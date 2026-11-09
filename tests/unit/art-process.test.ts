import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// `pnpm art`, which CI never runs. Every test spawns the script as the command line would, with
// --root on a temporary folder of pictures made here.

const TOOL = fileURLToPath(new URL('../../scripts/art/process.mjs', import.meta.url))
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 }
const INK = { r: 120, g: 30, b: 40, alpha: 1 }
const CREAM = { r: 255, g: 248, b: 236, alpha: 1 }
const RING_GROUND = [249, 243, 231]

const run = (root: string) =>
  spawnSync(process.execPath, [TOOL, '--root', root], { encoding: 'utf8' })

/** A solid picture with no transparency. */
const solid = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: INK } })
    .png()
    .toBuffer()

/** Solid ink of the art's size, centred on a clear canvas. */
function sticker([artWidth, artHeight]: [number, number], [width, height]: [number, number]) {
  const left = Math.floor((width - artWidth) / 2)
  const top = Math.floor((height - artHeight) / 2)
  return sharp({ create: { width: artWidth, height: artHeight, channels: 4, background: INK } })
    .extend({
      left,
      top,
      right: width - artWidth - left,
      bottom: height - artHeight - top,
      background: CLEAR,
    })
    .png()
    .toBuffer()
}

/** Art that already has its own cream rim, 24 px wide, centred on a clear canvas. */
async function rimmedSticker(side: number, canvas: number) {
  const inner = await sharp({
    create: { width: side - 48, height: side - 48, channels: 4, background: INK },
  })
    .png()
    .toBuffer()
  const art = await sharp({ create: { width: side, height: side, channels: 4, background: CREAM } })
    .composite([{ input: inner, left: 24, top: 24 }])
    .png()
    .toBuffer()
  const margin = (canvas - side) / 2
  return sharp(art)
    .extend({ left: margin, top: margin, right: margin, bottom: margin, background: CLEAR })
    .png()
    .toBuffer()
}

/**
 * An Emblem master, 1024 px wide on the ring's cream ground: an oval ring 401 x 321 px holding
 * more of that cream, with a bar of ink for the motto below it.
 */
function emblemMaster() {
  const [width, height] = [1024, 1000]
  const data = Buffer.alloc(width * height * 3)
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      const reach = ((x - 512) / 200) ** 2 + ((y - 480) / 160) ** 2
      const ink = (reach <= 1 && reach >= 0.6) || (y >= 880 && y <= 940 && x >= 212 && x <= 812)
      data.set(ink ? [INK.r, INK.g, INK.b] : RING_GROUND, (y * width + x) * 3)
    }
  return sharp(data, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer()
}

/** A written picture's pixels, each read as [r, g, b, alpha]. */
async function pixelsOf(file: string) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const at = (x: number, y: number) => {
    const start = (y * info.width + x) * 4
    return [...data.subarray(start, start + 4)]
  }
  return { at, width: info.width, height: info.height }
}

let scratch = ''
let made = 0

type KeptRow = { family: string; newId: string; newSrc: string }

/** A made-up repo holding one kept Plate, any other kept pictures, and the generated ones. */
function repo(
  generated: Record<string, Buffer>,
  keptPlate: Buffer,
  others: { row: KeptRow; master: Buffer }[] = [],
) {
  made += 1
  const root = join(scratch, `repo-${made}`)
  const files: Record<string, Buffer | string> = {
    'scripts/art/originals.json': JSON.stringify({
      files: [
        { verdict: 'KEEP', family: 'plate', newId: 'plate-kept', newSrc: '/art/plates/kept.jpg' },
        ...others.map(({ row }) => ({ verdict: 'KEEP', ...row })),
      ],
    }),
    'art/masters/plates/kept.jpg': keptPlate,
    ...Object.fromEntries(
      others.map(({ row, master }) => [`art/masters/${row.newSrc.slice('/art/'.length)}`, master]),
    ),
    ...Object.fromEntries(
      Object.entries(generated).map(([name, bytes]) => [`art/generated/${name}.png`, bytes]),
    ),
  }
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), contents)
  }
  return root
}

beforeAll(() => {
  scratch = mkdtempSync(join(tmpdir(), 'art-process-'))
})

afterAll(() => rmSync(scratch, { recursive: true, force: true }))

