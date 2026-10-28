import type { Locator, Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { recordAnimationStarts, transitionedOn } from './drawings'
import { expect, gotoReady, test } from './fixtures'

const spellingsButton = (page: Page) => page.getByRole('button', { name: 'Also spelled' })
const spellingsPopup = (page: Page) =>
  page.getByRole('dialog', { name: 'Other spellings of vikṣepa' })

/** The References: a native disclosure, the summary that names them and opens it, and their list. */
function references(page: Page) {
  const toggle = page.locator('summary', { hasText: 'References' })
  const disclosure = page.locator('details', { has: toggle })
  return { toggle, disclosure, list: disclosure.getByRole('list') }
}

/**
 * The control that has focus, and how much of it (in px²) lies under an open
 * dialog outside it: 0 when none does. Null when focus is on nothing.
 */
function focusUnderDialog(page: Page) {
  return page.evaluate(() => {
    const focused = document.activeElement
    if (!focused || focused === document.body) return null
    const what = `${focused.tagName.toLowerCase()} "${focused.textContent?.trim().slice(0, 30)}"`
    const dialog = document.querySelector('[role="dialog"]')
    if (!dialog || dialog.contains(focused) || dialog.getClientRects().length === 0) {
      return { what, covered: 0 }
    }
    const [a, b] = [focused.getBoundingClientRect(), dialog.getBoundingClientRect()]
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
    return { what, covered: width * height }
  })
}

test.describe('Concept page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
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

  test('opens the other spellings with Enter or Space, and Close or Escape hands focus back', async ({
    page,
  }) => {
    const trigger = spellingsButton(page)
    const popup = spellingsPopup(page)
    const close = popup.getByRole('button', { name: 'Close' })
    for (const [open, shut] of [
      ['Enter', 'Enter'],
      ['Space', 'Escape'],
    ] as const) {
      await trigger.focus()
      await page.keyboard.press(open)
      await expect(popup).toBeVisible()
      await expect(popup.getByRole('listitem')).toHaveText(['viksepa', 'Vikshepa'])
      // Focus stays on the button, and the popover's own controls come next.
      await expect(trigger).toBeFocused()
      await page.keyboard.press('Tab')
      await expect(close).toBeFocused()
      await page.keyboard.press(shut)
      await expect(popup).toBeHidden()
      await expect(trigger).toBeFocused()
    }
  })

  test('opens the other spellings with a click, and closes them with Close or a click elsewhere', async ({
    page,
  }) => {
    const trigger = spellingsButton(page)
    const popup = spellingsPopup(page)
    await trigger.click()
    await expect(popup).toBeVisible()
    await popup.getByRole('button', { name: 'Close' }).click()
    await expect(popup).toBeHidden()
    await expect(trigger).toBeFocused()

    await trigger.click()
    await expect(popup).toBeVisible()
    await page.getByRole('heading', { level: 1 }).click()
    await expect(popup).toBeHidden()
  })

  // WCAG 2.4.11: the popover stays open as focus moves on, so it must never cover where focus goes.
  test('the other spellings never cover the control that has focus, tabbing on or back', async ({
    page,
  }) => {
    const trigger = spellingsButton(page)
    const popup = spellingsPopup(page)
    const width = page.viewportSize()?.width ?? 0
    // As the page loads, then on a screen too short to show all of the popover below the button.
    for (const height of [page.viewportSize()?.height ?? 0, 600]) {
      await page.setViewportSize({ width, height })
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await trigger.click()
      await expect(popup).toBeVisible()
      for (const key of [...Array<string>(4).fill('Tab'), ...Array<string>(8).fill('Shift+Tab')]) {
        await page.keyboard.press(key)
        const focus = await focusUnderDialog(page)
        expect(focus, `${key}: focus is on a control`).not.toBeNull()
        expect(focus?.covered, `${key} to ${focus?.what}: none of it under the popover`).toBe(0)
      }
      await page.keyboard.press('Escape')
      await expect(popup).toBeHidden()
    }
  })

  test('folds the References away and opens them on request (FR-03)', async ({ page }) => {
    const { toggle: trigger, disclosure } = references(page)
    await expect(disclosure).not.toHaveAttribute('open')
    await trigger.click()
    await expect(disclosure).toHaveAttribute('open')
    const entries = page.locator('[id^="ref-"]')
    await expect(entries).toHaveCount(10)
    await expect(
      page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' }),
    ).toHaveAttribute('href', 'https://doi.org/10.3389/fpsyg.2025.1554014')
    await expectNoAxeViolations(page)
  })

  test('a link on the page to one of its References opens them at that entry (FR-03)', async ({
    page,
  }) => {
    const entry = page.locator('#ref-bhavanani-2012')
    await expect(entry).toBeHidden()
    await gotoReady(page, '/concepts/vikshepa/#ref-bhavanani-2012')
    await expect(entry).toBeVisible()
    await expect(entry).toBeInViewport()
  })

  test('a link from another page to one of its References opens them at that entry', async ({
    page,
  }) => {
    await gotoReady(page, '/questionnaires/karmayoga-scale/')
    await gotoReady(page, '/concepts/vikshepa/#ref-gurubhaktananda-2018')
    const entry = page.locator('#ref-gurubhaktananda-2018')
    await expect(entry).toBeVisible()
    await expect(entry).toBeInViewport()
  })

  test('reaches its related Questionnaire in one click (FR-01)', async ({ page }) => {
    await page.getByRole('link', { name: 'KarmaYoga Scale' }).click()
    await expect(page).toHaveURL('/questionnaires/karmayoga-scale/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')
  })

  test('keeps the wide comparison table scrollable in its own frame', async ({ page }) => {
    const frame = page.getByRole('region', { name: /Comparison between Indian and Western/ })
    await expect(frame).toBeVisible()
    await expect(frame).toHaveAttribute('tabindex', '0')
    await expect(frame.getByRole('row')).toHaveCount(10)
  })
})

