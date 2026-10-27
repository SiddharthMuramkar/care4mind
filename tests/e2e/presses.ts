import type { Locator, Page } from '@playwright/test'

interface Spread {
  target: Element
  /** Where the ink's circle is centred, as the browser computes it: "14px 9px", or "50% 50%". */
  from: string
  /** Whether the circle is bigger half-way through than at the start. */
  grew: boolean
}

/** Note every ink spread that starts on the page: a circle of ink growing over a control. */
export function recordInkSpreads(page: Page) {
  return page.addInitScript(() => {
    const spreads: Spread[] = []
    Object.defineProperty(window, '__inkSpreads', { value: spreads })
    const circle = (target: Element, pseudo: string) =>
      /^circle\((\S+) at (.+)\)$/.exec(getComputedStyle(target, pseudo || null).clipPath)
    const radius = (match: RegExpExecArray | null) => parseFloat(match?.[1] ?? '0')
    document.addEventListener(
      'animationstart',
      (event) => {
        const target = event.target as Element
        const animation = target
          .getAnimations({ subtree: true })
          .find(
            (candidate) =>
              (candidate as CSSAnimation).animationName === event.animationName &&
              ((candidate.effect as KeyframeEffect | null)?.pseudoElement ?? '') ===
                event.pseudoElement,
          )
        if (!animation) return
        // Look at the circle at the start and half-way, whenever this runs, then put the animation back.
        const at = (fraction: number) => {
          const time = animation.currentTime
          const duration = Number(animation.effect?.getComputedTiming().duration) || 0
          animation.currentTime = duration * fraction
          const match = circle(target, event.pseudoElement)
          animation.currentTime = time
          return match
        }
        const start = at(0)
        if (!start) return
        spreads.push({ target, from: start[2] ?? '', grew: radius(at(0.5)) > radius(start) })
      },
      true,
    )
  })
}

/** The ink spreads that have started on this control. Call recordInkSpreads before loading the page. */
export function inkSpreadsOn(control: Locator) {
  return control.evaluate((element) =>
    (window as unknown as { __inkSpreads: Spread[] }).__inkSpreads
      .filter(({ target }) => target === element)
      .map(({ from, grew }) => ({ from, grew })),
  )
}

/** A spread's centre in px, from its "14px 9px" form. */
export const centre = (from: string) => from.split(' ').map(parseFloat)
