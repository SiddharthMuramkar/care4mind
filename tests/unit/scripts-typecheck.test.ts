import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

// The tools under scripts/ are plain JavaScript, so only the compiler's JS checking keeps their
// types honest, and only the engines field stops a Node too old to run them.

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  engines: { node: string }
  scripts: Record<string, string>
}
const config = JSON.parse(readFileSync('scripts/tsconfig.json', 'utf8')) as {
  compilerOptions: Record<string, unknown>
  include: string[]
}

const tools = readdirSync('scripts', { recursive: true, encoding: 'utf8' })
  .filter((path) => path.endsWith('.mjs'))
  .map((path) => join('scripts', path))

describe('the tools under scripts/', () => {
  it('finds the tools', () => {
    expect(tools).toContain(join('scripts', 'content', 'registry.mjs'))
  })

  it.each(tools)('%s opts in to type checking', (path) => {
    const lines = readFileSync(path, 'utf8').split('\n')
    const first = lines[0]?.startsWith('#!') ? lines[1] : lines[0]
    expect(first).toBe('// @ts-check')
  })

  it('are type-checked as JavaScript, strictly', () => {
    expect(config.compilerOptions).toMatchObject({ allowJs: true, checkJs: true, strict: true })
    expect(config.include).toContain('**/*.mjs')
  })

  it('are checked by pnpm typecheck', () => {
    expect(pkg.scripts.typecheck).toMatch(/tsc (--noEmit )?-p scripts\b/)
  })

  it('declare the Node they need', () => {
    const [major, minor] = (pkg.engines.node.match(/^>=(\d+)\.(\d+)/) ?? []).slice(1).map(Number)
    expect(major).toBe(22)
    expect(minor).toBeGreaterThanOrEqual(15)
  })
})