// Interaction is an enhancement (user story 43): the native controls work without it.
test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false })

  test('the Concept page still shows the other spellings, and closes them', async ({ page }) => {
    await page.goto('/concepts/vikshepa/')
    const popup = spellingsPopup(page)
    await spellingsButton(page).click()
    await expect(popup).toBeVisible()
    await expect(popup.getByRole('listitem')).toHaveText(['viksepa', 'Vikshepa'])
    await popup.getByRole('button', { name: 'Close' }).click()
    await expect(popup).toBeHidden()
  })

  test('the Concept page still opens its References, and a link to one of them', async ({
    page,
  }) => {
    await page.goto('/concepts/vikshepa/#ref-bhavanani-2012')
    const linked = page.locator('#ref-bhavanani-2012')
    await expect(linked).toBeVisible()
    await expect(linked).toBeInViewport()

    await page.goto('/concepts/vikshepa/')
    const doi = page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' })
    await expect(doi).toBeHidden()
    await references(page).toggle.click()
    await expect(doi).toBeVisible()

    await page.getByRole('link', { name: 'KarmaYoga Scale' }).click()
    await expect(page).toHaveURL('/questionnaires/karmayoga-scale/')
  })
})

// Arriving by a link, the page is drawn by React in the browser, not from the server's HTML.
test('arriving from the homepage, the other spellings and the References still open', async ({
  page,
}) => {
  await gotoReady(page, '/')
  await page.getByRole('link', { name: 'Read about Vikṣepa' }).click()
  await expect(page).toHaveURL('/concepts/vikshepa/')
  const popup = spellingsPopup(page)
  await spellingsButton(page).click()
  await expect(popup).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(popup).toBeHidden()
  const doi = page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' })
  await references(page).toggle.click()
  await expect(doi).toBeVisible()
})

test('the References list fades in as it opens, by opacity alone', async ({ page }) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/concepts/vikshepa/')
  const doi = page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' })
  const { toggle, list } = references(page)
  await toggle.click()
  await expect(doi).toBeVisible()
  await expect.poll(() => transitionedOn(list)).toEqual(['opacity'])
})

/** How far each of these rules is turned from lying flat, in degrees (0 to 90), as drawn on screen. */
const turns = (rules: Locator) =>
  rules.evaluateAll((elements) =>
    elements
      .map((element) => {
        const { transform } = getComputedStyle(element)
        const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
        return Math.abs(Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)) % 180
      })
      .sort((a, b) => a - b),
  )

test('the References control shows a plus that folds into a minus as the list opens, and back', async ({
  page,
}) => {
  await recordAnimationStarts(page)
  await gotoReady(page, '/concepts/vikshepa/')
  const { toggle: trigger, disclosure } = references(page)
  // Two vermilion rules, silent to assistive technology.
  const icon = trigger.locator('[aria-hidden="true"]')
  await expect(icon).toHaveCount(1)
  const rules = icon.locator(':scope > *')
  await expect(rules).toHaveCount(2)
  for (const rule of await rules.all()) {
    await expect(rule).toBeVisible()
    await expect(rule).toHaveCSS('background-color', 'rgb(200, 52, 42)')
  }
  expect(await turns(rules), 'a plus while closed').toEqual([0, 90])

  await trigger.click()
  await expect(disclosure).toHaveAttribute('open')
  await expect.poll(() => turns(rules), 'a minus once open').toEqual([0, 0])
  const moved = await Promise.all((await rules.all()).map((rule) => transitionedOn(rule)))
  expect(moved.flat(), 'the upright rule folds flat, by transform').toEqual(['transform'])

  await trigger.click()
  await expect(disclosure).not.toHaveAttribute('open')
  await expect.poll(() => turns(rules), 'a plus again once closed').toEqual([0, 90])
})
