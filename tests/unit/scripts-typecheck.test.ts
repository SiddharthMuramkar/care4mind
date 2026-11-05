import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

// The tools under scripts/ are plain JavaScript, so only the compiler's JS checking keeps their
// types honest, and only the engines field stops a Node too old to run them.

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const pkg = JSON.parse(read('package.json')) as {
  engines: { node: string }
  scripts: Record<string, string>
}
const config = JSON.parse(read('scripts/tsconfig.json')) as {
  compilerOptions: Record<string, unknown>
  include: string[]
}

const tools = readdirSync(new URL('../../scripts', import.meta.url), {
  recursive: true,
  encoding: 'utf8',
})
  .filter((path) => path.endsWith('.mjs'))
  .map((path) => join('scripts', path))
  .sort()

describe('the tools under scripts/', () => {
  it('finds the tools', () => {
    expect(tools).toContain(join('scripts', 'content', 'registry.mjs'))
    expect(tools).toContain(join('scripts', 'content', 'captures.mjs'))
  })

  it.each(tools)('%s opts in to type checking', (path) => {
    const lines = read(path).split('\n')
    const first = lines[0]?.startsWith('#!') ? lines[1] : lines[0]
    expect(first).toBe('// @ts-check')
  })

  it('are type-checked as JavaScript, strictly', () => {
    expect(config.compilerOptions).toMatchObject({
      allowJs: true,
      checkJs: true,
      strict: true,
      noUncheckedIndexedAccess: true,
    })
    expect(config.include).toContain('**/*.mjs')
  })

  it('are checked by pnpm typecheck', () => {
    expect(pkg.scripts.typecheck).toMatch(/tsc -p scripts\b/)
  })

  it('declare a Node new enough to run them', () => {
    // The tools need at least Node 22.15; engines may pin a newer major instead.
    const match = /^(?:>=)?(\d+)(?:\.(\d+|x))?/.exec(pkg.engines.node.trim())
    const major = Number(match?.[1] ?? 0)
    const minor = match?.[2] === undefined || match[2] === 'x' ? 0 : Number(match[2])
    expect(major > 22 || (major === 22 && minor >= 15)).toBe(true)
  })
})
