import type { Locator, Page } from '@playwright/test'

import {
  animationsStartedOn,
  frameKolam,
  isDrawing,
  openingFolio,
  recordAnimationStarts,
  undrawn,
} from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { placeOnScreen, scrollPath, travel } from './scrolling'

const section = (page: Page, name: string) => page.getByRole('region', { name, exact: true })

/** The one drawing in the gap between two sections. */
async function drawingBetween(page: Page, above: Locator, below: Locator) {
  const top = await above.boundingBox()
  const bottom = await below.boundingBox()
  if (!top || !bottom) throw new Error('both sections must be on the page')
  const between: Locator[] = []
  for (const drawing of await page.getByRole('main').locator('svg').all()) {
    const box = await drawing.boundingBox()
    if (box && box.y >= top.y + top.height && box.y + box.height <= bottom.y) between.push(drawing)
  }
  expect(between, 'one drawing between the sections').toHaveLength(1)
  return between[0] as Locator
}

test.describe('the opening kolam', () => {
  test('frames the opening folio and is hidden from assistive technology', async ({ page }) => {
    await gotoReady(page, '/')
    const frame = await frameKolam(page)
    await expect(frame).toBeVisible()
    await expect(frame).toHaveAttribute('aria-hidden', 'true')
    await expect(page.getByRole('main').getByRole('img')).toHaveCount(0)
  })

  test('draws itself once on load, in about 1.6 s, and ends complete', async ({ page }) => {
    await recordAnimationStarts(page)
    await gotoReady(page, '/')
    const line = (await frameKolam(page)).locator('path')
    await expect.poll(() => isDrawing(line)).toBe(false)
    await expect(line).toHaveCSS('stroke-dashoffset', '0px')

    // Scrolling away and back draws nothing new.
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(100)
    expect(await isDrawing(line)).toBe(false)
    await expect(line).toHaveCSS('stroke-dashoffset', '0px')
    expect(await animationsStartedOn(line)).toEqual([
      { byScroll: false, duration: expect.closeTo(1600, -3) },
    ])
  })

  test('never makes the verse wait: the heading and translation are never hidden or faded in', async ({
    page,
  }) => {
    await recordAnimationStarts(page)
    await gotoReady(page, '/')
    const heading = page.getByRole('heading', { level: 1 })
    const translation = page.getByText('As are the thoughts, so are the manifestations.')
    for (const text of [heading, translation]) {
      await expect(text).toBeVisible()
      await expect(text).toHaveCSS('opacity', '1')
      // Nothing has animated the text, or anything round it, since the page began.
      expect(await animationsStartedOn(text, { orAncestors: true })).toEqual([])
    }
  })

  test('drifts a little slower than the page as it scrolls', async ({ page }) => {
    await gotoReady(page, '/')
    const [kolam = NaN, folio = NaN] = await travel(
      page,
      240,
      await frameKolam(page),
      openingFolio(page),
    )
    expect(folio).toBe(240)
    expect(kolam).toBeGreaterThan(folio * 0.5)
    expect(kolam).toBeLessThan(folio * 0.95)
  })

  test('is never the largest contentful paint', async ({ page }) => {
    await gotoReady(page, '/')
    const largest = await page.evaluate(
      () =>
        new Promise<{ inDrawing: boolean; text: string }>((resolve) => {
          new PerformanceObserver((list) => {
            const element = (list.getEntries().at(-1) as LargestContentfulPaint | undefined)
              ?.element
            resolve({
              inDrawing: Boolean(element?.closest('svg')),
              text: element?.textContent?.trim() ?? '',
            })
          }).observe({ type: 'largest-contentful-paint', buffered: true })
        }),
    )
    expect(largest.inDrawing).toBe(false)
    expect(largest.text).not.toBe('')
  })
})

test('a kolam band between each pair of sections draws itself in as it scrolls into view', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const neighbours: [string, string][] = [
    ['Contents', 'Concepts'],
    ['Concepts', 'Questionnaires'],
  ]
  for (const [above, below] of neighbours) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    const band = await drawingBetween(page, section(page, above), section(page, below))
    const line = band.locator('path')
    // A kolam: one unbroken line.
    await expect(line).toHaveCount(1)
    await expect(band).not.toBeInViewport()
    expect(await undrawn(line)).toBe(1)

    await placeOnScreen(band, 0.85)
    await expect.poll(() => undrawn(line)).toBeLessThan(1)
    expect(await undrawn(line)).toBeGreaterThan(0)

    await placeOnScreen(band, 0.2)
    await expect.poll(() => undrawn(line)).toBe(0)
  }
})

