import { expect, type Locator, type Page } from '@playwright/test'

/** The homepage's opening folio: the paper page the verse is printed on. */
export const openingFolio = (page: Page) => page.getByRole('heading', { level: 1 }).locator('..')

/** The kolam round the opening folio: the one drawing that reaches past its top and both sides. */
export async function frameKolam(page: Page): Promise<Locator> {
  const folio = await openingFolio(page).boundingBox()
  if (!folio) throw new Error('the opening folio is not on screen')
  const frames: Locator[] = []
  for (const drawing of await page.getByRole('main').locator('svg').all()) {
    const box = await drawing.boundingBox()
    if (box && box.y < folio.y && box.x < folio.x && box.x + box.width > folio.x + folio.width) {
      frames.push(drawing)
    }
  }
  expect(frames, 'one drawing frames the opening folio').toHaveLength(1)
  return frames[0] as Locator
}

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

/** Whether an animation is drawing this line right now. */
export const isDrawing = (line: Locator) =>
  line.evaluate((element) =>
    element.getAnimations().some((animation) => animation.playState === 'running'),
  )

/** How much of a line is still to draw: 0 when it is complete, 1 before it starts. */
export const undrawn = (line: Locator) =>
  line.evaluate((element) => parseFloat(getComputedStyle(element).strokeDashoffset))

interface Start {
  target: Element
  /** How long it runs, in ms. Scroll-driven animations have no duration in time. */
  duration: number | null
  byScroll: boolean
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
      const duration = animation?.effect?.getComputedTiming().duration
      starts.push({
        target,
        duration: typeof duration === 'number' ? duration : null,
        byScroll: Boolean(animation && !(animation.timeline instanceof DocumentTimeline)),
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
  return locator.evaluate(
    (element, orAncestors) =>
      (window as unknown as { __animationStarts: Start[] }).__animationStarts
        .filter(({ target }) => target === element || (orAncestors && target.contains(element)))
        .map(({ duration, byScroll }) => ({ duration, byScroll })),
    orAncestors,
  )
}
