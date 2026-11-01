import type { Locator, Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { recordAnimationStarts, transitionedOn } from './drawings'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'

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

// Front-end-site ticket 05: the Concept page v2.

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024
const contents = (page: Page) => page.getByRole('navigation', { name: 'Contents' })
const linked = (page: Page) => page.getByRole('region', { name: 'Linked knowledge' })
/** The open preview card: Base UI marks it open and the side it sits on. */
const previewCard = (page: Page) => page.locator('[data-open][data-side]').last()

/** Wait two frames, for a scroll-driven style to catch up with the scroll. */
const frames = (page: Page) =>
  page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  )

/** How much two boxes overlap, in px². */
function overlap(
  a: { x: number; y: number; width: number; height: number } | null,
  b: { x: number; y: number; width: number; height: number } | null,
) {
  if (!a || !b) return 0
  const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
  const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  return width * height
}

test.describe('Concept page v2: heading and blocks', () => {
  test('leads with the capitalised IAST, the Devanagari beneath it and the gloss in small capitals (D07)', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const heading = page.getByRole('heading', { level: 1 })
    const [iast, deva] = [heading.locator('[lang="sa-Latn"]'), heading.locator('[lang="sa-Deva"]')]
    await expect(iast).toHaveText('Vikṣepa')
    await expect(deva).toHaveText('विक्षेप')
    const [above, below] = [await iast.boundingBox(), await deva.boundingBox()]
    expect(below?.y ?? 0).toBeGreaterThan(above?.y ?? 0)
    const gloss = page.locator('header p', { hasText: 'Distraction' })
    await expect(gloss).toHaveCSS('font-variant-caps', 'all-small-caps')
  })

  test('a Concept with an English title leads with it', async ({ page }) => {
    await gotoReady(page, '/concepts/five-steps-of-perfection/')
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toHaveText(/five steps/i)
    await expect(heading.locator('[lang]')).toHaveCount(0)
  })

  test('each term has a heading a level below its section, an anchor and a visible link to it', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const section = page.locator('section#distraction-at-the-body-level')
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Distraction at the body level',
    )
    const term = section.locator('#vyadhi')
    await expect(term.getByRole('heading', { level: 3 })).toContainText('Vyādhi')
    const link = term.getByRole('link', { name: 'Link to Vyādhi' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '#vyadhi')
    await link.click()
    await expect(page).toHaveURL(/#vyadhi$/)
    await expect(term.getByRole('heading', { level: 3 })).toBeInViewport()
  })

  test('labels applications and comparison sections, and no comparison calls two ideas equivalent (D05)', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/sthitaprajna/')
    await expect(
      page.getByRole('heading', { level: 2, name: /^Applications: Applications of/ }),
    ).toBeVisible()
    const comparisons = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: /^Comparison: / }),
    })
    await expect(comparisons).toHaveCount(3)
    for (const comparison of await comparisons.all()) {
      await expect(comparison).not.toContainText(/\bequivalent\b|\bthe same as\b/i)
    }
  })

  test('sets a verse quoted mid-section, the shared topic introduction and a wide table', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/karta/')
    await expect(page.locator('section figure blockquote [lang="sa-Deva"]').first()).toBeVisible()
    await gotoReady(page, '/concepts/ahimsa/')
    await expect(page.getByText('From the introduction to')).toHaveCount(1)
    await expect(page.locator('section').getByRole('region').first()).toBeVisible()
  })
})

