import { expect, gotoReady, test } from './fixtures'
import { expectPaperFocusRing } from './paper'

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