test('each Contents numeral keeps its Devanagari digit, ringed by a kolam knot that draws in as it scrolls up', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const entries = section(page, 'Contents').getByRole('listitem')
  const numerals = ['१', '२', '३', '४', '५', '६']
  await expect(entries).toHaveCount(numerals.length)
  for (const [index, entry] of (await entries.all()).entries()) {
    const numeral = entry.getByText(numerals[index] ?? '', { exact: true })
    const knot = entry.locator('svg')
    const line = knot.locator('path')
    await expect(numeral).toBeVisible()
    await expect(line).toHaveCount(1)

    await placeOnScreen(knot, 0.9)
    await expect.poll(() => undrawn(line)).toBeLessThan(1)
    expect(await undrawn(line)).toBeGreaterThan(0)

    await placeOnScreen(knot, 0.2)
    await expect.poll(() => undrawn(line)).toBe(0)
    const ring = await knot.boundingBox()
    const digit = await numeral.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(
        [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE) ?? element,
      )
      const { x, y, width, height } = range.getBoundingClientRect()
      return { x, y, width, height }
    })
    if (!ring) throw new Error('the knot must be on screen')
    expect(ring.x, 'the knot loops round its numeral').toBeLessThan(digit.x)
    expect(ring.x + ring.width).toBeGreaterThan(digit.x + digit.width)
    expect(ring.y).toBeLessThan(digit.y + digit.height / 2)
    expect(ring.y + ring.height).toBeGreaterThan(digit.y + digit.height / 2)
  }
})

// The header's Concepts opens the Concepts page since front-end-site ticket 04 (D01), so only the
// opening folio's calls to action glide down this page.
for (const { from, name, to } of [
  { from: 'main', name: 'Explore Concepts', to: 'Concepts' },
  { from: 'main', name: 'Questionnaires', to: 'Questionnaires' },
] as const) {
  test(`"${name}" in the ${from === 'main' ? 'opening folio' : 'header'} glides down to the ${to} section, its heading in full view`, async ({
    page,
  }) => {
    await gotoReady(page, '/')
    const around =
      from === 'main' ? page.getByRole('main') : page.getByRole('navigation', { name: 'Main' })
    const link = around.getByRole('link', { name, exact: true })
    const heading = page.getByRole('heading', { name: to, level: 2 })
    await link.scrollIntoViewIfNeeded()
    const path = await scrollPath(page, async () => {
      await link.click()
      await expect(heading).toBeInViewport()
    })
    expect(path.length, 'a glide passes through many positions').toBeGreaterThan(4)
    await expect(heading).toBeInViewport({ ratio: 1 })
    // Not under the header, wherever the header is.
    const [title, header] = await Promise.all([
      heading.boundingBox(),
      page.getByRole('banner').boundingBox(),
    ])
    expect(title?.y).toBeGreaterThanOrEqual(Math.max(0, (header?.y ?? 0) + (header?.height ?? 0)))
  })
}

test('links to another page open it at once, without gliding from where you were', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const card = page.getByRole('link', { name: 'Read about Vikṣepa' })
  await placeOnScreen(card, 0.5)
  const toConcept = await scrollPath(page, async () => {
    await card.click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
  })
  expect(toConcept.at(-1)).toBe(0)
  expect(toConcept.length, 'a jump, not a glide').toBeLessThanOrEqual(3)

  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }))
  const backHome = await scrollPath(page, async () => {
    // The header stays on screen; its logo leads home.
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Care4Mind home', exact: true })
      .click()
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  })
  expect(backHome.at(-1)).toBe(0)
  expect(backHome.length, 'a jump, not a glide').toBeLessThanOrEqual(3)
})

test('nothing shifts while the kolams draw in, from load to the foot of the page', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const shifts: number[] = []
    Object.defineProperty(window, '__layoutShifts', { value: shifts })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number
        hadRecentInput: boolean
      })[]) {
        if (!entry.hadRecentInput) shifts.push(entry.value)
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await gotoReady(page, '/')
  const frame = (await frameKolam(page)).locator('path')
  await expect.poll(() => isDrawing(frame)).toBe(false)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let top = 0; top <= height; top += 300) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), top)
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)))
  }
  const shift = await page.evaluate(() =>
    (window as unknown as { __layoutShifts: number[] }).__layoutShifts.reduce((a, b) => a + b, 0),
  )
  expect(shift).toBeLessThan(0.01)
})

// Moved here from concept.spec.ts by front-end-site ticket 03.
test('the homepage card opens the Concept page', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await gotoReady(page, '/')
  await page.getByRole('link', { name: 'Read about Vikṣepa' }).click()
  await expect(page).toHaveURL('/concepts/vikshepa/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
  expect(errors).toEqual([])
})

test('the homepage leads on to every Concept and every Questionnaire', async ({ page }) => {
  await gotoReady(page, '/')
  const main = page.getByRole('main')
  await main.getByRole('link', { name: /^All \d+ Concepts, from A to Z$/ }).click()
  await expect(page).toHaveURL('/concepts/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Concepts')
  await page.goBack()
  await main.getByRole('link', { name: /more Questionnaires from the current site/ }).click()
  await expect(page).toHaveURL('/questionnaires/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Questionnaires')
})
