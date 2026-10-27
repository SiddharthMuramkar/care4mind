import { expect, test } from '@playwright/test'

import { frameKolam, openingFolio, unfinishedDrawings } from './drawings'
import { PAGES } from './routes'
import { travel } from './scrolling'

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

test('the opening kolam scrolls with the page where scroll timelines are missing', async ({
  page,
}) => {
  await page.goto('/')
  const scrollTimelines = await page.evaluate(() => CSS.supports('animation-timeline: scroll()'))
  test.skip(scrollTimelines, 'this browser drifts the kolam on a scroll timeline')
  const [kolam, folio] = await travel(page, 240, await frameKolam(page), openingFolio(page))
  expect(folio).toBe(240)
  expect(kolam).toBe(folio)
})
