import type { Locator, Page } from '@playwright/test'

import {
  animationsStartedOn,
  delaysStartedOn,
  isDrawing,
  openingFolio,
  recordAnimationStarts,
  type Start,
} from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { moving } from './lotuses'
import { placeOnScreen, scrollPath } from './scrolling'

const section = (page: Page, name: string) => page.getByRole('region', { name, exact: true })

/** The lotus Fleuron printed in the opening folio. */
const heroFleuron = (page: Page) => openingFolio(page).locator('svg')

/**
 * What has started on a drawing or any part of it since the page began: how long after being
 * set going each began and how long it runs, in ms, and whether it loops. Call
 * recordAnimationStarts before loading the page.
 */
const startsIn = (drawing: Locator) =>
  drawing.evaluate((svg) =>
    (window as unknown as { __animationStarts: Start[] }).__animationStarts
      .filter(({ target }) => svg.contains(target))
      .map(({ delay, duration, loops }) => ({ delay, duration, loops })),
  )

/** The one ornament in the gap between two sections: its outermost element hidden from assistive technology. */
async function ornamentBetween(page: Page, above: Locator, below: Locator) {
  const top = await above.boundingBox()
  const bottom = await below.boundingBox()
  if (!top || !bottom) throw new Error('both sections must be on the page')
  const between: Locator[] = []
  const decoration = page
    .getByRole('main')
    .locator('[aria-hidden="true"]:not([aria-hidden="true"] *)')
  for (const ornament of await decoration.all()) {
    const box = await ornament.boundingBox()
    if (box && box.y >= top.y + top.height && box.y + box.height <= bottom.y) between.push(ornament)
  }
  expect(between, 'one ornament between the sections').toHaveLength(1)
  return between[0] as Locator
}

/**
 * The rules of an OrnamentRule as drawn on screen, left to right: where each
 * starts and ends across the screen, and how much of its full width is inked.
 */
function rulesOf(ornament: Locator) {
  return ornament.evaluate((element) =>
    [...element.children]
      .filter((child): child is HTMLElement => child instanceof HTMLElement)
      .map((rule) => {
        const { left, right, width } = rule.getBoundingClientRect()
        return { left, right, inked: width / rule.offsetWidth }
      })
      .sort((a, b) => a.left - b.left),
  )
}