test.describe('Concept page v2: contents', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
  })

  test('lists the sections, Linked knowledge and the References in a named navigation', async ({
    page,
  }) => {
    const links = contents(page).getByRole('link')
    await expect(contents(page).getByRole('link', { name: 'What is vikṣepa?' })).toHaveAttribute(
      'href',
      '#what-is-viksepa',
    )
    await expect(contents(page).getByRole('link', { name: 'Linked knowledge' })).toHaveAttribute(
      'href',
      '#linked-knowledge',
    )
    await expect(contents(page).getByRole('link', { name: 'References' })).toHaveAttribute(
      'href',
      '#references',
    )
    expect(await links.count()).toBeGreaterThanOrEqual(9)
    await contents(page).getByRole('link', { name: 'Linked knowledge' }).click()
    await expect(linked(page).getByRole('heading', { level: 2 })).toBeInViewport()
  })

  test('stays in view beside the text on a wide screen, and sits above it unstuck on a narrow one', async ({
    page,
  }) => {
    const nav = contents(page)
    const firstSection = page.locator('section#what-is-viksepa')
    await page.locator('#linked-knowledge').scrollIntoViewIfNeeded()
    await frames(page)
    if (wide(page)) {
      await expect(nav.getByRole('heading', { name: 'Contents' })).toBeInViewport()
      const [toc, text] = [await nav.boundingBox(), await firstSection.boundingBox()]
      expect((toc?.x ?? 0) + (toc?.width ?? 0)).toBeLessThanOrEqual(text?.x ?? 0)
    } else {
      await expect(nav).not.toBeInViewport()
      await page.evaluate(() => window.scrollTo(0, 0))
      const [toc, text] = [await nav.boundingBox(), await firstSection.boundingBox()]
      expect((toc?.y ?? 0) + (toc?.height ?? 0)).toBeLessThanOrEqual(text?.y ?? 0)
    }
  })

  test('marks the section in view, in CSS alone', async ({ page }) => {
    const link = contents(page).getByRole('link', { name: 'Distraction at the body level' })
    const current = () => link.evaluate((element) => element.matches(':target-current'))
    expect(await current()).toBe(false)
    await page
      .locator('section#distraction-at-the-body-level')
      .evaluate((section) => section.scrollIntoView({ block: 'start' }))
    await frames(page)
    await expect.poll(current).toBe(true)
  })
})

test.describe('Concept page v2: linked knowledge', () => {
  test('gathers related Concepts with their reasons, the passages, sections, References and Questionnaire', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const panel = linked(page)
    const related = panel.getByRole('listitem').filter({ hasText: 'Citta-bhūmi' })
    await expect(related.getByRole('link', { name: 'Citta-bhūmi' })).toHaveAttribute(
      'href',
      '/concepts/chittabhumi/',
    )
    await expect(related).toContainText('Both quote Yoga Sūtra 1.30')
    await expect(panel.getByRole('link', { name: 'Yoga Sūtra 1.30' })).toHaveAttribute(
      'href',
      '/texts/yoga-sutra/#1-30',
    )
    await expect(panel.getByRole('link', { name: 'Yoga Sūtra', exact: true })).toHaveAttribute(
      'href',
      '/texts/yoga-sutra/',
    )
    await expect(panel.getByRole('link', { name: 'Indian and Western concepts' })).toHaveAttribute(
      'href',
      '#indian-and-western-concepts',
    )
    await expect(panel.locator('a[href^="#ref-"]')).toHaveCount(10)
    // The Questionnaire, with its status in words beside it (WCAG 1.4.1).
    const questionnaire = panel.getByRole('listitem').filter({ hasText: 'KarmaYoga Scale' })
    await expect(questionnaire.getByRole('link', { name: 'KarmaYoga Scale' })).toHaveAttribute(
      'href',
      '/questionnaires/karmayoga-scale/',
    )
    await expect(questionnaire).toContainText(/Open|Preview|Coming soon|Coming later/)
    // Its rules are decoration, silent to assistive technology.
    const rules = panel.locator('li [aria-hidden="true"]')
    expect(await rules.count()).toBeGreaterThan(10)
    await expectNoAxeViolations(page)
  })

  test('the Questionnaire’s title turns the page forward and flies into its heading', async ({
    page,
  }) => {
    await recordPageTurns(page)
    await gotoReady(page, '/concepts/vikshepa/')
    const link = linked(page).getByRole('link', { name: 'KarmaYoga Scale' })
    await link.scrollIntoViewIfNeeded()
    await prefetched(link)
    await link.click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarmaYoga Scale')
    const [turn] = await pageTurns(page)
    expectPageTurned(turn, 'forward')
    expect(turn?.flights.map(({ name }) => name)).toContain('questionnaire-title-karmayoga-scale')
  })

  test('leaves empty groups out', async ({ page }) => {
    await gotoReady(page, '/concepts/atman/')
    const panel = linked(page)
    await expect(panel.getByRole('heading', { level: 3 })).toHaveText([/^Related Concepts/])
    await expect(page.locator('details', { hasText: 'References' })).toHaveCount(0)
  })

  test('its cross-reference rules ink in from the centre as they scroll into view', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const ink = linked(page).locator('li [aria-hidden="true"] > *').last()
    const clip = () => ink.evaluate((element) => getComputedStyle(element).clipPath)
    expect(await clip()).toMatch(/^inset\(0px 50%/)
    await ink.evaluate((element) => element.scrollIntoView({ block: 'center' }))
    await frames(page)
    await expect.poll(clip).toMatch(/^(none|inset\(0px( 0%)?\))$/)
  })

  test('where motion is reduced, the rules are inked in and still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoReady(page, '/concepts/vikshepa/')
    const inks = linked(page).locator('li [aria-hidden="true"] > *')
    expect(await inks.count()).toBeGreaterThan(10)
    const still = await inks.evaluateAll((elements) =>
      elements.every(
        (element) =>
          getComputedStyle(element).clipPath === 'none' && element.getAnimations().length === 0,
      ),
    )
    expect(still).toBe(true)
  })
})

