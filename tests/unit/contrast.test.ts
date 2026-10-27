import { globSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { CONTRAST_PAIRS, contrastRatio } from '@/lib/contrast'

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })
})

/** Every CSS block that declares a full palette, keyed by file and selector. */
function palettes(): { name: string; colours: Record<string, string> }[] {
  const found: { name: string; colours: Record<string, string> }[] = []
  for (const file of globSync('src/**/*.css')) {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*--color-ground:[^{}]*)\}/g)) {
      const colours = Object.fromEntries(
        [...(body ?? '').matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(
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
      it(`${palette.name}: ${pair.foreground} on ${pair.background} ≥ ${pair.minimum}:1`, () => {
        const foreground = palette.colours[pair.foreground]
        const background = palette.colours[pair.background]
        if (!foreground || !background) {
          throw new Error(`--color-${pair.foreground} or --color-${pair.background} missing`)
        }
        expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(pair.minimum)
      })
    }
  }
})
