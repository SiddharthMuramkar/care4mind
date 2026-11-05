import type { Page } from '@playwright/test'

/**
 * Keep every animation that scripts start on the page, so a test can replay it
 * afterwards. Call before loading the page.
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
