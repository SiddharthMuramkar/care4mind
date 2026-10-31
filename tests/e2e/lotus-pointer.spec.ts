import type { Locator, Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'
import { logoLotus, lotuses } from './lotuses'
import { recordScriptedAnimations } from './switches'

const heroLotus = (page: Page) => page.getByRole('main').locator('svg[data-lotus]').first()

/** How far the lotus's parts are turned or grown from rest, summed over every group. */
const pose = (lotus: Locator) =>
  lotus.evaluate((svg) =>
    [...svg.querySelectorAll('g')].reduce((sum, group) => {
      const { transform } = getComputedStyle(group)
      if (transform === 'none') return sum
      const m = new DOMMatrixReadOnly(transform)
      return sum + Math.abs(Math.atan2(m.b, m.a)) + Math.abs(Math.hypot(m.a, m.b) - 1)
    }, 0),
  )

/** Holds every breath at its rest pose, so only the pointer moves the lotus. */
const holdBreath = (page: Page) =>
  page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if (animation.effect?.getComputedTiming().iterations !== Infinity) continue
      animation.pause()
      animation.currentTime = 0
    }
  })

const pauseLotuses = (page: Page) =>
  page.evaluate(() => {
    document.documentElement.dataset.lotusMotion = 'still'
  })

async function pointAt(page: Page, lotus: Locator) {
  const box = await lotus.boundingBox()
  if (!box) throw new Error('the lotus has no box')
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2, { steps: 4 })
}

test.beforeEach(async ({ page }) => {
  await recordScriptedAnimations(page)
  await gotoReady(page, '/')
  await holdBreath(page)
})

test('pointing at a lotus opens it toward the pointer, and it settles back when the pointer leaves', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'a finger has no pointer to follow')
  const lotus = heroLotus(page)
  await pointAt(page, lotus)
  await expect.poll(() => pose(lotus)).toBeGreaterThan(0.01)
  await expect
    .poll(() => lotus.evaluate((svg) => Number(svg.style.getPropertyValue('--lotus-lean'))))
    .toBeGreaterThan(0)
  await page.mouse.move(0, 0)
  await page.dispatchEvent('html', 'pointerleave')
  await expect.poll(() => pose(lotus)).toBeLessThan(0.001)
})

test('pressing a lotus blooms it, every time', async ({ page }) => {
  const lotus = heroLotus(page)
  for (const bloom of ['a', 'b', 'a']) {
    await lotus.click()
    await expect(lotus).toHaveAttribute('data-lotus-bloom', bloom)
    expect(
      await lotus.evaluate((svg) =>
        svg.getAnimations({ subtree: true }).some((a) => a.playState === 'running'),
      ),
    ).toBe(true)
  }
})

test("pressing the logo's lotus blooms it and still goes home", async ({ page }) => {
  await gotoReady(page, '/concepts/')
  await logoLotus(page).click()
  await expect(page).toHaveURL('/')
  await expect(logoLotus(page)).toHaveAttribute('data-lotus-bloom', 'a')
})

test("pressing the Menu's lotus leaves the Menu open", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1152, 'the Menu is for narrow screens')
  await page.getByRole('banner').getByRole('button', { name: 'Menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  const lotus = menu.locator('svg[data-lotus]').first()
  test.skip((await lotus.count()) === 0, 'this Menu holds no lotus')
  await lotus.click()
  await expect(lotus).toHaveAttribute('data-lotus-bloom', 'a')
  await expect(menu).toBeVisible()
})

test('while paused, pointing or pressing moves nothing', async ({ page }) => {
  await pauseLotuses(page)
  const lotus = heroLotus(page)
  await pointAt(page, lotus)
  await lotus.click()
  await expect(lotus).not.toHaveAttribute('data-lotus-bloom')
  expect(await lotus.evaluate((svg) => svg.style.getPropertyValue('--lotus-near'))).toBe('')
  expect(await pose(lotus)).toBeLessThan(0.001)
})

test('a lotus is moved by CSS alone', async ({ page }) => {
  const lotus = heroLotus(page)
  await pointAt(page, lotus)
  await lotus.click()
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __scriptedAnimations: Animation[] }).__scriptedAnimations.length,
    ),
  ).toBe(0)
})

test('double-pressing a lotus selects no text', async ({ page }) => {
  await lotuses(page).first().dblclick()
  expect(await page.evaluate(() => String(getSelection()))).toBe('')
})
