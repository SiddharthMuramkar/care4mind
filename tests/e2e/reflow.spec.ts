import { expect, gotoReady, test } from './fixtures'
import { PAGES } from './routes'

// WCAG 1.4.10 Reflow: content fits 320 CSS px without scrolling sideways.
for (const { path, name } of PAGES) {
  test(`${name} reflows at 320 px`, async ({ page }) => {
    await gotoReady(page, path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('the Concept page still reflows at 320 px with the Devanagari leading', async ({ page }) => {
  await gotoReady(page, '/concepts/vikshepa')
  const toggle = page.getByRole('button', { name: 'Devanagari first' })
  const box = await toggle.boundingBox()
  expect(box?.x ?? -1, 'the switch fits the screen').toBeGreaterThanOrEqual(0)
  expect((box?.x ?? 0) + (box?.width ?? Infinity)).toBeLessThanOrEqual(320)

  await toggle.click()
  const spellings = page.getByRole('heading', { level: 1 }).locator('[lang]')
  await expect(spellings.first()).toHaveAttribute('lang', 'sa-Deva')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
