import { readFileSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'

// The site's self-hosted fonts are subsets (scripts/fonts/subset.py): Playfair for Latin text and
// Tiro Devanagari Sanskrit for Devanagari. These read what the WOFF2 files themselves hold.

export const LATIN_FONTS = [
  'src/fonts/playfair/PlayfairText-Regular.woff2',
  'src/fonts/playfair/PlayfairText-Italic.woff2',
  'src/fonts/playfair/PlayfairText-SemiBold.woff2',
  'src/fonts/playfair/PlayfairDisplay-Medium.woff2',
]
export const DEVANAGARI_FONT =
  'src/fonts/tiro-devanagari-sanskrit/TiroDevanagariSanskrit-Regular.woff2'

/** Every face a browser loads. */
export const FONT_FILES = [...LATIN_FONTS, DEVANAGARI_FONT]

/** Where WOFF2 lists the tables read here among its known tables, so their tags take one byte. */
const KNOWN_TABLES = { cmap: 0, GSUB: 28 } as const

/** One table of a WOFF2 font, decompressed. */
function table(file: string, name: keyof typeof KNOWN_TABLES): Buffer {
  const font = readFileSync(file)
  let at = 48 // past the WOFF2 header
  const base128 = () => {
    let value = 0
    for (let i = 0; i < 5; i += 1) {
      const byte = font[at++] ?? 0
      value = value * 128 + (byte & 0x7f)
      if (!(byte & 0x80)) return value
    }
    throw new Error(`${file}: bad UIntBase128`)
  }
  const tables: { tag: number; length: number }[] = []
  for (let i = 0; i < font.readUInt16BE(12); i += 1) {
    const flags = font[at++] ?? 0
    const tag = flags & 0x3f
    if (tag === 0x3f) at += 4 // an arbitrary tag, never one read here
    const original = base128()
    // glyf (10) and loca (11) are transformed unless version 3; any other table only if not 0.
    const transformed = tag === 10 || tag === 11 ? flags >> 6 !== 3 : flags >> 6 !== 0
    tables.push({ tag, length: transformed ? base128() : original })
  }
  const data = brotliDecompressSync(font.subarray(at, at + font.readUInt32BE(20)))
  let offset = 0
  for (const { tag, length } of tables) {
    if (tag === KNOWN_TABLES[name]) return data.subarray(offset, offset + length)
    offset += length
  }
  throw new Error(`${file}: no ${name} table`)
}

/** The code points a WOFF2 font maps to a glyph, from its `cmap` table (formats 4 and 12). */
export function characterMap(file: string): Set<number> {
  const cmap = table(file, 'cmap')
  const points = new Set<number>()
  for (let i = 0; i < cmap.readUInt16BE(2); i += 1) {
    const start = cmap.readUInt32BE(8 + i * 8)
    const format = cmap.readUInt16BE(start)
    if (format === 4) {
      const segments = cmap.readUInt16BE(start + 6) / 2
      const ends = start + 14
      const starts = ends + segments * 2 + 2
      const deltas = starts + segments * 2
      const ranges = deltas + segments * 2
      for (let s = 0; s < segments; s += 1) {
        const first = cmap.readUInt16BE(starts + s * 2)
        const last = cmap.readUInt16BE(ends + s * 2)
        const delta = cmap.readInt16BE(deltas + s * 2)
        const range = cmap.readUInt16BE(ranges + s * 2)
        for (let point = first; point <= last && point !== 0xffff; point += 1) {
          const glyph =
            range === 0
              ? (point + delta) & 0xffff
              : cmap.readUInt16BE(ranges + s * 2 + range + (point - first) * 2)
          if (glyph !== 0) points.add(point)
        }
      }
    }
    if (format === 12) {
      for (let g = 0; g < cmap.readUInt32BE(start + 12); g += 1) {
        const first = cmap.readUInt32BE(start + 16 + g * 12)
        const last = cmap.readUInt32BE(start + 20 + g * 12)
        for (let point = first; point <= last; point += 1) points.add(point)
      }
    }
  }
  return points
}

/**
 * The OpenType substitution features a WOFF2 font keeps, from its `GSUB` feature list. The
 * subsetter drops a feature whose glyphs it dropped, so one listed here still does something.
 */
export function substitutionFeatures(file: string): Set<string> {
  const gsub = table(file, 'GSUB')
  const list = gsub.readUInt16BE(6)
  const features = new Set<string>()
  for (let i = 0; i < gsub.readUInt16BE(list); i += 1) {
    const record = list + 2 + i * 6
    features.add(gsub.toString('latin1', record, record + 4))
  }
  return features
}
