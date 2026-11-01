import { globSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { composite, CONTRAST_PAIRS, contrastRatio } from '@/styles/contrast'

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })
})

describe('composite', () => {
  it('lays a translucent colour over an opaque one', () => {
    expect(composite('#ff000080', '#0000ff')).toBe('#80007f')
    expect(composite('#123456ff', '#ffffff')).toBe('#123456')
    expect(composite('#12345600', '#abcdef')).toBe('#abcdef')
  })

  it('rejects anything but a #rrggbbaa colour over a #rrggbb one', () => {
    expect(() => composite('#ff0000', '#0000ff')).toThrow()
    expect(() => composite('#ff000080', '#0000ff80')).toThrow()
  })
})

/** Every CSS block that declares a full palette, keyed by file and selector. */
function palettes(): { name: string; colours: Record<string, string> }[] {
  const found: { name: string; colours: Record<string, string> }[] = []
  for (const file of globSync('src/**/*.css')) {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*--color-ground:[^{}]*)\}/g)) {
      const colours = Object.fromEntries(
        [...(body ?? '').matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6}(?:[0-9a-f]{2})?)\s*;/gi)].map(
          ([, name, value]) => [name, value],
        ),
      )
      found.push({ name: `${file} ${selector?.trim()}`, colours })
    }
  }
  return found
}

describe('palettes meet WCAG 2.2 AA contrast', () => {
  const all = palettes()

  it('finds the site palette', () => {
    expect(all.some((palette) => palette.name.includes('globals.css'))).toBe(true)
  })

  for (const palette of all) {
    for (const pair of CONTRAST_PAIRS) {
      const on = 'over' in pair ? `${pair.background} over ${pair.over}` : pair.background
      it(`${palette.name}: ${pair.foreground} on ${on} ≥ ${pair.minimum}:1`, () => {
        const foreground = palette.colours[pair.foreground]
        const background = palette.colours[pair.background]
        const under = 'over' in pair ? palette.colours[pair.over] : undefined
        if (!foreground || !background || ('over' in pair && !under)) {
          throw new Error(`a colour of ${pair.foreground} on ${on} is missing`)
        }
        const seen = under ? composite(background, under) : background
        expect(contrastRatio(foreground, seen)).toBeGreaterThanOrEqual(pair.minimum)
      })
    }
  }
})
