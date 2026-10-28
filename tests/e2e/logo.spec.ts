import type { Page } from '@playwright/test'

import { animationsStartedOn, isDrawing, recordAnimationStarts } from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { MISSING, PAGES } from './routes'

const homeLink = (page: Page) =>
  page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true })

for (const { path, name } of [...PAGES, { path: MISSING, name: '404 page' }]) {
  test(`${name} shows the kolam logo, still named "Care4Mind home"`, async ({ page }) => {
    await gotoReady(page, path)
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
  await gotoReady(page, '/')
  const box = await homeLink(page).boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48)
})

test('the mark adds no stop of its own to the tab order', async ({ page }) => {
  await gotoReady(page, '/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(homeLink(page)).toBeFocused()
  await page.keyboard.press('Tab')
  // The header's next control: Concepts where the sections fit (from 72rem), else Search.
  const next = (page.viewportSize()?.width ?? 0) >= 1152 ? 'Concepts' : 'Search'
  const main = page.getByRole('navigation', { name: 'Main' })
  await expect(main.getByRole('link', { name: next, exact: true })).toBeFocused()
})

// The redraws are listened for, not caught running: a busy machine can take longer than one to look.
const REDRAW = [{ byScroll: false, duration: expect.closeTo(700, -2) }]

test('pointing at the logo redraws its mark, which ends complete', async ({ page }) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/')
  const line = homeLink(page).locator('svg path')
  expect(await isDrawing(line)).toBe(false)
  await homeLink(page).hover()
  await expect.poll(() => animationsStartedOn(line)).toEqual(REDRAW)
  await expect.poll(() => isDrawing(line)).toBe(false)
  expect(await line.evaluate((element) => getComputedStyle(element).strokeDashoffset)).toBe('0px')
})

test('focusing the logo from the keyboard redraws its mark', async ({ page }) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(homeLink(page)).toBeFocused()
  await expect.poll(() => animationsStartedOn(homeLink(page).locator('svg path'))).toEqual(REDRAW)
})

test('the footer shows the same mark and wordmark, and pointing at it draws nothing', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const wordmark = page.getByRole('contentinfo').getByText('care4mind', { exact: true })
  await expect(wordmark.locator('svg')).toBeVisible()
  await wordmark.hover()
  await page.waitForTimeout(100)
  expect(await isDrawing(wordmark.locator('svg path'))).toBe(false)
})
