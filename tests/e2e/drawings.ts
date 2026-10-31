import type { Locator, Page } from '@playwright/test'

/** The homepage's opening folio: the paper page the verse is printed on. */
export const openingFolio = (page: Page) => page.getByRole('heading', { level: 1 }).locator('..')

/**
 * Lines in decorative drawings that are not fully drawn. Lines a scroll
 * timeline is drawing are left out: they finish as the visitor scrolls.
 */
export function unfinishedDrawings(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('svg[aria-hidden="true"] path')]
      .filter((line) =>
        line.getAnimations().every((animation) => animation.timeline instanceof DocumentTimeline),
      )
      .filter((line) => parseFloat(getComputedStyle(line).strokeDashoffset) !== 0)
      .map((line) => line.outerHTML.slice(0, 80)),
  )
}

/**
 * Rules in decorative ornaments (thin lines across, such as an OrnamentRule's)
 * drawn short of their full width. Rules a scroll timeline is inking in are
 * left out: they finish as the visitor scrolls. So are the parts of controls
 * (a switch's track, a disclosure's plus), which show a state rather than finish.
 */
export function unfinishedRules(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[aria-hidden="true"] *, [aria-hidden="true"]')]
      .filter((rule) => rule.offsetHeight <= 3 && rule.offsetWidth > 8)
      .filter((rule) => !rule.closest('a, button, summary, [role]'))
      .filter((rule) =>
        rule.getAnimations().every((animation) => animation.timeline instanceof DocumentTimeline),
      )
      .filter((rule) => rule.getBoundingClientRect().width < rule.offsetWidth - 0.5)
      .map((rule) => rule.outerHTML.slice(0, 80)),
  )
}

/** Whether an animation is drawing this line right now. */
export const isDrawing = (line: Locator) =>
  line.evaluate((element) =>
    element.getAnimations().some((animation) => animation.playState === 'running'),
  )

/** How much of a line is still to draw: 0 when it is complete, 1 before it starts. */
export const undrawn = (line: Locator) =>
  line.evaluate((element) => parseFloat(getComputedStyle(element).strokeDashoffset))

export interface Start {
  target: Element
  /** The keyframes an animation runs; empty for a transition. */
  name: string
  /** How long it runs, in ms. Scroll-driven animations have no duration in time. */
  duration: number | null
  /** How long after it was set going it began, in ms. */
  delay: number
  /** Whether it repeats without end. */
  loops: boolean
  byScroll: boolean
  /** The property a transition changes; empty for an animation. */
  property: string
}

/** Note every CSS animation and transition that starts on the page, from before its first paint. */
export function recordAnimationStarts(page: Page) {
  return page.addInitScript(() => {
    const starts: Start[] = []
    Object.defineProperty(window, '__animationStarts', { value: starts })
    const record = (event: AnimationEvent | TransitionEvent) => {
      const target = event.target as Element
      const animation = target
        .getAnimations()
        .find((candidate) =>
          'animationName' in event
            ? (candidate as CSSAnimation).animationName === event.animationName
            : (candidate as CSSTransition).transitionProperty === event.propertyName,
        )
      const timing = animation?.effect?.getComputedTiming()
      const duration = timing?.duration
      starts.push({
        target,
        name: 'animationName' in event ? event.animationName : '',
        duration: typeof duration === 'number' ? duration : null,
        delay: Number(timing?.delay ?? 0),
        loops: timing?.iterations === Infinity,
        byScroll: Boolean(animation && !(animation.timeline instanceof DocumentTimeline)),
        property: 'propertyName' in event ? event.propertyName : '',
      })
    }
    document.addEventListener('animationstart', record, true)
    document.addEventListener('transitionstart', record, true)
  })
}

/**
 * The animations and transitions that have started on this element since the
 * page began, or with `orAncestors`, on it or on anything that contains it.
 * Call recordAnimationStarts before loading the page.
 */
export function animationsStartedOn(locator: Locator, { orAncestors = false } = {}) {
  return startsOn(locator, orAncestors).then((starts) =>
    starts.map(({ duration, byScroll }) => ({ duration, byScroll })),
  )
}

/**
 * How long after being set going each animation that has started on this
 * element began, in ms: drawings that go stroke by stroke start their strokes
 * at different times. Call recordAnimationStarts before loading the page.
 */
export function delaysStartedOn(locator: Locator) {
  return startsOn(locator, false).then((starts) => starts.map(({ delay }) => delay))
}

/**
 * The properties that have transitioned on this element or its pseudo-elements
 * since the page began, each once. Call recordAnimationStarts before loading the page.
 */
export function transitionedOn(locator: Locator) {
  return startsOn(locator, false).then((starts) => [
    ...new Set(starts.map(({ property }) => property).filter(Boolean)),
  ])
}

function startsOn(locator: Locator, orAncestors: boolean) {
  return locator.evaluate(
    (element, orAncestors) =>
      (window as unknown as { __animationStarts: Start[] }).__animationStarts
        .filter(({ target }) => target === element || (orAncestors && target.contains(element)))
        .map(({ duration, delay, byScroll, property }) => ({
          duration,
          delay,
          byScroll,
          property,
        })),
    orAncestors,
  )
}
