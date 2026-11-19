import type { Locator, Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'

// Red means a link to follow or "you are here", and large numerals keep it as an accent. Titles,
// labels and the marks between crumbs are ink: a page of red reads as a wall of it, and as an error.

/** A colour token as the browser sets text in it, read off a probe so it compares with a computed colour. */
const inked = (page: Page, token: string) =>
  page.evaluate((token) => {
    const probe = document.createElement('i')
    probe.style.color = `var(${token})`
    document.body.append(probe)
    const colour = getComputedStyle(probe).color
    probe.remove()
    return colour
  }, token)

const colourOf = (element: Locator, pseudo?: '::before') =>
  element.evaluate((node, pseudo) => getComputedStyle(node, pseudo ?? null).color, pseudo)

test.describe('red is kept for links and “you are here”', () => {
  test(
    'a section’s role, above its heading, is muted ink',
    { tag: '@one-width' },
    async ({ page }) => {
      await gotoReady(page, '/concepts/vikshepa/')
      const role = page.getByRole('main').getByText('Comparison', { exact: true }).first()
      expect(await colourOf(role)).toBe(await inked(page, '--color-surface-muted'))
    },
  )

  test('References’ letter headings are ink', { tag: '@one-width' }, async ({ page }) => {
    await gotoReady(page, '/library/references/')
    const letter = page.getByRole('main').getByRole('heading', { name: 'A', exact: true })
    expect(await colourOf(letter)).toBe(await inked(page, '--color-surface-ink'))
  })

  // A phone shows one crumb with an arrow before it; a wider screen a trail with a dot between crumbs.
  test('the mark before a crumb is muted ink', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem')
    const muted = await inked(page, '--color-ink-muted')
    for (const crumb of await crumbs.all()) {
      if (!(await crumb.isVisible())) continue
      const mark = await crumb.evaluate((node) => getComputedStyle(node, '::before').content)
      if (mark === 'none' || mark === 'normal') continue
      expect(await colourOf(crumb, '::before')).toBe(muted)
    }
  })
})
