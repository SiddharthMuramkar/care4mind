import { expect, type Page, test } from '@playwright/test'

// Every spec takes test and expect from here, so a fixture added here reaches them all.
export { expect, test }

/**
 * How widely the specs that loop over routes test (E2E_SCOPE): every route,
 * `full` (the default), or one route of each kind, `sample`.
 */
export function e2eScope(): 'sample' | 'full' {
  const scope = process.env.E2E_SCOPE || 'full'
  if (scope === 'sample' || scope === 'full') return scope
  throw new Error(`E2E_SCOPE must be “sample” or “full”, not “${scope}”.`)
}

/** The entries a looping spec visits: all of them, or with E2E_SCOPE=sample only those marked `sample`. */
export function inScope<Entry extends { sample?: boolean }>(entries: readonly Entry[]) {
  return e2eScope() === 'sample' ? entries.filter((entry) => entry.sample) : entries
}

/**
 * What makes the page scroll sideways (FR-06, WCAG 1.4.10): nothing when it fits the screen;
 * otherwise how far it scrolls, then the outermost elements reaching past the screen's right
 * edge, so a failure names them. Check it with `toEqual([])`.
 */
export function scrollsSideways(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const root = document.documentElement
    const edge = root.clientWidth
    const overflow = root.scrollWidth - edge
    if (overflow <= 0) return []
    const past = (element: Element) => element.getBoundingClientRect().right > edge + 0.5
    const name = (element: Element) => {
      const id = element.id ? `#${element.id}` : ''
      const kind = element.classList[0] ? `.${element.classList[0]}` : ''
      const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)
      return `<${element.localName}${id}${kind}>${text ? ` “${text}”` : ''}`
    }
    // The outermost: its container fits and lets it show, rather than clipping or scrolling it.
    const culprits = [...document.body.querySelectorAll('*')].filter((element) => {
      const parent = element.parentElement
      if (!past(element) || !parent) return false
      return (
        parent === document.body ||
        (!past(parent) && getComputedStyle(parent).overflowX === 'visible')
      )
    })
    return [`scrolls ${overflow} px sideways`, ...culprits.slice(0, 5).map(name)]
  })
}

/**
 * Open a page and wait until React has hydrated it, so nothing the test then
 * clicks, types or presses lands before the page's handlers are attached. The
 * layout's HydrationMarker sets html[data-hydrated] at that moment; the server
 * never sends it. With JavaScript off there is nothing to wait for: use page.goto.
 */
export async function gotoReady(page: Page, path: string, options?: Parameters<Page['goto']>[1]) {
  const response = await page.goto(path, options)
  // Generous: under load, starting React can take seconds.
  await expect(page.locator('html'), 'React has hydrated the page').toHaveAttribute(
    'data-hydrated',
    { timeout: 15_000 },
  )
  return response
}
