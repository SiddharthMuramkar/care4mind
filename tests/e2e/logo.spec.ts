import { expect, type Page, test } from '@playwright/test'

import { isDrawing } from './drawings'
import { MISSING, PAGES } from './routes'

const homeLink = (page: Page) =>
  page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })

for (const { path, name } of [...PAGES, { path: MISSING, name: '404 page' }]) {
  test(`${name} shows the kolam logo, still named "Care4Mind home"`, async ({ page }) => {
    await page.goto(path)
    const logo = homeLink(page)
    await expect(logo).toHaveText('care4mind')
    await expect(logo.locator('svg')).toBeVisible()
    // WCAG 2.5.3: the visible "care4mind" is in the name, and the mark adds nothing to what is announced.
    await expect(logo).toMatchAriaSnapshot(`
      - /children: deep-equal
      - link "Care4Mind home":
        - text: care4mind
    `)
  })
}

test('the logo is a target at least 48 px tall', async ({ page }) => {
  await page.goto('/')
  const box = await homeLink(page).boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48)
})

test('the mark adds no stop of its own to the tab order', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(homeLink(page)).toBeFocused()
  await page.keyboard.press('Tab')
  const main = page.getByRole('navigation', { name: 'Main' })
  await expect(main.getByRole('link', { name: 'Concepts', exact: true })).toBeFocused()
})

test('pointing at the logo redraws its mark, which ends complete', async ({ page }) => {
  await page.goto('/')
  const line = homeLink(page).locator('svg path')
  expect(await isDrawing(line)).toBe(false)
  await homeLink(page).hover()
  await expect.poll(() => isDrawing(line)).toBe(true)
  await expect.poll(() => isDrawing(line)).toBe(false)
  expect(await line.evaluate((element) => getComputedStyle(element).strokeDashoffset)).toBe('0px')
})

test('focusing the logo from the keyboard redraws its mark', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(homeLink(page)).toBeFocused()
  await expect.poll(() => isDrawing(homeLink(page).locator('svg path'))).toBe(true)
})

test('the footer shows the same mark and wordmark, and pointing at it draws nothing', async ({
  page,
}) => {
  await page.goto('/')
  const wordmark = page.getByRole('contentinfo').getByText('care4mind', { exact: true })
  await expect(wordmark.locator('svg')).toBeVisible()
  await wordmark.hover()
  await page.waitForTimeout(100)
  expect(await isDrawing(wordmark.locator('svg path'))).toBe(false)
})
