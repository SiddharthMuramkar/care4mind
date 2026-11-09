// @ts-check
// Turns the masters, and any generated pictures, into the files the site serves and the 320 px
// copies share cards draw. Run it again and it writes the same bytes.
//
//   pnpm art

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import sharp from 'sharp'

import { rootFrom, runTool, ToolError } from '../content/cli.mjs'

const CARD_PX = 320
const MAX_PX = 1024
/** Art with a shorter side below this may look soft at its largest uses, so the table says so. */
const SMALL_PX = 512
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 }
/** The first row of the Emblem ring's master that holds the motto, not the ring. */
const MOTTO_TOP = 857
const RING_GROUND = { r: 249, g: 243, b: 231 }
const RING_TOLERANCE = 60
/** The smallest PNG sharp writes without changing a pixel. */
const PNG = { compressionLevel: 9, adaptiveFiltering: true }

/** A picture's RGBA pixels. */
async function pixels(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

/** The shorter side of a picture, in pixels. */
async function shortSide(input) {
  const { width, height } = await sharp(input).metadata()
  return Math.min(width, height)
}

/** Cuts a picture down to the box around every pixel that shows at all. */
async function trim(input, label) {
  const { data, width, height } = await pixels(input)
  let [left, top, right, bottom] = [width, height, -1, -1]
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      if (data.readUInt8((y * width + x) * 4 + 3) === 0) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  if (right < 0) throw new ToolError(`${label} is fully transparent.`)
  return sharp(input)
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png()
    .toBuffer()
}

/** Centres a picture on a clear square, with `share` of its longer side as margin all round. */
async function padSquare(input, share) {
  const { width, height } = await sharp(input).metadata()
  const long = Math.max(width, height)
  const side = long + 2 * Math.round(long * share)
  const left = Math.floor((side - width) / 2)
  const top = Math.floor((side - height) / 2)
  return sharp(input)
    .extend({
      left,
      top,
      right: side - width - left,
      bottom: side - height - top,
      background: CLEAR,
    })
    .png()
    .toBuffer()
}

/**
 * Whether a trimmed Sticker already has its cream edge: the share of cream among the solid pixels
 * just inside its outline. Art with its own edge scores 0.69 or more; art with none, under 0.2.
 */
async function hasCreamEdge(trimmed) {
  const { data, width, height } = await pixels(trimmed)
  const alphaAt = (x, y) =>
    x < 0 || y < 0 || x >= width || y >= height ? 0 : data.readUInt8((y * width + x) * 4 + 3)
  let rim = 0
  let cream = 0
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      if (alphaAt(x, y) < 250) continue
      const nearOutline =
        alphaAt(x - 4, y) < 128 ||
        alphaAt(x + 4, y) < 128 ||
        alphaAt(x, y - 4) < 128 ||
        alphaAt(x, y + 4) < 128
      if (!nearOutline) continue
      rim += 1
      const at = (y * width + x) * 4
      if (data.readUInt8(at) > 225 && data.readUInt8(at + 1) > 215 && data.readUInt8(at + 2) > 190)
        cream += 1
    }
  return cream / rim >= 0.4
}

/**
 * The picture's alpha grown outwards by a round brush of `radius`, as one byte a pixel. Stamped
 * here because sharp's dilate shrinks a white mask and leaves square corners. The picture's outer
 * rows must be clear.
 */
function grownMask({ data, width, height }, radius) {
  const alphaAt = (p) => data.readUInt8(p * 4 + 3)
  const brush = []
  for (let dy = -radius; dy <= radius; dy += 1)
    for (let dx = -radius; dx <= radius; dx += 1)
      if (dx * dx + dy * dy <= radius * radius) brush.push(dy * width + dx)

  const mask = new Uint8Array(width * height)
  for (let p = 0; p < mask.length; p += 1) {
    if (alphaAt(p) === 0) continue
    mask[p] = 255
    if (alphaAt(p - 1) && alphaAt(p + 1) && alphaAt(p - width) && alphaAt(p + width)) continue
    for (const offset of brush) mask[p + offset] = 255
  }
  return mask
}

