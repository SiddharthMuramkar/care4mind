import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Point at a link and wait until its page is prefetched, as a visitor's
 * reading time allows. A link pressed while its page is still being fetched
 * loses its transition types (seen with Next.js 16.4), and the page changes
 * at once instead of turning.
 */
export async function prefetched(link: Locator) {
  const page = link.page()
  const path = new URL((await link.getAttribute('href')) ?? '', page.url()).pathname
  await link.hover()
  const fetches = () =>
    page.evaluate(
      (path) =>
        performance.getEntriesByType('resource').filter(({ name }) => {
          const url = new URL(name)
          return url.pathname === path && url.searchParams.has('_rsc')
        }).length,
      path,
    )
  // Done once at least one fetch has finished and no more arrive.
  let seen = -1
  await expect
    .poll(async () => {
      const count = await fetches()
      const settled = count > 0 && count === seen
      seen = count
      return settled
    })
    .toBe(true)
}

/** How a snapshot of a page moves during a view transition, sampled half-way through. */
export interface Movement {
  /** Horizontal offset half-way, in px: negative is to the left. */
  x: number
  opacity: number
  /** The properties its animations change. */
  properties: string[]
  /** How long it moves for, in ms. */
  duration: number
}

/** A shared element flying from one place to another: where it is at the start, half-way and the end. */
export interface Flight {
  name: string
  y: [number, number, number]
}

export interface PageTurn {
  /** The page's path before and after. */
  from: string
  to: string
  /** The main content being left, and the main content arriving; null when it doesn't move. */
  leaving: Movement | null
  arriving: Movement | null
  flights: Flight[]
  sampled: boolean
}

/**
 * Note every view transition the page starts and how its snapshots move.
 * With `hold`, each one is paused half-way until releasePageTurn is called.
 */
