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
