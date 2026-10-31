import type { Locator, Page } from '@playwright/test'

import {
  animationsStartedOn,
  openingFolio,
  recordAnimationStarts,
  unfinishedDrawings,
  unfinishedRules,
} from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { inPageTransitions, pageTurns, prefetched, recordPageTurns } from './page-turns'
import { inkSpreadsOn, recordInkSpreads } from './presses'
import { READING_PAGES, readingThread, readTo } from './reading'
import { at, MISSING, ROUTES_IN_SCOPE } from './routes'
import { scrollPath } from './scrolling'
import { knobPath, recordScriptedAnimations } from './switches'

/** Animations still moving: anything running longer than the 1 ms the reduced-motion rule allows. */
async function movingAnimations(page: Page) {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => {
        if (animation.playState !== 'running') return false
        const duration = animation.effect?.getComputedTiming().duration
        return animation.timeline instanceof DocumentTimeline === false || Number(duration) > 1
      })
      .map((animation) => (animation as CSSAnimation).animationName ?? animation.id),
  )
}

const nextFrames = (page: Page) =>
  page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )

/** How far each of these rules is turned from lying flat, in degrees (0 to 90), as drawn on screen. */
const turns = (rules: Locator) =>
  rules.evaluateAll((elements) =>
    elements
      .map((element) => {
        const { transform } = getComputedStyle(element)
        const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
        return Math.abs(Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)) % 180
      })
      .sort((a, b) => a - b),
  )

// NFR-01: with "reduce motion" on, on every route in the registry, nothing moves on load, on
// scroll or on click, and every drawing shows finished.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} keeps still, its drawings finished, with reduced motion`, async ({
    page,
  }) => {
    const where = at(page, route.path)
    await gotoReady(page, route.path)
    expect.soft(await movingAnimations(page), `${where}: moving on load`).toEqual([])
    expect.soft(await unfinishedDrawings(page), `${where}: unfinished on load`).toEqual([])
    expect
      .soft(await unfinishedRules(page), `${where}: rules short of full width on load`)
      .toEqual([])

    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(100)
    expect.soft(await movingAnimations(page), `${where}: moving after a scroll`).toEqual([])
    expect.soft(await unfinishedDrawings(page), `${where}: unfinished after a scroll`).toEqual([])
    expect
      .soft(await unfinishedRules(page), `${where}: rules short of full width after a scroll`)
      .toEqual([])

    // The first control in the page's content that takes a click: disabled buttons (a Start not
    // yet open) can't. A click that leads to another page is followed there.
    const control = page.locator('main :is(button:enabled, summary)').first()
    if (await control.count()) {
      await control.scrollIntoViewIfNeeded()
      await control.click()
      await page.waitForLoadState()
      await page.waitForTimeout(50)
      expect(await movingAnimations(page), `${where}: moving after a click`).toEqual([])
    }
  })
}

test('the 404 page shows its Fleuron finished and still, with reduced motion', async ({ page }) => {
  await recordAnimationStarts(page)
  await gotoReady(page, MISSING)
  const strokes = page.getByRole('main').locator('svg path')
  await expect(strokes.first()).toBeVisible()
  expect(await unfinishedDrawings(page)).toEqual([])
  expect(await movingAnimations(page)).toEqual([])
  for (const stroke of await strokes.all()) {
    expect(await animationsStartedOn(stroke), 'nothing started on it').toEqual([])
  }
})

test("the opening folio's Fleuron is finished from the first paint, with nothing starting on it, with reduced motion", async ({
  page,
}) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/')
  const fleuron = openingFolio(page).locator('svg')
  await expect(fleuron).toBeVisible()
  const strokes = await fleuron.locator('path').all()
  expect(strokes.length).toBeGreaterThan(1)
  for (const stroke of strokes) {
    await expect(stroke).toHaveCSS('stroke-dashoffset', '0px')
    expect(await animationsStartedOn(stroke), 'nothing started on it').toEqual([])
  }
  const circles = await fleuron.locator('circle').all()
  expect(circles.length).toBeGreaterThan(0)
  for (const circle of circles) {
    expect(await animationsStartedOn(circle), 'nothing started on it').toEqual([])
  }
})

