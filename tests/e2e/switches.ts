import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Keep every animation that scripts start on the page (Motion runs its knob
 * spring as one), so a test can replay it afterwards. Call before loading the page.
 */
export function recordScriptedAnimations(page: Page) {
  return page.addInitScript(() => {
    const started: Animation[] = []
    Object.defineProperty(window, '__scriptedAnimations', { value: started })
    const animate = Element.prototype.animate
    Element.prototype.animate = function (this: Element, ...args: Parameters<Element['animate']>) {
      const animation = animate.apply(this, args)
      started.push(animation)
      return animation
    }
  })
}

/**
 * Press a switch, wait until it is still, and trace how far across the switch
 * each of its parts sat: before the press, then at sixty even steps through
 * any animation that moved it. Returns the trace of the part that travelled
 * furthest: the knob. Replaying the animations, rather than watching frames,
 * catches every turn of the path however busy the machine is. Call
 * recordScriptedAnimations before loading the page.
 */
export async function knobPath(control: Locator, press: () => Promise<void>): Promise<number[]> {
  const where = () =>
    control.evaluate((button) =>
      [...button.querySelectorAll('*')].map(
        (part) => part.getBoundingClientRect().left - button.getBoundingClientRect().left,
      ),
    )
  const before = await where()
  const earlier = await control.evaluate(
    () => (window as unknown as { __scriptedAnimations: Animation[] }).__scriptedAnimations.length,
  )
  await press()
  await expect
    .poll(async () => {
      const at = await where()
      await control.page().waitForTimeout(300)
      return JSON.stringify(await where()) === JSON.stringify(at)
    })
    .toBe(true)
  return control.evaluate(
    (button, { before, earlier }) => {
      const started = (
        window as unknown as { __scriptedAnimations: Animation[] }
      ).__scriptedAnimations.slice(earlier)
      const parts = [...button.querySelectorAll('*')]
      const x = (part: Element) =>
        part.getBoundingClientRect().left - button.getBoundingClientRect().left
      const paths = parts.map((part, index) => {
        const path = [before[index] ?? NaN]
        const moves = started.filter(
          (animation) => (animation.effect as KeyframeEffect | null)?.target === part,
        )
        const end = Math.max(
          0,
          ...moves.map((move) => Number(move.effect?.getComputedTiming().endTime)),
        )
        if (end > 0) {
          const states = moves.map((move) => move.playState)
          moves.forEach((move) => move.pause())
          for (let step = 0; step <= 60; step++) {
            moves.forEach((move) => (move.currentTime = (end * step) / 60))
            path.push(x(part))
          }
          moves.forEach((move, index) => (states[index] === 'idle' ? move.cancel() : move.finish()))
        }
        path.push(x(part))
        return path.filter((value, index) => index === 0 || value !== path[index - 1])
      })
      const travel = (path: number[]) => Math.max(...path) - Math.min(...path)
      return paths.reduce(
        (furthest, path) => (travel(path) > travel(furthest) ? path : furthest),
        [],
      )
    },
    { before, earlier },
  )
}
