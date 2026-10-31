#!/usr/bin/env node
// The repo's guard for coding agents. Claude Code runs it before every Bash, Edit, Write and
// NotebookEdit call (.claude/settings.json), in the main session and in every subagent.
//
// Agents act through the developer's own GitHub login, so GitHub can't tell an agent's merge from
// the developer's. The developer reviews and merges every PR, pulls main and deletes every branch
// themselves, so an agent has to be stopped here, before the command runs.
//
//   deny  merging or auto-merging a PR, deleting a branch, changing main (a commit, merge, pull,
//         reset or push), force-pushing, skipping or moving git hooks, deploying production from
//         a laptop, editing a checkout of main or the generated content registry
//   ask   changing what protects main (rulesets, repo or CI settings), changing the guard itself
//         (Claude Code settings, hooks, git internals and config), moving the developer's main
//         checkout off main, rolling production back, and any command whose target the guard
//         can't read. A subagent can't ask, so there an ask is a deny.
//
// Anything else gets no answer, which leaves the call to Claude Code's usual permission rules.
// If the guard itself fails, it asks rather than letting the call through.
//
//   echo '<PreToolUse input as JSON>' | node .claude/hooks/guard.mjs
//
// Tested in tests/unit/guard.test.ts. Plain Node, no dependencies.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const MAIN = 'main'
const EDIT_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit'])

const REASON = {
  merge:
    'Only the developer merges PRs in this repo. Leave the PR open, green and with every review thread answered, and tell them it is ready.',
  deleteBranch:
    'Only the developer deletes branches, local or remote. Leave the branch; if its worktree is in the way, `git worktree remove` it.',
  main: 'main changes only through a PR the developer merges. Work on a branch from origin/main, in a worktree of your own.',
  editMain:
    'This checkout is on main, which changes only through PRs. Make a worktree on a branch first: git worktree add ../<repo>-wt-<name> -b <name> --no-track origin/main.',
  moveMainCheckout:
    "This checkout is on main, and it is the developer's: switching it changes what they see and pull. Prefer a worktree (git worktree add ../<repo>-wt-<name> -b <name> --no-track origin/main).",
  force:
    'Force-pushing rewrites history the developer may be reviewing. Push a new commit, or use --force-with-lease on your own branch.',
  hooks:
    "The git hooks guard main for everyone, the developer's own commits included: don't skip or move them.",
  production: 'Production deploys only from main, once CI passes, never from a laptop.',
  settings:
    'This changes what protects main (rulesets, repository or CI settings). The developer approves each such change.',
  guardFiles:
    'This changes the guard itself (Claude Code settings or hooks, git hooks, git internals or config). The developer approves each such change.',
  generated:
    'src/content/generated/ is written by scripts/content/registry.mjs. Change a record under src/content/data instead.',
  unreadable:
    "The guard can't read what this runs or where (a variable, stdin or a file it can't see). Write the command out plainly, or ask the developer.",
  rollback: "Rolling production back is the developer's call.",
  failed: "The guard couldn't check this call, so it needs the developer's approval.",
  subagent: "A subagent can't ask the developer: hand this back to the main session.",
}

const ALLOW = Object.freeze({ decision: 'allow', reason: '' })
const deny = (reason) => ({ decision: 'deny', reason })
const ask = (reason) => ({ decision: 'ask', reason })
const RANK = { allow: 0, ask: 1, deny: 2 }

/** The most serious of the verdicts; the first one wins a tie, so its reason is the one shown. */
function worst(verdicts) {
  return verdicts.reduce(
    (kept, next) => (RANK[next.decision] > RANK[kept.decision] ? next : kept),
    ALLOW,
  )
}

// ---------- Reading a shell command ----------

const OPERATORS = ['&&', '||', ';;', '|&', ';', '|', '&', '(', ')']
const KEYWORDS = new Set([
  'if',
  'then',
  'else',
  'elif',
  'fi',
  'do',
  'done',
  'while',
  'until',
  '!',
  '{',
  '}',
  'time',
])

// A word keeps each variable the shell would expand as a marker, VAR + name + END, so it can be
// filled in later from what the command line set. @BRANCH stands for $(git branch --show-current).
const VAR = '\u0001'
const END = '\u0002'
/** Stands for a value the guard can't know: a substitution's output, or a variable it never saw set. */
const UNKNOWN = '\u0003'
const BRANCH = '@BRANCH'
const BRANCH_QUERY =
  /^\s*git\s+(?:branch\s+--show-current|rev-parse\s+--abbrev-ref\s+HEAD|symbolic-ref\s+(?:(?:--short|-q|--quiet)\s+)*HEAD)\s*$/

/** The commands inside every `$( )` and backtick pair of a text the shell expands, such as a heredoc body. */
function substitutionsIn(text) {
  const subs = []
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\\') index += 1
    else if (text.startsWith('$(', index)) {
      const close = closingParen(text, index + 2)
      subs.push(text.slice(index + 2 + (text[index + 2] === '(' ? 1 : 0), close - 1))
      index = close - 1
    } else if (text[index] === '`') {
      const close = text.indexOf('`', index + 1)
      subs.push(text.slice(index + 1, close === -1 ? text.length : close))
      index = close === -1 ? text.length : close
    }
  }
  return subs
}

/** The index just past a heredoc's closing delimiter line, and the body before it. */
function readHeredoc(source, start, { delimiter, stripTabs }) {
  let index = start
  const lines = []
  while (index < source.length) {
    const end = source.indexOf('\n', index)
    const line = source.slice(index, end === -1 ? source.length : end)
    index = end === -1 ? source.length : end + 1
    if ((stripTabs ? line.replace(/^\t+/, '') : line) === delimiter)
      return { end: index, body: lines.join('\n') }
    lines.push(line)
  }
  return { end: source.length, body: lines.join('\n') }
}

/** A heredoc's delimiter, read just after its `<<`, and the index after it. */
function heredocStart(source, start) {
  let at = start
  const stripTabs = source[at] === '-'
  if (stripTabs) at += 1
  while (source[at] === ' ' || source[at] === '\t') at += 1
  let delimiter = ''
  // An unquoted delimiter means the shell expands the body, $( ) included.
  let expands = true
  while (at < source.length && !/[\s;&|<>()]/.test(source[at])) {
    if (source[at] === "'" || source[at] === '"') {
      expands = false
      const quote = source[at]
      const end = source.indexOf(quote, at + 1)
      delimiter += source.slice(at + 1, end === -1 ? source.length : end)
      at = end === -1 ? source.length : end + 1
    } else if (source[at] === '\\') {
      expands = false
      delimiter += source[at + 1] ?? ''
      at += 2
    } else delimiter += source[at++]
  }
  return [{ delimiter, stripTabs, expands }, at]
}

/**
 * The index just past the `)` that closes the one before `start`. Quoted text and heredoc bodies
 * are skipped, as the shell skips them, so an apostrophe in a commit message can't hide the rest.
 */
function closingParen(source, start) {
  let depth = 1
  const heredocs = []
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]
    if (char === '\n' && heredocs.length) {
      let at = index + 1
      for (const heredoc of heredocs.splice(0)) at = readHeredoc(source, at, heredoc).end
      index = at - 1
    } else if (char === '\\') index += 1
    else if (source.startsWith("$'", index)) index = ansiC(source, index + 2)[1] - 1
    else if (char === "'") {
      const end = source.indexOf("'", index + 1)
      index = end === -1 ? source.length : end
    } else if (char === '"') index = closingQuote(source, index + 1) - 1
    else if (source.startsWith('<<', index) && !source.startsWith('<<<', index)) {
      const [heredoc, next] = heredocStart(source, index + 2)
      heredocs.push(heredoc)
      index = next - 1
    } else if (char === '(') depth += 1
    else if (char === ')' && (depth -= 1) === 0) return index + 1
  }
  return source.length
}

/** The index just past the `"` that closes a double-quoted string opened before `start`. */
function closingQuote(source, start) {
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === '\\') index += 1
    else if (source[index] === '"') return index + 1
    else if (source.startsWith('$(', index)) index = closingParen(source, index + 2) - 1
  }
  return source.length
}

const ESCAPES = {
  n: '\n',
  t: '\t',
  r: '\r',
  a: '\x07',
  b: '\b',
  e: '\x1b',
  E: '\x1b',
  f: '\f',
  v: '\v',
}

/** An ANSI-C $'…' string's text, read from just after its `$'`, and the index after it. */
function ansiC(source, start) {
  let text = ''
  let index = start
  while (index < source.length && source[index] !== "'") {
    if (source[index] === '\\') {
      const next = source[index + 1] ?? ''
      const hex = /^x([0-9a-fA-F]{1,2})/.exec(source.slice(index + 1))
      const octal = /^([0-7]{1,3})/.exec(source.slice(index + 1))
      if (hex) {
        text += String.fromCharCode(parseInt(hex[1], 16))
        index += 1 + hex[0].length
      } else if (octal) {
        text += String.fromCharCode(parseInt(octal[1], 8))
        index += 1 + octal[0].length
      } else {
        text += ESCAPES[next] ?? next
        index += 2
      }
    } else text += source[index++]
  }
  return [text, index + 1]
}

