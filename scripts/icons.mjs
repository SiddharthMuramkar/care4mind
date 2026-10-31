#!/usr/bin/env node
// The home-screen icon, src/app/apple-icon.png: the tab icon, src/app/icon.svg, drawn 144 px
// across on a 180 px square of the page's ground. iOS shows a transparent pixel as black, so the
// ground runs to every edge. Run it after changing either; it prints the file it wrote.
//
//   pnpm icons
//
// Playwright, which the repo has, draws it, as it takes the pictures for `pnpm shots`.

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ICON = join(ROOT, 'src/app/icon.svg')
const OUT = join(ROOT, 'src/app/apple-icon.png')
/** The square iOS asks for, and how wide the icon is drawn in it. */
const SIZE = 180
const DRAWN = 144

/** --color-ground, from the stylesheet that declares every colour. */
function ground() {
  const css = readFileSync(join(ROOT, 'src/styles/globals.css'), 'utf8')
  const colour = /--color-ground:\s*(#[0-9a-f]{6})\s*;/i.exec(css)?.[1]
  if (!colour) throw new Error('src/styles/globals.css declares no --color-ground.')
  return colour
}

const icon = `data:image/svg+xml;base64,${readFileSync(ICON).toString('base64')}`
const { chromium } = await import('@playwright/test')
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } })
  await page.setContent(
    `<!doctype html><body style="margin:0;height:100vh;display:grid;place-items:center;background:${ground()}">` +
      `<img src="${icon}" width="${DRAWN}" height="${DRAWN}" alt=""></body>`,
  )
  await page.locator('img').evaluate((image) => image.decode())
  await page.screenshot({ path: OUT })
} finally {
  await browser.close()
}
console.log(OUT)
