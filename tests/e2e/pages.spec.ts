import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { MISSING, PAGES } from './routes'

for (const { path, name } of PAGES) {
  test.describe(name, () => {
    test('loads with one h1 and no sideways scroll', async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })

    test('passes axe at WCAG 2.2 AA', async ({ page }) => {
      await page.goto(path)
      await expectNoAxeViolations(page)
    })

    test('tells search engines not to index it, twice', async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.headers()['x-robots-tag']).toContain('noindex')
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    })
  })
}

test('a missing page returns 404 and is not indexed', async ({ page }) => {
  const response = await page.goto(MISSING)
  expect(response?.status()).toBe(404)
  expect(response?.headers()['x-robots-tag']).toContain('noindex')
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
})

test('the skip link is the first thing keyboard focus reaches', async ({ page }) => {
  await page.goto(PAGES[0].path)
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
})