test.describe('Concept page v2: citations', () => {
  const citation = (page: Page) => page.locator('section a[href="#ref-bhavanani-2012"]').first()

  test('a citation opens the References at its entry and puts focus on it, by keyboard', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const entry = page.locator('#ref-bhavanani-2012')
    await expect(entry).toBeHidden()
    await citation(page).focus()
    await page.keyboard.press('Enter')
    await expect(entry).toBeVisible()
    await expect(entry).toBeFocused()
    await expect(entry).toBeInViewport()
    await expect(references(page).disclosure).toHaveAttribute('open')
    // Clear of the sticky header, which would otherwise cover part of the list's control.
    await references(page).toggle.evaluate((toggle) => toggle.scrollIntoView({ block: 'center' }))
    await expectNoAxeViolations(page)
  })

  test('a citation opens the References at its entry and puts focus on it, by mouse', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const entry = page.locator('#ref-bhavanani-2012')
    await citation(page).click()
    await expect(entry).toBeFocused()
    await expect(entry).toBeInViewport()
  })

  test('without JavaScript, a citation still reaches its entry', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/concepts/vikshepa/')
    await citation(page).click()
    const entry = page.locator('#ref-bhavanani-2012')
    await expect(entry).toBeVisible()
    await expect(entry).toBeInViewport()
    await context.close()
  })
})

