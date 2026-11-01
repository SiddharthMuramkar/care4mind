import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** One face the share-card renderer sets type in: its family, weight and bytes. */
export interface CardFace {
  name: string
  data: Buffer
  weight: 400 | 500
  style: 'normal'
}

// The WOFF twins of the site's subsets (scripts/fonts/subset.py): Satori cannot read WOFF2.
const FILES = [
  { name: 'Playfair Display', file: 'playfair/PlayfairDisplay-Medium.woff', weight: 500 },
  { name: 'Playfair Text', file: 'playfair/PlayfairText-Regular.woff', weight: 400 },
  {
    name: 'Tiro Devanagari Sanskrit',
    file: 'tiro-devanagari-sanskrit/TiroDevanagariSanskrit-Regular.woff',
    weight: 400,
  },
] as const

let faces: Promise<CardFace[]> | undefined

/** The faces a share card is set in, read once per process. */
export function cardFaces(): Promise<CardFace[]> {
  faces ??= Promise.all(
    FILES.map(async ({ name, file, weight }) => ({
      name,
      weight,
      style: 'normal' as const,
      data: await readFile(join(process.cwd(), 'src', 'fonts', file)),
    })),
  )
  return faces
}
