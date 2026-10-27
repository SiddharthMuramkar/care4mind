import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './axe'

test.describe('Concept page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/concepts/vikshepa')
  })

  test('names the term in IAST and Devanagari, each with its language tag', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toHaveAccessibleName('Vikṣepa विक्षेप')
    await expect(heading.locator('[lang="sa-Latn"]')).toHaveText('Vikṣepa')
    await expect(heading.locator('[lang="sa-Deva"]')).toHaveText('विक्षेप')
    expect(await page.locator('main [lang="sa-Deva"]').count()).toBeGreaterThan(5)
  })

  test('shows the other spellings in a popover that keyboard users can close', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Also spelled' })
    await trigger.click()
    const popup = page.getByRole('dialog')
    await expect(popup).toContainText('viksepa')
    await expect(popup).toContainText('Vikshepa')
    await expectNoAxeViolations(page)
    await page.keyboard.press('Escape')
    await expect(popup).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('folds the References away and opens them on request (FR-03)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /References/ })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const entries = page.locator('[id^="ref-"]')
    await expect(entries).toHaveCount(10)
    await expect(
      page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' }),
    ).toHaveAttribute('href', 'https://doi.org/10.3389/fpsyg.2025.1554014')
    await expectNoAxeViolations(page)
  })

  test('reaches its related Questionnaire in one click (FR-01)', async ({ page }) => {
    await page.getByRole('link', { name: 'KarmaYoga Scale' }).click()
    await expect(page).toHaveURL('/questionnaires/karmayoga-scale')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')
  })

  test('keeps the wide comparison table scrollable in its own frame', async ({ page }) => {
    const frame = page.getByRole('region', { name: /Comparison between Indian and Western/ })
    await expect(frame).toBeVisible()
    await expect(frame).toHaveAttribute('tabindex', '0')
    await expect(frame.getByRole('row')).toHaveCount(10)
  })
})

test('the homepage card opens the Concept page', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('link', { name: 'Read about Vikṣepa' }).click()
  await expect(page).toHaveURL('/concepts/vikshepa')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
  expect(errors).toEqual([])
})
