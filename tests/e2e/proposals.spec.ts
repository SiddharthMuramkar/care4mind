import { hrefFor } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'

// The proposals page (front-end-site ticket 12): what the design suggests beyond the brief, for
// the Project owner's sign-off. Local runs and CI build with both proposal flags on (D20), so
// both built proposals are listed, with audio pronunciation, described only, and nothing else.

const PATH = hrefFor({ page: 'proposals' })
const ENTRIES = ['Concept map', 'Devanagari first, on every page', 'Audio pronunciation']

test.describe('the proposals page', () => {
  test('lists the three proposals and no others, each with its status, gains, costs and switch', async ({
    page,
  }) => {
    await gotoReady(page, PATH)
    const entries = page.getByRole('main').getByRole('article').getByRole('article')
    await expect(entries.getByRole('heading', { level: 2 })).toHaveText(ENTRIES)
    await expect(
      entries.getByRole('paragraph').filter({ hasText: /^(Built|Described, not built)$/ }),
    ).toHaveText(['Built', 'Built', 'Described, not built'])
    for (const entry of await entries.all())
      await expect(entry.getByRole('term')).toHaveText([
        'What it adds',
        'What it costs',
        'How it is switched off',
      ])
    await expect(page.getByRole('main')).not.toContainText(/reading path/i)
  })

  test('is labelled a proposal by its heading, under Home › Proposals', async ({ page }) => {
    await gotoReady(page, PATH)
    const header = page.getByRole('main').locator('header').first()
    await expect(header).toContainText('Proposal')
    await expect(header).toContainText('Each awaits the Project owner’s decision')
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem')
    await expect(crumbs).toHaveText(['Home', 'Proposals'])
  })

  test('leads to the Concept map with a forward page turn, and to the A–Z to try Devanagari first', async ({
    page,
  }) => {
    await recordPageTurns(page)
    await gotoReady(page, PATH)
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Concepts A–Z' }),
    ).toHaveAttribute('href', hrefFor({ page: 'concepts' }))
    const open = page.getByRole('link', { name: 'Open the Concept map' })
    await prefetched(open)
    await open.click()
    await expect(page).toHaveURL(new RegExp(`${hrefFor({ page: 'concept-map' })}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Concept map')
    const [turn] = await pageTurns(page)
    expectPageTurned(turn, 'forward')
  })

  test('passes axe', async ({ page }) => {
    await gotoReady(page, PATH)
    await expectNoAxeViolations(page)
  })
})
