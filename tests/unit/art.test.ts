import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { art, type ArtOrigin } from '@/art'
import { EMBLEM_MARK, EMBLEM_RING } from '@/art/emblem'
import { ART } from '@/art/registry'

import nextConfig from '../../next.config'

const PUBLIC = join(process.cwd(), 'public')
const LICENCE = "The client's own picture; reuse confirmation pending"
const MAX_BYTES = 1_500_000

interface Original {
  verdict: string
  newId: string
  newSrc: string
  wpId: number
}

const { files } = JSON.parse(
  readFileSync(join(process.cwd(), 'scripts/art/originals.json'), 'utf8'),
) as { files: Original[] }
const KEPT = files.filter((file) => file.verdict === 'KEEP')

/** Whether an origin says everything its kind has to. */
function isComplete(origin: ArtOrigin): boolean {
  switch (origin.kind) {
    case 'care4mind':
      return origin.wpId > 0 && origin.oldPath.startsWith('/wp-content/uploads/')
    case 'generated':
      return [origin.tool, origin.model, origin.prompt, origin.made].every(Boolean)
    case 'licensed':
      return [origin.credit, origin.source].every(Boolean)
  }
}

describe('the image settings', () => {
  it('serve AVIF first, cached for 31 days, at only the widths the pictures use', () => {
    expect(nextConfig.images).toEqual({
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 2_678_400,
      imageSizes: [64, 72, 112, 120, 128, 144, 160, 168, 200, 224, 240, 320, 336, 360, 400, 480],
    })
  })
})

describe('art', () => {
  it('returns the record of a picture, with the pixels of its file', () => {
    expect(art('plate-jeweller')).toMatchObject({
      family: 'plate',
      src: '/art/plates/jeweller.jpg',
      width: 1024,
      height: 1024,
      caption: 'The jeweller',
      origin: {
        kind: 'care4mind',
        wpId: 464,
        oldPath: '/wp-content/uploads/2024/05/Jewellry-making-2.jpeg',
      },
    })
  })
})

describe('the Emblem records', () => {
  it('are the registry’s own', () => {
    expect(art('emblem-ring')).toBe(EMBLEM_RING)
    expect(art('emblem-mark')).toBe(EMBLEM_MARK)
  })

  // Error pages are client components, so anything `emblem.ts` runs reaches the browser.
  it('import nothing but types, so a client component can use them', () => {
    const source = readFileSync(join(process.cwd(), 'src/art/emblem.ts'), 'utf8')
    expect(source.match(/^import (?!type\b).*$/gm)).toBeNull()
  })
})

describe('the art registry', () => {
  it('holds the 22 kept pictures', () => {
    expect(ART).toHaveLength(22)
  })

  it('has a unique kebab-case id for every picture', () => {
    const ids = ART.map((record) => record.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  it('has a record, with its address and old id, for every picture kept from the old site', () => {
    expect(KEPT).toHaveLength(22)
    for (const kept of KEPT) {
      const record = ART.find((candidate) => candidate.id === kept.newId)
      expect(record?.src, kept.newId).toBe(kept.newSrc)
      expect(record?.origin.wpId, kept.newId).toBe(kept.wpId)
      expect(record?.approved, kept.newId).toBe(true)
      expect(record?.licence, kept.newId).toBe(LICENCE)
    }
  })

  it('has no file under public/art without a record', () => {
    const onDisk = readdirSync(join(PUBLIC, 'art'), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
      .map((entry) => join(entry.parentPath, entry.name).slice(PUBLIC.length))
      .sort()
    expect(onDisk).toEqual(ART.map((record) => record.src).sort())
  })

  describe.each(ART)('$id', (record) => {
    it('has a file under the size limit', () => {
      const path = join(PUBLIC, record.src)
      expect(existsSync(path)).toBe(true)
      expect(statSync(path).size).toBeLessThan(MAX_BYTES)
    })

    it('states the true pixels of its file', async () => {
      // autoOrient: the size after any EXIF rotation, so a rotated file cannot pass with its sides swapped.
      const { autoOrient } = await sharp(join(PUBLIC, record.src)).metadata()
      expect(autoOrient).toEqual({ width: record.width, height: record.height })
    })

    it('has alt text of at most 125 characters', () => {
      expect(record.alt).not.toBe('')
      expect(record.alt.length).toBeLessThanOrEqual(125)
    })

    it('has a complete origin and a licence', () => {
      expect(isComplete(record.origin)).toBe(true)
      expect(record.licence).not.toBe('')
    })
  })
})
