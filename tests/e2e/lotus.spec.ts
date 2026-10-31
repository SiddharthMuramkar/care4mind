import { type Page } from '@playwright/test'

import { LOTUS_MOTION_KEY } from '@/components/lotus-motion'

import { recordAnimationStarts, unfinishedDrawings } from './drawings'
import { expect, gotoReady, test } from './fixtures'
import {
  breathes,
  flashesPerSecond,
  logoLotus,
  loopingProperties,
  lotuses,
  lotusStarts,
  moving,
  pauseButton,
} from './lotuses'
import { ROUTES_IN_SCOPE } from './routes'

const allMoving = async (page: Page) => {
  const each = await Promise.all((await lotuses(page).all()).map(moving))
  return each.length > 0 && each.every(Boolean)
}
const noneMoving = async (page: Page) => {
  const each = await Promise.all((await lotuses(page).all()).map(moving))
  return each.every((running) => !running)
}
const storedMotion = (page: Page) =>
  page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('care4mind:lotus')))

test('every lotus on the home page breathes', async ({ page }) => {
  await gotoReady(page, '/')
  await expect(logoLotus(page)).toBeAttached()
  expect(await lotuses(page).count()).toBeGreaterThanOrEqual(4)
  for (const lotus of await lotuses(page).all()) {
    await expect.poll(() => breathes(lotus)).toBe(true)
  }
})

test('a lotus moves by transform and opacity alone, its strokes whole, at most 3 flashes a second', async ({
  page,
}) => {
  await gotoReady(page, '/')
  await expect.poll(() => unfinishedDrawings(page)).toEqual([])
  for (const lotus of await lotuses(page).all()) {
    expect(await loopingProperties(lotus)).toEqual(['opacity', 'transform'])
    expect(await flashesPerSecond(lotus)).toBeLessThanOrEqual(3)
  }
})

test('the button is on every page, unpressed', async ({ page }) => {
  for (const { path } of ROUTES_IN_SCOPE) {
    await gotoReady(page, path)
    const pause = await pauseButton(page)
    await expect(pause, path).toBeVisible()
    await expect(pause, path).toHaveAttribute('aria-pressed', 'false')
  }
})

test('pressing it stills every lotus within two frames, and pressing again sets them breathing', async ({
  page,
}) => {
  await gotoReady(page, '/')
  const pause = await pauseButton(page)
  await expect.poll(() => allMoving(page)).toBe(true)
  await pause.click()
  const stillAfterTwoFrames = await page.evaluate(
    () =>
      new Promise<boolean>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            resolve(
              [...document.querySelectorAll('svg[data-lotus]')].every((svg) =>
                svg
                  .getAnimations({ subtree: true })
                  .every(
                    (animation) =>
                      animation.playState !== 'running' ||
                      animation.effect?.getComputedTiming().iterations !== Infinity,
                  ),
              ),
            ),
          ),
        ),
      ),
  )
  expect(stillAfterTwoFrames).toBe(true)
  await expect(pause).toHaveAttribute('aria-pressed', 'true')
  await pause.click()
  await expect(pause).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(() => allMoving(page)).toBe(true)
})

for (const key of ['Space', 'Enter']) {
  test(`${key} presses it, with the focus ring visible and uncovered`, async ({ page }) => {
    await gotoReady(page, '/')
    const pause = await pauseButton(page)
    await pause.focus()
    await expect(pause).toBeFocused()
    expect(await pause.evaluate((button) => getComputedStyle(button).outlineStyle)).not.toBe('none')
    const uncovered = await pause.evaluate((button) => {
      const box = button.getBoundingClientRect()
      const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
      return top !== null && button.contains(top)
    })
    expect(uncovered).toBe(true)
    await page.keyboard.press(key)
    await expect(pause).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => noneMoving(page)).toBe(true)
  })
}

test('it is at least 44 by 44; its name holds while its look changes', async ({ page }) => {
  await gotoReady(page, '/')
  const pause = await pauseButton(page)
  const box = await pause.boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(44)
  expect(box?.height).toBeGreaterThanOrEqual(44)
  const before = await pause.screenshot()
  await pause.click()
  await expect(pause).toHaveAccessibleName('Pause the lotus')
  await expect.poll(async () => (await pause.screenshot()).equals(before)).toBe(false)
})

test('the choice holds across a client navigation, a reload and a new tab', async ({
  page,
  context,
}) => {
  const elsewhere = ROUTES_IN_SCOPE.find(({ path }) => path !== '/')?.path ?? '/'
  await gotoReady(page, elsewhere)
  await (await pauseButton(page)).click()
  await page.keyboard.press('Escape')
  await page.getByRole('banner').getByRole('link', { name: 'Care4Mind home', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => noneMoving(page)).toBe(true)
  await page.reload()
  await expect.poll(() => noneMoving(page)).toBe(true)
  await expect(await pauseButton(page)).toHaveAttribute('aria-pressed', 'true')
  const tab = await context.newPage()
  await gotoReady(tab, '/')
  await expect.poll(() => noneMoving(tab)).toBe(true)
})

test('a remembered pause starts nothing on any lotus from the first paint', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'still'), LOTUS_MOTION_KEY)
  await recordAnimationStarts(page)
  await gotoReady(page, '/')
  await expect.poll(() => unfinishedDrawings(page)).toEqual([])
  expect(await lotusStarts(page)).toEqual([])
  expect(await noneMoving(page)).toBe(true)
})

test('nothing is stored until a press, then one entry', async ({ page }) => {
  await gotoReady(page, '/')
  expect(await storedMotion(page)).toEqual([])
  await (await pauseButton(page)).click()
  await expect.poll(() => storedMotion(page)).toEqual([LOTUS_MOTION_KEY])
})

test('with storage blocked the lotus breathes and nothing throws', async ({ page }) => {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage is blocked', 'SecurityError')
      },
    }),
  )
  await gotoReady(page, '/')
  await expect.poll(() => moving(logoLotus(page))).toBe(true)
  await (await pauseButton(page)).click()
  await expect.poll(() => noneMoving(page)).toBe(true)
  expect(errors).toEqual([])
})

test('turning reduced motion on mid-visit stills every lotus', async ({ page }) => {
  await gotoReady(page, '/')
  await expect.poll(() => allMoving(page)).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => noneMoving(page)).toBe(true)
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('nothing loops and there is no button', async ({ page }) => {
    await page.goto('/')
    await expect(lotuses(page).first()).toBeAttached()
    await expect(page.getByRole('button', { name: 'Pause the lotus', exact: true })).toHaveCount(0)
    for (const lotus of await lotuses(page).all()) {
      expect(await breathes(lotus)).toBe(false)
    }
  })
})