test.describe('Concept page v2: previews', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
  })

  test('a Concept link shows its preview on hover, which the pointer can move onto', async ({
    page,
  }) => {
    const link = linked(page).getByRole('link', { name: 'Citta-bhūmi' })
    await link.scrollIntoViewIfNeeded()
    await page.mouse.move(1, 1)
    await link.hover()
    const card = previewCard(page)
    await expect(card).toContainText('Concept')
    await expect(card).toContainText('Citta-bhūmi')
    await expect
      .poll(async () => overlap(await card.boundingBox(), await link.boundingBox()))
      .toBe(0)
    await card.hover()
    await page.waitForTimeout(600)
    await expect(card).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('a citation shows its preview on keyboard focus, beside it, and Escape closes it', async ({
    page,
  }) => {
    const link = page.locator('section a[href^="#ref-"]').first()
    await page.keyboard.press('Shift')
    await link.focus()
    const card = previewCard(page)
    await expect(card).toContainText('Reference')
    await expect
      .poll(async () => overlap(await card.boundingBox(), await link.boundingBox()))
      .toBe(0)
    await page.keyboard.press('Escape')
    await expect(card).toBeHidden()
    await expect(link).toBeFocused()
  })

  test('a verse link shows its translation, and a second preview asks the network for nothing', async ({
    page,
  }) => {
    const first = linked(page).getByRole('link', { name: 'Citta-bhūmi' })
    await first.scrollIntoViewIfNeeded()
    await page.mouse.move(1, 1)
    await first.hover()
    await expect(previewCard(page)).toContainText('Citta-bhūmi')
    await page.mouse.move(1, 1)
    await expect(previewCard(page)).toBeHidden()

    // Data the page asks for, not the code or prefetches its links make.
    const requests: string[] = []
    page.on('request', (request) => {
      if (['fetch', 'xhr'].includes(request.resourceType()) && !request.url().includes('_rsc')) {
        requests.push(request.url())
      }
    })
    const verse = linked(page).getByRole('link', { name: 'Yoga Sūtra 1.30' })
    await verse.hover()
    await expect(previewCard(page)).toContainText('Verse')
    await expect(previewCard(page)).toContainText('Yoga Sūtra 1.30')
    expect(requests).toEqual([])
  })

  test('shows nothing on touch', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true })
    const page = await context.newPage()
    await gotoReady(page, '/concepts/vikshepa/')
    const link = page.locator('section a[href^="#ref-"]').first()
    await link.scrollIntoViewIfNeeded()
    await link.tap()
    await page.waitForTimeout(900)
    await expect(page.locator('[data-open][data-side]')).toHaveCount(0)
    await context.close()
  })
})

test.describe('Concept page v2: verse cards', () => {
  test('a chip leads to the passage, and "Copy verse" copies it and says so politely', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await gotoReady(page, '/concepts/vikshepa/')
    const card = page.locator('figure', { hasText: 'Yoga Sūtra 1.30' }).first().locator('..')
    await expect(card.getByRole('link', { name: 'Yoga Sūtra 1.30' })).toHaveAttribute(
      'href',
      '/texts/yoga-sutra/#1-30',
    )
    const copy = card.getByRole('button', { name: /^Copy verse/ })
    await copy.focus()
    await page.keyboard.press('Enter')
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    const devanagari = (await card.locator('blockquote [lang="sa-Deva"]').innerText()).split(
      '\n',
    )[0]
    expect(copied).toContain(devanagari?.trim().slice(0, 12))
    expect(copied).toContain('Yoga Sūtra 1.30')
    expect(copied).not.toContain('<')

    const notifications = page.getByRole('region', { name: 'Notifications' })
    await expect(notifications).toHaveAttribute('aria-live', 'polite')
    const status = notifications.getByText('Verse copied')
    await expect(status).toBeVisible()
    await expect(notifications.getByText('Yoga Sūtra 1.30')).toHaveAttribute('lang', 'sa-Latn')
    await expect(copy).toBeFocused()
    await expectNoAxeViolations(page)

    // Space copies too; its toast stays at least 5 seconds, and focus never moves.
    await page.keyboard.press(' ')
    await expect(status).toHaveCount(2)
    await page.waitForTimeout(5000)
    await expect(status.last()).toBeVisible()
    await expect(copy).toBeFocused()
  })
})

