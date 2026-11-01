import { hrefFor } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'

// The proposals page (front-end-site ticket 12): what the design suggests beyond the brief, for
// the Project owner's sign-off. Local runs and CI build with both proposal flags on (D20), so
// the three built proposals are listed, with audio pronunciation, described only, and nothing else.

const PATH = hrefFor({ page: 'proposals' })
const ENTRIES = [
  'Concept map',
  'Devanagari first, on every page',
  'Start here',
  'Audio pronunciation',
]

test.describe('the proposals page', () => {
  test('lists the four proposals and no others, each with its status, gains, costs and switch', async ({
    page,
  }) => {
    await gotoReady(page, PATH)
    const entries = page.getByRole('main').getByRole('article').getByRole('article')
    await expect(entries.getByRole('heading', { level: 2 })).toHaveText(ENTRIES)
    await expect(
      entries.getByRole('paragraph').filter({ hasText: /^(Built|Described, not built)$/ }),
    ).toHaveText(['Built', 'Built', 'Built', 'Described, not built'])
    for (const entry of await entries.all())
      await expect(entry.getByRole('term')).toHaveText([
        'What it adds',
        'What it costs',
        'How it is switched off',
      ])
    await expect(page.getByRole('main')).not.toContainText(/reading path/i)
  })

  test('sets each setting as code inside its sentence, not on a line of its own', async ({
    page,
  }) => {
    await gotoReady(page, PATH)
    const answers = page
      .getByRole('main')
      .getByRole('definition')
      .filter({ has: page.getByRole('code') })
    await expect(answers.getByRole('code')).toHaveText([
      'FEATURE_CONCEPT_MAP=0',
      'FEATURE_DEVANAGARI_FIRST=0',
      'FEATURE_START_HERE=0',
    ])
    for (const answer of await answers.all()) {
      await expect(answer).toContainText(/One setting, FEATURE_\w+=0, with no code change/)
      // The comma after the setting sits on the line where the setting ends.
      const sameLine = await answer.getByRole('code').evaluate((code) => {
        const end = [...code.getClientRects()].at(-1)
        const next = code.nextSibling
        if (!end || !next) return false
        const comma = document.createRange()
        comma.setStart(next, 0)
        comma.setEnd(next, 1)
        const { top, bottom } = comma.getBoundingClientRect()
        return top < end.bottom && bottom > end.top
      })
      expect(sameLine).toBe(true)
    }
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

// Start here: a proposal page for a first-time reader, linked from the header and the Menu.
// CI builds with every flag on; the flag-off case (no route, no link) is held by the unit tests.
const START = hrefFor({ page: 'start' })

test.describe('Start here', () => {
  test('the header links to it, and it explains the site, the sounds and where to begin', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await gotoReady(page, '/')
    const link = page.getByRole('banner').getByRole('link', { name: 'Start here' })
    await expect(link).toHaveAttribute('href', START)
    await gotoReady(page, START)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Start here')
    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { level: 2 })).toHaveText([
      'What Indian psychology is',
      'How the site is organised',
      'How to read Sanskrit names',
      'Three first reads',
      'If you need help',
    ])
    for (const slug of ['vikshepa', 'chittabhumi', 'sthitaprajna'])
      await expect(main.locator(`a[href="/concepts/${slug}/"]`)).toHaveCount(1)
    await expect(main).toContainText('not treatment')
    await expect(main.locator('[data-help-line] a[href="tel:14416"]')).toHaveCount(1)
  })

  test('on a phone the Menu links to it', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await gotoReady(page, '/')
    await page.getByRole('banner').getByRole('button', { name: 'Menu', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Menu' })
    await expect(drawer.getByRole('link', { name: 'Start here' })).toHaveAttribute('href', START)
  })

  test('passes axe', async ({ page }) => {
    await gotoReady(page, START)
    await expectNoAxeViolations(page)
  })
})
