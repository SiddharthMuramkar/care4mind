import { type Locator, type Page } from '@playwright/test'

import { recordAnimationStarts, unfinishedDrawings } from './drawings'
import { expect, gotoReady, test } from './fixtures'
import {
  BREATH,
  breathes,
  breathProperties,
  flashesPerSecond,
  logoLotus,
  lotuses,
  lotusStarts,
  runningOnTheClock,
} from './lotuses'
import { ROUTES_IN_SCOPE } from './routes'
import { recordScriptedAnimations } from './switches'

// WCAG 2.2.2: motion that starts on its own and ends within 5 s needs no pause control.
const STILL_BY = 5_000

test('the hero lotus breathes once, after it draws in, and is still within 5 s of load', async ({
  page,
}) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/')
  const hero = heroLotus(page)
  await expect.poll(() => breathes(hero)).toBe(true)
  const timings = await hero.evaluate(
    (svg, breath) =>
      svg.getAnimations({ subtree: true }).map((animation) => {
        const timing = animation.effect?.getComputedTiming()
        return {
          breath: breath.includes((animation as CSSAnimation).animationName),
          iterations: timing?.iterations,
          endTime: Number(timing?.endTime),
        }
      }),
    BREATH,
  )
  for (const { iterations, endTime } of timings) {
    expect(iterations, 'it runs once').toBe(1)
    expect(endTime, 'it ends within 5 s').toBeLessThanOrEqual(STILL_BY)
  }
  const drawnBy = Math.max(...timings.filter((t) => !t.breath).map((t) => t.endTime))
  const breaths = (await lotusStarts(page)).filter(({ name }) => BREATH.includes(name))
  expect(breaths.length, 'it breathes').toBeGreaterThan(0)
  for (const { delay } of breaths) {
    expect(delay, 'the breath sets off once the drawing is done').toBeGreaterThanOrEqual(drawnBy)
  }
})

test('no other lotus breathes', async ({ page }) => {
  await gotoReady(page, '/')
  const all = await lotuses(page).all()
  expect(all.length).toBeGreaterThanOrEqual(4)
  const hero = await heroLotus(page).elementHandle()
  for (const lotus of all) {
    if (await lotus.evaluate((svg, h) => svg === h, hero)) continue
    expect(await breathes(lotus)).toBe(false)
  }
})

test('the breath moves by transform and opacity alone, its strokes whole, at most 3 flashes a second', async ({
  page,
}) => {
  await gotoReady(page, '/')
  await expect.poll(() => unfinishedDrawings(page)).toEqual([])
  const hero = heroLotus(page)
  expect(await breathProperties(hero)).toEqual(['opacity', 'transform'])
  expect(await flashesPerSecond(hero)).toBeLessThanOrEqual(3)
})

test('with no input, nothing runs on the clock 5.5 s after load, on any route', async ({
  page,
}) => {
  test.setTimeout(ROUTES_IN_SCOPE.length * 15_000)
  for (const { path } of ROUTES_IN_SCOPE) {
    await page.goto(path)
    const sinceLoad = await page.evaluate(() => performance.now())
    await page.waitForTimeout(Math.max(0, STILL_BY + 500 - sinceLoad))
    expect(await runningOnTheClock(page), path).toEqual([])
  }
})

test('there is no pause control, on any route', async ({ page }) => {
  for (const { path } of ROUTES_IN_SCOPE) {
    await gotoReady(page, path)
    await expect(page.getByRole('button', { name: /pause/i }), path).toHaveCount(0)
  }
})

test('turning reduced motion on mid-visit stops the breath', async ({ page }) => {
  await gotoReady(page, '/')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => breathes(heroLotus(page))).toBe(false)
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

async function pointAt(page: Page, lotus: Locator) {
  const box = await lotus.boundingBox()
  if (!box) throw new Error('the lotus has no box')
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2, { steps: 4 })
}

test.describe('pointing and pressing', () => {
  test.beforeEach(async ({ page }) => {
    await recordScriptedAnimations(page)
    await gotoReady(page, '/')
    // The hero's one breath ends first, so only the pointer moves it.
    await expect.poll(() => runningOnTheClock(page), { timeout: 10_000 }).toEqual([])
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
