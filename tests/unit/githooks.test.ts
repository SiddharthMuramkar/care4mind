import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// The repo's git hooks (.githooks/) and the installer that puts them where every checkout shares
// them, run against throwaway repos so nothing here touches this repo's own hooks.

const INSTALL = resolve('scripts/githooks/install.mjs')
const installer = (await import(pathToFileURL(INSTALL).href)) as {
  versionOf(text: string): number | null
  plan(source: string, installed: string | null): { write: boolean; warning: string | null }
}

const PRE_PUSH = readFileSync('.githooks/pre-push', 'utf8')
const ZEROS = '0'.repeat(40)
const SHA = 'a'.repeat(40)

// Isolated from the developer's own git settings, which may set a hooks path of their own.
const ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 't',
  GIT_AUTHOR_EMAIL: 't@example.com',
  GIT_COMMITTER_NAME: 't',
  GIT_COMMITTER_EMAIL: 't@example.com',
  CI: '',
  VERCEL: '',
}

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, {
    cwd,
    env: ENV,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
const attempt = (cwd: string, ...args: string[]) =>
  spawnSync('git', args, { cwd, env: ENV, encoding: 'utf8' })
const runInstaller = (root: string, env: NodeJS.ProcessEnv = ENV) =>
  spawnSync(process.execPath, [INSTALL, '--root', root], { env, encoding: 'utf8' })

const root = mkdtempSync(join(tmpdir(), 'githooks-'))
const repo = join(root, 'repo')
const worktree = join(root, 'repo-wt-x')
const hooks = join(repo, '.git', 'hooks')

beforeAll(() => {
  git(root, 'init', '--quiet', '--initial-branch=main', repo)
  git(repo, 'commit', '--quiet', '--allow-empty', '-m', 'first')
  git(repo, 'worktree', 'add', '--quiet', worktree, '-b', 'ticket-1-x')
})
afterAll(() => rmSync(root, { recursive: true, force: true }))

describe('the installer', () => {
  it('installs from a linked worktree into the hooks folder every checkout shares', () => {
    const result = runInstaller(worktree)
    expect(result.status).toBe(0)
    expect(readFileSync(join(hooks, 'pre-commit'), 'utf8')).toBe(
      readFileSync('.githooks/pre-commit', 'utf8'),
    )
    expect(readFileSync(join(hooks, 'pre-push'), 'utf8')).toBe(PRE_PUSH)
    expect(result.stderr).toMatch(/pre-commit: installed/)
  })

  it('says nothing when the hooks are already current', () => {
    runInstaller(repo)
    expect(runInstaller(repo).stderr).toBe('')
  })

  it('does nothing in CI or on Vercel, and outside a repo', () => {
    const elsewhere = mkdtempSync(join(tmpdir(), 'githooks-none-'))
    try {
      expect(runInstaller(elsewhere).status).toBe(0)
      expect(runInstaller(repo, { ...ENV, CI: 'true' }).stderr).toBe('')
      expect(runInstaller(repo, { ...ENV, VERCEL: '1' }).stderr).toBe('')
    } finally {
      rmSync(elsewhere, { recursive: true, force: true })
    }
  })

  it('replaces the legacy pre-push, and leaves a hook it did not write alone', () => {
    const legacy = '#!/bin/sh\necho "Blocked: no direct pushes to main."\nexit 1\n'
    const foreign = '#!/bin/sh\n# git-lfs\ngit lfs pre-push "$@"\n'
    writeFileSync(join(hooks, 'pre-push'), legacy)
    writeFileSync(join(hooks, 'pre-commit'), foreign)
    const result = runInstaller(repo)
    expect(readFileSync(join(hooks, 'pre-push'), 'utf8')).toBe(PRE_PUSH)
    expect(readFileSync(join(hooks, 'pre-commit'), 'utf8')).toBe(foreign)
    expect(result.stderr).toMatch(/pre-commit: it was not written by this script/)
  })

  it('never downgrades a newer hook', () => {
    expect(installer.plan('# care4mind-githook v1\n', '# care4mind-githook v2\n')).toEqual({
      write: false,
      warning: 'the installed version (v2) is newer than this one (v1)',
    })
    expect(installer.plan('# care4mind-githook v2\n', '# care4mind-githook v1\n').write).toBe(true)
    expect(installer.versionOf(PRE_PUSH)).toBe(1)
  })

  it('warns when core.hooksPath would stop git reading the shared hooks', () => {
    git(repo, 'config', 'core.hooksPath', '/tmp/elsewhere')
    try {
      expect(runInstaller(repo).stderr).toMatch(/core\.hooksPath is set/)
    } finally {
      git(repo, 'config', '--unset', 'core.hooksPath')
    }
  })
})

describe('the hooks', () => {
  beforeAll(() => {
    rmSync(join(hooks, 'pre-commit'), { force: true })
    runInstaller(repo)
  })

  it('refuses a commit on main, and says what to do instead', () => {
    const result = attempt(repo, 'commit', '--allow-empty', '-m', 'on main')
    expect(result.status).not.toBe(0)
    expect(result.stderr).toMatch(/git switch -c <name> origin\/main/)
  })

  it('lets a commit on a branch through, in a worktree too', () => {
    expect(attempt(worktree, 'commit', '--allow-empty', '-m', 'on a branch').status).toBe(0)
  })

  const prePush = (lines: string) =>
    spawnSync('/bin/sh', [join(hooks, 'pre-push'), 'origin', 'url'], {
      input: lines,
      encoding: 'utf8',
    })

  it.each([
    [`refs/heads/x ${SHA} refs/heads/main ${SHA}\n`, 1],
    [`refs/heads/x ${SHA} refs/heads/master ${SHA}\n`, 1],
    [`(delete) ${ZEROS} refs/heads/main ${SHA}\n`, 1],
    [`refs/heads/x ${SHA} refs/heads/x ${ZEROS}\n`, 0],
    [`refs/heads/x ${SHA} refs/heads/x ${SHA}\n`, 0],
    [`refs/heads/main ${SHA} refs/heads/main ${ZEROS}\n`, 0],
  ])('pre-push given %j exits %i', (lines, status) => {
    expect(prePush(lines).status).toBe(status)
  })
})
