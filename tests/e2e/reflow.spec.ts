import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { at, ROUTES, ROUTES_IN_SCOPE } from './routes'

// The widths phones, tablets and laptops commonly have, besides the 320 px every route is checked at.
const WIDTHS = [360, 375, 390, 414, 768, 1024, 1280, 1440]

// WCAG 1.4.10 Reflow: every route fits 320 CSS px without scrolling sideways.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} reflows at 320 px`, async ({ page }) => {
    await gotoReady(page, route.path)
    expect(await scrollsSideways(page), `${at(page, route.path)}: no sideways scroll`).toEqual([])
  })
}

// One page of each kind, at each width: a layout that fits 320 px can still overflow at 375 px.
// Always the sampled set, whatever E2E_SCOPE says: widths cost tests per route.
for (const route of ROUTES.filter((entry) => entry.sample)) {
  for (const width of WIDTHS) {
    test(`${route.path} reflows at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await gotoReady(page, route.path)
      expect(
        await scrollsSideways(page),
        `${at(page, route.path)} at ${width} px: no sideways scroll`,
      ).toEqual([])
    })
  }
}

test('the Concept page still reflows at 320 px with the Devanagari leading', async ({ page }) => {
  await gotoReady(page, '/concepts/vikshepa/')
  const toggle = page.getByRole('button', { name: 'Devanagari first' })
  const box = await toggle.boundingBox()
  expect(box?.x ?? -1, 'the switch fits the screen').toBeGreaterThanOrEqual(0)
  expect((box?.x ?? 0) + (box?.width ?? Infinity)).toBeLessThanOrEqual(320)

  await toggle.click()
  const spellings = page.getByRole('heading', { level: 1 }).locator('[lang]')
  await expect(spellings.first()).toHaveAttribute('lang', 'sa-Deva')
  expect(await scrollsSideways(page)).toEqual([])
})