/** A flat colour showing through a mask, as a sharp pipeline. */
function maskLayer(mask, size, [r, g, b], opacity) {
  const data = Buffer.alloc(mask.length * 4)
  mask.forEach((value, p) => {
    data[p * 4] = r
    data[p * 4 + 1] = g
    data[p * 4 + 2] = b
    data[p * 4 + 3] = Math.round(value * opacity)
  })
  return sharp(data, { raw: { ...size, channels: 4 } })
}

/** Lays a trimmed picture on a cream die-cut edge with a soft shadow below it. */
async function addDieCut(trimmed) {
  const { width, height } = await sharp(trimmed).metadata()
  const long = Math.max(width, height)
  const grow = Math.round(long * 0.03)
  const blur = long * 0.01
  const drop = Math.round(long * 0.006)
  // The edge and its shadow need this much clear space, or they would clip at the picture's box.
  const room = grow + Math.ceil(blur * 3) + drop
  const size = { width: width + 2 * room, height: height + 2 * room }
  const framed = await sharp(trimmed)
    .extend({ left: room, top: room, right: room, bottom: room, background: CLEAR })
    .png()
    .toBuffer()

  const mask = grownMask(await pixels(framed), grow)
  const shadow = await maskLayer(mask, size, [0, 0, 0], 0.18).blur(blur).png().toBuffer()
  const edge = await maskLayer(mask, size, [0xff, 0xf8, 0xec], 1).png().toBuffer()
  return sharp({ create: { ...size, channels: 4, background: CLEAR } })
    .composite([
      { input: shadow, left: 0, top: drop },
      { input: edge, left: 0, top: 0 },
      { input: framed, left: 0, top: 0 },
    ])
    .png()
    .toBuffer()
}

/** A kept Plate is served exactly as the client's file is. */
async function keptPlate(input) {
  return { bytes: input, short: await shortSide(input) }
}

async function sticker(input, label) {
  if ((await sharp(input).stats()).isOpaque)
    throw new ToolError(`${label} has no transparency. Remove its background first.`)
  const trimmed = await trim(input, label)
  const edge = !(await hasCreamEdge(trimmed))
  const body = edge ? await trim(await addDieCut(trimmed), label) : trimmed
  const padded = await padSquare(body, 0.04)
  // Its own pipeline, because sharp always runs extend after resize within one.
  const bytes = await sharp(padded)
    .resize(MAX_PX, MAX_PX, { fit: 'inside', withoutEnlargement: true })
    .png(PNG)
    .toBuffer()
  return { bytes, edge, short: await shortSide(trimmed) }
}

/**
 * Makes clear every pixel near the ground colour that the picture's edges can reach, so the cream
 * enclosed by the ring stays.
 */
function clearGround({ data, width, height }) {
  const { r, g, b } = RING_GROUND
  const isGround = (p) =>
    Math.abs(data.readUInt8(p * 4) - r) +
      Math.abs(data.readUInt8(p * 4 + 1) - g) +
      Math.abs(data.readUInt8(p * 4 + 2) - b) <
    RING_TOLERANCE
  const count = width * height
  const seen = new Uint8Array(count)
  const reach = []
  const visit = (p) => {
    if (seen[p] || !isGround(p)) return
    seen[p] = 1
    reach.push(p)
  }
  for (let x = 0; x < width; x += 1) {
    visit(x)
    visit(count - width + x)
  }
  for (let y = 0; y < height; y += 1) {
    visit(y * width)
    visit(y * width + width - 1)
  }
  for (let p = reach.pop(); p !== undefined; p = reach.pop()) {
    data[p * 4 + 3] = 0
    if (p % width > 0) visit(p - 1)
    if (p % width < width - 1) visit(p + 1)
    if (p >= width) visit(p - width)
    if (p < count - width) visit(p + width)
  }
}

/** The ring without its motto, and with its ground cleared. No margin: that is a Sticker's rule. */
async function emblemRing(input, label) {
  const { width } = await sharp(input).metadata()
  const above = await sharp(input).extract({ left: 0, top: 0, width, height: MOTTO_TOP }).toBuffer()
  const image = await pixels(above)
  clearGround(image)
  const raw = { width: image.width, height: image.height, channels: /** @type {4} */ (4) }
  const cleared = await sharp(image.data, { raw }).png().toBuffer()
  return emblem(await trim(cleared, label))
}

