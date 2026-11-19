import type { Locator, Page } from '@playwright/test'

import { expect, gotoReady, test } from './fixtures'
import { expectPaperFocusRing } from './paper'

/** The colour scheme the browser draws an element's scrollbars and native controls in. */
const scheme = (element: Locator) => element.evaluate((node) => getComputedStyle(node).colorScheme)

// The indigo page asks for dark scrollbars, controls and canvas; every paper surface on it for light ones.
test.describe('the colour scheme', () => {
  test('is dark on the page and light inside a folio and a card', async ({ page }) => {
    await gotoReady(page, '/')
    expect(await scheme(page.locator('html'))).toBe('dark')
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'dark')
    const folio = page.locator('main [data-paper]').first()
    expect(await scheme(folio)).toBe('light')
    const card = page.locator('#featured').getByRole('article').first()
    expect(await scheme(card.getByRole('link').first())).toBe('light')
  })

  test('is light inside a form on paper', async ({ page }) => {
    await gotoReady(page, '/search/')
    expect(await scheme(page.locator('html'))).toBe('dark')
    expect(await scheme(page.getByRole('main').getByRole('searchbox').first())).toBe('light')
  })

  test.describe('on a phone', { tag: '@self-width' }, () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('is light in the Menu Drawer', async ({ page }) => {
      await gotoReady(page, '/')
      await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
      const drawer = page.getByRole('dialog', { name: 'Menu' })
      await expect(drawer).toBeVisible()
      expect(await scheme(drawer.getByRole('link').first())).toBe('light')
    })
  })
})

// A focused link on paper draws its ring in paper's focus colour, on every paper surface. The
// Retake dialog's ring is checked with the rest of the Questionnaire flow, at its end screen.

test.describe('a focused link on paper rings in paper’s focus colour', () => {
  test('on a folio', async ({ page }) => {
    await gotoReady(page, '/concepts/')
    const folio = page.getByRole('article', { name: /Concepts/ })
    await expectPaperFocusRing(folio.getByRole('link', { name: 'Search the site' }))
  })

  test('on a Concept card', async ({ page }) => {
    await gotoReady(page, '/')
    // The homepage's Concept cards are its featured ones now, under "Start with these".
    const card = page.locator('#featured').getByRole('article').first()
    await expectPaperFocusRing(card.getByRole('link', { name: /^Read about/ }), '::after')
  })

  test('on a Questionnaire card', async ({ page }) => {
    // The homepage no longer shows Questionnaire cards; they live on their own index.
    await gotoReady(page, '/questionnaires/')
    const card = page
      .getByRole('region', { name: /With a page of/ })
      .getByRole('article')
      .first()
    await expectPaperFocusRing(card.getByRole('link', { name: /^About the/ }), '::after')
  })

  test.describe('on a computer', { tag: '@self-width' }, () => {
    test.use({ viewport: { width: 1280, height: 900 } })

    test('in a navigation panel', async ({ page }) => {
      await gotoReady(page, '/')
      await page.getByRole('banner').getByRole('button', { name: 'More in Concepts' }).click()
      const panel = page.getByRole('navigation', { name: 'Concepts', exact: true })
      await expect(panel).toBeVisible()
      await expectPaperFocusRing(panel.getByRole('link').first())
    })
  })

  test.describe('on a phone', { tag: '@self-width' }, () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('in the Menu Drawer', async ({ page }) => {
      await gotoReady(page, '/')
      await page.getByRole('banner').getByRole('button', { name: 'Menu' }).click()
      const drawer = page.getByRole('dialog', { name: 'Menu' })
      await expect(drawer).toBeVisible()
      await expectPaperFocusRing(drawer.getByRole('link').first())
    })
  })
})

/** A colour token as the browser paints it, read off a probe so it compares with a computed background. */
const painted = (page: Page, token: string) =>
  page.evaluate((token) => {
    const probe = document.createElement('i')
    probe.style.backgroundColor = `var(${token})`
    document.body.append(probe)
    const colour = getComputedStyle(probe).backgroundColor
    probe.remove()
    return colour
  }, token)

const background = (element: Locator) =>
  element.evaluate((node) => getComputedStyle(node).backgroundColor)

// Long reading happens on the lighter paper, and the cards laid on it keep the deeper one, so the
// two tones give the page depth. The homepage's hero keeps the deeper paper too.
test.describe('the reading paper', { tag: '@one-width' }, () => {
  for (const path of [
    '/concepts/vikshepa/',
    '/topics/mind/',
    '/texts/yoga-sutra/',
    '/library/',
    '/library/courses/',
    '/questionnaires/karmayoga-scale/',
  ]) {
    test(`is the body of ${path}`, async ({ page }) => {
      await gotoReady(page, path)
      const folio = page.getByRole('main').getByRole('article').first()
      expect(await background(folio)).toBe(await painted(page, '--color-reading'))
    })
  }

  test('lies under cards that keep the deeper paper', async ({ page }) => {
    await gotoReady(page, '/topics/mind/')
    const card = page.getByRole('main').getByRole('article').nth(1)
    await expect(card.getByRole('link', { name: /^Read about/ })).toBeVisible()
    expect(await background(card)).toBe(await painted(page, '--color-card'))
  })

  test('is not the homepage hero’s', async ({ page }) => {
    await gotoReady(page, '/')
    const hero = page.getByRole('main').locator('[data-paper]').first()
    expect(await background(hero)).toBe(await painted(page, '--color-surface'))
  })
})
