// @ts-check
// The contact sheet: every brief with its candidates, at the sizes they will be used, on both
// grounds, beside the client's own pictures. It writes a page and its PDF to the inbox.
//
//   pnpm art:sheet

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import sharp from 'sharp'

import { SLOTS } from '../../src/art/slots.ts'
import { rootFrom, runTool, ToolError } from '../content/cli.mjs'

/** How many candidates a brief is made with. */
const PLACES = 4
/** Twice the largest tile, enough to count fingers. */
const THUMB_PX = 480
/**
 * Chrome re-encodes a PNG losslessly in a PDF but passes a JPEG through, and the PDF is emailed.
 * This quality keeps a full sheet near 17 MB, inside a 25 MB attachment limit once encoded.
 */
const THUMB_JPEG = { quality: 70 }
const CANDIDATE_FILE = /^([1-4])\.(?:png|jpe?g|webp)$/i
/** Two of the client's own pictures per kind of brief. A Pothi is judged against their books. */
const REFERENCES = {
  sticker: ['sticker-cosmos', 'sticker-meditation'],
  pothi: ['sticker-book-ornate', 'sticker-book-clasp'],
  plate: ['plate-jeweller-woman', 'plate-sculptor'],
}

/** What the sheet writes to the inbox, beside the candidates. */
const HTML_FILE = 'sheet.html'
const PDF_FILE = 'sheet.pdf'

/** The sizes a picture is used at, in CSS pixels. */
const SIZES = [64, 120, 240]
const GROUNDS = ['paper', 'indigo']
/** The custom property behind each colour the sheet draws with. */
const COLOUR_TOKENS = {
  paper: '--press-paper',
  indigo: '--press-indigo',
  page: '--press-paper-fresh',
  ink: '--press-paper-ink',
}

/** The sheet's colours, read from the site's stylesheet so the grounds cannot drift from it. */
export function readColours(css) {
  return Object.fromEntries(
    Object.entries(COLOUR_TOKENS).map(([name, token]) => {
      const value = new RegExp(`${token}\\s*:\\s*(#[0-9a-fA-F]{3,8})`).exec(css)?.[1]
      if (!value) throw new ToolError(`The site's stylesheet has no ${token}.`)
      return [name, value]
    }),
  )
}

const escapeHtml = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** One place at one size on one ground: the picture, or a box of the size it will take. */
function tile(place, label, size, ground, masked) {
  const mask = masked ? ' mask' : ''
  const inner = place.thumb
    ? `<img data-place="filled" class="picture${mask}" src="${place.thumb}-${ground}.jpg" width="${size}" height="${size}" alt="">`
    : `<div data-place="empty" class="empty${mask}" style="width: ${size}px; height: ${size}px">${label}</div>`
  return `<div class="cell" style="height: ${size}px">${inner}</div>`
}

/** Every place of a brief on one ground, a row per size. */
function panel(brief, ground) {
  const places = [
    ...brief.candidates.map((place, index) => [place, index + 1]),
    ...brief.references.map((place) => [place, '']),
  ]
  const rows = SIZES.map((size) => {
    const tiles = places.map(([place, label]) => tile(place, label, size, ground, brief.masked))
    return `<div class="row">${tiles.join('')}</div>`
  })
  return `<div class="ground ${ground}" data-ground="${ground}">${rows.join('')}</div>`
}

function section(brief) {
  const heads = [...brief.candidates.map((_, index) => index + 1), 'Existing', 'Existing']
  return `<section data-brief="${brief.id}">
<h2>${brief.id} <small>${escapeHtml(brief.placement)}</small></h2>
<p>${escapeHtml(brief.brief)}</p>
<div class="row heads">${heads.map((head) => `<div class="cell">${head}</div>`).join('')}</div>
${GROUNDS.map((ground) => panel(brief, ground)).join('\n')}
</section>`
}

/** The page: one brief per printed page, so each can be judged on its own. */
export function renderSheet(plan, colours) {
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Contact sheet</title>
<style>
@page { size: 1640px 1200px; margin: 0 }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact }
body { min-width: 1640px; margin: 0; font: 16px/1.4 Georgia, serif; background: ${colours.page}; color: ${colours.ink} }
section { break-after: page; padding: 24px 32px }
h2 { margin: 0; font-size: 22px }
small { margin-left: 12px; font-size: 16px; font-weight: normal }
p { margin: 4px 0 16px; max-width: 72ch }
.ground { padding: 16px 28px; margin-bottom: 16px }
.paper { background: ${colours.paper}; color: ${colours.ink} }
.indigo { background: ${colours.indigo}; color: ${colours.paper} }
.row { display: flex; gap: 16px }
.row + .row { margin-top: 12px }
.heads { padding: 0 28px 6px }
.cell { display: grid; flex: 0 0 240px; place-items: center }
.picture { display: block; object-fit: contain }
.mask { border-radius: 50%; object-fit: cover }
.empty { display: grid; place-items: center; border: 1px solid; font-size: 14px }
</style>
${plan.map(section).join('\n')}
</html>
`
}

/** The file of a picture the client kept, relative to the repo. */
function keptFile(originals, id) {
  const original = originals.find((file) => file.newId === id && file.verdict === 'KEEP')
  if (!original) throw new ToolError(`${id} is not one of the client's kept pictures.`)
  return `public${original.newSrc}`
}

