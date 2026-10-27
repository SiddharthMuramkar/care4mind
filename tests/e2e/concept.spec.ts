import { expect, type Locator, test } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { recordAnimationStarts, transitionedOn } from './drawings'

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

/** How far a drawing is turned, in degrees, as it is drawn on screen. */
const turned = (drawing: Locator) =>
  drawing.evaluate((element) => {
    const { transform } = getComputedStyle(element)
    const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
    return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)
  })

test('the References control wears a kolam knot that turns as the list opens, and back', async ({
  page,
}) => {
  await recordAnimationStarts(page)
  await page.goto('/concepts/vikshepa')
  const trigger = page.getByRole('button', { name: /References/ })
  const knot = trigger.locator('svg')
  // A 1×1 kolam: one unbroken line looped round one dot, silent to assistive technology.
  await expect(knot).toHaveAttribute('aria-hidden', 'true')
  await expect(knot.locator('path')).toHaveCount(1)
  await expect(knot.locator('circle')).toHaveCount(1)
  expect(await turned(knot)).toBe(0)
  const dot = knot.locator('circle')
  const closedDot = (await dot.boundingBox())?.width ?? NaN

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect.poll(() => turned(knot)).toBe(45)
  expect(await transitionedOn(knot), 'it turns by transform').toEqual(['transform'])
  // A near-round knot looks much the same turned, so its dot swells too: the open state shows at a
  // glance. Turning alone widens the dot's box by √2; swelling widens it well past that.
  await expect.poll(async () => (await dot.boundingBox())?.width).toBeGreaterThan(closedDot * 2)
  expect(await transitionedOn(dot), 'it swells by transform').toEqual(['transform'])

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect.poll(() => turned(knot)).toBe(0)
  await expect.poll(async () => (await dot.boundingBox())?.width).toBeCloseTo(closedDot, 0)
})