/** A `$` expansion read at `start` (just past the `$`): the marker or text it adds, and the index after. */
function readDollar(text, start) {
  if (text[start] === '{') {
    const end = text.indexOf('}', start + 1)
    const inner = text.slice(start + 1, end === -1 ? text.length : end)
    // ${B%x} or ${B:0:4} changes the value, so only a bare ${B} is filled in.
    const bare = /^[A-Za-z_][A-Za-z0-9_]*$/.test(inner)
    return [bare ? `${VAR}${inner}${END}` : UNKNOWN, end === -1 ? text.length : end + 1]
  }
  const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(text.slice(start))?.[0]
  if (name) return [`${VAR}${name}${END}`, start + name.length]
  // $@, $1, $? and the like are never known here.
  return /^[@*#?$!0-9-]/.test(text[start] ?? '') ? [UNKNOWN, start + 1] : ['$', start]
}

/** A `$(…)`'s text, as the word shows it: the current branch for a branch query, else a placeholder. */
const substitution = (inner) => (BRANCH_QUERY.test(inner) ? `${VAR}${BRANCH}${END}` : UNKNOWN)

/**
 * The command's tokens: words (quotes removed, variables kept as markers, and the commands inside
 * any `$( )` or backticks kept as `subs`), operators and redirections. A heredoc's body is data:
 * it is skipped, and kept on its redirection for a shell that reads it.
 */
export function tokenize(source) {
  const tokens = []
  const heredocs = []
  let word = null
  const current = () => (word ??= { type: 'word', value: '', subs: [], quoted: false })
  const flush = () => {
    if (word) tokens.push(word)
    word = null
  }
  const atCommandStart = () => !word && (tokens.length === 0 || tokens.at(-1).type === 'op')
  let index = 0
  while (index < source.length) {
    const char = source[index]
    if (char === '\n') {
      flush()
      tokens.push({ type: 'op', value: ';' })
      index += 1
      for (const heredoc of heredocs.splice(0)) {
        const { end, body } = readHeredoc(source, index, heredoc)
        heredoc.token.body = body
        heredoc.token.subs = heredoc.expands ? substitutionsIn(body) : []
        index = end
      }
    } else if (char === ' ' || char === '\t' || char === '\r') {
      flush()
      index += 1
    } else if (char === '#' && !word) {
      while (index < source.length && source[index] !== '\n') index += 1
    } else if (char === '\\') {
      if (source[index + 1] !== '\n') current().value += source[index + 1] ?? ''
      index += 2
    } else if (source.startsWith("$'", index)) {
      const [text, next] = ansiC(source, index + 2)
      current().value += text
      word.quoted = true
      index = next
    } else if (char === "'") {
      const end = source.indexOf("'", index + 1)
      const stop = end === -1 ? source.length : end
      current().value += source.slice(index + 1, stop)
      word.quoted = true
      index = stop + 1
    } else if (char === '"' || source.startsWith('$"', index)) {
      const open = char === '"' ? index : index + 1
      const end = closingQuote(source, open + 1)
      const inner = source.slice(open + 1, Math.max(end - 1, open + 1))
      const target = current()
      target.quoted = true
      for (let at = 0; at < inner.length; at += 1) {
        if (inner[at] === '\\' && '"\\$`\n'.includes(inner[at + 1] ?? '')) {
          target.value += inner[at + 1]
          at += 1
        } else if (inner.startsWith('$((', at)) {
          const close = closingParen(inner, at + 2)
          target.subs.push(...substitutionsIn(inner.slice(at + 3, close - 1)))
          target.value += UNKNOWN
          at = close - 1
        } else if (inner.startsWith('$(', at)) {
          const close = closingParen(inner, at + 2)
          const sub = inner.slice(at + 2, close - 1)
          target.subs.push(sub)
          target.value += substitution(sub)
          at = close - 1
        } else if (inner[at] === '`') {
          const close = inner.indexOf('`', at + 1)
          target.subs.push(inner.slice(at + 1, close === -1 ? inner.length : close))
          target.value += UNKNOWN
          at = close === -1 ? inner.length : close
        } else if (inner[at] === '$') {
          const [text, next] = readDollar(inner, at + 1)
          target.value += text
          at = next - 1
        } else target.value += inner[at]
      }
      index = end
    } else if (source.startsWith('$((', index)) {
      const close = closingParen(source, index + 2)
      current().subs.push(...substitutionsIn(source.slice(index + 3, close - 1)))
      current().value += UNKNOWN
      index = close
    } else if (source.startsWith('$(', index)) {
      const close = closingParen(source, index + 2)
      const sub = source.slice(index + 2, close - 1)
      current().subs.push(sub)
      current().value += substitution(sub)
      index = close
    } else if (char === '`') {
      const close = source.indexOf('`', index + 1)
      current().subs.push(source.slice(index + 1, close === -1 ? source.length : close))
      current().value += UNKNOWN
      index = close === -1 ? source.length : close + 1
    } else if (char === '$') {
      const [text, next] = readDollar(source, index + 1)
      current().value += text
      index = next
    } else if (source.startsWith('((', index) && atCommandStart()) {
      // An arithmetic command: its << is a shift, not a heredoc, but a $( ) in it still runs.
      const close = source.indexOf('))', index + 2)
      const stop = close === -1 ? source.length : close
      current().subs.push(...substitutionsIn(source.slice(index + 2, stop)))
      flush()
      index = close === -1 ? source.length : close + 2
    } else if (source.startsWith('<<', index) && !source.startsWith('<<<', index)) {
      flush()
      const [heredoc, next] = heredocStart(source, index + 2)
      const token = { type: 'redirect', value: '<<', body: null }
      tokens.push(token)
      heredocs.push({ ...heredoc, token })
      index = next
    } else if (char === '>' || char === '<' || source.startsWith('&>', index)) {
      // A file descriptor written just before the redirection (2>) belongs to it, not the command.
      if (word && /^\d+$/.test(word.value) && word.subs.length === 0) word = null
      flush()
      const operator = /^(?:&>>|&>|<<<|>>|>&|>\||<&|<>|>|<)/.exec(source.slice(index))[0]
      tokens.push({ type: 'redirect', value: operator })
      index += operator.length
    } else {
      const operator = OPERATORS.find((candidate) => source.startsWith(candidate, index))
      if (operator) {
        flush()
        tokens.push({ type: 'op', value: operator })
        index += operator.length
      } else {
        current().value += char
        index += 1
      }
    }
  }
  flush()
  return tokens
}

/** A {a..c} or {1..3} sequence's items, or null for anything else. */
function sequence(inner) {
  const match = /^(-?\d+|[A-Za-z])\.\.(-?\d+|[A-Za-z])$/.exec(inner)
  if (!match) return null
  const numeric = /\d/.test(match[1])
  const [from, to] = numeric
    ? [Number(match[1]), Number(match[2])]
    : [match[1].charCodeAt(0), match[2].charCodeAt(0)]
  if (Math.abs(to - from) > 64) return null
  const step = from <= to ? 1 : -1
  const items = []
  for (let at = from; step > 0 ? at <= to : at >= to; at += step)
    items.push(numeric ? String(at) : String.fromCharCode(at))
  return items
}

/** Brace expansion, as the shell does it before anything else, so {gh,pr} merge is gh pr merge. */
function expandBraces(word) {
  const match = /\{([^{}]*)\}/.exec(word)
  if (!match) return [word]
  const parts = match[1].includes(',') ? match[1].split(',') : sequence(match[1])
  const [before, after] = [word.slice(0, match.index), word.slice(match.index + match[0].length)]
  if (!parts) return expandBraces(after).map((rest) => `${before}{${match[1]}}${rest}`)
  return parts.flatMap((part) => expandBraces(before + part + after))
}

/** The tokens as simple commands in order, with `(` and `)` kept to mark subshells. */
function commandsOf(tokens) {
  const items = []
  let previous = null
  let piped = false
  let command = { words: [], redirects: [], subs: [], pipedFrom: null }
  const finish = () => {
    if (command.words.length || command.redirects.length || command.subs.length) {
      items.push(command)
      previous = command
    }
    command = { words: [], redirects: [], subs: [], pipedFrom: null }
  }
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (token.type === 'op') {
      finish()
      piped = token.value === '|' || token.value === '|&'
      if (piped) command.pipedFrom = previous
      if (token.value === '(' || token.value === ')') items.push({ scope: token.value })
    } else if (token.type === 'redirect') {
      const target =
        token.value !== '<<' && tokens[index + 1]?.type === 'word' ? tokens[(index += 1)] : null
      if (target) command.subs.push(...target.subs)
      if (token.subs) command.subs.push(...token.subs)
      command.redirects.push({ operator: token.value, target: target?.value ?? '', heredoc: token })
    } else {
      command.subs.push(...token.subs)
      if (command.words.length === 0 && KEYWORDS.has(token.value)) continue
      // The shell expands braces only outside quotes.
      command.words.push(...(token.quoted ? [token.value] : expandBraces(token.value)))
    }
  }
  finish()
  return items
}

