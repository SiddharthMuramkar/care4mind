import { expect, test } from '@playwright/test'

import { PAGES } from './routes'

// WCAG 1.4.10 Reflow: content fits 320 CSS px without scrolling sideways.
for (const { path, name } of PAGES) {
  test(`${name} reflows at 320 px`, async ({ page }) => {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
