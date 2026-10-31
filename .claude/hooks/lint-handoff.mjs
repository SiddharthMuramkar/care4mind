#!/usr/bin/env node
// Before a session or a builder stops, lint and typecheck when source changed.
// Exit 2 hands the errors back so the session keeps going. stop_hook_active means that
// already happened once: print the errors for the developer and let the session stop.
//
//   echo '<Stop input as JSON>' | node .claude/hooks/lint-handoff.mjs
//
// Tested in tests/unit/lint-handoff.test.ts. Plain Node, no dependencies.

import { spawnSync } from 'node:child_process'
import { extname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Extensions whose uncommitted changes are worth checking. */
const SOURCE = new Set(['.ts', '.tsx', '.mjs', '.cjs', '.css'])

/** The checks a source change asks for, in the order a person runs them. */
export function checksFor(paths) {
  const changed = paths.some((path) => SOURCE.has(extname(path).toLowerCase()))
  return changed ? ['pnpm lint', 'pnpm typecheck'] : []
}

/** 2 sends the session back. 0 lets it stop, including a second failure in a row. */
export function exitFor(failed, stopHookActive) {
  if (!failed || stopHookActive) return 0
  return 2
}

/**
 * Paths from `git status --porcelain=v1 -z`. A rename or copy is two records:
 * the status line holds the old path, and the next record is the new one.
 */
export function pathsFromStatusZ(text) {
  const records = text.split('\0').filter((record) => record !== '')
  const paths = []
  for (let index = 0; index < records.length; index++) {
    const record = records[index]
    const status = record.slice(0, 2)
    paths.push(record.slice(3))
    if (status.includes('R') || status.includes('C')) {
      index += 1
      if (records[index]) paths.push(records[index])
    }
  }
  return paths
}

const tail = (text) => {
  const max = 12_000
  if (text.length <= max) return text
  // tsc and eslint print the errors at the end.
  return `…[truncated]\n${text.slice(text.length - max)}`
}

function report(failures, stopHookActive) {
  const lead = stopHookActive
    ? 'Lint or the type check failed again. Stopping anyway; the errors follow.'
    : 'Lint or the type check failed. Fix them before stopping.'
  const body = failures.map(({ command, output }) => `$ ${command}\n${tail(output)}`).join('\n')
  return `${lead}\n${body}\n`
}

function git(cwd, args) {
  return spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' })
}

function changed(cwd) {
  const top = git(cwd, ['rev-parse', '--show-toplevel'])
  if (top.status !== 0) return { root: null, paths: [] }
  const root = top.stdout.trim()
  const status = git(root, ['status', '--porcelain=v1', '-z', '-uall'])
  if (status.status !== 0) return { root, paths: [] }
  return { root, paths: pathsFromStatusZ(status.stdout) }
}

function runCheck(command, cwd) {
  const script = command.slice('pnpm '.length)
  let result = spawnSync('pnpm', [script], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  })
  if (result.error?.code === 'ENOENT') {
    result = spawnSync(process.execPath, ['corepack', 'pnpm', script], {
      cwd,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    })
  }
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? `${result.error.message}\n` : ''}`
  return { command, status: result.status ?? 1, output }
}

async function readInput() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  const text = Buffer.concat(chunks).toString('utf8').trim()
  if (!text) return {}
  return JSON.parse(text)
}

async function main() {
  let input = {}
  try {
    input = await readInput()
  } catch {
    // A broken payload must not trap the session in a stop loop.
    process.exitCode = 0
    return
  }
  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : process.cwd()
  const { root, paths } = changed(cwd)
  const checks = checksFor(paths)
  if (!root || checks.length === 0) return
  const failures = checks.flatMap((command) => {
    const result = runCheck(command, root)
    return result.status === 0 ? [] : [result]
  })
  if (failures.length === 0) return
  const stopHookActive = input.stop_hook_active === true
  process.stderr.write(report(failures, stopHookActive))
  process.exitCode = exitFor(true, stopHookActive)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => {
    process.exitCode = 0
  })
}
