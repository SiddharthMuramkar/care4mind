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

let scratch = ''
let made = 0

/** A made-up repo holding one kept Plate and the given generated pictures. */
function repo(generated: Record<string, Buffer>, keptPlate: Buffer) {
  made += 1
  const root = join(scratch, `repo-${made}`)
  const files: Record<string, Buffer | string> = {
    'scripts/art/originals.json': JSON.stringify({
      files: [
        { verdict: 'KEEP', family: 'plate', newId: 'plate-kept', newSrc: '/art/plates/kept.jpg' },
      ],
    }),
    'art/masters/plates/kept.jpg': keptPlate,
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
  let first: ReturnType<typeof run>

  beforeAll(async () => {
    kept = await sharp(await solid(1024, 1024))
      .jpeg()
      .toBuffer()
    root = repo(
      {
        'plate-big': await solid(1500, 1500),
        'plate-small': await solid(400, 400),
        'pothi-palm': await sticker([600, 600], [640, 640]),
        'sticker-big': await sticker([1300, 1300], [1400, 1400]),
        'sticker-exact': await sticker([512, 512], [600, 600]),
        'sticker-margin': await sticker([480, 480], [900, 900]),
        'sticker-narrow': await sticker([479, 600], [481, 602]),
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
})
