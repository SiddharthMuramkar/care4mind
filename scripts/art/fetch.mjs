#!/usr/bin/env node
// @ts-check
// Saves the old site's WordPress media library before WordPress goes. It checks the live list
// against scripts/art/originals.json and stops on any difference, downloads all 71 files into the
// export folder under art, copies the 22 kept files byte for byte into the masters, and writes
// every old media address, with its WordPress id, for the redirect table. Takes 5 minutes or more,
// because the old server is slow.
//
//   pnpm art:fetch
//
// Afterwards, zip the year folders of the export for the client. It writes nothing outside art.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

import sharp from 'sharp'

import { rootFrom, runTool, ToolError } from '../content/cli.mjs'

const ORIGIN = 'https://care4mind.org'
const USER_AGENT = 'care4mind-site-rebuild/1.0'
/** Between downloads, to go easy on the old server. */
const PAUSE_MS = 200

/** The whole media list, across as many pages as WordPress says it has. */
export async function listLibrary(origin) {
  const rows = []
  let pages = 1
  for (let page = 1; page <= pages; page += 1) {
    const url = `${origin}/wp-json/wp/v2/media?per_page=100&page=${page}`
    const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } })
    if (!response.ok) throw new ToolError(`${response.status} for ${url}`)
    pages = Number(response.headers.get('x-wp-totalpages') ?? 1)
    rows.push(...(await response.json()))
  }
  return rows
}

/**
 * One file's bytes, checked against the server's Content-Length. The file is asked for unencoded:
 * the server gzips fonts, and then Content-Length is the size of the compressed form, not of the
 * body fetch hands back.
 */
export async function download(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, 'accept-encoding': 'identity' },
  })
  if (response.status !== 200) throw new ToolError(`${response.status} for ${url}`)
  const encoding = response.headers.get('content-encoding')
  if (encoding) throw new ToolError(`${url} came with content-encoding ${encoding}.`)
  const expected = response.headers.get('content-length')
  if (expected === null) throw new ToolError(`${url} came with no Content-Length.`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length !== Number(expected))
    throw new ToolError(`${url} is ${bytes.length} bytes; Content-Length says ${expected}.`)
  return bytes
}

/** Stops on a picture whose pixels aren't what the list says. A font has no pixels to compare. */
export async function checkPixels(bytes, row) {
  const { width, height } = row.media_details
  if (width === undefined) return
  const actual = await sharp(bytes).metadata()
  if (actual.width !== width || actual.height !== height)
    throw new ToolError(
      `${row.id} is ${actual.width}x${actual.height}; the list says ${width}x${height}.`,
    )
}

/** Every old address of the library (each file and its resized copies), as a path, in order. */
export function addressesOf(apiRows) {
  const addresses = new Map()
  for (const row of apiRows) {
    const copies = Object.values(row.media_details.sizes ?? {}).map((copy) => copy.source_url)
    for (const url of [row.source_url, ...copies]) {
      const address = new URL(url).pathname
      if (!addresses.has(address)) addresses.set(address, row.id)
    }
  }
  return [...addresses]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([address, wpId]) => ({ address, wpId }))
}

/** Where a file of the old library is saved. The month stays, because names repeat across them. */
export function exportPath(root, oldPath) {
  const match = /^\/wp-content\/uploads\/(\d{4})\/(\d{2})\/((?!\.)[^/]+)$/.exec(oldPath)
  if (!match) throw new ToolError(`Not a file in the old media library: ${oldPath}`)
  return join(root, 'art/wp-export', match[1] ?? '', match[2] ?? '', match[3] ?? '')
}

/** Where a kept file goes: the address the site will serve it at, under the masters folder. */
export function masterPath(root, newSrc) {
  const match = /^\/art\/(emblem|stickers|plates)\/([\w-]+\.\w+)$/.exec(newSrc)
  if (!match) throw new ToolError(`Not a place for a master: ${newSrc}`)
  return join(root, 'art/masters', match[1] ?? '', match[2] ?? '')
}

/**
 * What differs between the live media list and the saved one, one line each. WordPress's reported
 * size is compared here, against the saved `kb`: the check on a download is its Content-Length.
 */
export function compareLibrary(apiRows, files) {
  const differences = []
  const saved = new Map(files.map((file) => [file.wpId, file]))
  const live = new Set(apiRows.map((row) => row.id))

  for (const file of files)
    if (!live.has(file.wpId)) differences.push(`${file.wpId} removed: ${file.oldPath}`)

  for (const row of apiRows) {
    const file = saved.get(row.id)
    if (!file) {
      differences.push(`${row.id} added: ${row.source_url}`)
      continue
    }
    const path = new URL(row.source_url).pathname
    if (path !== file.oldPath) differences.push(`${row.id} path: ${file.oldPath} is now ${path}`)
    const { width, height, filesize } = row.media_details
    // A font has no pixels, and the saved list says so.
    const size = width === undefined ? 'font' : `${width}x${height}`
    if (size !== file.size) differences.push(`${row.id} pixel size: ${file.size} is now ${size}`)
    const kb = Math.round((filesize ?? 0) / 1024)
    if (kb !== file.kb) differences.push(`${row.id} reported size: ${file.kb} KB is now ${kb} KB`)
  }
  return differences
}

async function main(args) {
  const { root } = rootFrom(args)
  const { files } = JSON.parse(readFileSync(join(root, 'scripts/art/originals.json'), 'utf8'))

  const apiRows = await listLibrary(ORIGIN)
  const differences = compareLibrary(apiRows, files)
  if (differences.length > 0)
    throw new ToolError(`The old site no longer matches the saved list:\n${differences.join('\n')}`)

  const rows = new Map(apiRows.map((row) => [row.id, row]))
  for (const file of files) {
    const row = rows.get(file.wpId)
    const bytes = await download(row.source_url)
    await checkPixels(bytes, row)
    // Written only after every check, so a failed file never sits in the export.
    const path = exportPath(root, file.oldPath)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, bytes)
    process.stdout.write(`${file.wpId} ${bytes.length} bytes\n`)
    await delay(PAUSE_MS)
  }

  const kept = files.filter((file) => file.verdict === 'KEEP')
  for (const file of kept) {
    const master = masterPath(root, file.newSrc)
    mkdirSync(dirname(master), { recursive: true })
    copyFileSync(exportPath(root, file.oldPath), master)
  }

  const addresses = addressesOf(apiRows)
  writeFileSync(
    join(root, 'art/old-media-addresses.json'),
    `${JSON.stringify(addresses, null, 2)}\n`,
  )
  process.stdout.write(
    `${files.length} files saved, ${kept.length} masters copied, ${addresses.length} addresses listed.\n`,
  )
}

await runTool(import.meta, main)