export function recordPageTurns(page: Page, { hold = false } = {}) {
  return page.addInitScript((hold) => {
    const turns: PageTurn[] = []
    Object.defineProperty(window, '__pageTurns', { value: turns })
    const held: Animation[] = []
    Object.defineProperty(window, '__releasePageTurn', {
      value: async () => {
        const released = held.splice(0)
        released.forEach((animation) => animation.play())
        await Promise.all(released.map((animation) => animation.finished.catch(() => {})))
        // The transition's layer comes down on the next frame.
        await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
      },
    })
    const start = Document.prototype.startViewTransition
    if (!start) return
    // React names a page's <main> while it takes part in a transition.
    const mainName = () => document.querySelector('main')?.style.viewTransitionName || null

    // Every animation on one snapshot, set to the same point (0 to 1 of each), then put back.
    const at = <T>(animations: Animation[], fraction: number, read: () => T): T => {
      const times = animations.map((animation) => animation.currentTime)
      for (const animation of animations) {
        const duration = Number(animation.effect?.getComputedTiming().duration) || 0
        animation.currentTime = duration * fraction
      }
      const value = read()
      animations.forEach((animation, index) => (animation.currentTime = times[index] ?? null))
      return value
    }
    const style = (pseudo: string) => getComputedStyle(document.documentElement, pseudo)
    const matrix = (pseudo: string) => {
      const transform = style(pseudo).transform
      return new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
    }

    Document.prototype.startViewTransition = function (this: Document, init) {
      const options: StartViewTransitionOptions =
        typeof init === 'function' ? { update: init } : { ...init }
      const turn: PageTurn = {
        from: location.pathname,
        to: location.pathname,
        leaving: null,
        arriving: null,
        flights: [],
        sampled: false,
      }
      turns.push(turn)
      // The old page has been captured by the time the update starts, and is gone after it.
      let leaving: string | null = null
      let arriving: string | null = null
      const update = options.update
      options.update = () => {
        leaving = mainName()
        return Promise.resolve(update?.()).then(() => {
          arriving = mainName()
        })
      }
      const transition = start.call(this, options)
      transition.ready
        .then(() => {
          turn.to = location.pathname
          const animations = document
            .getAnimations()
            .filter((animation) =>
              (animation.effect as KeyframeEffect | null)?.pseudoElement?.startsWith(
                '::view-transition',
              ),
            )
          const on = (pseudo: string) =>
            animations.filter(
              (animation) => (animation.effect as KeyframeEffect).pseudoElement === pseudo,
            )
          const movement = (pseudo: string): Movement | null => {
            const moving = on(pseudo)
            if (moving.length === 0) return null
            return at(moving, 0.5, () => ({
              x: matrix(pseudo).m41,
              opacity: parseFloat(style(pseudo).opacity),
              properties: [
                ...new Set(
                  moving.flatMap((animation) =>
                    (animation.effect as KeyframeEffect)
                      .getKeyframes()
                      .flatMap((keyframe) =>
                        Object.keys(keyframe).filter(
                          (key) =>
                            !['offset', 'computedOffset', 'easing', 'composite'].includes(key),
                        ),
                      ),
                  ),
                ),
              ].sort(),
              duration: Math.max(
                ...moving.map(
                  (animation) => Number(animation.effect?.getComputedTiming().endTime) || 0,
                ),
              ),
            }))
          }
          if (leaving) turn.leaving = movement(`::view-transition-old(${leaving})`)
          if (arriving) turn.arriving = movement(`::view-transition-new(${arriving})`)
          for (const animation of animations) {
            const pseudo = (animation.effect as KeyframeEffect).pseudoElement ?? ''
            const name = /^::view-transition-group\((.+)\)$/.exec(pseudo)?.[1]
            if (!name || name === leaving || name === arriving) continue
            const group = on(pseudo)
            const [start, midway, end] = [0, 0.5, 1].map((fraction) =>
              at(group, fraction, () => matrix(pseudo)),
            ) as [DOMMatrixReadOnly, DOMMatrixReadOnly, DOMMatrixReadOnly]
            // React also holds the page's root still with an animation; only groups that move fly.
            if (start.m41 === end.m41 && start.m42 === end.m42) continue
            turn.flights.push({ name, y: [start.m42, midway.m42, end.m42] })
          }
          turn.sampled = true
          if (hold) {
            for (const animation of animations) {
              const duration = Number(animation.effect?.getComputedTiming().duration) || 0
              animation.currentTime = duration / 2
              animation.pause()
              held.push(animation)
            }
          }
        })
        .catch(() => {})
      return transition
    }
  }, hold)
}

/** The view transitions that changed page, once each has been sampled. */
export async function pageTurns(page: Page): Promise<PageTurn[]> {
  const read = () =>
    page.evaluate(() => (window as unknown as { __pageTurns: PageTurn[] }).__pageTurns)
  await expect.poll(async () => (await read()).every((turn) => turn.sampled)).toBe(true)
  return (await read()).filter((turn) => turn.from !== turn.to)
}

/** Let a held page turn finish, and wait until it has. */
export const releasePageTurn = (page: Page) =>
  page.evaluate(() =>
    (window as unknown as { __releasePageTurn: () => Promise<void> }).__releasePageTurn(),
  )

/**
 * The page turned: the page being left slid away and faded as the new one slid
 * in and came up, in about 300 ms, by transform and opacity alone. Forward,
 * the old page goes left and the new one comes from the right; back, the reverse.
 */
export function expectPageTurned(turn: PageTurn | undefined, direction: 'forward' | 'back') {
  const away = direction === 'forward' ? -1 : 1
  const { leaving, arriving } = turn ?? {}
  expect(leaving, 'the page being left moves').not.toBeNull()
  expect(arriving, 'the page arriving moves').not.toBeNull()
  for (const [movement, side] of [
    [leaving, away],
    [arriving, -away],
  ] as const) {
    expect(Math.sign(movement?.x ?? 0), `${direction}: which way it moves`).toBe(side)
    expect(movement?.opacity).toBeGreaterThan(0)
    expect(movement?.opacity).toBeLessThan(1)
    expect(movement?.properties).toEqual(['opacity', 'transform'])
    expect(movement?.duration).toBeGreaterThanOrEqual(250)
    expect(movement?.duration).toBeLessThanOrEqual(400)
  }
}