async function emblemMark(input, label) {
  return emblem(await trim(input, label))
}

/** A trimmed Emblem, squared up with no margin. */
async function emblem(art) {
  const padded = await padSquare(art, 0)
  return { bytes: await sharp(padded).png(PNG).toBuffer(), short: await shortSide(art) }
}

/** Unlike the client's Plates, a generated one arrives as a large PNG and is re-encoded. */
async function generatedPlate(input, label) {
  const { width, height } = await sharp(input).metadata()
  if (width !== height) throw new ToolError(`${label} is ${width} x ${height}. A Plate is square.`)
  if (!(await sharp(input).stats()).isOpaque)
    throw new ToolError(`${label} has transparency. A Plate is opaque.`)
  const bytes = await sharp(input)
    .resize(MAX_PX, MAX_PX, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()
  return { bytes, short: width }
}

/** The recipe for a kept picture. Throws on an Emblem it has no recipe for. */
function keptRecipe({ family, newId }) {
  if (family === 'plate') return keptPlate
  if (family === 'sticker') return sticker
  if (newId === 'emblem-ring') return emblemRing
  if (newId === 'emblem-mark') return emblemMark
  throw new ToolError(`No recipe for ${newId} (family ${family}).`)
}

function keptJobs(root) {
  const { files } = JSON.parse(readFileSync(join(root, 'scripts/art/originals.json'), 'utf8'))
  return files
    .filter((file) => file.verdict === 'KEEP')
    .map((file) => {
      const path = file.newSrc.slice('/art/'.length)
      const make = keptRecipe(file)
      return { family: file.family, path, master: join(root, 'art/masters', path), make }
    })
}

/** A generated picture's id is its file name, and the first word of it says what it is. */
function generatedJobs(root) {
  const folder = join(root, 'art/generated')
  if (!existsSync(folder)) return []
  return readdirSync(folder)
    .filter((name) => !name.startsWith('.') && !name.endsWith('.json'))
    .sort()
    .map((name) => {
      if (!name.endsWith('.png'))
        throw new ToolError(`${name} in the generated folder is not a .png.`)
      const id = name.slice(0, -'.png'.length)
      const master = join(folder, name)
      if (id.startsWith('plate-'))
        return { family: 'plate', path: `plates/${id}.jpg`, master, make: generatedPlate }
      if (id.startsWith('sticker-') || id.startsWith('pothi-'))
        return { family: 'sticker', path: `stickers/${id}.png`, master, make: sticker }
      throw new ToolError(`${name} in the generated folder needs a plate-, sticker- or pothi- id.`)
    })
}

/** The 320 px copy a share card draws: JPEG for a Plate, PNG for anything with transparency. */
function card(bytes, family) {
  const copy = sharp(bytes).resize(CARD_PX, CARD_PX)
  return (family === 'plate' ? copy.jpeg({ quality: 80 }) : copy.png(PNG)).toBuffer()
}

function write(path, bytes) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, bytes)
}

async function main(args) {
  const { root } = rootFrom(args)

  // Everything is made before anything is written, so a run that stops leaves the folders alone.
  const made = []
  for (const job of [...keptJobs(root), ...generatedJobs(root)]) {
    const input = readFileSync(job.master)
    const { bytes, edge, short } = await job.make(input, job.path)
    const flags = [edge && 'edge added', short < SMALL_PX && `under ${SMALL_PX} px`]
      .filter(Boolean)
      .join(', ')
    made.push({ job, bytes, copy: await card(bytes, job.family), flags })
  }

  const table = []
  for (const { job, bytes, copy, flags } of made)
    for (const [folder, file, note] of [
      ['public/art', bytes, flags],
      ['art/cards', copy, ''],
    ]) {
      write(join(root, folder, job.path), file)
      const { width, height } = await sharp(file).metadata()
      table.push({
        file: `${folder}/${job.path}`,
        pixels: `${width}x${height}`,
        bytes: file.length,
        family: job.family,
        flags: note,
      })
    }
  console.table(table)
}

await runTool(import.meta, main)
