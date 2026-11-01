import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean)

const topLevel = new Set(tracked.map((file) => file.split('/')[0]))

const scripts = Object.keys(
  (JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }).scripts,
)

// pnpm's own commands, which no package.json script needs to define.
const PNPM_COMMANDS = new Set(['add', 'dlx', 'exec', 'install', 'remove', 'run', 'update', 'why'])

/** Pointers that name, on purpose, something this repo doesn't hold, and why. */
const ELSEWHERE = new Map([
  ['MISSION.md', 'the /teach workspace, outside the repo'],
  ['docs/agents/', 'removed; ADR 0005 says why'],
])

/** A backticked token that reads as a path in this repo, as the path to look for. */
function repoPath(token: string): string | undefined {
  if (/[\s*<>{}$…]/.test(token) || ELSEWHERE.has(token)) return undefined
  const path = token.replace(/^\.\//, '').replace(/:\d+(?::\d+)?$/, '')
  if (path.startsWith('@/')) return `src/${path.slice(2)}`
  const first = path.split('/')[0] ?? ''
  if (path.includes('/')) return topLevel.has(first) ? path : undefined
  return /^[A-Z][A-Z0-9_-]*\.md$/.test(path) ? path : undefined
}

function resolves(path: string): boolean {
  return ['', '.ts', '.tsx', '/index.ts'].some((ending) => existsSync(path + ending))
}

function headings(file: string): string[] {
  return [...readFileSync(file, 'utf8').matchAll(/^#+\s+(.+?)\s*$/gm)].map(([, text = '']) => text)
}

/** Every pointer in a piece of text that names a path, a script or a section that isn't there. */
function brokenPointers(text: string): string[] {
  const broken: string[] = []
  for (const [, token = ''] of text.matchAll(/`([^`\n]+)`/g)) {
    const path = repoPath(token.trim())
    if (path !== undefined && !resolves(path)) broken.push(`path ${token}`)
  }
  // Backticked, or bare where punctuation or a line's end closes it: "pnpm and yarn" is prose.
  for (const [, quoted, bare] of text.matchAll(/`pnpm ([\w:-]+)|\bpnpm ([\w:-]+)(?=[,.;)]|$)/gm)) {
    const name = quoted ?? bare ?? ''
    if (!PNPM_COMMANDS.has(name) && !scripts.includes(name)) broken.push(`script pnpm ${name}`)
  }
  for (const [, file = '', section = ''] of text.matchAll(/([\w./-]+\.md), "([^"]+)"/g)) {
    if (!existsSync(file) || !headings(file).includes(section))
      broken.push(`section ${file}, "${section}"`)
  }
  return broken
}

const HASH_COMMENTS = /\.(ya?ml|sh)$/
const SLASH_COMMENTS = /\.(ts|tsx|mjs|js|cjs|css)$/

/** A source file's comments, one line each; a doc is all prose. */
function prose(file: string): string {
  const text = readFileSync(file, 'utf8')
  if (file.endsWith('.md')) return text
  const comment = HASH_COMMENTS.test(file)
    ? /^\s*#(.*)$/
    : /^\s*(?:\/\/|\/\*+|\*)(.*)$|\s\/\/\s(.*)$/
  return text
    .split('\n')
    .map((line) => {
      const match = comment.exec(line)
      return match ? (match[1] ?? match[2] ?? '') : ''
    })
    .join('\n')
}

const sources = tracked.filter(
  (file) =>
    !file.startsWith('src/content/data/') &&
    (file.endsWith('.md') || HASH_COMMENTS.test(file) || SLASH_COMMENTS.test(file)),
)

describe('pointers in docs and comments', () => {
  it('reads the docs, the agent files and the source comments', () => {
    for (const file of ['CLAUDE.md', 'SPEC.md', 'README.md', 'GLOSSARY.md'])
      expect(sources).toContain(file)
    expect(sources).toContain('docs/adr/0005-rules-live-in-checks.md')
    expect(sources).toContain('.claude/hooks/guard.mjs')
    expect(sources.some((file) => file.startsWith('tests/e2e/'))).toBe(true)
  })

  it.each(sources)('%s names only paths, scripts and sections that exist', (file) => {
    expect(brokenPointers(prose(file))).toEqual([])
  })

  it('fails on a backticked path, a pnpm script or a README section that is not there', () => {
    expect(
      brokenPointers(
        'See `scripts/nope.mjs`, `@/content/nope`, `NOPE.md`, run `pnpm nope`, then pnpm gone. ' +
          'Read README.md, "Nowhere".',
      ),
    ).toEqual([
      'path scripts/nope.mjs',
      'path @/content/nope',
      'path NOPE.md',
      'script pnpm nope',
      'script pnpm gone',
      'section README.md, "Nowhere"',
    ])
  })

  it('passes the pointers that resolve, and leaves what is not a repo path alone', () => {
    expect(
      brokenPointers(
        'See `scripts/lane/heavy.sh`, `@/content`, `SPEC.md:12`, `src/app/concepts/[slug]/`, ' +
          '`archive/press-original`, `ticket-<n>-x`, `~/Desktop/x/`, `pnpm check:e2e`, ' +
          '`pnpm exec eslint`, pnpm and yarn. Read README.md, "Checks".',
      ),
    ).toEqual([])
  })
})
