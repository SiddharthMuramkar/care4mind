import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import manifest from '@/app/manifest'
import { LOTUS } from '@/components/lotus'
import { customProperties, resolveColour } from '@/lib/contrast'

const iconSvg = () => readFileSync('src/app/icon.svg', 'utf8')

/** Every colour token in the global stylesheet, by name, resolved: ground → #151a3d. */
function colourTokens(): Map<string, string> {
  const declarations = customProperties(readFileSync('src/styles/globals.css', 'utf8'))
  return new Map(
    Object.entries(declarations)
      .filter(([name]) => name.startsWith('--color-'))
      .map(([name, value]) => [name.slice('--color-'.length), resolveColour(value, declarations)]),
  )
}

/** Each <tag> element in an SVG's source, as its attributes by name. */
function elements(svg: string, tag: string): Record<string, string>[] {
  return [...svg.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map(([, attributes = '']) =>
    Object.fromEntries(
      [...attributes.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]),
    ),
  )
}

describe('the tab icon, icon.svg', () => {
  it('draws the Fleuron’s lotus: its three petals and its dot', () => {
    const svg = iconSvg()
    expect(elements(svg, 'path').map(({ d }) => d)).toEqual([
      LOTUS.petals.centre,
      LOTUS.petals.left,
      LOTUS.petals.right,
    ])
    expect(elements(svg, 'circle')).toContainEqual(
      expect.objectContaining({
        cx: String(LOTUS.dot.cx),
        cy: String(LOTUS.dot.cy),
        r: String(LOTUS.dot.r),
      }),
    )
  })

  it('is drawn in lines: the petals stroked and unfilled, and no disc behind them', () => {
    const svg = iconSvg()
    expect(elements(svg, 'g')).toContainEqual(
      expect.objectContaining({ fill: 'none', stroke: colourTokens().get('highlight') }),
    )
    expect(elements(svg, 'circle'), 'circles in the icon beside its dot').toHaveLength(1)
  })

  it('turns to the paper ink on a dark tab bar, where vermilion lines would sink', () => {
    const svg = iconSvg()
    expect(svg).toContain('prefers-color-scheme: dark')
    expect(svg).toContain(colourTokens().get('ink'))
  })

  it('paints only in colour tokens, as an SVG served on its own can’t read var()', () => {
    const hexes = iconSvg().match(/#[0-9a-f]{3,8}\b/gi) ?? []
    expect(hexes, 'colours in icon.svg').not.toEqual([])
    const tokens = [...colourTokens().values()]
    const strays = hexes.filter((hex) => !tokens.includes(hex.toLowerCase()))
    expect(strays, 'colours in icon.svg that aren’t --color-* tokens').toEqual([])
  })
})

/** apple-icon.png's bytes, and the type of each of its chunks, in order. */
function appleIcon() {
  const png = readFileSync('src/app/apple-icon.png')
  const chunks: string[] = []
  // After the 8-byte signature, each chunk is its data's length, its type, its data and a checksum.
  for (let at = 8; at + 8 <= png.length; at += 12 + png.readUInt32BE(at)) {
    chunks.push(png.toString('latin1', at + 4, at + 8))
  }
  return { png, chunks }
}

describe('the home-screen icon, apple-icon.png', () => {
  it('is a PNG 180×180', () => {
    const { png, chunks } = appleIcon()
    expect(png.subarray(0, 8)).toEqual(Buffer.from('\x89PNG\r\n\x1a\n', 'latin1'))
    expect(chunks[0]).toBe('IHDR')
    // IHDR's data begins with the width and the height.
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([180, 180])
  })

  it('has no transparent pixel, which iOS would show as black', () => {
    const { png, chunks } = appleIcon()
    // IHDR's colour type, after the width, height and bit depth: 2 is red, green and blue, no alpha.
    expect(png[25], 'colour type').toBe(2)
    expect(chunks, 'a colour marked transparent').not.toContain('tRNS')
  })
})

describe('the web manifest', () => {
  it('is coloured with the ground', async () => {
    const ground = colourTokens().get('ground')
    const { theme_color, background_color } = await manifest()
    expect({ theme_color, background_color }).toEqual({
      theme_color: ground,
      background_color: ground,
    })
  })

  it('names icons that are files beside it', async () => {
    const sources = ((await manifest()).icons ?? []).map(({ src }) => src)
    expect(sources).not.toEqual([])
    const missing = sources.filter((src) => !existsSync(join('src/app', src)))
    expect(missing, 'icons the manifest names that src/app doesn’t hold').toEqual([])
  })
})
