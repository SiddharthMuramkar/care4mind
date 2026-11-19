import type { Locator } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'

// A filter chip is 44 px tall at every width, a finger's target on a touch laptop too, and a
// pressed chip shows a tick before its name as well as its ink fill, so its state never rests
// on colour alone (WCAG 1.4.1).

/**
 * The tick a chip draws before its name, or null where it draws none: a stroke in the chip's own
 * ink, taller than it is wide, as a tick is (not a square lozenge, nor a red mark).
 */
const tick = (chip: Locator) =>
  chip.evaluate((button) => {
    const mark = getComputedStyle(button, '::after')
    const [width, height] = [parseFloat(mark.width), parseFloat(mark.height)]
    if (mark.content === 'none' || !(width > 0) || !(height > 0)) return null
    return { width, height, inked: mark.borderBottomColor === getComputedStyle(button).color }
  })

for (const path of ['/concepts/', '/library/references/']) {
  test(`${path}: every filter chip is 44 px tall, and only a pressed one shows a tick`, async ({
    page,
  }) => {
    await gotoReady(page, path)
    const chips = page.getByRole('group', { name: 'Filter the entries' }).getByRole('button')
    // The plain chips give way to Base UI's when its code arrives, with the rail's toolbar.
    await expect(page.getByRole('toolbar', { name: 'Jump to a letter' })).toBeVisible()
    const heights = await chips.evaluateAll((buttons) =>
      buttons
        .filter((button) => button.checkVisibility())
        .map((button) => ({
          name: button.textContent,
          height: button.getBoundingClientRect().height,
        })),
    )
    expect(heights.length).toBeGreaterThan(0)
    for (const { name, height } of heights) expect(height, name ?? '').toBeGreaterThanOrEqual(44)
    const first = chips.first()
    await expect(first).toHaveAttribute('aria-pressed', 'false')
    expect(await tick(first), 'no tick while off').toBeNull()
    await first.click()
    await expect(first).toHaveAttribute('aria-pressed', 'true')
    const mark = await tick(first)
    expect(mark, 'a tick once pressed').not.toBeNull()
    expect(mark?.width).toBeGreaterThan(0)
    expect(mark?.height, 'taller than wide').toBeGreaterThan(mark?.width ?? Infinity)
    expect(mark?.inked, 'in the chip’s own ink').toBe(true)
  })
}
