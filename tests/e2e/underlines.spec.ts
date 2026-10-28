import type { Locator, Page } from '@playwright/test'

import { recordAnimationStarts, transitionedOn } from './drawings'
import { expect, gotoReady, test } from './fixtures'
import { MISSING } from './routes'

/** Focus a link as a keyboard user would, so it shows its focus state. */
async function focusFromKeyboard(page: Page, link: Locator) {
  await page.keyboard.press('Tab')
  await link.focus()
  expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await recordAnimationStarts(page)
})

// Navigation and calls to action: no underline at rest; a line draws in, by transform alone.
const DRAWN: { page: string; name: string; in: (page: Page) => Locator; width?: number }[] = [
  {
    page: '/',
    name: 'Concepts',
    in: (page: Page) => page.getByRole('navigation', { name: 'Main' }),
    // The header shows its sections from 72rem; narrower screens find them in the Menu.
    width: 1440,
  },
  { page: '/', name: 'Explore Concepts', in: (page: Page) => page.getByRole('main') },
  { page: '/', name: 'Questionnaires', in: (page: Page) => page.getByRole('main') },
  { page: MISSING, name: 'Go to the homepage', in: (page: Page) => page.getByRole('main') },
]

for (const { page: path, name, in: around, width } of DRAWN) {
  for (const [how, act] of [
    ['pointing at', (_page: Page, link: Locator) => link.hover()],
    ['focusing', focusFromKeyboard],
  ] as const) {
    test(`${how} "${name}" draws a line under it, by transform`, async ({ page }) => {
      if (width) await page.setViewportSize({ width, height: 900 })
      await gotoReady(page, path)
      const link = around(page).getByRole('link', { name, exact: true })
      await expect(link).toHaveCSS('text-decoration-line', 'none')
      await act(page, link)
      await expect.poll(() => transitionedOn(link)).toContain('transform')
      expect(await transitionedOn(link)).toEqual(['transform'])
    })
  }
}

// Links in running text keep their underline at rest (WCAG 1.4.1) and draw an accent over it.
const IN_TEXT = [
  { page: '/', name: 'Concepts', in: (page: Page) => page.getByRole('main') },
  {
    page: '/concepts/vikshepa/',
    name: 'KarmaYoga Scale',
    in: (page: Page) => page.getByRole('main'),
  },
  {
    page: '/concepts/vikshepa/',
    name: 'Home',
    in: (page: Page) => page.getByRole('navigation', { name: 'Breadcrumb' }),
  },
  { page: MISSING, name: 'Read about Vikṣepa', in: (page: Page) => page.getByRole('main') },
]

for (const { page: path, name, in: around } of IN_TEXT) {
  for (const [how, act] of [
    ['pointing at', (_page: Page, link: Locator) => link.hover()],
    ['focusing', focusFromKeyboard],
  ] as const) {
    test(`${how} "${name}" in running text draws an accent over its underline`, async ({
      page,
    }) => {
      await gotoReady(page, path)
      const link = around(page).getByRole('link', { name, exact: true })
      await expect(link).toHaveCSS('text-decoration-line', 'underline')
      const atRest = await link.screenshot()
      await act(page, link)
      await expect.poll(() => transitionedOn(link)).toContain('background-size')
      expect(await transitionedOn(link)).toEqual(['background-size'])
      await expect(link, 'still underlined').toHaveCSS('text-decoration-line', 'underline')
      await expect.poll(async () => (await link.screenshot()).equals(atRest)).toBe(false)
    })
  }
}

test('pressing a card still presses it into the page', async ({ page }) => {
  await gotoReady(page, '/')
  const action = page.getByRole('link', { name: 'Read about Vikṣepa' })
  const card = page.getByRole('article').filter({ has: action })
  await action.scrollIntoViewIfNeeded()
  const before = await card.boundingBox()
  const box = await action.boundingBox()
  await page.mouse.move((box?.x ?? 0) + 10, (box?.y ?? 0) + 10)
  await page.mouse.down()
  await expect.poll(async () => (await card.boundingBox())?.y).toBeCloseTo((before?.y ?? 0) + 2, 0)
  // Let go away from the card, so it doesn't navigate.
  await page.mouse.move(1, 1)
  await page.mouse.up()
})

test('a call to action keeps its focus ring', async ({ page }) => {
  await gotoReady(page, '/')
  const cta = page.getByRole('main').getByRole('link', { name: 'Explore Concepts', exact: true })
  await focusFromKeyboard(page, cta)
  await expect(cta).toHaveCSS('outline-style', 'solid')
  expect(parseFloat(await cta.evaluate((element) => getComputedStyle(element).outlineWidth))).toBe(
    3,
  )
})