describe('a run that finishes', () => {
  let root = ''
  let kept: Buffer
  let plateSmall: Buffer
  let first: ReturnType<typeof run>

  beforeAll(async () => {
    kept = await sharp(await solid(1024, 1024))
      .jpeg()
      .toBuffer()
    plateSmall = await solid(400, 400)
    root = repo(
      {
        'plate-big': await solid(1500, 1500),
        'plate-small': plateSmall,
        'pothi-palm': await sticker([600, 600], [640, 640]),
        'sticker-big': await sticker([1300, 1300], [1400, 1400]),
        'sticker-exact': await sticker([512, 512], [600, 600]),
        'sticker-margin': await sticker([480, 480], [900, 900]),
        'sticker-narrow': await sticker([479, 600], [481, 602]),
        'sticker-rimmed': await rimmedSticker(600, 640),
      },
      kept,
    )
    first = run(root)
  }, 120_000)

  /** The table's row for one output file. */
  const row = (file: string) => {
    const line = first.stdout.split('\n').find((text) => text.includes(`'${file}'`))
    expect(line, file).toBeDefined()
    return line ?? ''
  }

  const size = (file: string) => sharp(join(root, file)).metadata()

  it('exits 0', () => {
    expect(first.stderr).toBe('')
    expect(first.status).toBe(0)
  })

  it('copies a kept Plate byte for byte', () => {
    expect(readFileSync(join(root, 'public/art/plates/kept.jpg')).equals(kept)).toBe(true)
  })

  it.each([
    ['plate-big', 'plates/plate-big.jpg'],
    ['pothi-palm', 'stickers/pothi-palm.png'],
    ['sticker-exact', 'stickers/sticker-exact.png'],
  ])('sends %s to %s, with a 320 px card', async (_id, path) => {
    expect(existsSync(join(root, 'public/art', path))).toBe(true)
    expect(await size(`art/cards/${path}`)).toMatchObject({ width: 320, height: 320 })
  })

  it.each(['plates/plate-big.jpg', 'stickers/sticker-big.png'])(
    'caps %s at 1024 px',
    async (path) => {
      expect(await size(`public/art/${path}`)).toMatchObject({ width: 1024, height: 1024 })
    },
  )

  it('flags a Plate under 512 px', () => {
    expect(row('public/art/plates/plate-small.jpg')).toContain('under 512 px')
  })

  it('flags art under 512 px on a larger canvas, even when the output is larger', async () => {
    const path = 'public/art/stickers/sticker-margin.png'
    expect((await size(path)).width).toBeGreaterThanOrEqual(512)
    expect(row(path)).toContain('under 512 px')
  })

  it('flags art with one side under 512 px, beside the edge it added', () => {
    expect(row('public/art/stickers/sticker-narrow.png')).toContain('edge added, under 512 px')
  })

  it('does not flag art of exactly 512 px, or any card copy', () => {
    expect(row('public/art/stickers/sticker-exact.png')).not.toContain('under 512 px')
    expect(row('art/cards/plates/plate-small.jpg')).not.toContain('under 512 px')
  })

  it('never enlarges a small Sticker or Plate', async () => {
    expect((await size('public/art/stickers/sticker-margin.png')).width).toBeLessThan(1024)
    expect(await size('public/art/plates/plate-small.jpg')).toMatchObject({
      width: 400,
      height: 400,
    })
  })

  it('encodes a generated Plate as JPEG at quality 85', async () => {
    const expected = await sharp(plateSmall).jpeg({ quality: 85 }).toBuffer()
    expect(readFileSync(join(root, 'public/art/plates/plate-small.jpg')).equals(expected)).toBe(
      true,
    )
  })

  it('pads a Sticker that is not square to a square', async () => {
    const { width, height } = await size('public/art/stickers/sticker-narrow.png')
    expect(width).toBe(height)
  })

  it('lays art with no edge of its own on a cream die-cut edge', async () => {
    const { at, width, height } = await pixelsOf(
      join(root, 'public/art/stickers/sticker-exact.png'),
    )
    const y = Math.floor(height / 2)
    const art = Array.from({ length: width }, (_, x) => x).find((x) => at(x, y)[0] === INK.r)
    expect(art).toBeGreaterThan(1)
    expect(at((art ?? 0) - 1, y)).toEqual([CREAM.r, CREAM.g, CREAM.b, 255])
    expect(at(0, 0)[3]).toBe(0)
    expect(row('public/art/stickers/sticker-exact.png')).toContain('edge added')
  })

  it('leaves art with its own cream edge alone, inside a 4% clear margin', async () => {
    const path = 'public/art/stickers/sticker-rimmed.png'
    expect(row(path)).not.toContain('edge added')
    const { at, width, height } = await pixelsOf(join(root, path))
    expect([width, height]).toEqual([648, 648])
    const middle = 324
    expect(at(23, middle)[3]).toBe(0)
    expect(at(24, middle)).toEqual([CREAM.r, CREAM.g, CREAM.b, 255])
    expect(at(623, middle)).toEqual([CREAM.r, CREAM.g, CREAM.b, 255])
    expect(at(624, middle)[3]).toBe(0)
  })

  it('writes the same bytes on a second run', () => {
    const snapshot = () =>
      ['public/art', 'art/cards'].flatMap((folder) =>
        readdirSync(join(root, folder), { recursive: true, withFileTypes: true })
          .filter((entry) => entry.isFile())
          .map((entry) => join(entry.parentPath, entry.name))
          .sort()
          .map((file) => [file, readFileSync(file).toString('base64')]),
      )
    const before = snapshot()
    expect(before.length).toBeGreaterThan(0)
    expect(run(root).status).toBe(0)
    expect(snapshot()).toEqual(before)
  })
})

