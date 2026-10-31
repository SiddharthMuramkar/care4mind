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

  it('leaves modules no palette colour of their own', () => {
    const hits: string[] = []
    for (const file of globSync('src/**/*.module.css')) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const [raw] of css.matchAll(/#[0-9a-f]{6}\b/gi)) hits.push(`${file}: ${raw}`)
    }
    expect(hits).toEqual([])
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

/** A rule's body, comments already gone, for a selector that is exactly `selector`. */
function rule(file: string, selector: string): string {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const bodies = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, found]) => (found ?? '').split(',').some((part) => part.trim() === selector))
    .map(([, , body]) => body ?? '')
  if (bodies.length === 0) throw new Error(`no ${selector} in ${file}`)
  return bodies.join('\n')
}

function declared(body: string, property: string): string | undefined {
  const match = new RegExp(`(?:^|[^\\w-])${property}\\s*:\\s*([^;]+)`).exec(body)
  return match?.[1]?.replace(/\s+/g, ' ').trim()
}

function hex(palette: { colours: Record<string, string> }, name: string): string {
  const value = palette.colours[name]
  if (!value || !/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`the palette has no #rrggbb --color-${name}`)
  }
  return value
}

/** The colour a reader sees: the ink at `opacity`, laid over the paper. */
function seen(ink: string, paper: string, opacity = 1): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
  return composite(`${ink}${alpha}`, paper)
}

describe('numerals and the paragraph anchor', () => {
  const palette = palettes().find((item) => item.name.includes('globals.css'))
  if (!palette) throw new Error('the site palette is missing')
  const paper = hex(palette, 'surface')

  it('the paragraph anchor: surface-link at its opacity on the paper ≥ 4.5:1', () => {
    const body = rule('src/components/prose/Prose.module.css', '.anchor')
    expect(declared(body, 'color')).toBe('var(--color-surface-link)')
    const opacity = Number(declared(body, 'opacity') ?? '1')
    expect(
      contrastRatio(seen(hex(palette, 'surface-link'), paper, opacity), paper),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('the contents numeral: surface-muted on the paper ≥ 4.5:1', () => {
    const body = rule('src/components/concept/Contents.module.css', '.numeral')
    expect(declared(body, 'color')).toBe('var(--color-surface-muted)')
    expect(contrastRatio(hex(palette, 'surface-muted'), paper)).toBeGreaterThanOrEqual(4.5)
  })

  it('the topic kicker numeral: surface-link on the paper ≥ 4.5:1', () => {
    const body = rule('src/app/topics/[slug]/page.module.css', '.order')
    expect(declared(body, 'color')).toBe('var(--color-surface-link)')
    expect(contrastRatio(hex(palette, 'surface-link'), paper)).toBeGreaterThanOrEqual(4.5)
  })

  it('the lit plate numeral: surface-link on the lit row ≥ 4.5:1', () => {
    const numeral = declared(
      rule('src/components/topics/ContentsPlate.module.css', '.numeral'),
      'color',
    )
    const background = declared(
      rule('src/components/topics/ContentsPlate.module.css', '.row'),
      'background',
    )
    expect(numeral).toMatch(/var\(--color-surface-link\)\s*calc\(var\(--lit,\s*0\)\s*\*\s*100%\)/)
    const wash = /var\(--color-highlight\)\s*calc\(var\(--lit,\s*0\)\s*\*\s*([\d.]+)%\)/.exec(
      background ?? '',
    )
    const percent = Number(wash?.[1])
    expect(percent).toBeGreaterThan(0)
    const row = seen(hex(palette, 'highlight'), paper, percent / 100)
    expect(contrastRatio(hex(palette, 'surface-link'), row)).toBeGreaterThanOrEqual(4.5)
  })

  it('no module uses --color-surface-rule as a text colour', () => {
    const hits: string[] = []
    for (const file of globSync('src/**/*.module.css')) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        for (const declaration of (body ?? '').matchAll(/(?:^|[^\w-])color\s*:\s*([^;]+)/g)) {
          const value = declaration[1] ?? ''
          if (value.includes('--color-surface-rule')) {
            hits.push(`${file} ${(selector ?? '').trim()}: ${value.trim()}`)
          }
        }
      }
    }
    expect(hits).toEqual([])
  })
})
