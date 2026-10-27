import { expect, test } from '@playwright/test'

import { unfinishedDrawings } from './drawings'
import { PAGES } from './routes'

// Firefox and WebKit: each page renders, without errors or sideways scroll.
for (const { path, name } of PAGES) {
  test(`${name} renders`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    expect(errors).toEqual([])
  })

  // Drawings these browsers can't drive by scroll are simply shown finished.
  test(`${name} shows the kolam logo and finished drawings`, async ({ page }) => {
    await page.goto(path)
    const logo = page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })
    await expect(logo.locator('svg')).toBeVisible()
    await expect.poll(() => unfinishedDrawings(page)).toEqual([])
  })
}