describe('the Emblem ring', () => {
  let picture: Awaited<ReturnType<typeof pixelsOf>>

  beforeAll(async () => {
    const root = repo({}, await solid(300, 300), [
      {
        row: { family: 'emblem', newId: 'emblem-ring', newSrc: '/art/emblems/ring.png' },
        master: await emblemMaster(),
      },
    ])
    expect(run(root).status).toBe(0)
    picture = await pixelsOf(join(root, 'public/art/emblems/ring.png'))
  }, 120_000)

  it('leaves the motto out and comes out square, with no margin', () => {
    expect([picture.width, picture.height]).toEqual([401, 401])
  })

  it('clears the ground outside the ring, inside the box around it', () => {
    expect(picture.at(0, 40)[3]).toBe(0)
  })

  it('keeps the cream the ring encloses', () => {
    expect(picture.at(200, 200)).toEqual([...RING_GROUND, 255])
  })
})

describe('a run that stops', () => {
  const cases: [string, string, () => Promise<Buffer>, string][] = [
    [
      'a Sticker with no transparency',
      'sticker-opaque',
      () => solid(300, 300),
      'stickers/sticker-opaque.png has no transparency.',
    ],
    [
      'a fully transparent Sticker',
      'sticker-empty',
      () =>
        sharp({ create: { width: 300, height: 300, channels: 4, background: CLEAR } })
          .png()
          .toBuffer(),
      'stickers/sticker-empty.png is fully transparent.',
    ],
    [
      'a Plate that is not square',
      'plate-wide',
      () => solid(600, 400),
      'plates/plate-wide.jpg is 600 x 400. A Plate is square.',
    ],
    [
      'a Plate with transparency',
      'plate-clear',
      () => sticker([200, 200], [300, 300]),
      'plates/plate-clear.jpg has transparency. A Plate is opaque.',
    ],
    [
      'an id with no known first word',
      'ornament-vine',
      () => solid(300, 300),
      'ornament-vine.png in the generated folder needs a plate-, sticker- or pothi- id.',
    ],
  ]

  it.each(cases)('names %s, exits 2 and writes nothing', async (_title, name, picture, message) => {
    // The kept Plate is made first, so a run that stops already has a file it could have written.
    const root = repo({ [name]: await picture() }, await solid(300, 300))
    const result = run(root)
    expect(result.status).toBe(2)
    expect(result.stderr).toContain(message)
    expect(result.stderr).not.toMatch(/^\s+at /m)
    expect(result.stdout).toBe('')
    expect(existsSync(join(root, 'public'))).toBe(false)
    expect(existsSync(join(root, 'art/cards'))).toBe(false)
  })

  it('names an Emblem with no recipe, exits 2 and writes nothing', async () => {
    const root = repo({}, await solid(300, 300), [
      {
        row: { family: 'emblem', newId: 'emblem-seal', newSrc: '/art/emblems/seal.png' },
        master: await solid(300, 300),
      },
    ])
    const result = run(root)
    expect(result.status).toBe(2)
    expect(result.stderr).toContain('No recipe for emblem-seal (family emblem).')
    expect(existsSync(join(root, 'public'))).toBe(false)
  })
})
