import { globSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  composite,
  CONTRAST_PAIRS,
  contrastRatio,
  customProperties,
  resolveColour,
} from '@/lib/contrast'

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

describe('resolveColour', () => {
  const declarations = {
    '--press-indigo': '#151A3D',
    '--color-ground': 'var(--press-indigo)',
    '--color-ink': '#ffffff',
  }

  it('follows var() to the colour it names', () => {
    expect(resolveColour('var(--color-ground)', declarations)).toBe('#151a3d')
    expect(() => resolveColour('var(--color-missing)', declarations)).toThrow()
  })

  it('blends a color-mix() in sRGB as the browser does', () => {
    expect(resolveColour('color-mix(in srgb, #000000 50%, #ffffff)', {})).toBe('#808080')
    expect(resolveColour('color-mix(in srgb, #ff0000, #0000ff 25%)', {})).toBe('#bf0040')
    expect(
      resolveColour('color-mix(in srgb, var(--color-ink) 70%, transparent)', declarations),
    ).toBe('#ffffffb3')
    expect(
      resolveColour(
        'color-mix(in srgb, color-mix(in srgb, #ffffff 50%, transparent) 50%, #000000)',
        {},
      ),
    ).toBe('#555555c0')
  })

  it('refuses what it can’t compute', () => {
    expect(() => resolveColour('color-mix(in oklch, #000000, #ffffff)', {})).toThrow()
    expect(() => resolveColour('rgb(0 0 0)', {})).toThrow()
  })
})

/** Every CSS block that declares a full palette, keyed by file and selector, each colour resolved. */
function palettes(): { name: string; colours: Record<string, string> }[] {
  const found: { name: string; colours: Record<string, string> }[] = []
  for (const file of globSync('src/**/*.css')) {
    const css = readFileSync(file, 'utf8')
    for (const [, selector, body = ''] of css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(/([^{}]+)\{([^{}]*--color-ground:[^{}]*)\}/g)) {
      const declarations = { ...customProperties(css), ...customProperties(body) }
      const colours = Object.fromEntries(
        Object.entries(customProperties(body))
          .filter(([name]) => name.startsWith('--color-'))
          .map(([name, value]) => [
            name.slice('--color-'.length),
            resolveColour(value, declarations),
          ]),
      )
      found.push({ name: `${file} ${selector?.trim()}`, colours })
    }
  }
  return found
}

describe('the site palette', () => {
  const declarations = Object.entries(
    customProperties(readFileSync('src/styles/globals.css', 'utf8')),
  )

  it('writes each primitive colour once', () => {
    const primitives = declarations.filter(([name]) => name.startsWith('--press-'))
    expect(primitives).not.toEqual([])
    for (const [name, value] of primitives) expect(value, name).toMatch(/^#[0-9a-f]{6}$/)
    const values = primitives.map(([, value]) => value)
    expect(values).toEqual([...new Set(values)])
  })

  it('names each colour token by its role, as an alias or a mix of the primitives', () => {
    const tokens = declarations.filter(([name]) => name.startsWith('--color-'))
    expect(tokens).not.toEqual([])
    for (const [name, value] of tokens)
      expect(value, name).not.toMatch(/#|\b(?:rgba?|hsla?|oklch|lab)\(/i)
  })
})

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

/** The declarations of one rule in a CSS module, comments stripped. */
function rule(file: string, selector: string): string {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`(?:^|})\\s*${escaped}\\s*\\{([^{}]*)\\}`).exec(css)
  if (!match) throw new Error(`${file} has no ${selector} rule`)
  return match[1] ?? ''
}

describe('numerals and the paragraph anchor use the colours their pairs check', () => {
  const text = [
    { file: 'src/components/prose/Prose.module.css', selector: '.anchor', token: 'surface-muted' },
    {
      file: 'src/components/concept/Contents.module.css',
      selector: '.numeral',
      token: 'surface-muted',
    },
    { file: 'src/app/topics/[slug]/page.module.css', selector: '.order', token: 'surface-link' },
    {
      file: 'src/components/topics/ContentsPlate.module.css',
      selector: '.numeral',
      token: 'surface-link',
    },
  ]

  for (const { file, selector, token } of text) {
    it(`${file} ${selector} is written in ${token}, at full strength`, () => {
      const declarations = rule(file, selector)
      expect(declarations).toMatch(new RegExp(`(?:^|[;\\s])color:[^;]*var\\(--color-${token}\\)`))
      expect(declarations).not.toMatch(/(?:^|[;\s])opacity:/)
      expect(declarations).not.toMatch(/--color-highlight\b/)
    })
  }
})

describe('the rule colour is never text', () => {
  it('no module sets a text colour from --color-surface-rule', () => {
    const offenders = globSync('src/**/*.css').flatMap((file) => {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      return [...css.matchAll(/(?:^|[;{\s])color:([^;}]*)/g)]
        .filter(([, value]) => value?.includes('--color-surface-rule'))
        .map(([declaration]) => `${file}: ${declaration.trim()}`)
    })
    expect(offenders).toEqual([])
  })
})
