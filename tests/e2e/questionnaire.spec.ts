import { expect, gotoReady, test } from './fixtures'
import { pageTurns, prefetched, recordPageTurns } from './page-turns'

// Local runs and CI build with the preview flag on (D16), so the KarmaYoga Scale's Start opens
// its flow. Where the flag is off, Start stays disabled and says "Coming soon"; front-end-site
// ticket 15's flags-off build checks that side.
test.describe('Questionnaire page (FR-05)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/questionnaires/karmayoga-scale/')
  })

  test('sets out purpose and limitations before the start control', async ({ page }) => {
    const purpose = page.getByRole('heading', { name: 'What it is for' })
    const limits = page.getByRole('heading', { name: 'Before you start: its limits' })
    const start = page.getByRole('link', { name: 'Start the Questionnaire' })
    await expect(purpose).toBeVisible()
    await expect(limits).toBeVisible()
    const top = async (locator: typeof start) => (await locator.boundingBox())?.y ?? Infinity
    expect(await top(purpose)).toBeLessThan(await top(start))
    expect(await top(limits)).toBeLessThan(await top(start))
  })

  test('marks the limitations as a draft for the Psychology expert', async ({ page }) => {
    await expect(page.getByText(/Psychology expert has not reviewed/)).toBeVisible()
  })

  test('says it is a preview, starts its flow, and asks no questions itself', async ({ page }) => {
    await expect(page.getByText('Preview', { exact: true })).toBeVisible()
    await expect(page.getByText(/^Your answers aren[’']t scored yet\.$/)).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Start the Questionnaire' }),
    ).toHaveAccessibleDescription(/^Your answers aren[’']t scored yet\./)
    await expect(page.getByRole('link', { name: 'Start the Questionnaire' })).toHaveAttribute(
      'href',
      '/questionnaires/karmayoga-scale/take/',
    )
    await expect(page.locator('main').locator('input, select, textarea, form')).toHaveCount(0)
  })
})

// Front-end-site ticket 10 builds the flow itself (questionnaire-flow.spec.ts): its page now asks
// the questions, so the old check that it held none is gone, and these cover the index (D16).
test.describe('Questionnaires page (D16)', () => {
  /** The 16 description pages' Questionnaires and the Dosha Survey, at their anchors. */
  const LATER = [
    'ahimsa',
    'asteya',
    'atma-bandhu',
    'brahma-vihara',
    'brahmacharya',
    'chittabhumi',
    'dosha-survey',
    'five-steps-of-perfection',
    'karta',
    'momentum-of-spiritual-practice',
    'panch-klesha',
    'satya',
    'spiritual-practitioner',
    'sthitaprajna',
    'triguna',
    'upa-vikshepa',
    'vikshepa',
  ]

  test('features the KarmaYoga Scale first, as a preview', async ({ page }) => {
    await page.goto('/questionnaires/')
    const first = page.locator('main article article').first()
    await expect(first.getByRole('heading', { level: 3 })).toHaveText('KarmaYoga Scale')
    await expect(first.getByText('Preview', { exact: true })).toBeVisible()
  })

  test('groups the 17 coming later by topic, each with its anchor, title, status and Concept', async ({
    page,
  }) => {
    await page.goto('/questionnaires/')
    const later = page.getByRole('region', { name: 'Coming later' })
    expect(await later.getByRole('heading', { level: 3 }).count()).toBeGreaterThan(1)
    const slips = later.locator('li[id]')
    expect((await slips.evaluateAll((items) => items.map(({ id }) => id))).sort()).toEqual(LATER)
    for (const slip of await slips.all()) {
      await expect(slip.getByRole('heading', { level: 4 })).toHaveText(/\S/)
      await expect(slip.getByText('Coming later', { exact: true })).toBeVisible()
      await expect(slip.getByRole('link').first()).toHaveAttribute(
        'href',
        /^\/concepts\/[a-z-]+\/$/,
      )
    }
    await expect(page.locator('#dosha-survey').getByRole('heading', { level: 4 })).toBeVisible()
  })

  test('marks the slip an old address leads to', async ({ page }) => {
    await page.goto('/questionnaires/#dosha-survey')
    await expect(page.locator('#dosha-survey')).toBeInViewport()
  })

  test('the KarmaYoga card flies into its page’s title', async ({ page }) => {
    await recordPageTurns(page)
    await gotoReady(page, '/questionnaires/')
    const card = page.getByRole('link', { name: 'About the KarmaYoga Scale' })
    await prefetched(card)
    await card.click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')
    const [turn] = await pageTurns(page)
    expect(turn?.flights.map(({ name }) => name)).toContain('questionnaire-title-karmayoga-scale')
  })
})
