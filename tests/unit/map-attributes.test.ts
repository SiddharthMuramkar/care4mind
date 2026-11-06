import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { litRules, mapAttribute } from '@/components/map'

// The map's data attributes have one home in code; its stylesheet, which can't import names,
// must spell the same ones.

const CONTRACT = new Set<string>(Object.values(mapAttribute))
// Styling hooks the plate writes for its own stylesheet alone: no script reads them.
const STYLE_ONLY = new Set(['data-layer', 'data-side', 'data-topic'])
const attributesIn = (text: string) => new Set(text.match(/data-[a-z-]+/g) ?? [])

describe('the map’s data attributes', () => {
  it('styles only attributes the contract names, or its own styling hooks', () => {
    const css = readFileSync(
      join(__dirname, '../../src/components/map/ConceptMap.module.css'),
      'utf8',
    )
    for (const name of attributesIn(css))
      expect(CONTRACT.has(name) || STYLE_ONLY.has(name), name).toBe(true)
  })

  it('spells each name once, in its home, and the map’s code reads it from there', () => {
    const folder = join(__dirname, '../../src/components/map')
    const code = readdirSync(folder).filter(
      (file) => /\.tsx?$/.test(file) && file !== 'attributes.ts',
    )
    expect(code.length).toBeGreaterThan(0)
    for (const file of code) {
      const spelt = [...attributesIn(readFileSync(join(folder, file), 'utf8'))]
      expect(
        spelt.filter((name) => CONTRACT.has(name)),
        file,
      ).toEqual([])
    }
  })

  it('lights the plate by the contract’s attributes alone', () => {
    const layout = {
      points: [{ slug: 'atman' }, { slug: 'manas' }],
      connections: [{ source: 'atman', target: 'manas' }],
    }
    const rules = litRules(layout as never)
    expect(rules).toContain(`[${mapAttribute.map}]:has([${mapAttribute.point}="atman"]`)
    for (const name of attributesIn(rules)) expect(CONTRACT.has(name), name).toBe(true)
  })
})
