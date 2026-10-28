import { unfinishedDrawings, unfinishedRules } from './drawings'
import { expect, test } from './fixtures'
import { READING_PAGES, readingThread, readTo } from './reading'
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

  // Drawings and rules these browsers can't drive by scroll are simply shown finished.
  test(`${name} shows the wordmark, finished drawings and full-width rules`, async ({ page }) => {
    await page.goto(path)
    const logo = page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })
    await expect(logo).toBeVisible()
    await expect(logo).toHaveText('Care4Mind')
    await expect(logo.locator('path, line, polyline, polygon, img, canvas')).toHaveCount(0)
    await expect.poll(() => unfinishedDrawings(page)).toEqual([])
    await expect.poll(() => unfinishedRules(page)).toEqual([])
  })
}

for (const { path, name } of READING_PAGES) {
  test(`${name} has no reading thread where scroll timelines are missing`, async ({ page }) => {
    await page.goto(path)
    const scrollTimelines = await page.evaluate(() => CSS.supports('animation-timeline: scroll()'))
    test.skip(scrollTimelines, 'this browser fills the thread on a scroll timeline')
    await readTo(page, 0.5)
    expect(await readingThread(page)).toBeNull()
  })
}
