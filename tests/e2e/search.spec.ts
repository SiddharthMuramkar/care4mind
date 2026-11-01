import { expect, test } from './fixtures'

test.describe('the search page, without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('a typed spelling leads with its Concept, under Concepts first', async ({ page }) => {
    await page.goto('/search/')
    await page.getByLabel('A Concept, a term, a verse, a text or an author').fill('vikshepa')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/\/search\/\?q=vikshepa$/)
    await expect(page.locator('main section h3').first()).toHaveText('Concepts')
    await expect(page.locator('main section li a').first()).toHaveText('Vikṣepa')
  })

  test('a typo still finds its Concept', async ({ page }) => {
    await page.goto('/search/?q=vikshpa')
    await expect(page.locator('main section li a').first()).toHaveText('Vikṣepa')
  })
})