test.describe('the opening folio', () => {
  test('its lotus Fleuron draws itself once on load, stroke by stroke, ends complete, then breathes', async ({
    page,
  }) => {
    await recordAnimationStarts(page)
    await gotoReady(page, '/')
    const fleuron = heroFleuron(page)
    await expect(fleuron).toBeVisible()
    await expect(fleuron).toHaveAttribute('aria-hidden', 'true')
    await expect(page.getByRole('main').getByRole('img')).toHaveCount(0)
    const strokes = await fleuron.locator('path').all()
    expect(strokes.length, 'drawn in more than one stroke').toBeGreaterThan(1)
    for (const stroke of strokes) {
      await expect.poll(() => isDrawing(stroke)).toBe(false)
      await expect(stroke).toHaveCSS('stroke-dashoffset', '0px')
    }

    // Scrolling away and back draws nothing new.
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(100)
    for (const stroke of strokes) {
      expect(await isDrawing(stroke)).toBe(false)
      await expect(stroke).toHaveCSS('stroke-dashoffset', '0px')
      expect(await animationsStartedOn(stroke), 'drawn once, in time').toEqual([
        { byScroll: false, duration: expect.any(Number) },
      ])
    }
    // Stroke by stroke: the strokes set off one after another, not all at once.
    const delays = await Promise.all(strokes.map((stroke) => delaysStartedOn(stroke)))
    expect(new Set(delays.flat()).size).toBeGreaterThan(1)

    // Then it breathes: each loop sets off as the drawing ends, never while it is still drawing.
    await expect
      .poll(async () => (await startsIn(fleuron)).some(({ loops }) => loops), 'it breathes')
      .toBe(true)
    const starts = await startsIn(fleuron)
    const drawing = starts.filter(({ loops }) => !loops)
    const drawnBy = Math.max(...drawing.map(({ delay, duration }) => delay + (duration ?? 0)))
    for (const { delay } of starts.filter(({ loops }) => loops)) {
      expect(delay, 'a loop sets off once the drawing is done').toBeGreaterThanOrEqual(drawnBy)
    }
    expect(await moving(fleuron), 'and it breathes on').toBe(true)
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

  test('sits on the ruled ground with nothing drawn round it, and nothing drifts as the page scrolls', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    const hero = page.getByRole('region').filter({ has: page.getByRole('heading', { level: 1 }) })
    await expect(hero.locator('svg'), 'the only drawing is in the folio').toHaveCount(
      await openingFolio(page).locator('svg').count(),
    )
    const parts = [openingFolio(page), heroFleuron(page), hero]
    const tops = () => Promise.all(parts.map(async (part) => (await part.boundingBox())?.y ?? NaN))
    const before = await tops()
    await page.evaluate(() => window.scrollBy({ top: 240, behavior: 'instant' }))
    await page.evaluate(
      () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
    )
    const after = await tops()
    expect(before.map((top, index) => top - (after[index] ?? NaN))).toEqual([240, 240, 240])
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

test('an OrnamentRule between each pair of sections inks in from the centre as it scrolls into view', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const neighbours: [string, string][] = [
    ['Contents', 'Concepts'],
    ['Concepts', 'Questionnaires'],
  ]
  for (const [above, below] of neighbours) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    const ornament = await ornamentBetween(page, section(page, above), section(page, below))
    await expect(ornament).toHaveAttribute('aria-hidden', 'true')
    await expect(ornament).not.toBeInViewport()
    const before = await rulesOf(ornament)
    expect(before, 'two rules, one each side of the fleuron').toHaveLength(2)
    for (const rule of before)
      expect(rule.inked, 'short before it reaches the screen').toBeLessThan(0.1)

    await placeOnScreen(ornament, 0.85)
    const partWay = await rulesOf(ornament)
    for (const rule of partWay) {
      expect(rule.inked, 'part-way in on the way up').toBeGreaterThan(0.1)
      expect(rule.inked).toBeLessThan(0.95)
    }

    await placeOnScreen(ornament, 0.2)
    await expect
      .poll(async () => (await rulesOf(ornament)).map(({ inked }) => inked))
      .toEqual([1, 1])
    const full = await rulesOf(ornament)

    // From the centre: the rules' inner ends, beside the fleuron, stay put while their outer ends reach out.
    const [left, right] = [partWay[0], partWay[1]]
    const [fullLeft, fullRight] = [full[0], full[1]]
    if (!left || !right || !fullLeft || !fullRight) throw new Error('two rules')
    expect(Math.abs(right.left - left.right - (fullRight.left - fullLeft.right))).toBeLessThan(1)
    expect(left.left).toBeGreaterThan(fullLeft.left)
    expect(right.right).toBeLessThan(fullRight.right)
  }
})

test('each Contents numeral is its Devanagari digit as plain text, with nothing drawn round it', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const entries = section(page, 'Contents').getByRole('listitem')
  const numerals = ['१', '२', '३', '४', '५', '६']
  await expect(entries).toHaveCount(numerals.length)
  for (const [index, entry] of (await entries.all()).entries()) {
    const numeral = entry.getByText(numerals[index] ?? '', { exact: true })
    await expect(numeral).toBeVisible()
    expect(
      await numeral.evaluate((element) => element.children.length),
      'the numeral is text alone',
    ).toBe(0)
    await expect(entry.locator('svg, img, canvas'), 'nothing drawn in the entry').toHaveCount(0)
  }
})

test.describe('the opening folio says what the site is', () => {
  test('its H1 is the promise, and the motto is a small label above it', async ({ page }) => {
    await gotoReady(page, '/')
    const folio = openingFolio(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Indian psychology, explained simply.',
    )
    await expect(folio.locator('h1 [lang]')).toHaveCount(0)
    await expect(folio.locator('[lang="sa-Deva"]')).toHaveText('यद् भावं तद् भवति')
    await expect(folio.locator('[lang="sa-Latn"]')).toHaveText('yad bhāvaṃ tad bhavati')
  })

  test('leads to Start here, with Browse concepts beside it, and nothing else', async ({
    page,
  }) => {
    await gotoReady(page, '/')
    const folio = openingFolio(page)
    await expect(folio.getByRole('link')).toHaveCount(2)
    await expect(folio.getByRole('link', { name: 'Start here' })).toHaveAttribute('href', '/start/')
    await expect(folio.getByRole('link', { name: 'Browse concepts' })).toHaveAttribute(
      'href',
      '/concepts/',
    )
  })

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 390, height: 844 },
  ]) {
    test(`at ${viewport.width}×${viewport.height}, the H1, the subhead and the primary button show without scrolling`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await gotoReady(page, '/')
      const folio = openingFolio(page)
      for (const part of [
        page.getByRole('heading', { level: 1 }),
        folio.getByText(/^Ideas about the mind from India’s traditional texts/),
        // The primary button, whichever the Start here flag makes it.
        folio.getByRole('link').first(),
      ]) {
        await expect(part).toBeInViewport({ ratio: 1 })
      }
    })
  }
})

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

test('nothing shifts while the ornaments draw and ink in, from load to the foot of the page', async ({
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
  for (const stroke of await heroFleuron(page).locator('path').all()) {
    await expect.poll(() => isDrawing(stroke)).toBe(false)
  }
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
