import { expect, test } from './fixtures'

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
    await expect(page.getByRole('link', { name: 'Start the Questionnaire' })).toHaveAttribute(
      'href',
      '/questionnaires/karmayoga-scale/take/',
    )
    await expect(page.locator('main').locator('input, select, textarea, form')).toHaveCount(0)
  })
})

test('the flow names its Questionnaire and leads back to its purpose and limits', async ({
  page,
}) => {
  const response = await page.goto('/questionnaires/karmayoga-scale/take/')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')
  await expect(page.locator('main').locator('input, select, textarea, form')).toHaveCount(0)
  await page.getByRole('link', { name: /^Back to what the KarmaYoga Scale is for/ }).click()
  await expect(page).toHaveURL('/questionnaires/karmayoga-scale/')
})
