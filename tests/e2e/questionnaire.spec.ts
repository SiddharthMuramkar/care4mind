import { expect, test } from '@playwright/test'

test.describe('Questionnaire page (FR-05)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/questionnaires/karmayoga-scale')
  })

  test('sets out purpose and limitations before the start control', async ({ page }) => {
    const purpose = page.getByRole('heading', { name: 'What it is for' })
    const limits = page.getByRole('heading', { name: 'Before you start: its limits' })
    const start = page.getByRole('button', { name: 'Start the Questionnaire' })
    await expect(purpose).toBeVisible()
    await expect(limits).toBeVisible()
    const top = async (locator: typeof start) => (await locator.boundingBox())?.y ?? Infinity
    expect(await top(purpose)).toBeLessThan(await top(start))
    expect(await top(limits)).toBeLessThan(await top(start))
  })

  test('marks the limitations as a draft for the Psychology expert', async ({ page }) => {
    await expect(page.getByText(/Psychology expert has not reviewed/)).toBeVisible()
  })

  test('cannot start yet, says so, and asks no questions', async ({ page }) => {
    const start = page.getByRole('button', { name: 'Start the Questionnaire' })
    await expect(start).toBeDisabled()
    await expect(page.getByText('Coming soon.')).toBeVisible()
    await expect(page.locator('main').locator('input, select, textarea, form')).toHaveCount(0)
  })
})
