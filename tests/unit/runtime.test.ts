import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const pkg = JSON.parse(read('package.json'))

describe('the Node runtime', () => {
  it('is 26 for Vercel, CI and version managers alike', () => {
    expect(pkg.engines.node).toBe('26.x')
    expect(read('.nvmrc').trim()).toBe('26')
    expect(pkg.devEngines.runtime).toEqual({ name: 'node', version: '26.x', onFail: 'download' })
  })

  it('is the one the scripts run on, whatever the system Node is', () => {
    expect(process.versions.node.split('.')[0]).toBe('26')
  })

  it('has types from the same major', () => {
    expect(pkg.devDependencies['@types/node']).toMatch(/^26\./)
  })
})