/** The briefs of the sheet, one per slot, each with its places and its references. */
export function planSheet({ slots, briefs, candidates, originals }) {
  return slots.map((slot) => {
    const brief = briefs[slot.id]
    if (!brief) throw new ToolError(`${slot.id} has no brief in the prompts file.`)
    const references = REFERENCES[brief.template]
    if (!references) throw new ToolError(`${slot.id} has an unknown template: ${brief.template}.`)
    return {
      id: slot.id,
      placement: slot.placement,
      brief: brief.brief,
      masked: brief.template === 'plate',
      candidates: Array.from({ length: PLACES }, (_, index) => {
        const file = candidates[slot.id]?.[index + 1] ?? null
        return { file, thumb: file === null ? null : `.thumbs/${slot.id}/${index + 1}` }
      }),
      references: references.map((id) => ({
        id,
        file: keptFile(originals, id),
        thumb: `.thumbs/${id}/existing`,
      })),
    }
  })
}

/** The candidates in the inbox, by slot id and number. Anything else there earns a warning. */
export function findCandidates(inbox, slotIds, warn) {
  const found = {}
  for (const folder of readdirSync(inbox, { withFileTypes: true })) {
    if (folder.name.startsWith('.') || [HTML_FILE, PDF_FILE].includes(folder.name)) continue
    if (!folder.isDirectory()) {
      warn(`${folder.name} in the inbox is not in a slot's folder, so the sheet leaves it out.`)
      continue
    }
    if (!slotIds.includes(folder.name)) {
      warn(`${folder.name} in the inbox is not a slot id, so the sheet leaves it out.`)
      continue
    }
    const places = (found[folder.name] = {})
    const names = readdirSync(join(inbox, folder.name)).toSorted()
    for (const name of names.filter((entry) => !entry.startsWith('.'))) {
      const number = CANDIDATE_FILE.exec(name)?.[1]
      if (number === undefined)
        warn(`${folder.name}/${name} is not 1 to 4 and an image, so the sheet leaves it out.`)
      else if (places[number])
        warn(`${folder.name}/${name} repeats number ${number}, so the sheet leaves it out.`)
      else places[number] = join(inbox, folder.name, name)
    }
  }
  return found
}

/** A small copy of every picture on the sheet, flattened onto each ground so halos show. */
export async function writeThumbs(plan, colours, inbox, root) {
  const files = new Map(
    plan
      .flatMap((brief) => [...brief.candidates, ...brief.references])
      .filter((place) => place.thumb)
      .map((place) => [place.thumb, place.file]),
  )
  for (const [thumb, file] of files) {
    mkdirSync(dirname(join(inbox, thumb)), { recursive: true })
    const base = sharp(resolve(root, file)).resize(THUMB_PX, THUMB_PX, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    try {
      for (const ground of GROUNDS)
        await base
          .clone()
          .flatten({ background: colours[ground] })
          .jpeg(THUMB_JPEG)
          .toFile(join(inbox, `${thumb}-${ground}.jpg`))
    } catch (error) {
      throw new ToolError(`Cannot read ${file}: ${String(error)}`)
    }
  }
}

/** Open the written page and print it, with the backgrounds Chrome leaves out by default. */
async function printSheet(html, pdf) {
  const { chromium } = await import('@playwright/test')
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.goto(pathToFileURL(html).href)
    const broken = await page.evaluate(() =>
      [...document.images].filter((image) => image.naturalWidth === 0).map((image) => image.src),
    )
    if (broken.length > 0) throw new ToolError(`These did not load:\n${broken.join('\n')}`)
    await page.pdf({ path: pdf, printBackground: true, preferCSSPageSize: true })
  } finally {
    await browser.close()
  }
}

async function main(args) {
  const { root } = rootFrom(args)
  const inbox = join(root, 'art/inbox')
  mkdirSync(inbox, { recursive: true })
  const read = (path) => readFileSync(join(root, path), 'utf8')
  const colours = readColours(read('src/styles/globals.css'))
  const plan = planSheet({
    slots: SLOTS,
    briefs: JSON.parse(read('art/prompts.json')).pictures,
    candidates: findCandidates(
      inbox,
      SLOTS.map((slot) => slot.id),
      (text) => console.warn(text),
    ),
    originals: JSON.parse(read('scripts/art/originals.json')).files,
  })
  await writeThumbs(plan, colours, inbox, root)
  const html = join(inbox, HTML_FILE)
  const pdf = join(inbox, PDF_FILE)
  writeFileSync(html, renderSheet(plan, colours))
  await printSheet(html, pdf)
  console.log(html)
  console.log(pdf)
}

await runTool(import.meta, main)