test.describe('Concept page v2: tables', () => {
  test('a wide table scrolls in its own named region, its first column staying in view', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const frame = page.getByRole('region', { name: /Comparison between Indian and Western/ })
    await expect(frame).toHaveAttribute('tabindex', '0')
    const first = frame.getByRole('row').nth(1).locator('th, td').first()
    const second = frame.getByRole('row').nth(1).locator('th, td').nth(1)
    const [before, beside] = [await first.boundingBox(), await second.boundingBox()]
    await frame.evaluate((element) => element.scrollBy({ left: 400, behavior: 'instant' }))
    const scrolled = await frame.evaluate((element) => element.scrollLeft)
    if (scrolled > 0) {
      expect((await first.boundingBox())?.x).toBeCloseTo(before?.x ?? 0, 0)
      expect((await second.boundingBox())?.x ?? 0).toBeLessThan(beside?.x ?? 0)
    }
    // Scroll shadows in CSS: shades fixed to the frame, and paper that scrolls with the table.
    const attachment = await frame.evaluate(
      (element) => getComputedStyle(element).backgroundAttachment,
    )
    expect(attachment).toContain('local')
    expect(attachment).toContain('scroll')
    expect(await scrollsSideways(page)).toEqual([])
  })
})

test.describe('Concept page v2: previous and next', () => {
  test('"next" turns the page forward and "previous" turns it back, within the topic', async ({
    page,
  }) => {
    await recordPageTurns(page)
    await gotoReady(page, '/concepts/sthitaprajna/')
    const pager = page.getByRole('navigation', { name: /^Concepts in / })
    const next = pager.getByRole('link', { name: /^Next/ })
    await expect(next).toContainText('Upa-vikṣepa')
    await prefetched(next)
    await next.click()
    await expect(page).toHaveURL('/concepts/upa-vikshepa/')
    // Let the turn finish before the next one starts, which would cut it short.
    const [forward] = await pageTurns(page)
    expectPageTurned(forward, 'forward')
    const previous = page
      .getByRole('navigation', { name: /^Concepts in / })
      .getByRole('link', { name: /^Previous/ })
    await expect(previous).toContainText('Sthitaprajña')
    await prefetched(previous)
    await previous.click()
    await expect(page).toHaveURL('/concepts/sthitaprajna/')
    const [, back] = await pageTurns(page)
    expectPageTurned(back, 'back')
  })

  test('the first Concept of a topic has no "previous", and the last no "next"', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/chittabhumi/')
    const pager = page.getByRole('navigation', { name: /^Concepts in / })
    await expect(pager.getByRole('link', { name: /^Previous/ })).toHaveCount(0)
    await expect(pager.getByRole('link', { name: /^Next/ })).toHaveCount(1)
    await gotoReady(page, '/concepts/vikshepa/')
    const last = page.getByRole('navigation', { name: /^Concepts in / })
    await expect(last.getByRole('link', { name: /^Next/ })).toHaveCount(0)
    await expect(last.getByRole('link', { name: /^Previous/ })).toHaveCount(1)
  })
})

test.describe('Concept page v2: print', () => {
  test('prints the text alone, the References open, and the address after each external link', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('header').first()).toBeHidden()
    await expect(page.locator('footer').last()).toBeHidden()
    await expect(contents(page)).toBeHidden()
    await expect(page.getByRole('button', { name: /^Copy verse/ }).first()).toBeHidden()
    await expect(page.getByRole('button', { name: 'Also spelled' })).toBeHidden()
    await expect(page.locator('#ref-bhavanani-2012')).toBeVisible()
    const doi = page.getByRole('link', { name: 'doi:10.3389/fpsyg.2025.1554014' })
    await expect(doi).toBeVisible()
    const after = await doi.evaluate((link) => getComputedStyle(link, '::after').content)
    expect(after).toContain('https://doi.org/10.3389/fpsyg.2025.1554014')
    const inks = linked(page).locator('li [aria-hidden="true"] > *')
    expect(await inks.count()).toBeGreaterThan(10)
    expect(
      await inks.evaluateAll((elements) =>
        elements.every((element) => getComputedStyle(element).clipPath === 'none'),
      ),
    ).toBe(true)
    await expect(page.locator('blockquote [lang="sa-Deva"]').first()).toBeVisible()
  })
})
