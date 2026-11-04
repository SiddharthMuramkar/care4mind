import type { Locator, Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'
import { centre, inkSpreadsOn, recordInkSpreads } from './presses'
import { MISSING } from './routes'

test.beforeEach(async ({ page }) => {
  await recordInkSpreads(page)
})

// The ink never holds up a press: each call to action still takes you where it says.
const CALLS_TO_ACTION = [
  {
    from: '/',
    name: 'Start here',
    to: '/start/',
    heading: (page: Page) => page.getByRole('heading', { level: 1 }),
  },
  {
    from: '/',
    name: 'Browse concepts',
    to: '/concepts/',
    heading: (page: Page) => page.getByRole('heading', { name: 'Concepts', level: 1 }),
  },
  {
    from: MISSING,
    name: 'Go to the homepage',
    to: '/',
    heading: (page: Page) => page.getByRole('heading', { level: 1 }),
  },
]

const PRESSES: Record<string, (cta: Locator) => Promise<void>> = {
  clicking: (cta) => cta.click(),
  'pressing Enter on': async (cta) => {
    // On screen first, as a keyboard user's Tab leaves it: focusing a control below the fold
    // glides it into view, and a glide still under way when Enter lands replaces Enter's own.
    await cta.scrollIntoViewIfNeeded()
    await cta.focus()
    await cta.press('Enter')
  },
}

for (const { from, name, to, heading } of CALLS_TO_ACTION) {
  for (const [how, press] of Object.entries(PRESSES)) {
    test(`${how} "${name}" takes you where it says`, async ({ page }) => {
      await gotoReady(page, from)
      await press(page.getByRole('main').getByRole('link', { name, exact: true }))
      await expect(page).toHaveURL(to)
      await expect(heading(page)).toBeInViewport()
    })
  }
}

// Each press opens the page in a new tab, so the homepage and its ink stay in view.
test('pressing "Start here" spreads ink from the point pressed', async ({ page, context }) => {
  await gotoReady(page, '/')
  const cta = page.getByRole('main').getByRole('link', { name: 'Start here', exact: true })
  const opened = context.waitForEvent('page')
  await cta.click({ modifiers: ['ControlOrMeta'], position: { x: 14, y: 9 } })
  await (await opened).close()
  await expect.poll(() => inkSpreadsOn(cta)).toHaveLength(1)
  const [spread] = await inkSpreadsOn(cta)
  const [x = NaN, y = NaN] = centre(spread?.from ?? '')
  expect(Math.hypot(x - 14, y - 9), 'centred on the press, to within a pixel').toBeLessThan(1.5)
  expect(spread?.grew, 'the ink spreads out from there').toBe(true)
})

test('pressing a call to action again spreads fresh ink from the new point', async ({
  page,
  context,
}) => {
  await gotoReady(page, '/')
  const cta = page.getByRole('main').getByRole('link', { name: 'Start here', exact: true })
  for (const position of [
    { x: 10, y: 10 },
    { x: 40, y: 30 },
  ]) {
    const opened = context.waitForEvent('page')
    await cta.click({ modifiers: ['ControlOrMeta'], position })
    await (await opened).close()
  }
  await expect.poll(() => inkSpreadsOn(cta)).toHaveLength(2)
  const [first, second] = await inkSpreadsOn(cta)
  const [x = NaN, y = NaN] = centre(second?.from ?? '')
  expect(first?.from).not.toBe(second?.from)
  expect(Math.hypot(x - 40, y - 30), 'centred on the second press').toBeLessThan(1.5)
  expect(second?.grew).toBe(true)
})

// A plain press leaves the 404 at once; opening the homepage in a new tab keeps it in view.
test('pressing the 404 page\'s "Go to the homepage" spreads ink too', async ({ page, context }) => {
  await gotoReady(page, MISSING)
  const cta = page.getByRole('main').getByRole('link', { name: 'Go to the homepage', exact: true })
  const opened = context.waitForEvent('page')
  await cta.click({ modifiers: ['ControlOrMeta'], position: { x: 20, y: 12 } })
  await (await opened).close()
  await expect.poll(() => inkSpreadsOn(cta)).toHaveLength(1)
  const [spread] = await inkSpreadsOn(cta)
  const [x = NaN, y = NaN] = centre(spread?.from ?? '')
  expect(Math.hypot(x - 20, y - 12), 'centred on the press').toBeLessThan(1.5)
})

test('pressing Enter on "Start here" spreads ink from its centre', async ({ page, context }) => {
  await gotoReady(page, '/')
  const cta = page.getByRole('main').getByRole('link', { name: 'Start here', exact: true })
  await cta.focus()
  const opened = context.waitForEvent('page')
  await page.keyboard.press('ControlOrMeta+Enter')
  await (await opened).close()
  await expect.poll(() => inkSpreadsOn(cta)).toEqual([{ from: '50% 50%', grew: true }])
})
