import type { Page } from '@playwright/test'

import { frameKolam, openingFolio, unfinishedDrawings } from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { inPageTransitions, pageTurns, prefetched, recordPageTurns } from './page-turns'
import { inkSpreadsOn, recordInkSpreads } from './presses'
import { READING_PAGES, readingThread, readTo } from './reading'
import { MISSING, PAGES } from './routes'
import { scrollPath, travel } from './scrolling'
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

// NFR-01: with "reduce motion" on, nothing moves on load, on scroll or on click.
for (const { path, name } of PAGES) {
  test(`${name} keeps still with reduced motion`, async ({ page }) => {
    await gotoReady(page, path)
    expect(await movingAnimations(page)).toEqual([])

    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(100)
    expect(await movingAnimations(page)).toEqual([])

    // Disabled buttons (the Questionnaire's "Start") can't be clicked, so pick the first one that can.
    const button = page.locator('main button:enabled').first()
    if (await button.count()) {
      await button.scrollIntoViewIfNeeded()
      await button.click()
      await page.waitForTimeout(50)
      expect(await movingAnimations(page)).toEqual([])
    }
  })

  test(`${name} shows every drawing finished with reduced motion`, async ({ page }) => {
    await gotoReady(page, path)
    expect(await unfinishedDrawings(page)).toEqual([])

    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(100)
    expect(await unfinishedDrawings(page)).toEqual([])
  })
}

test('the 404 page shows its kolam finished, with reduced motion', async ({ page }) => {
  await gotoReady(page, MISSING)
  expect(await unfinishedDrawings(page)).toEqual([])
  expect(await movingAnimations(page)).toEqual([])
})

for (const { from, name } of [
  { from: 'main', name: 'Explore Concepts' },
  { from: 'navigation', name: 'Concepts' },
] as const) {
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
  { from: '/', link: 'Read about Vikṣepa', to: '/concepts/vikshepa' },
  { from: '/concepts/vikshepa', link: 'Home', to: '/' },
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

test('the opening kolam scrolls with the page, with reduced motion', async ({ page }) => {
  await gotoReady(page, '/')
  const [kolam, folio] = await travel(page, 240, await frameKolam(page), openingFolio(page))
  expect(folio).toBe(240)
  expect(kolam).toBe(folio)
})

// The reduce rule shortens any animation to 1 ms, so listen for animations starting at all.
test('pointing at or focusing the logo starts no drawing, with reduced motion', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const logo = page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })
  await expect(logo.locator('svg path')).toHaveCount(1)
  const started = await page.evaluateHandle(() => {
    const names: string[] = []
    document.addEventListener('animationstart', (event) => names.push(event.animationName))
    return names
  })

  await logo.hover()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(logo).toBeFocused()
  await page.waitForTimeout(100)
  expect(await started.jsonValue()).toEqual([])
  expect(await movingAnimations(page)).toEqual([])
  expect(await unfinishedDrawings(page)).toEqual([])
})

test('the "Devanagari first" switch still swaps the scripts, at once, with reduced motion', async ({
  page,
}) => {
  await recordPageTurns(page)
  await recordScriptedAnimations(page)
  await gotoReady(page, '/concepts/vikshepa')
  const toggle = page.getByRole('button', { name: 'Devanagari first' })
  const spellings = page.getByRole('heading', { level: 1 }).locator('[lang]')
  await expect(spellings.first()).toHaveAttribute('lang', 'sa-Latn')

  const knob = await knobPath(toggle, () => toggle.click())
  expect(knob, 'the knob jumps across, from one loop to the other').toHaveLength(2)
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