test('the References plus becomes a minus at once, with nothing moving, with reduced motion', async ({
  page,
}) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/concepts/vikshepa/')
  const toggle = page.locator('summary', { hasText: 'References' })
  const disclosure = page.locator('details', { has: toggle })
  const rules = toggle.locator('[aria-hidden="true"] > *')
  await expect(rules).toHaveCount(2)
  expect(await turns(rules), 'a plus while closed').toEqual([0, 90])

  await toggle.click()
  await expect(disclosure).toHaveAttribute('open')
  // At once: read two frames on, not polled.
  await nextFrames(page)
  expect(await turns(rules), 'a minus once open').toEqual([0, 0])
  // The reduce rule cuts every transition to 1 ms, so nothing may run longer than that.
  for (const rule of await rules.all()) {
    for (const { duration } of await animationsStartedOn(rule)) {
      expect(duration, 'it folds flat at once').toBeLessThanOrEqual(1)
    }
  }
  expect(await movingAnimations(page)).toEqual([])

  await toggle.click()
  await expect(disclosure).not.toHaveAttribute('open')
  await nextFrames(page)
  expect(await turns(rules), 'a plus again').toEqual([0, 90])
})

// The header's Concepts opens the Concepts page since front-end-site ticket 04 (D01); its
// reduced-motion checks are in nav.spec.ts.
for (const { from, name } of [{ from: 'main', name: 'Explore Concepts' }] as const) {
  test(`"${name}" in the ${from === 'main' ? 'opening folio' : 'header'} jumps straight to the Concepts, with reduced motion`, async ({
    page,
  }) => {
    await gotoReady(page, '/')
    const around =
      from === 'main' ? page.getByRole('main') : page.getByRole('navigation', { name: 'Main' })
    const link = around.getByRole('link', { name, exact: true })
    const heading = page.getByRole('heading', { name: 'Concepts', level: 2 })
    await link.scrollIntoViewIfNeeded()
    const path = await scrollPath(page, async () => {
      await link.click()
      await expect(heading).toBeInViewport()
    })
    expect(path, 'one jump, from where it was to the section').toHaveLength(2)
    await expect(heading).toBeInViewport({ ratio: 1 })
  })
}

test('pressing a call to action spreads no ink and moves nothing, with reduced motion', async ({
  page,
}) => {
  await recordInkSpreads(page)
  await gotoReady(page, '/')
  const cta = page.getByRole('main').getByRole('link', { name: 'Explore Concepts', exact: true })
  await cta.click()
  await expect(page.getByRole('heading', { name: 'Concepts', level: 2 })).toBeInViewport()
  await page.waitForTimeout(50)
  expect(await inkSpreadsOn(cta)).toEqual([])
  expect(await movingAnimations(page)).toEqual([])
})

for (const { from, link, to } of [
  { from: '/', link: 'Read about Vikṣepa', to: '/concepts/vikshepa/' },
  { from: '/concepts/vikshepa/', link: 'Home', to: '/' },
]) {
  test(`following "${link}" changes the page at once, with reduced motion`, async ({ page }) => {
    await recordPageTurns(page)
    await gotoReady(page, from)
    const target = page.getByRole('link', { name: link, exact: true })
    await prefetched(target)
    await target.click()
    await expect(page).toHaveURL(to)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    for (const change of await pageTurns(page)) {
      expect(change.leaving).toBeNull()
      expect(change.arriving).toBeNull()
      expect(change.flights).toEqual([])
    }
    expect(await movingAnimations(page)).toEqual([])
  })
}

test('the "Devanagari first" switch still swaps the scripts, at once, with reduced motion', async ({
  page,
}) => {
  await recordPageTurns(page)
  await recordScriptedAnimations(page)
  await gotoReady(page, '/concepts/vikshepa/')
  const toggle = page.getByRole('button', { name: 'Devanagari first' })
  const spellings = page.getByRole('heading', { level: 1 }).locator('[lang]')
  await expect(spellings.first()).toHaveAttribute('lang', 'sa-Latn')

  const knob = await knobPath(toggle, () => toggle.click())
  expect(knob, 'the knob jumps across, from one end of the track to the other').toHaveLength(2)
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(spellings.first()).toHaveAttribute('lang', 'sa-Deva')
  await expect(toggle).toBeFocused()
  for (const swap of await inPageTransitions(page)) {
    expect(swap.flights, 'the spellings swap without flying').toEqual([])
  }
  expect(await movingAnimations(page)).toEqual([])
})

for (const { path, name } of READING_PAGES) {
  test(`${name} has no reading thread, with reduced motion`, async ({ page }) => {
    await gotoReady(page, path)
    await readTo(page, 0.5)
    expect(await readingThread(page)).toBeNull()
  })
}
