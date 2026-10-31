import { type Locator, type Page } from '@playwright/test'

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
import { recordScriptedAnimations } from './switches'

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
    // Chromium shows :focus-visible on a scripted focus only after a key press.
    await page.keyboard.press('Shift')
    await pause.focus()
    await expect(pause).toBeFocused()
    expect(await pause.evaluate((button) => getComputedStyle(button).outlineStyle)).not.toBe('none')
    // The Menu may still be sliding in.
    await expect
      .poll(() =>
        pause.evaluate((button) => {
          const box = button.getBoundingClientRect()
          const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
          return top !== null && button.contains(top)
        }),
      )
      .toBe(true)
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
  const pause = await pauseButton(page)
  await pause.click()
  await expect(pause).toHaveAttribute('aria-pressed', 'true')
  const menu = page.getByRole('dialog', { name: 'Menu' })
  const menuWasOpen = await menu.isVisible()
  await page.keyboard.press('Escape')
  if (menuWasOpen) await expect(menu).toBeHidden()
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

test.describe('pointing and pressing', () => {
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
})
