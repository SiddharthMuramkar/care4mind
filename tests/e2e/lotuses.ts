import { expect, type Locator, type Page } from '@playwright/test'

import type { Start } from './drawings'

/** Every lotus on the page: the header's beside the wordmark, and each Fleuron. */
export const lotuses = (page: Page) => page.locator('svg[data-lotus]')

/** The lotus beside the wordmark, in the header's link home. */
export const logoLotus = (page: Page) =>
  page
    .getByRole('banner')
    .getByRole('link', { name: 'Care4Mind home', exact: true })
    .locator('svg[data-lotus]')

/** Whether the lotus is breathing now: one of its endless animations is running. */
export const moving = (lotus: Locator) =>
  lotus.evaluate((svg) =>
    svg
      .getAnimations({ subtree: true })
      .some(
        (animation) =>
          animation.playState === 'running' &&
          animation.effect?.getComputedTiming().iterations === Infinity,
      ),
  )

/** Whether the lotus has an endless animation, running, paused or yet to start. */
export const breathes = (lotus: Locator) =>
  lotus.evaluate((svg) =>
    svg
      .getAnimations({ subtree: true })
      .some((animation) => animation.effect?.getComputedTiming().iterations === Infinity),
  )

/** The properties the lotus's endless animations change, each once, in order: ['opacity', 'transform']. */
export const loopingProperties = (lotus: Locator) =>
  lotus.evaluate((svg) => {
    const timing = new Set(['offset', 'computedOffset', 'easing', 'composite'])
    const properties = svg
      .getAnimations({ subtree: true })
      .filter((animation) => animation.effect?.getComputedTiming().iterations === Infinity)
      .flatMap(({ effect }) => (effect instanceof KeyframeEffect ? effect.getKeyframes() : []))
      .flatMap((keyframe) => Object.keys(keyframe))
      .filter((key) => !timing.has(key))
    return [...new Set(properties)].sort()
  })

/**
 * The animations and transitions that have started on any lotus or its parts
 * since the page began, each with the part it started on. Call
 * recordAnimationStarts before loading the page.
 */
export const lotusStarts = (page: Page) =>
  page.evaluate(() =>
    (window as unknown as { __animationStarts: Start[] }).__animationStarts
      .filter(({ target }) => target.closest('svg[data-lotus]'))
      .map(({ target, ...start }) => ({
        part: [target.localName, ...target.classList].join('.'),
        ...start,
      })),
  )

/**
 * The "Pause the lotus" button: in the header from 72rem (1152 px), and below
 * that in the Menu, which this opens first.
 */
export async function pauseButton(page: Page) {
  const pause = { name: 'Pause the lotus', exact: true }
  if ((page.viewportSize()?.width ?? 0) >= 1152) {
    return page.getByRole('banner').getByRole('button', pause)
  }
  const menu = page.getByRole('dialog', { name: 'Menu' })
  if (!(await menu.isVisible())) {
    await page.getByRole('banner').getByRole('button', { name: 'Menu', exact: true }).click()
  }
  await expect(menu).toBeVisible()
  return menu.getByRole('button', pause)
}
