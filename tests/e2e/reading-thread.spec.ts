import type { Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'
import { READING_PAGES, readingThread, readTo } from './reading'

/** Wait until the page has kept still for a few frames: focus glides a control into view. */
function settled(page: Page) {
  return page.evaluate(
    () =>
      new Promise<void>((done) => {
        let [last, still] = [window.scrollY, 0]
        const check = () => {
          still = window.scrollY === last ? still + 1 : 0
          last = window.scrollY
          if (still >= 5) done()
          else requestAnimationFrame(check)
        }
        requestAnimationFrame(check)
      }),
  )
}

for (const { path, name } of READING_PAGES) {
  test(`${name}: a thread across the top fills as you read, silent and out of the way`, async ({
    page,
  }) => {
    await gotoReady(page, path)
    const unread = await readingThread(page)
    expect(unread, 'a thread lies across the top of the screen').not.toBeNull()
    expect(unread?.width, 'nothing read yet').toBe(0)

    await readTo(page, 0.5)
    const halfway = await readingThread(page)
    expect(halfway?.left, 'it fills from the left edge').toBe(0)
    expect((halfway?.width ?? NaN) / (halfway?.screenWidth ?? NaN), 'half read').toBeCloseTo(0.5, 1)
    expect(halfway?.height, 'a thread, not a bar').toBeLessThanOrEqual(4)
    expect(halfway?.silent, 'hidden from assistive technology').toBe(true)
    expect(halfway?.passesPressesThrough, 'presses pass through it').toBe(true)

    await readTo(page, 1)
    const read = await readingThread(page)
    expect(read?.width, 'all read').toBeCloseTo(read?.screenWidth ?? NaN, 0)
  })

  test(`${name}: nothing shifts while you read, from load to the foot of the page`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const shifts: number[] = []
      Object.defineProperty(window, '__layoutShifts', { value: shifts })
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number
          hadRecentInput: boolean
        })[]) {
          if (!entry.hadRecentInput) shifts.push(entry.value)
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await gotoReady(page, path)
    for (let fraction = 0; fraction <= 1; fraction += 0.1) await readTo(page, fraction)
    const shift = await page.evaluate(() =>
      (window as unknown as { __layoutShifts: number[] }).__layoutShifts.reduce((a, b) => a + b, 0),
    )
    expect(shift).toBeLessThan(0.01)
  })
}

test('the thread never hides a focused control, tabbing down the page or back up', async ({
  page,
}) => {
  await gotoReady(page, '/concepts/vikshepa/')
  // The page has about a dozen stops; this goes past the last and back to the first.
  const steps = [...Array<string>(15).fill('Tab'), ...Array<string>(15).fill('Shift+Tab')]
  let checked = 0
  for (const key of steps) {
    await page.keyboard.press(key)
    await settled(page)
    // A control over half the screen tall (the comparison table's frame) may not fit whole below the padding.
    const ring = await page.evaluate(() => {
      const focused = document.activeElement
      if (!focused || focused === document.body) return null
      const { top, height } = focused.getBoundingClientRect()
      if (height > window.innerHeight / 2) return null
      const { outlineWidth, outlineOffset } = getComputedStyle(focused)
      return { top: top - parseFloat(outlineWidth) - parseFloat(outlineOffset) }
    })
    const thread = await readingThread(page)
    if (!ring || !thread?.width) continue
    checked++
    expect(ring.top, `focus ring ${checked} sits below the thread`).toBeGreaterThan(thread.height)
  }
  expect(checked, 'the thread was showing for some of the controls').toBeGreaterThan(3)
})
