import type { Page } from '@playwright/test'

import { expect } from './fixtures'

/** From 48rem (768 px) a page shows its whole trail; on a phone, one link back to the page above. */
const WHOLE_TRAIL = 768

/** A page's Breadcrumb landmark. */
export const breadcrumb = (page: Page) =>
  page.getByRole('navigation', { name: 'Breadcrumb', exact: true })

/**
 * Check a page's trail, its labels from the first crumb to the page itself. From 48rem every
 * crumb shows; on a phone only the link back to the page above, on one line. Either way the
 * page itself is the trail's current crumb.
 */
export async function expectTrail(page: Page, trail: readonly string[], where?: string) {
  const nav = breadcrumb(page)
  const shown = nav.getByRole('listitem')
  if ((page.viewportSize()?.width ?? 0) >= WHOLE_TRAIL) {
    await expect(shown, where).toHaveText([...trail])
  } else {
    await expect(shown, where).toHaveText([trail.at(-2) ?? ''])
    await expect(nav.getByRole('link'), where).toHaveCount(1)
    // One line: no taller than its link's own 44 px target by more than a breath.
    expect((await nav.boundingBox())?.height ?? 0, where).toBeLessThanOrEqual(50)
  }
  await expect(nav.locator('[aria-current="page"]'), where).toHaveText(trail.at(-1) ?? '')
}
