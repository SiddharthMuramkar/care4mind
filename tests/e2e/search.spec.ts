import { concepts, home } from '@/content'
import { resultGroups } from '@/lib/search/search'
import { search } from '@/lib/search/server'

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

  test('the empty page hints what to try, and offers the starting points', async ({ page }) => {
    await page.goto('/search/')
    const box = page.getByLabel('A Concept, a term, a verse, a text or an author')
    await expect(box).toHaveAttribute('placeholder', 'Try: focus, anger, Gītā…')
    const { onYourMind } = await home.get()
    expect(onYourMind.length).toBeGreaterThan(0)
    for (const { label, concept } of onYourMind) {
      await expect(
        page.getByRole('main').getByRole('link', { name: label, exact: true }),
      ).toHaveAttribute('href', concept.href)
    }
  })

  test('a Concept result shows its name with its gloss', async ({ page }) => {
    await page.goto('/search/?q=vikshepa')
    await expect(page.locator('main section li').first()).toContainText(
      `Vikṣepa · ${vikshepa.english}`,
    )
  })

  test('groups come in their order, five to a group until “Show all”', async ({ page }) => {
    const groups = resultGroups(await search('gita'))
    await page.goto('/search/?q=gita')
    await expect(page.locator('main section h3')).toHaveText(groups.map(({ heading }) => heading))
    const shownGroups = page.locator('main section > div')
    await expect(shownGroups).toHaveCount(groups.length)
    for (const [at, group] of groups.entries()) {
      const shown = shownGroups.nth(at)
      await expect(shown.locator('li'), group.heading).toHaveCount(group.results.length)
      expect(group.results.length, group.heading).toBeLessThanOrEqual(5)
      const showAll = shown.getByRole('link', { name: `Show all ${group.total}` })
      await expect(showAll, group.heading).toHaveCount(group.total > 5 ? 1 : 0)
    }

    const over = groups.findIndex(({ total }) => total > 5)
    const group = groups[over]
    if (!group) throw new Error('“gita” has a group over five.')
    await shownGroups
      .nth(over)
      .getByRole('link', { name: `Show all ${group.total}` })
      .click()
    await expect(page).toHaveURL(new RegExp(`all=${group.kind}`))
    await expect(page.locator('main section > div').nth(over).locator('li')).toHaveCount(
      group.total,
    )
  })

  test('no results offers the starting points, the Concepts and the help line', async ({
    page,
  }) => {
    const response = await page.goto('/search/?q=self-worth')
    expect(response?.status()).toBe(200)
    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { level: 2 })).toHaveText('No results for “self-worth”')
    const { onYourMind } = await home.get()
    for (const { label, concept } of onYourMind) {
      await expect(main.getByRole('link', { name: label, exact: true })).toHaveAttribute(
        'href',
        concept.href,
      )
    }
    const browse = main.getByRole('link', { name: 'Browse all concepts', exact: true })
    await expect(browse).toHaveAttribute('href', '/concepts/')
    expect((await page.request.get('/concepts/')).status()).toBe(200)
    const help = main.locator('[data-help-line]')
    await expect(help).toContainText('not treatment')
    for (const tel of ['tel:14416', 'tel:18008914416', 'tel:112']) {
      await expect(help.locator(`a[href="${tel}"]`)).toHaveCount(1)
    }
  })

  test('the 404 page carries the search box and the starting points, beside its links', async ({
    page,
  }) => {
    const response = await page.goto('/no-such-page-here/')
    expect(response?.status()).toBe(404)
    const main = page.getByRole('main')
    await expect(main.getByRole('link', { name: 'Go to the homepage' })).toBeVisible()
    await expect(main.getByRole('link', { name: /Read about/ })).toBeVisible()
    const { onYourMind } = await home.get()
    for (const { label, concept } of onYourMind) {
      await expect(main.getByRole('link', { name: label, exact: true })).toHaveAttribute(
        'href',
        concept.href,
      )
    }
    await main.getByLabel('A Concept, a term, a verse, a text or an author').fill('vikshepa')
    await main.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/\/search\/\?q=vikshepa$/)
    await expect(page.locator('main section li a').first()).toHaveText('Vikṣepa')
  })
})
