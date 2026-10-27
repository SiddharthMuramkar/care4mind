import type { Locator, Page } from '@playwright/test'

/** Scroll down by `distance` at once, then say how far up the screen each element went. */
export async function travel(page: Page, distance: number, ...elements: Locator[]) {
  const tops = () =>
    Promise.all(elements.map(async (element) => (await element.boundingBox())?.y ?? NaN))
  const before = await tops()
  await page.evaluate((top) => window.scrollBy({ top, behavior: 'instant' }), distance)
  // Scroll-driven animations catch up on the next frame.
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )
  const after = await tops()
  return before.map((top, index) => top - (after[index] ?? NaN))
}

/** Scroll at once so that the element's top sits this far down the screen (0 is the top, 1 the bottom). */
export function placeOnScreen(element: Locator, fraction: number) {
  return element.evaluate((node, fraction) => {
    const top = node.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top - window.innerHeight * fraction, behavior: 'instant' })
  }, fraction)
}
