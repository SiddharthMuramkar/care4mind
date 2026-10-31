import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { at, ROUTES_IN_SCOPE } from './routes'

// WCAG 1.4.10 Reflow: every route fits 320 CSS px without scrolling sideways.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} reflows at 320 px`, async ({ page }) => {
    await gotoReady(page, route.path)
    expect(await scrollsSideways(page), `${at(page, route.path)}: no sideways scroll`).toEqual([])
  })
}
