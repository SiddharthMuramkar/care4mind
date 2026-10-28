import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { at, ROUTES_IN_SCOPE } from './routes'

// WCAG 1.4.10 Reflow: every route fits 320 CSS px without scrolling sideways.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} reflows at 320 px`, async ({ page }) => {
    await gotoReady(page, route.path)
    expect(await scrollsSideways(page), `${at(page, route.path)}: no sideways scroll`).toEqual([])
  })
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
