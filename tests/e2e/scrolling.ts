import { expect, type Locator, type Page } from '@playwright/test'

/** Scroll at once so that the element's top sits this far down the screen (0 is the top, 1 the bottom). */
export function placeOnScreen(element: Locator, fraction: number) {
  return element.evaluate(async (node, fraction) => {
    const top = node.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top - window.innerHeight * fraction, behavior: 'instant' })
    // Scroll-driven animations catch up on the next frame; until then they read as before.
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
  }, fraction)
}

/**
 * Do something (and wait for where it should lead), then list every scroll
 * position the page passed through, frame by frame, until it came to rest.
 * A jump passes through two; a glide, many.
 */
export async function scrollPath(page: Page, act: () => Promise<unknown>) {
  await page.evaluate(() => {
    const path = [window.scrollY]
    Object.defineProperty(window, '__scrollPath', { value: path, configurable: true })
    const watch = () => {
      if (path.at(-1) !== window.scrollY) path.push(window.scrollY)
      requestAnimationFrame(watch)
    }
    requestAnimationFrame(watch)
  })
  await act()
  const at = () => page.evaluate(() => window.scrollY)
  await expect
    .poll(async () => {
      const before = await at()
      await page.waitForTimeout(150)
      return (await at()) === before
    })
    .toBe(true)
  return page.evaluate(() => (window as unknown as { __scrollPath: number[] }).__scrollPath)
}
