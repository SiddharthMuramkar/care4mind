import { cutOffOrOverlapping, measureLayout, settle, showDeferred } from './edges'
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

// WCAG 1.4.4 and 1.4.10 together: with text twice its size, 320 px wide, no word or control in a
// page's content is cut off or runs off the screen, and no two words are drawn over each other.
// One page of each kind. The Concept map's plate shortens its labels where they can't fit, by
// design, beside the list that names each in full, so its page is left out here.
for (const route of ROUTES.filter((entry) => entry.sample && entry.kind !== 'concept-map')) {
  test(`${route.path} at 200% text size and 320 px wide cuts off nothing and overlaps nothing`, async ({
    page,
  }) => {
    await gotoReady(page, route.path)
    // The reader's text size: every size set in rem or em doubles, as a browser's setting has it.
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)
    await showDeferred(page)
    await settle(page)
    expect(cutOffOrOverlapping(await measureLayout(page, 'main#main'))).toEqual([])
  })
}
