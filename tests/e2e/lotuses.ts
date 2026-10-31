import { type Locator, type Page } from '@playwright/test'

import type { Start } from './drawings'

/** Every lotus on the page: the header's beside the wordmark, and each Fleuron. */
export const lotuses = (page: Page) => page.locator('svg[data-lotus]')

/** The lotus beside the wordmark, in the header's link home. */
export const logoLotus = (page: Page) =>
  page
    .getByRole('banner')
    .getByRole('link', { name: 'Care4Mind home', exact: true })
    .locator('svg[data-lotus]')

/** The keyframes of the hero's one breath: its petals, its heart and the heart's glow. */
export const BREATH = ['breathe-left', 'breathe-right', 'breathe-centre', 'heartbeat', 'glow']

/** Whether the lotus has a breath, running, finished or yet to start. */
export const breathes = (lotus: Locator) =>
  lotus.evaluate(
    (svg, breath) =>
      svg
        .getAnimations({ subtree: true })
        .some((animation) => breath.includes((animation as CSSAnimation).animationName)),
    BREATH,
  )

/** Whether anything on the lotus is animating now. */
export const moving = (lotus: Locator) =>
  lotus.evaluate((svg) =>
    svg.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running'),
  )

/** The properties the lotus's breath changes, each once, in order: ['opacity', 'transform']. */
export const breathProperties = (lotus: Locator) =>
  lotus.evaluate((svg, breath) => {
    const timing = new Set(['offset', 'computedOffset', 'easing', 'composite'])
    const properties = svg
      .getAnimations({ subtree: true })
      .filter((animation) => breath.includes((animation as CSSAnimation).animationName))
      .flatMap(({ effect }) => (effect instanceof KeyframeEffect ? effect.getKeyframes() : []))
      .flatMap((keyframe) => Object.keys(keyframe))
      .filter((key) => !timing.has(key))
    return [...new Set(properties)].sort()
  }, BREATH)

/**
 * What is animating on the clock now, anywhere on the page: running animations on the document
 * timeline. Scroll-driven ones move only as the visitor scrolls, so they don't count.
 */
export const runningOnTheClock = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter(
        (animation) =>
          animation.playState === 'running' && animation.timeline instanceof DocumentTimeline,
      )
      .map((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target
        const name =
          (animation as CSSAnimation).animationName ??
          (animation as CSSTransition).transitionProperty
        return `${name} on ${target ? [target.localName, ...target.classList].join('.') : '?'}`
      }),
  )

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

/** The most flashes a second any part of the lotus's breath makes: one per rise to a peak. */
export const flashesPerSecond = (lotus: Locator) =>
  lotus.evaluate(
    (svg, breath) =>
      Math.max(
        0,
        ...svg
          .getAnimations({ subtree: true })
          .filter((animation) => breath.includes((animation as CSSAnimation).animationName))
          .map(({ effect }) => effect)
          .filter((effect): effect is KeyframeEffect => effect instanceof KeyframeEffect)
          .map((effect) => {
            const opacities = effect
              .getKeyframes()
              .map((keyframe) => keyframe.opacity)
              .filter((opacity) => opacity !== undefined)
              .map(Number)
            const peaks = opacities.filter(
              (opacity, index) => index > 0 && opacity > (opacities[index - 1] ?? opacity),
            ).length
            const seconds = Number(effect.getComputedTiming().duration) / 1000
            return seconds > 0 ? peaks / seconds : 0
          }),
      ),
    BREATH,
  )
