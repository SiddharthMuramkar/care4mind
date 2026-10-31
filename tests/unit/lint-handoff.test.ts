import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

// The handoff check (.claude/hooks/lint-handoff.mjs): which changes run which checks, and
// whether a failure sends the session back. Then the hook as Claude Code runs it.

const HOOK = resolve('.claude/hooks/lint-handoff.mjs')

const handoff = (await import(pathToFileURL(HOOK).href)) as {
  checksFor(paths: readonly string[]): string[]
  exitFor(failed: boolean, stopHookActive: boolean): number
  pathsFromStatusZ(text: string): string[]
}

const BOTH = ['pnpm lint', 'pnpm typecheck']

describe('which changes run which checks', () => {
  it.each(['.ts', '.tsx', '.mjs', '.cjs', '.css'])('%s runs lint and the type check', (ext) => {
    expect(handoff.checksFor([`src/changed${ext}`])).toEqual(BOTH)
  })

  it('ignores everything else, including a clean tree', () => {
    expect(handoff.checksFor([])).toEqual([])
    expect(handoff.checksFor(['README.md', 'src/app/icon.svg', 'notes.json'])).toEqual([])
  })

  it('runs both checks when any changed file is source, a rename included', () => {
    const status = 'R  docs/old.md\0src/new.ts\0?? README.md\0'
    expect(handoff.checksFor(handoff.pathsFromStatusZ(status))).toEqual(BOTH)
  })

  it('reads a deletion and a copy from status', () => {
    const status = 'D  src/gone.css\0C  src/a.md\0src/b.tsx\0'
    expect(handoff.pathsFromStatusZ(status)).toEqual(['src/gone.css', 'src/a.md', 'src/b.tsx'])
  })
})

describe('a failure sends the session back once', () => {
  it('blocks the first stop and allows the second', () => {
    expect(handoff.exitFor(true, false)).toBe(2)
    expect(handoff.exitFor(true, true)).toBe(0)
  })

  it('lets a clean check stop', () => {
    expect(handoff.exitFor(false, false)).toBe(0)
    expect(handoff.exitFor(false, true)).toBe(0)
  })
})

describe('the hook Claude Code runs', () => {
  const settings = JSON.parse(readFileSync('.claude/settings.json', 'utf8')) as {
    hooks: Record<string, { hooks: { command: string }[] }[]>
  }

  const commandFor = (event: 'Stop' | 'SubagentStop') => {
    const command = settings.hooks[event]?.[0]?.hooks[0]?.command
    if (!command) throw new Error(`No ${event} hook is configured`)
    return command
  }

  it('runs on Stop and on SubagentStop, through the launcher', () => {
    for (const event of ['Stop', 'SubagentStop'] as const) {
      expect(commandFor(event)).toContain('run-lint-handoff.sh')
      expect(commandFor(event)).toContain('exit 0')
    }
    expect(readFileSync('.claude/hooks/run-lint-handoff.sh', 'utf8')).toContain('lint-handoff.mjs')
  })

  it('stops at once when no source file changed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'handoff-clean-'))
    try {
      execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: dir })
      writeFileSync(join(dir, 'notes.md'), 'nothing to check\n')
      mkdirSync(join(dir, 'src'), { recursive: true })
      writeFileSync(join(dir, 'src', 'icon.svg'), '<svg/>\n')
      const result = spawnSync(process.execPath, [HOOK], {
        input: JSON.stringify({ hook_event_name: 'Stop', cwd: dir, stop_hook_active: false }),
        encoding: 'utf8',
      })
      expect(result.status).toBe(0)
      expect(result.stdout).toBe('')
      expect(result.stderr).toBe('')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('sends a type error back, and the second time stops and prints it', () => {
    const dir = mkdtempSync(join(tmpdir(), 'handoff-fail-'))
    const bin = join(dir, 'bin')
    try {
      execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: dir })
      writeFileSync(join(dir, 'broken.ts'), 'const n: number = "no"\n')
      mkdirSync(bin)
      // A stand-in for pnpm: lint passes, typecheck fails, and neither is the real toolchain.
      writeFileSync(
        join(bin, 'pnpm'),
        '#!/bin/sh\nif [ "$1" = lint ]; then exit 0; fi\necho "broken.ts(1,7): error TS2322" >&2\nexit 1\n',
      )
      execFileSync('chmod', ['+x', join(bin, 'pnpm')])
      const run = (stopHookActive: boolean) =>
        spawnSync(process.execPath, [HOOK], {
          input: JSON.stringify({
            hook_event_name: 'Stop',
            cwd: dir,
            stop_hook_active: stopHookActive,
          }),
          encoding: 'utf8',
          env: { ...process.env, PATH: `${bin}:/usr/bin:/bin` },
        })
      const first = run(false)
      expect(first.status).toBe(2)
      expect(first.stderr).toContain('Fix them before stopping')
      expect(first.stderr).toContain('TS2322')
      expect(first.stderr).toContain('pnpm typecheck')
      const second = run(true)
      expect(second.status).toBe(0)
      expect(second.stderr).toContain('Stopping anyway')
      expect(second.stderr).toContain('TS2322')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
