#!/usr/bin/env node
// @ts-check
// Installs the repo's git hooks (.githooks/) into the hooks folder that every checkout of the
// repo shares, so each worktree is covered whichever branch it is on. pnpm runs it as `prepare`,
// after an install that changed something.
//
// It never fails an install. With no git, in CI or on Vercel it does nothing, and anything that
// goes wrong is a warning. It writes a hook only when the hook changed, never replaces a newer
// version of one, and leaves alone a hook it didn't write.
//
//   node scripts/githooks/install.mjs [--root <dir>]   install into <dir>'s repo (default: here)
//
// Tested in tests/unit/githooks.test.ts. Plain Node, no dependencies.

import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SOURCE = resolve(dirname(fileURLToPath(import.meta.url)), '../../.githooks')
const VERSION = /^# care4mind-githook v(\d+)$/m
/** Words from the untracked pre-push hook these replace, which carried no version line. */
const LEGACY = 'Blocked: no direct pushes to'

/** A hook's version, 0 for the legacy pre-push, or null for a hook this script didn't write. */
export function versionOf(text) {
  const match = VERSION.exec(text)
  if (match) return Number(match[1])
  return text.includes(LEGACY) ? 0 : null
}

/** What to do with one hook: write it, or leave it and say why. */
export function plan(source, installed) {
  if (installed === source) return { write: false, warning: null }
  if (installed === null) return { write: true, warning: null }
  const was = versionOf(installed)
  const is = versionOf(source)
  if (was === null)
    return { write: false, warning: 'it was not written by this script, so it is left alone' }
  if (typeof is === 'number' && was > is)
    return {
      write: false,
      warning: `the installed version (v${was}) is newer than this one (v${is})`,
    }
  return { write: true, warning: null }
}

const git = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()

export function install(root, env = process.env) {
  if (env.CI || env.VERCEL) return []
  let hooks
  try {
    hooks = join(git(root, 'rev-parse', '--path-format=absolute', '--git-common-dir'), 'hooks')
  } catch {
    return []
  }
  const notes = []
  try {
    const hooksPath = git(root, 'config', '--get', 'core.hooksPath')
    if (hooksPath)
      notes.push(`core.hooksPath is set to ${hooksPath}, so git runs no hooks from ${hooks}`)
  } catch {
    // Unset, as it should be.
  }
  mkdirSync(hooks, { recursive: true })
  for (const name of readdirSync(SOURCE)) {
    const source = readFileSync(join(SOURCE, name), 'utf8')
    const target = join(hooks, name)
    const { write, warning } = plan(
      source,
      existsSync(target) ? readFileSync(target, 'utf8') : null,
    )
    if (warning) notes.push(`${name}: ${warning}`)
    if (!write) continue
    writeFileSync(target, source)
    chmodSync(target, 0o755)
    notes.push(`${name}: installed in ${hooks}`)
  }
  return notes
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const at = process.argv.indexOf('--root')
  try {
    for (const note of install(at === -1 ? process.cwd() : resolve(process.argv[at + 1] ?? '.')))
      console.error(`githooks: ${note}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`githooks: not installed (${message})`)
  }
}