// ---------- What a word stands for ----------

const expandHome = (path) =>
  path === '~' || path.startsWith('~/') ? homedir() + path.slice(1) : path
const MARKER = new RegExp(`${VAR}([^${END}]*)${END}`, 'g')

/** A word with the variables this command line set, or the session has, filled in. */
function expand(word, state) {
  return word.replace(MARKER, (_, name) => {
    if (name === BRANCH) return branchIn(state, state.cwd) ?? UNKNOWN
    if (name === 'PWD') return state.cwd
    return state.vars[name] ?? process.env[name] ?? UNKNOWN
  })
}

/** Whether a word still holds something the guard couldn't fill in. */
const unknown = (word) => word.includes(UNKNOWN)

/** The value given to the first of `names` (`-f x`, `--file x` or `--file=x`), or null. */
function valueOf(args, names) {
  for (let index = 0; index < args.length; index += 1) {
    const [name, inline] = args[index].split(/=(.*)/s)
    if (names.includes(name)) return inline ?? args[index + 1] ?? ''
  }
  return null
}

/** The words that aren't options, leaving out the values of the options in `valued`. */
function withoutValues(args, valued) {
  const words = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (valued.includes(arg)) index += 1
    else if (!arg.startsWith('-')) words.push(arg)
  }
  return words
}

/** A patch's verdict, by the files it would change: `+++ b/<path>` and `diff --git` lines. */
function judgePatch(files, dir, stdinText = null) {
  const texts = files.length
    ? files.map((file) => readText(resolve(dir, expandHome(file))))
    : [stdinText]
  if (texts.some((text) => text === null)) return ask(REASON.unreadable)
  const paths = texts.flatMap((text) =>
    [...text.matchAll(/^(?:\+\+\+|---) (?:[ab]\/)?(\S+)|^diff --git a\/(\S+) b\/(\S+)/gm)].flatMap(
      (match) => match.slice(1).filter(Boolean),
    ),
  )
  return paths.some((path) => isGuardedPath(resolve(dir, path))) ? ask(REASON.guardFiles) : ALLOW
}

/** Long options (before any =), short-option letters, and the other words, up to a bare `--`. */
function readOptions(args) {
  const long = new Set()
  const short = new Set()
  const positional = []
  let ended = false
  for (const arg of args) {
    if (ended || arg === '-' || !arg.startsWith('-')) positional.push(arg)
    else if (arg === '--') ended = true
    else if (arg.startsWith('--')) long.add(arg.split('=')[0])
    else for (const letter of arg.slice(1)) short.add(letter)
  }
  // git takes any unambiguous start of a long option, so --del is --delete.
  const has = (option) => [...long].some((given) => given.length >= 4 && option.startsWith(given))
  return { long, short, positional, has }
}

/** The path with every symlink it passes through resolved, as far as the path exists. */
function realPath(path) {
  let head = resolve(path)
  const tail = []
  while (dirname(head) !== head) {
    try {
      return join(realpathSync.native(head), ...tail)
    } catch {
      tail.unshift(basename(head))
      head = dirname(head)
    }
  }
  return resolve(path)
}

/**
 * Whether a path is part of a guard: Claude Code's settings or hooks, a git hooks folder, git's
 * internals, or the git and gh configuration that can define aliases. Compared without case, as
 * macOS's default file system does, and through symlinks.
 */
function isGuardedPath(path) {
  const home = homedir().toLowerCase()
  return [resolve(path), realPath(path)].some((candidate) => {
    const lower = candidate.toLowerCase()
    const parts = lower.split(sep)
    const inHome = (...rest) =>
      lower === join(home, ...rest) || lower.startsWith(join(home, ...rest) + sep)
    return (
      inHome('.gitconfig') ||
      inHome('.config', 'git') ||
      inHome('.config', 'gh') ||
      parts.some(
        (part, index) =>
          part === '.git' ||
          part === '.githooks' ||
          (part === '.claude' &&
            (index === parts.length - 1 ||
              parts[index + 1] === 'hooks' ||
              /^settings(?:\.local)?\.json$/.test(parts[index + 1] ?? ''))),
      )
    )
  })
}

/** Whether removing a folder would take a guard with it: a checkout, or Claude Code's settings. */
const holdsGuard = (path) =>
  ['.git', '.githooks', join('.claude', 'hooks'), join('.claude', 'settings.json')].some((inside) =>
    existsSync(join(path, inside)),
  )

