import type { Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'

// Back to top: a 44 px button at the lower right of a long page, shown once the reader is two
// screens down, which takes the reader and their focus back to the top of the page.

/** A long page at every width: a Concept's runs to many screens. */
const LONG = '/concepts/vikshepa/'

const backToTop = (page: Page) => page.getByRole('button', { name: 'Back to top', exact: true })

/** Scroll the page at once, whatever its own scroll behaviour. */
const scrollTo = (page: Page, top: number) =>
  page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), top)

const screen = (page: Page) => page.evaluate(() => window.innerHeight)

test('shows only once the reader is two screens down, and passes axe', async ({ page }) => {
  await gotoReady(page, LONG)
  await expect(backToTop(page)).toBeHidden()
  const height = await screen(page)
  await scrollTo(page, 2 * height - 40)
  await expect(backToTop(page)).toBeHidden()
  await scrollTo(page, 2 * height + 40)
  await expect(backToTop(page)).toBeVisible()
  await expectNoAxeViolations(page, 'with Back to top shown')
  await scrollTo(page, height)
  await expect(backToTop(page)).toBeHidden()
})

test('is a 44 px button at the lower right, inside the screen’s safe area', async ({ page }) => {
  await gotoReady(page, LONG)
  // A phone's home bar and rounded corners, as a notched phone reports them to the page.
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { bottom: 34, right: 24 } })
  const insets = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.cssText =
      'position: fixed; padding: 0 env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) 0'
    document.body.append(probe)
    const style = getComputedStyle(probe)
    const read = { right: parseFloat(style.paddingRight), bottom: parseFloat(style.paddingBottom) }
    probe.remove()
    return read
  })
  await scrollTo(page, 3 * (await screen(page)))
  const button = backToTop(page)
  await expect(button).toBeVisible()
  const box = await button.boundingBox()
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 }
  expect(box?.width).toBe(44)
  expect(box?.height).toBe(44)
  const [x, y] = [box?.x ?? 0, box?.y ?? 0]
  expect(x, 'on the right').toBeGreaterThan(width / 2)
  expect(y, 'at the bottom').toBeGreaterThan(height / 2)
  // At least a 16 px margin, inside whatever the safe area takes.
  expect(width - (x + 44), 'clear of the right edge').toBeGreaterThanOrEqual(insets.right + 15.5)
  expect(height - (y + 44), 'clear of the bottom edge').toBeGreaterThanOrEqual(insets.bottom + 15.5)
})

test('takes the reader and their focus back to the top, from the keyboard', async ({ page }) => {
  await gotoReady(page, LONG)
  await scrollTo(page, 3 * (await screen(page)))
  const button = backToTop(page)
  await expect(button).toBeVisible()
  await button.focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  // Focus is on the page's first stop, its skip link, and the next Tab goes on into the header.
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused()
  await expect(button).toBeHidden()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true }),
  ).toBeFocused()
})

test('takes the reader back to the top when pressed', async ({ page }) => {
  await gotoReady(page, LONG)
  await scrollTo(page, 3 * (await screen(page)))
  await backToTop(page).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused()
})
