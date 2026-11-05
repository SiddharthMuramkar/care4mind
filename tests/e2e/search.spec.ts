import { concepts } from '@/content'

import { expect, test } from './fixtures'

const vikshepa = (await concepts.list()).find(({ slug }) => slug === 'vikshepa')
if (!vikshepa) throw new Error('Vikṣepa is in the content.')

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

  test('a Concept result shows its topic chip and reading time', async ({ page }) => {
    await page.goto('/search/?q=vikshepa')
    const result = page.locator('main section li').first()
    const minutes = vikshepa.readingMinutes
    await expect(result.locator(`[data-topic="${vikshepa.topic.slug}"]`)).toHaveText(
      vikshepa.topic.name,
    )
    await expect(result).toContainText(
      `About ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} to read`,
    )
  })

  test('a typo still finds its Concept', async ({ page }) => {
    await page.goto('/search/?q=vikshpa')
    await expect(page.locator('main section li a').first()).toHaveText('Vikṣepa')
  })
})