const shortBranch = (ref) =>
  ref.replace(/^refs\/heads\//, '').replace(/^refs\/remotes\/[^/]+\//, '')

/** Git settings that make git run a command of their choosing. */
const RUNS_COMMANDS =
  /^(?:alias\.|core\.(?:pager|editor|sshcommand|fsmonitor|askpass)|filter\.|diff\.[^.]+\.(?:textconv|command)|merge\.[^.]+\.driver|sequence\.editor|gpg\.(?:[^.]+\.)?program|credential\.helper|include(?:if)?\.)/i
/** Git settings that decide where a plain `git push` goes. */
const PUSH_SETTING =
  /^(?:remote\.[^.]+\.(?:push|mirror|pushurl|url)|remote\.pushdefault|push\.default|branch\.[^.]+\.(?:merge|remote|pushremote))$/i

/** The verdict on one git setting given to a command, by -c, --config-env or the environment. */
function judgeSetting(setting) {
  if (/^core\.hookspath$/i.test(setting)) return deny(REASON.hooks)
  return RUNS_COMMANDS.test(setting) || PUSH_SETTING.test(setting) ? ask(REASON.guardFiles) : ALLOW
}

// ---------- State as a command line runs ----------

/** What one state of the shell knows: where it is, its variables, and each checkout's branch. */
function newState(cwd, git) {
  return { cwd, git, vars: {}, exported: {}, switched: new Map(), repos: new Map(), depth: 0 }
}

/** A subshell's state: it starts where its parent is, and its changes stay inside it. */
const cloneState = (state) => ({
  ...state,
  vars: { ...state.vars },
  exported: { ...state.exported },
  switched: new Map(state.switched),
})

const deeper = (state) => ({ ...cloneState(state), depth: state.depth + 1 })

function repoAt(state, dir) {
  if (!state.repos.has(dir)) state.repos.set(dir, state.git.repoOf(dir))
  return state.repos.get(dir)
}

const topOf = (state, dir) => repoAt(state, dir)?.top ?? dir

function branchIn(state, dir) {
  const top = topOf(state, dir)
  return state.switched.has(top) ? state.switched.get(top) : (repoAt(state, dir)?.branch ?? null)
}

// ---------- Judging git ----------

function judgeGit(args, state, context) {
  const verdicts = context.settings.map(judgeSetting)
  let dir = state.cwd
  let elsewhere = context.gitDirSet
  let index = 0
  while (index < args.length && args[index].startsWith('-')) {
    const arg = args[index]
    const value = args[index + 1] ?? ''
    if (arg === '-C') {
      if (unknown(value)) elsewhere = 'unknown'
      dir = resolve(dir, expandHome(value || '.'))
      index += 2
    } else if (arg === '-c') {
      verdicts.push(judgeSetting(value.split('=')[0]))
      index += 2
    } else if (arg === '--config-env' || arg.startsWith('--config-env=')) {
      const setting = arg === '--config-env' ? value : arg.slice('--config-env='.length)
      verdicts.push(judgeSetting(setting.split('=')[0]))
      index += arg === '--config-env' ? 2 : 1
    } else if (/^--(?:git-dir|work-tree)$/.test(arg)) {
      elsewhere ||= true
      index += 2
    } else if (/^--(?:git-dir|work-tree)=/.test(arg)) {
      elsewhere ||= true
      index += 1
    } else if (/^--(?:namespace|super-prefix|exec-path)$/.test(arg)) index += 2
    else index += 1
  }
  if (unknown(state.cwd)) elsewhere = 'unknown'
  verdicts.push(judgeGitVerb(args[index], args.slice(index + 1), state, dir, elsewhere, context))
  return worst(verdicts)
}

/** The verdict on a git command that changes a checkout: deny on main, ask where unknown. */
function onMain(state, dir, elsewhere) {
  if (elsewhere === 'unknown') return ask(REASON.unreadable)
  return elsewhere || branchIn(state, dir) === MAIN ? deny(REASON.main) : ALLOW
}

function judgeGitVerb(verb, rest, state, dir, elsewhere, context) {
  const { short, positional, has } = readOptions(rest)
  const guardedIn = (paths) => paths.some((path) => isGuardedPath(resolve(dir, expandHome(path))))

  switch (verb) {
    case 'branch': {
      if (short.has('d') || short.has('D') || has('--delete')) return deny(REASON.deleteBranch)
      // Moving or forcing touches every branch named; copying touches only the new name.
      const moves =
        ['m', 'M', 'f'].some((letter) => short.has(letter)) || has('--move') || has('--force')
      const copies = short.has('c') || short.has('C') || has('--copy')
      if (moves && positional.some((name) => name === MAIN || unknown(name)))
        return deny(REASON.main)
      return copies && (positional.at(-1) === MAIN || unknown(positional.at(-1) ?? ''))
        ? deny(REASON.main)
        : ALLOW
    }
    case 'push':
      return judgePush(rest, state, dir, context, elsewhere)
    case 'commit':
      if (has('--no-verify') || short.has('n')) return deny(REASON.hooks)
      return onMain(state, dir, elsewhere)
    case 'merge':
    case 'pull':
    case 'rebase':
    case 'reset':
    case 'cherry-pick':
    case 'revert':
    case 'am':
      if (has('--no-verify')) return deny(REASON.hooks)
      if (has('--abort') || has('--quit')) return ALLOW
      // A reset limited to paths only touches the index; a bare `--` still resets everything.
      if (verb === 'reset' && rest.indexOf('--') !== -1 && rest.indexOf('--') < rest.length - 1)
        return ALLOW
      return onMain(state, dir, elsewhere)
    case 'apply':
      return judgePatch(positional, dir)
    case 'restore':
      return guardedIn(positional) ? ask(REASON.guardFiles) : ALLOW
    case 'switch':
    case 'checkout': {
      const separator = rest.indexOf('--')
      if (separator !== -1)
        return guardedIn(rest.slice(separator + 1)) ? ask(REASON.guardFiles) : ALLOW
      const creates = verb === 'switch' ? ['c', 'C'] : ['b', 'B']
      let next
      if (creates.some((letter) => short.has(letter)) || has('--create') || has('--force-create'))
        next = positional[0]
      else if (has('--detach') || (verb === 'switch' && short.has('d'))) next = 'HEAD'
      else if (positional.length !== 1) return ALLOW
      else if (verb === 'checkout' && /[./]/.test(positional[0]))
        return guardedIn(positional) ? ask(REASON.guardFiles) : ALLOW
      else next = positional[0]
      if (!next) return ALLOW
      const leavesMain = branchIn(state, dir) === MAIN && next !== MAIN
      state.switched.set(topOf(state, dir), next)
      return leavesMain ? ask(REASON.moveMainCheckout) : ALLOW
    }
    case 'worktree': {
      if (rest[0] !== 'add') return ALLOW
      let branch = null
      let path = null
      let force = false
      for (let at = 1; at < rest.length; at += 1) {
        const arg = rest[at]
        if (arg === '-b' || arg === '-B') {
          force ||= arg === '-B'
          branch = rest[(at += 1)] ?? null
        } else if (arg === '--reason') at += 1
        else if (!arg.startsWith('-') && path === null) path = arg
      }
      if (force && (branch === MAIN || unknown(branch ?? ''))) return deny(REASON.main)
      if (path && branch) state.switched.set(resolve(dir, expandHome(path)), branch)
      return ALLOW
    }
    case 'update-ref': {
      if (short.has('d') || has('--delete')) return deny(REASON.deleteBranch)
      if (has('--stdin')) return ask(REASON.unreadable)
      const ref = withoutValues(rest, ['-m'])[0] ?? ''
      return shortBranch(ref) === MAIN || unknown(ref) ? deny(REASON.main) : ALLOW
    }
    case 'config': {
      const file = valueOf(rest, ['-f', '--file'])
      if (file !== null && (unknown(file) || isGuardedPath(resolve(dir, expandHome(file)))))
        return ask(REASON.guardFiles)
      const words = withoutValues(rest, [
        '-f',
        '--file',
        '--blob',
        '--type',
        '--default',
        '--comment',
      ])
      const subcommands = [
        'set',
        'unset',
        'get',
        'list',
        'edit',
        'rename-section',
        'remove-section',
      ]
      const setting = (subcommands.includes(words[0]) ? words[1] : words[0]) ?? ''
      const edits = words[0] === 'edit' || has('--edit') || short.has('e')
      const writes =
        edits ||
        ['set', 'unset', 'rename-section', 'remove-section'].includes(words[0]) ||
        [
          '--add',
          '--unset',
          '--unset-all',
          '--replace-all',
          '--rename-section',
          '--remove-section',
        ].some((option) => has(option)) ||
        (words.length >= 2 && !['get', 'list'].includes(words[0]))
      if (!writes) return ALLOW
      if (edits || unknown(setting)) return ask(REASON.guardFiles)
      return judgeSetting(setting)
    }
    case 'symbolic-ref':
      return positional.length >= 2 ? onMain(state, dir, elsewhere) : ALLOW
    case 'rm':
    case 'mv':
      return guardedIn(positional) ? ask(REASON.guardFiles) : ALLOW
    default:
      return ALLOW
  }
}

function judgePush(rest, state, dir, context, elsewhere) {
  const { short, positional, has } = readOptions(rest)
  if (short.has('d') || has('--delete') || has('--mirror') || has('--prune'))
    return deny(REASON.deleteBranch)
  if (has('--no-verify')) return deny(REASON.hooks)
  if (has('--all') || has('--branches')) return deny(REASON.main)
  const forced = short.has('f') || has('--force')
  // xargs adds words the guard never sees.
  if (context.appends) return ask(REASON.unreadable)
  const refspecs = withoutValues(rest, [
    '-o',
    '--push-option',
    '--receive-pack',
    '--exec',
    '--repo',
  ]).slice(1)
  if (refspecs.length === 0) {
    if (has('--tags')) return ALLOW
    if (unknown(positional[0] ?? '') || elsewhere) return ask(REASON.unreadable)
    const upstream = state.git.upstreamOf(dir)
    if (
      branchIn(state, dir) === MAIN ||
      (upstream && shortBranch(upstream.replace(/^[^/]+\//, '')) === MAIN)
    )
      return deny(REASON.main)
    return forced ? deny(REASON.force) : ALLOW
  }
  for (const refspec of refspecs) {
    if (refspec.startsWith(':')) return deny(REASON.deleteBranch)
    if (refspec.startsWith('+')) return deny(REASON.force)
    if (refspec.includes('*')) return deny(REASON.main)
    const [source, destination] = refspec.split(':')
    const target = destination ?? source
    const head = target === 'HEAD' || target === '@'
    if (head && elsewhere) return ask(REASON.unreadable)
    // git takes heads/main and refs/heads/main for main.
    const named = head
      ? branchIn(state, dir)
      : shortBranch(target).replace(/^(?:refs\/)?heads\//, '')
    if (named === MAIN) return deny(REASON.main)
    if (unknown(refspec)) return ask(REASON.unreadable)
  }
  return forced ? deny(REASON.force) : ALLOW
}

// ---------- Judging GitHub and Vercel ----------

const GH_VALUED = new Set([
  '-R',
  '--repo',
  '-X',
  '--method',
  '-f',
  '--raw-field',
  '-F',
  '--field',
  '-H',
  '--header',
  '--input',
  '-q',
  '--jq',
  '-t',
  '--template',
  '--hostname',
  '-p',
  '--preview',
  '--cache',
  '-b',
  '--body',
  '--title',
  '-B',
  '--base',
  '--head',
  '-m',
  '--message',
  '-A',
  '--author',
  '-L',
  '--limit',
  '-s',
  '--state',
  '-l',
  '--label',
  '-a',
  '--assignee',
  '-e',
  '--env',
  '--body-file',
  '--subject',
])

/** The words of a `gh` command with the options that take a value, and their values, set apart. */
function readGh(args) {
  const words = []
  const values = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    const [name, inline] = arg.startsWith('--') ? arg.split(/=(.*)/s) : [arg, undefined]
    if (GH_VALUED.has(name)) values.push([name, inline ?? args[(index += 1)] ?? ''])
    else if (/^-[fFXp]./.test(arg)) values.push([arg.slice(0, 2), arg.slice(2)])
    else if (arg.startsWith('-')) values.push([name, inline ?? true])
    else words.push(arg)
  }
  const has = (...names) => values.some(([name]) => names.includes(name))
  const valuesOf = (...names) =>
    values.filter(([name]) => names.includes(name)).map(([, value]) => value)
  return { words, has, valuesOf }
}

const MERGING_MUTATION =
  /\b(?:mergePullRequest|enablePullRequestAutoMerge|mergeBranch|enqueuePullRequest)\b/
const DELETING_MUTATION = /\b(?:deleteRef|deleteRepository)\b/
const MAIN_MUTATION = /\bupdateRefs?\b/
const SETTINGS_MUTATION =
  /\b(?:createRepositoryRuleset|updateRepositoryRuleset|deleteRepositoryRuleset|updateRepository|createBranchProtectionRule|updateBranchProtectionRule|deleteBranchProtectionRule|disablePullRequestAutoMerge)\b/

/** A GraphQL document's verdict, by the mutations it names. */
function judgeGraphql(query) {
  if (MERGING_MUTATION.test(query)) return deny(REASON.merge)
  if (DELETING_MUTATION.test(query)) return deny(REASON.deleteBranch)
  if (MAIN_MUTATION.test(query)) return deny(REASON.main)
  return SETTINGS_MUTATION.test(query) ? ask(REASON.settings) : ALLOW
}

const SETTINGS_ENDPOINT =
  /^repos\/[^/]+\/[^/]+\/(?:rulesets|branches\/[^/]+\/protection|actions\/permissions|actions\/secrets|actions\/variables|actions\/workflows\/[^/]+\/disable|code-scanning\/default-setup|vulnerability-alerts|automated-security-fixes|environments)/i

/** A contents-API write lands on `main` unless it names another branch. */
function judgeContentsWrite(method, endpoint, fields) {
  if (!/^repos\/[^/]+\/[^/]+\/contents\//i.test(endpoint) || !['PUT', 'DELETE'].includes(method))
    return ALLOW
  const branch = fields.find((field) => field.startsWith('branch='))?.slice('branch='.length)
  return branch === undefined || branch === MAIN || unknown(branch) ? deny(REASON.main) : ALLOW
}

const apiPath = (path) =>
  path
    .replace(/^(?:https?:\/\/)?api\.github\.com/i, '')
    .replace(/^\/+/, '')
    .split(/[?#]/)[0]

/** A GitHub REST call's verdict, from its method and its path below api.github.com. */
function judgeGitHubRequest(method, path) {
  const endpoint = apiPath(path)
  const at = (pattern) => new RegExp(`^repos/[^/]+/[^/]+${pattern}$`, 'i').test(endpoint)
  if (method === 'GET' || method === 'HEAD') return ALLOW
  if (at('/pulls/[^/]+/merge') || (at('/merges') && method === 'POST')) return deny(REASON.merge)
  if (/^repos\/[^/]+\/[^/]+\/git\/refs\/heads\//i.test(endpoint)) {
    if (method === 'DELETE') return deny(REASON.deleteBranch)
    return at('/git/refs/heads/(?:main|[^/]*\\$[^/]*)') ? deny(REASON.main) : ALLOW
  }
  if (at('') && method === 'DELETE') return deny(REASON.settings)
  return at('') || SETTINGS_ENDPOINT.test(endpoint) ? ask(REASON.settings) : ALLOW
}

function judgeGh(args) {
  const { words, has, valuesOf } = readGh(args)
  const [group, action] = words
  if (group === 'pr' && action === 'merge') return deny(REASON.merge)
  if (group === 'pr' && action === 'close' && (has('--delete-branch') || has('-d')))
    return deny(REASON.deleteBranch)
  if (group === 'repo' && action === 'delete') return deny(REASON.settings)
  if (group === 'repo' && ['edit', 'rename', 'archive', 'unarchive'].includes(action))
    return ask(REASON.settings)
  if (group === 'workflow' && action === 'disable') return ask(REASON.settings)
  if ((group === 'secret' || group === 'variable') && ['set', 'delete', 'remove'].includes(action))
    return ask(REASON.settings)
  // An alias or an extension can make gh run anything, and the token is the developer's own.
  if (group === 'alias' && ['set', 'import'].includes(action)) return ask(REASON.guardFiles)
  if (
    (group === 'extension' || group === 'ext') &&
    ['install', 'upgrade', 'create'].includes(action)
  )
    return ask(REASON.guardFiles)
  if (group === 'auth' && action === 'token') return ask(REASON.settings)
  if (group !== 'api') return ALLOW

  const fields = valuesOf('-f', '-F', '--field', '--raw-field').filter(
    (value) => typeof value === 'string',
  )
  const [declared] = valuesOf('-X', '--method')
  const method =
    typeof declared === 'string'
      ? declared.toUpperCase()
      : fields.length || has('--input')
        ? 'POST'
        : 'GET'
  // Any word could be the endpoint if an option's value went unrecognised, so each is judged.
  return worst(
    words.slice(1).map((endpoint) => {
      if (apiPath(endpoint).toLowerCase() !== 'graphql')
        return worst([
          judgeGitHubRequest(method, endpoint),
          judgeContentsWrite(method, apiPath(endpoint), fields),
        ])
      const query = fields.find((field) => field.startsWith('query='))?.slice('query='.length)
      if (query === undefined || query.startsWith('@') || has('--input'))
        return ask(REASON.unreadable)
      return judgeGraphql(query)
    }),
  )
}

/** curl, wget and HTTPie, judged when they call GitHub's or Vercel's API. */
function judgeHttp(name, args) {
  // HTTPie takes an address without its scheme.
  const url =
    args.find((arg) => /^(?:https?:\/\/)?api\.(?:github|vercel)\.com(?:[/:?]|$)/i.test(arg)) ?? ''
  const host = (/^(?:https?:\/\/)?([^/:?]+)/.exec(url)?.[1] ?? '').toLowerCase()
  if (host !== 'api.github.com' && host !== 'api.vercel.com') return ALLOW
  const body = args.filter((arg, index) =>
    /^(?:-d|--data(?:-raw|-binary|-urlencode)?|--json|-F|--form|--body-data|--post-data)$/.test(
      args[index - 1] ?? '',
    ),
  )
  let method = args.find((arg, index) => /^(?:-[a-zA-Z]*X|--request)$/.test(args[index - 1] ?? ''))
  // curl also takes the method run on: -XPUT, -sXPUT, --request=PUT.
  method ??= args
    .map((arg) => /^-[a-zA-Z]*X([A-Za-z]+)$|^--(?:request|method)=(.+)$/.exec(arg))
    .find(Boolean)
    ?.slice(1)
    .find(Boolean)
  if (name === 'http' || name === 'https')
    method ??= args.find((arg) => /^(?:GET|POST|PUT|PATCH|DELETE)$/i.test(arg))
  method = (method ?? (body.length ? 'POST' : 'GET')).toUpperCase()
  if (host === 'api.vercel.com') return method === 'GET' ? ALLOW : ask(REASON.settings)
  const path = url.replace(/^(?:https?:\/\/)?api\.github\.com/i, '')
  if (/^\/graphql\b/i.test(path))
    return body.length ? judgeGraphql(body.join(' ')) : ask(REASON.unreadable)
  const branch = /"branch"\s*:\s*"([^"]*)"/.exec(body.join(' '))?.[1]
  return worst([
    judgeGitHubRequest(method, path),
    judgeContentsWrite(method, apiPath(path), branch === undefined ? [] : [`branch=${branch}`]),
  ])
}

/** Where curl or wget would write what it downloads, as paths. */
function downloadTargets(name, args) {
  const named = args.filter((arg, index) =>
    name === 'wget'
      ? /^(?:-O|--output-document)$/.test(args[index - 1] ?? '')
      : /^(?:-o|--output)$/.test(args[index - 1] ?? ''),
  )
  const attached = args.map((arg) => /^--output(?:-document)?=(.+)$/.exec(arg)?.[1]).filter(Boolean)
  return [...named, ...attached]
}

const VERCEL_VALUED = new Set([
  '--target',
  '--scope',
  '-S',
  '--token',
  '-t',
  '--cwd',
  '--local-config',
  '-A',
  '--global-config',
  '-Q',
  '--env',
  '-e',
  '--build-env',
  '-b',
  '--meta',
  '-m',
  '--regions',
  '--environment',
  '--team',
  '-T',
])
/** Vercel CLI commands; any other first word is a folder to deploy. */
const VERCEL_COMMANDS = new Set([
  'alias',
  'api',
  'bisect',
  'blob',
  'build',
  'cache',
  'certs',
  'curl',
  'deploy',
  'dev',
  'dns',
  'domains',
  'edge-config',
  'env',
  'flags',
  'git',
  'global-config',
  'guidance',
  'help',
  'httpstat',
  'init',
  'inspect',
  'install',
  'integration',
  'integration-resource',
  'link',
  'list',
  'login',
  'logout',
  'logs',
  'ls',
  'mcp',
  'metrics',
  'microfrontends',
  'open',
  'project',
  'projects',
  'promote',
  'pull',
  'redeploy',
  'remove',
  'rm',
  'rollback',
  'rolling-release',
  'switch',
  'target',
  'teams',
  'telemetry',
  'upgrade',
  'webhooks',
  'whoami',
])

function judgeVercel(args) {
  const { long } = readOptions(args)
  const positional = args.filter(
    (arg, index) => !arg.startsWith('-') && !VERCEL_VALUED.has(args[index - 1]),
  )
  const command = positional[0]
  const targetsProduction =
    long.has('--prod') ||
    long.has('--production') ||
    args.some(
      (arg, index) =>
        arg === '--target=production' || (arg === '--target' && args[index + 1] === 'production'),
    )
  const deploys =
    command === undefined ||
    command === 'deploy' ||
    command === 'redeploy' ||
    !VERCEL_COMMANDS.has(command)
  if (command === 'promote' || (targetsProduction && deploys)) return deny(REASON.production)
  if (command === 'rollback') return ask(REASON.rollback)
  if (command === 'alias' && ['set', 'rm', 'remove'].includes(positional[1]))
    return ask(REASON.settings)
  if (command === 'env' && ['add', 'rm', 'remove', 'update'].includes(positional[1]))
    return ask(REASON.settings)
  if (
    ['project', 'projects', 'domains', 'dns'].includes(command) &&
    ['rm', 'remove', 'add'].includes(positional[1])
  )
    return ask(REASON.settings)
  if (command === 'remove' || command === 'rm') return ask(REASON.settings)
  if (command === 'api') {
    const method = args.find(
      (arg, index) => args[index - 1] === '-X' || args[index - 1] === '--method',
    )
    const writes =
      (method && method.toUpperCase() !== 'GET') ||
      args.some((arg) => /^(?:--input|-F|-f|--field|--raw-field)$/.test(arg))
    return writes ? ask(REASON.settings) : ALLOW
  }
  return ALLOW
}

// ---------- Judging code and files ----------

const DANGEROUS_TEXT = [
  [
    /\bgh\s+pr\s+merge\b|mergePullRequest|enablePullRequestAutoMerge|mergeBranch|pulls\/[^/\s'"`]+\/merge\b|\/merges\b|['"`]pr['"`]\s*,\s*['"`]merge['"`]/,
    REASON.merge,
  ],
  [
    /\bgit\b[^\n]*\bbranch\b[^\n]*\s-(?:-delete\b|[a-zA-Z]*[dD]\b)|\bgit\b[^\n]*\bpush\b[^\n]*(?:--delete|--mirror|--prune|\s:)|deleteRef|['"`]branch['"`]\s*,\s*['"`]-(?:-delete|[a-zA-Z]*[dD])['"`]|['"`]push['"`][^\]\n]*['"`](?:--delete|-d|--mirror|--prune|:[^'"`]+)['"`]/,
    REASON.deleteBranch,
  ],
  [/--no-verify|core\.hooksPath/i, REASON.hooks],
  [
    /\bvercel\b[^\n]*(?:--prod\b|\bpromote\b)|['"`]vercel['"`][^\]\n]*['"`](?:--prod|promote)['"`]/,
    REASON.production,
  ],
]

const GUARDED_TEXT =
  /\.claude\/(?:hooks\b|settings(?:\.local)?\.json)|\.githooks\b|\.git\/(?:hooks|config)\b|\.gitconfig\b/
const SETTINGS_TEXT =
  /\/rulesets\b[\s\S]*\b(?:PUT|POST|PATCH|DELETE)\b|\b(?:PUT|POST|PATCH|DELETE)\b[\s\S]*\/rulesets\b/
const SPAWNS =
  /child_process|subprocess|execSync|execFileSync|spawnSync|\bspawn\(|\bexecFile\(|os\.system|\bPopen\b|\bsystem\(/
const SPAWNED_RISK = /\b(?:merge|--delete|--prod|promote|no-verify|hookspath|push)\b/i

/** Code for another interpreter, judged by what it says. */
function judgeScript(code) {
  for (const [pattern, reason] of DANGEROUS_TEXT) if (pattern.test(code)) return deny(reason)
  if (GUARDED_TEXT.test(code)) return ask(REASON.guardFiles)
  if (SETTINGS_TEXT.test(code)) return ask(REASON.settings)
  return SPAWNS.test(code) && SPAWNED_RISK.test(code) ? ask(REASON.unreadable) : ALLOW
}

/** A file's text, if it is a readable file small enough to judge. */
function readText(path) {
  try {
    return statSync(path).isFile() && statSync(path).size <= 256_000
      ? readFileSync(path, 'utf8')
      : null
  } catch {
    return null
  }
}

const PACKAGE_VALUED = ['-C', '--dir', '--prefix', '--filter', '-F', '-w', '--workspace', '--cwd']

/** The script a package manager runs for `pnpm <name>`, `npm run <name>` or `npm test`, if any. */
function scriptName(manager, args) {
  const words = withoutValues(args, PACKAGE_VALUED)
  if (words[0] === 'run' || words[0] === 'run-script') return words[1] ?? null
  if (manager !== 'npm') return words[0] ?? null
  const lifecycle = {
    t: 'test',
    tst: 'test',
    test: 'test',
    start: 'start',
    stop: 'stop',
    restart: 'restart',
  }
  return lifecycle[words[0]] ?? null
}

/** That script's text, with the pre- and post-scripts that run around it, or null. */
function packageScript(state, manager, args) {
  const name = scriptName(manager, args)
  if (!name) return null
  for (let dir = state.cwd; ; dir = dirname(dir)) {
    const text = readText(join(dir, 'package.json'))
    if (text) {
      try {
        const scripts = JSON.parse(text).scripts ?? {}
        if (scripts[name] === undefined) return null
        return [scripts[`pre${name}`], scripts[name], scripts[`post${name}`]]
          .filter(Boolean)
          .join('\n')
      } catch {
        return null
      }
    }
    if (dirname(dir) === dir) return null
  }
}

const SHELLS = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh', 'fish'])
/** Interpreters and the options that hand them code inline. */
const INLINE_CODE = {
  node: ['-e', '--eval', '-p', '--print'],
  bun: ['-e', '--eval'],
  deno: ['eval'],
  python: ['-c'],
  perl: ['-e', '-E'],
  ruby: ['-e'],
  osascript: ['-e'],
}
/** Programs that run the script file named by their first word that isn't an option. */
const SCRIPT_RUNNERS = new Set(['tsx', 'ts-node', 'vite-node', 'jiti', 'esno'])
/** Programs that run a command given to them as one string, such as tmux 'gh pr merge 1'. */
const STRING_RUNNERS = new Set([
  'tmux',
  'screen',
  'ssh',
  'watch',
  'script',
  'flock',
  'parallel',
  'su',
  'runuser',
  'expect',
  'entr',
  'nodemon',
  'concurrently',
])
const FILE_WRITERS = new Set([
  'rm',
  'mv',
  'cp',
  'chmod',
  'chown',
  'ln',
  'truncate',
  'tee',
  'touch',
  'unlink',
  'install',
  'rmdir',
  'rsync',
  'dd',
])
// A link is judged by both ends, since a link to a guard file is a way to write it.
const COPIERS = new Set(['cp', 'install', 'rsync'])
/** Programs that only print or search their arguments, so a `git` among them is just a word. */
const TEXT_ONLY = new Set([
  'echo',
  'printf',
  'cat',
  'grep',
  'egrep',
  'rg',
  'ag',
  'head',
  'tail',
  'less',
  'more',
  'wc',
  'sort',
  'uniq',
  'cut',
  'tr',
  'jq',
  'ls',
  'test',
  '[',
  'which',
  'type',
  'man',
  'help',
  'tldr',
  'sed',
  'diff',
  'file',
  'stat',
  'basename',
  'dirname',
  'realpath',
  'readlink',
  'true',
  'false',
  'printenv',
  'export',
  'local',
  'declare',
  'read',
  'alias',
])
const PROGRAMS = ['git', 'gh', 'vercel', 'vc']
const PNPM_COMMANDS = new Set([
  'install',
  'i',
  'add',
  'remove',
  'rm',
  'uninstall',
  'update',
  'up',
  'list',
  'ls',
  'll',
  'outdated',
  'why',
  'store',
  'run',
  'exec',
  'dlx',
  'create',
  'init',
  'publish',
  'pack',
  'link',
  'unlink',
  'audit',
  'licenses',
  'prune',
  'rebuild',
  'rb',
  'import',
  'fetch',
  'deploy',
  'env',
  'config',
  'c',
  'setup',
  'test',
  't',
  'start',
  'restart',
  'stop',
  'server',
  'doctor',
  'patch',
  'patch-commit',
  'patch-remove',
  'approve-builds',
  'self-update',
  'bin',
  'root',
  'cache',
  'help',
  'info',
  'view',
  'search',
  'whoami',
  'version',
  'login',
  'logout',
  'owner',
  'dist-tag',
  'docs',
  'home',
  'repo',
  'bugs',
  'catalog',
  'sbom',
])
const MAX_DEPTH = 6

/** Drops what only sets up a command, such as `env`, `sudo` or `command`, down to the program. */
function unwrap(words, state) {
  let rest = [...words]
  const env = { ...state.exported }
  let appends = false
  for (;;) {
    while (rest.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(rest[0])) {
      const [name, value] = rest[0].split(/=(.*)/s)
      env[name] = value
      rest = rest.slice(1)
    }
    const name = basename(rest[0] ?? '')
    const next = rest[1] ?? ''
    if (
      [
        'command',
        'builtin',
        'exec',
        'nohup',
        'caffeinate',
        'nice',
        'time',
        'stdbuf',
        'unbuffer',
        'chronic',
      ].includes(name)
    ) {
      rest = rest.slice(1)
      while (rest[0]?.startsWith('-')) rest = rest.slice(rest[0] === '-n' ? 2 : 1)
    } else if (name === 'env') {
      rest = rest.slice(1)
      while (rest[0]?.startsWith('-')) {
        const option = rest[0]
        if (option === '-S' || option === '--split-string') {
          rest = [...(rest[1] ?? '').split(/\s+/).filter(Boolean), ...rest.slice(2)]
        } else if (option.startsWith('-S') || option.startsWith('--split-string=')) {
          const text = option.startsWith('-S')
            ? option.slice(2)
            : option.slice('--split-string='.length)
          rest = [...text.split(/\s+/).filter(Boolean), ...rest.slice(1)]
        } else rest = rest.slice(['-u', '-C', '--unset', '--chdir'].includes(option) ? 2 : 1)
      }
    } else if (['sudo', 'timeout', 'xargs', 'npx', 'bunx', 'pnpx'].includes(name)) {
      if (name === 'xargs') appends = true
      rest = rest.slice(1)
      const valued = {
        sudo: ['-u', '-g', '-C', '-D', '-h', '-p', '-U'],
        timeout: ['-s', '-k', '--signal', '--kill-after'],
        xargs: ['-I', '-L', '-n', '-P', '-s', '-E', '-d', '-a'],
        npx: ['-p', '--package', '-c', '--call'],
        bunx: ['-p', '--package'],
        pnpx: [],
      }[name]
      while (rest[0]?.startsWith('-')) rest = rest.slice(valued.includes(rest[0]) ? 2 : 1)
      if (name === 'timeout') rest = rest.slice(1)
    } else if (
      ((name === 'pnpm' || name === 'yarn') && ['exec', 'dlx'].includes(next)) ||
      (name === 'npm' && ['exec', 'x'].includes(next)) ||
      (name === 'bun' && next === 'x') ||
      (['uv', 'poetry', 'pipenv', 'rye', 'pdm'].includes(name) && next === 'run')
    ) {
      rest = rest.slice(2)
      while (rest[0]?.startsWith('-')) rest = rest.slice(1)
      if (rest[0] === '--') rest = rest.slice(1)
    } else break
  }
  const settings = []
  const count = Number(env.GIT_CONFIG_COUNT ?? 0)
  for (let index = 0; index < count; index += 1) settings.push(env[`GIT_CONFIG_KEY_${index}`] ?? '')
  for (const match of (env.GIT_CONFIG_PARAMETERS ?? '').matchAll(/'([^']+)'(?:=|')/g))
    settings.push(match[1])
  // Another config file, or another home, is a way to hand git aliases the guard can't see.
  const elsewhereConfig = [
    'GIT_CONFIG_GLOBAL',
    'GIT_CONFIG_SYSTEM',
    'GIT_CONFIG',
    'HOME',
    'XDG_CONFIG_HOME',
  ].some((key) => key in env && env[key] !== process.env[key])
  if (elsewhereConfig) settings.push('include.path')
  const gitDirSet = Object.keys(env).some((key) => /^GIT_(?:DIR|WORK_TREE|INDEX_FILE)$/.test(key))
  return { words: rest, context: { settings, gitDirSet, appends } }
}

/** What a shell or interpreter with no script would read from stdin, or null when it can't be known. */
function stdinOf(command) {
  const heredoc = command.redirects.find(({ operator }) => operator === '<<')
  if (heredoc) return heredoc.heredoc.body ?? ''
  const string = command.redirects.find(({ operator }) => operator === '<<<')
  if (string) return string.target
  const file = command.redirects.find(({ operator }) => operator === '<')
  if (file) return null
  if (!command.pipedFrom) return ''
  const [program, ...words] = command.pipedFrom.words
  return ['echo', 'printf'].includes(basename(program ?? '')) ? words.join(' ') : null
}

function judgeCommand(command, state) {
  const verdicts = []
  for (const { operator, target } of command.redirects) {
    // 2>&1 and >&- point at file descriptors, not files.
    const toFile = operator.includes('>') && target !== '' && !/^(?:\d+|-)$/.test(target)
    if (toFile && isGuardedPath(resolve(state.cwd, expandHome(target))))
      verdicts.push(ask(REASON.guardFiles))
  }
  const { words, context } = unwrap(command.words, state)
  if (words.length === 0) return worst(verdicts)
  // npx vercel@latest runs vercel, and python3.12 is python.
  const name = basename(words[0])
    .replace(/(?<=.)@[^@]*$/, '')
    .replace(/^python[\d.]*$/, 'python')
  const args = words.slice(1)
  const pathOf = (word) => resolve(state.cwd, expandHome(word))
  const judgeInput = (asShell) => {
    const text = stdinOf(command)
    if (text === null) return ask(REASON.unreadable)
    return asShell ? judgeSource(text, deeper(state)) : judgeScript(text)
  }
  const judgeFile = (path, asShell) => {
    if (state.depth >= MAX_DEPTH) return ask(REASON.failed)
    if (/^\/dev\/(?:stdin|fd\/0)$/.test(path)) return judgeInput(asShell)
    if (unknown(path) || /^\/(?:dev|proc)\//.test(path)) return ask(REASON.unreadable)
    const text = readText(pathOf(path))
    if (text === null) return ALLOW
    return asShell || /^#!.*\b(?:ba|z|k|da)?sh\b/.test(text)
      ? judgeSource(text, deeper(state))
      : judgeScript(text)
  }
  /** A shell script given as a word: judged, or asked about when it came from a substitution. */
  const judgeScriptWord = (script) =>
    unknown(script) ? ask(REASON.unreadable) : judgeSource(script, deeper(state))

  // A program named by a variable or a pattern could be any of them, so it is judged as each.
  if (unknown(words[0]) || /[*?[]/.test(words[0])) {
    const runsScript = args.some((arg) => /^-[a-zA-Z]*c[a-zA-Z]*$/.test(arg))
    for (const program of runsScript ? [...PROGRAMS, 'sh'] : PROGRAMS)
      verdicts.push(
        judgeCommand({ ...command, words: [program, ...args], redirects: [] }, deeper(state)),
      )
  } else if (name === 'cd' || name === 'pushd') {
    const target = args.find((arg) => arg === '-' || !/^(?:-[LPe@]*|--)$/.test(arg))
    if (target === '-') state.cwd = UNKNOWN
    else state.cwd = target ? pathOf(target) : homedir()
  } else if (name === 'export') {
    for (const definition of args) {
      const [variable, value] = definition.split(/=(.*)/s)
      if (value !== undefined) state.vars[variable] = state.exported[variable] = value
    }
  } else if (name === 'git') verdicts.push(judgeGit(args, state, context))
  else if (name === 'gh') verdicts.push(judgeGh(args))
  else if (name === 'vercel' || name === 'vc') verdicts.push(judgeVercel(args))
  else if (['curl', 'wget', 'http', 'https', 'xh'].includes(name)) {
    verdicts.push(judgeHttp(name, args))
    const remoteName =
      args.some((arg) => /^-[a-zA-Z]*O[a-zA-Z]*$|^--remote-name/.test(arg)) && name === 'curl'
    const targets = [...downloadTargets(name, args), ...(remoteName ? [join(state.cwd, 'x')] : [])]
    if (targets.some((path) => unknown(path) || isGuardedPath(pathOf(path))))
      verdicts.push(ask(REASON.guardFiles))
  } else if (name === 'alias') {
    for (const definition of args) {
      const value = definition.split(/=(.*)/s)[1]
      if (value) verdicts.push(judgeScriptWord(value))
    }
  } else if (SHELLS.has(name)) {
    const flagIndex = args.findIndex((arg) => /^-[a-zA-Z]*c[a-zA-Z]*$/.test(arg))
    const script =
      flagIndex === -1
        ? null
        : (args.slice(flagIndex + 1).find((arg) => !arg.startsWith('-')) ?? '')
    const file = args.find((arg) => !arg.startsWith('-'))
    if (script !== null) verdicts.push(judgeScriptWord(script))
    else if (file) verdicts.push(judgeFile(file, true))
    else verdicts.push(judgeInput(true))
  } else if (name === 'source' || name === '.') {
    verdicts.push(args[0] ? judgeFile(args[0], true) : ask(REASON.unreadable))
  } else if (name === 'eval') verdicts.push(judgeScriptWord(args.join(' ')))
  else if (['awk', 'gawk', 'mawk', 'nawk'].includes(name))
    verdicts.push(judgeScript(args.join(' ')))
  else if ((name === 'bun' || name === 'deno') && args[0] === 'run') {
    const script = name === 'bun' ? packageScript(state, name, args) : null
    const file = args.slice(1).find((arg) => !arg.startsWith('-'))
    if (script !== null) verdicts.push(judgeScriptWord(script))
    else if (file) verdicts.push(judgeFile(file, false))
  } else if (name === 'bun' && packageScript(state, name, args) !== null)
    verdicts.push(judgeScriptWord(packageScript(state, name, args)))
  else if (INLINE_CODE[name]) {
    const flags = INLINE_CODE[name]
    let code = null
    let codeAt = -1
    args.forEach((arg, index) => {
      if (code !== null) return
      // -c code, -c<code>, -uc code (python) or --eval=code.
      const flag = flags.find(
        (option) =>
          arg === option ||
          (option.startsWith('--')
            ? arg.startsWith(`${option}=`)
            : new RegExp(`^-[a-zA-Z]*${option[1]}`).test(arg)),
      )
      if (!flag) return
      if (arg === flag || new RegExp(`^-[a-zA-Z]*${flag[1]}$`).test(arg)) {
        code = args[index + 1] ?? ''
        codeAt = index + 1
      } else {
        code = flag.startsWith('--')
          ? arg.slice(flag.length + 1)
          : arg.slice(arg.indexOf(flag[1]) + 1)
        codeAt = index
      }
    })
    const files = args.filter((arg, index) => !arg.startsWith('-') && index !== codeAt)
    if (files.some((file) => isGuardedPath(pathOf(file)))) verdicts.push(ask(REASON.guardFiles))
    if (code !== null) verdicts.push(unknown(code) ? ask(REASON.unreadable) : judgeScript(code))
    else if (files[0]) verdicts.push(judgeFile(files[0], false))
    else verdicts.push(judgeInput(false))
  } else if (SCRIPT_RUNNERS.has(name)) {
    const file = args.find((arg) => !arg.startsWith('-'))
    if (file) verdicts.push(judgeFile(file, false))
  } else if (['pnpm', 'npm', 'yarn', 'bun'].includes(name)) {
    const script = packageScript(state, name, args)
    const binary = withoutValues(args, PACKAGE_VALUED)[0]
    if (script !== null)
      verdicts.push(
        state.depth >= MAX_DEPTH ? ask(REASON.failed) : judgeSource(script, deeper(state)),
      )
    else if ((name === 'pnpm' || name === 'yarn') && binary && !PNPM_COMMANDS.has(binary))
      // pnpm and yarn run a local binary by its name when no script has it.
      verdicts.push(
        judgeCommand(
          { ...command, words: args.slice(args.indexOf(binary)), redirects: [] },
          deeper(state),
        ),
      )
  } else if (name === 'patch') {
    const input = valueOf(args, ['-i', '--input'])
    const dir = valueOf(args, ['-d', '--directory'])
    const redirected = command.redirects.find(({ operator }) => operator === '<')?.target
    const files = input !== null ? [input] : redirected ? [redirected] : []
    verdicts.push(
      judgePatch(
        files,
        dir === null ? state.cwd : pathOf(dir),
        files.length ? null : stdinOf(command),
      ),
    )
  } else if (['tar', 'bsdtar', 'unzip', 'ditto'].includes(name)) {
    const dir =
      name === 'ditto'
        ? args.at(-1)
        : valueOf(args, name === 'unzip' ? ['-d'] : ['-C', '--directory', '--cd'])
    const extracts =
      name !== 'tar' || args.some((arg) => /^-?[a-zA-Z]*x|^--extract|^--get/.test(arg))
    if (
      extracts &&
      (isGuardedPath(dir === null || dir === undefined ? state.cwd : pathOf(dir)) ||
        unknown(dir ?? ''))
    )
      verdicts.push(ask(REASON.guardFiles))
  } else if (FILE_WRITERS.has(name) || (name === 'sed' && args.some((arg) => /^-i/.test(arg)))) {
    const paths = args.filter(
      (arg) => !arg.startsWith('-') && !(name === 'dd' && !arg.startsWith('of=')),
    )
    const targets = name === 'dd' ? paths.map((arg) => arg.slice(3)) : paths
    // A copy writes only its destination; anything else changes every path it names.
    const written = COPIERS.has(name) ? targets.slice(-1) : targets
    const removes = ['rm', 'mv', 'rmdir'].includes(name)
    // A pattern such as .claude/* is judged by the folder it starts in.
    const folderOf = (path) =>
      /[*?[]/.test(path) ? path.split(/[*?[]/)[0].replace(/\/[^/]*$/, '') || '.' : path
    if (
      written.some((path) => {
        const target = pathOf(folderOf(path))
        return unknown(path) || isGuardedPath(target) || (removes && holdsGuard(target))
      })
    )
      verdicts.push(ask(REASON.guardFiles))
  } else {
    if (words[0].includes('/')) verdicts.push(judgeFile(words[0], false))
    if (!TEXT_ONLY.has(name)) {
      // A wrapper such as heavy.sh, flock or watch runs the command it is handed, as words or a string.
      args.forEach((arg, index) => {
        if (PROGRAMS.includes(arg) || SHELLS.has(arg))
          verdicts.push(
            judgeCommand({ ...command, words: args.slice(index), redirects: [] }, deeper(state)),
          )
        else if (/\s/.test(arg) && (STRING_RUNNERS.has(name) || /\b(?:gh|git|vercel)\b/.test(arg)))
          verdicts.push(judgeScriptWord(arg))
      })
    }
  }
  return worst(verdicts)
}

/** One command line's verdict, walking its commands in order so a `cd`, a variable or a `git switch` counts. */
function judgeSource(source, state) {
  if (state.depth > MAX_DEPTH) return ask(REASON.failed)
  const items = commandsOf(tokenize(source))
  const stack = []
  const verdicts = []
  let current = state
  for (const item of items) {
    if (item.scope === '(') {
      stack.push(current)
      current = cloneState(current)
    } else if (item.scope === ')') current = stack.pop() ?? current
    else {
      for (const sub of item.subs) verdicts.push(judgeSource(sub, deeper(current)))
      const words = item.words.map((word) => expand(word, current))
      if (
        words.length &&
        words.every((word) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) &&
        !item.redirects.length
      ) {
        for (const word of words) {
          const [variable, value] = word.split(/=(.*)/s)
          current.vars[variable] = value
        }
        continue
      }
      const redirects = item.redirects.map((redirect) => ({
        ...redirect,
        target: expand(redirect.target, current),
      }))
      const pipedFrom = item.pipedFrom && {
        ...item.pipedFrom,
        words: item.pipedFrom.words.map((word) => expand(word, current)),
      }
      verdicts.push(judgeCommand({ ...item, words, redirects, pipedFrom }, current))
    }
  }
  return worst(verdicts)
}

function judgeEdit(input, git) {
  const file = input.tool_input?.file_path ?? input.tool_input?.notebook_path
  if (typeof file !== 'string' || file === '') return ALLOW
  const path = resolve(input.cwd ?? process.cwd(), expandHome(file))
  const repo = git.repoOf(dirname(path))
  if (repo && (path + sep).startsWith(join(repo.top, 'src', 'content', 'generated') + sep))
    return deny(REASON.generated)
  if (repo && repo.branch === MAIN) return deny(REASON.editMain)
  return isGuardedPath(path) ? ask(REASON.guardFiles) : ALLOW
}

// ---------- Git, for real ----------

function run(args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    }).trim()
  } catch {
    return null
  }
}

/** The nearest folder that exists at or above `dir`, since a file being written may not yet. */
function existingDir(dir) {
  let at = resolve(dir)
  while (!existsSync(at) && dirname(at) !== at) at = dirname(at)
  return at
}

export const realGit = {
  /** The checkout that holds `dir`: its top folder and current branch (null when detached). */
  repoOf(dir) {
    const at = existingDir(dir)
    const top = run(['-C', at, 'rev-parse', '--show-toplevel'])
    if (!top) return null
    return { top, branch: run(['-C', at, 'symbolic-ref', '--quiet', '--short', 'HEAD']) || null }
  },
  /** The upstream of the branch checked out at `dir`, such as origin/main, or null. */
  upstreamOf(dir) {
    return (
      run(['-C', existingDir(dir), 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']) ||
      null
    )
  },
}

// ---------- The hook ----------

/** The guard's verdict on one PreToolUse call: { decision: 'allow' | 'ask' | 'deny', reason }. */
export function decide(input, git = realGit) {
  let verdict = ALLOW
  if (input?.tool_name === 'Bash') {
    verdict = judgeSource(
      String(input.tool_input?.command ?? ''),
      newState(input.cwd ?? process.cwd(), git),
    )
  } else if (EDIT_TOOLS.has(input?.tool_name)) verdict = judgeEdit(input, git)
  if (verdict.decision === 'ask' && input?.agent_id)
    return deny(`${verdict.reason} ${REASON.subagent}`)
  return verdict
}

/** The hook's output: JSON for a deny or an ask, and nothing for an allow. */
export function answer(verdict) {
  if (verdict.decision === 'allow') return ''
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: verdict.decision,
      permissionDecisionReason: verdict.reason,
    },
  })
}

async function main() {
  let text = ''
  for await (const chunk of process.stdin) text += chunk
  process.stdout.write(answer(decide(JSON.parse(text))))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stdout.write(answer(ask(`${REASON.failed} (${error.message})`)))
  })
}
