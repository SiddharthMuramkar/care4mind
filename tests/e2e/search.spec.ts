import { gzipSync } from 'node:zlib'

import type { Locator, Page } from '@playwright/test'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'
import { expectPageTurned, pageTurns, recordPageTurns } from './page-turns'

// Front-end-site ticket 09: search (FR-04, NFR-03): the ⌘K palette, the results page and the index.

const WIDE = 1152
const isWide = (page: Page) => (page.viewportSize()?.width ?? 0) >= WIDE

const banner = (page: Page) => page.getByRole('banner')
/** The header's Search: a labelled field from 72rem, a reading glass below. */
const headerSearch = (page: Page) => banner(page).getByRole('link', { name: 'Search', exact: true })
const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' })
const field = (page: Page) => palette(page).getByRole('combobox', { name: 'Search Care4Mind' })
const options = (page: Page) => palette(page).getByRole('option')
/** The option the arrow keys have reached: the one the field points at. */
async function highlighted(page: Page): Promise<Locator> {
  const id = await field(page).getAttribute('aria-activedescendant')
  return palette(page).locator(`[id="${id}"]`)
}

test.describe('the palette', () => {
  test('opens with Ctrl+K and with ⌘K, never with a single key', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await page.keyboard.press('k')
    await page.keyboard.press('/')
    await expect(palette(page)).toHaveCount(0)

    await page.keyboard.press('Control+k')
    await expect(palette(page)).toBeVisible()
    await expect(field(page)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(palette(page)).toHaveCount(0)

    await page.keyboard.press('Meta+k')
    await expect(palette(page)).toBeVisible()
    await expect(field(page)).toBeFocused()
    // The shortcut again puts it away.
    await page.keyboard.press('Meta+k')
    await expect(palette(page)).toHaveCount(0)
  })

  test('opens from the header’s Search, which names its shortcut for the platform', async ({
    page,
  }) => {
    await gotoReady(page, '/texts/')
    const search = headerSearch(page)
    await expect(search).toHaveAttribute('href', '/search/')
    await expect(search).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(search).toHaveAttribute('aria-keyshortcuts', 'Control+K')
    if (isWide(page)) await expect(search).toHaveAttribute('data-shortcut', 'Ctrl K')
    await search.click()
    await expect(palette(page)).toBeVisible()
    await expect(field(page)).toBeFocused()
  })

  test('shows ⌘K on a Mac', async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      viewport: { width: 1440, height: 900 },
    })
    const page = await context.newPage()
    await gotoReady(page, '/')
    await expect(headerSearch(page)).toHaveAttribute('aria-keyshortcuts', 'Meta+K')
    await expect(headerSearch(page)).toHaveAttribute('data-shortcut', '⌘K')
    await context.close()
  })

  test('keeps the header’s Search the same size as its shortcut appears', async ({
    page,
    browser,
    baseURL,
  }) => {
    test.skip(!isWide(page), 'the shortcut shows from 72rem')
    const still = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      viewport: page.viewportSize(),
    })
    const plain = await still.newPage()
    await plain.goto('/')
    const before = await headerSearch(plain).boundingBox()
    await still.close()
    await gotoReady(page, '/')
    await expect(headerSearch(page)).toHaveAttribute('data-shortcut', 'Ctrl K')
    expect(await headerSearch(page).boundingBox()).toEqual(before)
  })

  test('takes a keyboard from typing to the chosen page, turning it forward', async ({ page }) => {
    await recordPageTurns(page)
    await gotoReady(page, '/')
    await page.keyboard.press('Control+k')
    await page.keyboard.type('vikshepa')

    // Grouped by kind under headings, the best first, with the spelling that matched.
    await expect(palette(page).getByRole('group').first()).toHaveAccessibleName(/^Concepts/)
    const first = options(page).first()
    await expect(first).toHaveAccessibleName(/^Vikṣepa/)
    await expect(first).toContainText(/matched vikshepa/i)
    await expect(await highlighted(page)).toHaveAccessibleName(/^Vikṣepa/)

    await page.keyboard.press('ArrowDown')
    await expect(await highlighted(page)).toHaveAccessibleName(/^Upa-vikṣepa/)
    await page.keyboard.press('ArrowUp')
    await expect(await highlighted(page)).toHaveAccessibleName(/^Vikṣepa/)
    await expect(field(page)).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/concepts\/vikshepa\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vikṣepa')
    await expect(palette(page)).toHaveCount(0)
    const [turn] = await pageTurns(page)
    expectPageTurned(turn, 'forward')
  })

  test('finds a term inside its Concept, and a verse by its locator', async ({ page }) => {
    await gotoReady(page, '/')
    await page.keyboard.press('Control+k')
    await page.keyboard.type('Sanshay')
    const term = options(page).first()
    await expect(term).toHaveAccessibleName(/^Saṃśaya/)
    await expect(term).toContainText('in Vikṣepa')
    await expect(term).toHaveAttribute('href', '/concepts/vikshepa/#samsaya')

    await field(page).fill('YS 1.30')
    await expect(options(page).first()).toHaveAccessibleName(/^Yoga Sūtra 1\.30/)
    await expect(options(page).first()).toHaveAttribute('href', '/texts/yoga-sutra/#1-30')
  })

  test('reads Devanagari, typed or composed through an input method', async ({
    page,
    browserName,
  }) => {
    await gotoReady(page, '/')
    await page.keyboard.press('Control+k')
    await expect(field(page)).toBeFocused()
    await page.keyboard.insertText('विक्षेप')
    const first = options(page).first()
    await expect(first).toHaveAccessibleName(/^Vikṣepa/)
    await expect(first.locator('i[lang="sa-Deva"]')).toHaveText('विक्षेप')

    test.skip(browserName !== 'chromium', 'composition is driven through Chromium’s DevTools')
    await field(page).fill('')
    const session = await page.context().newCDPSession(page)
    // An input method shows each stage of a word before it is committed.
    for (const stage of ['व', 'वि', 'विक्ष', 'विक्षेप']) {
      await session.send('Input.imeSetComposition', {
        text: stage,
        selectionStart: stage.length,
        selectionEnd: stage.length,
      })
    }
    await session.send('Input.insertText', { text: 'विक्षेप' })
    await expect(field(page)).toHaveValue('विक्षेप')
    await expect(options(page).first()).toHaveAccessibleName(/^Vikṣepa/)
  })

  test('announces how many results it found', async ({ page }) => {
    await gotoReady(page, '/')
    await page.keyboard.press('Control+k')
    const status = palette(page).getByRole('status')
    await expect(status).toHaveText('')
    await page.keyboard.type('Tomar')
    await expect(status).toHaveText(/^\d+ results for “Tomar”$/)
    const count = Number((await status.textContent())?.match(/^\d+/)?.[0])
    expect(count).toBeGreaterThanOrEqual(17)
    await field(page).fill('qqqqxz')
    await expect(status).toHaveText('No results for “qqqqxz”')
    await expect(palette(page)).toContainText('Nothing found for “qqqqxz”.')
  })

  test('suggests real searches before anything is typed', async ({ page }) => {
    await gotoReady(page, '/')
    await page.keyboard.press('Control+k')
    const tries = palette(page).getByRole('button')
    for (const name of ['vikshepa', 'विक्षेप', 'YS 1.30', 'Tomar']) {
      await expect(tries.filter({ hasText: name })).toBeVisible()
    }
    await tries.filter({ hasText: 'YS 1.30' }).click()
    await expect(field(page)).toHaveValue('YS 1.30')
    await expect(field(page)).toBeFocused()
    await expect(options(page).first()).toHaveAccessibleName(/^Yoga Sūtra 1\.30/)
  })

  test('gives focus back to whatever opened it', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await headerSearch(page).click()
    await expect(field(page)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(palette(page)).toHaveCount(0)
    await expect(headerSearch(page)).toBeFocused()

    const home = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link').first()
    await home.focus()
    await page.keyboard.press('Control+k')
    await expect(field(page)).toBeFocused()
    await palette(page).getByRole('button', { name: 'Close search' }).click()
    await expect(palette(page)).toHaveCount(0)
    await expect(home).toBeFocused()
  })

  test('opens from the Menu’s Drawer once it has closed, and gives focus to Menu after', async ({
    page,
  }) => {
    test.skip(isWide(page), 'the Drawer is for narrow screens')
    await gotoReady(page, '/concepts/vikshepa/')
    await banner(page).getByRole('button', { name: 'Menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Menu' })
    await drawer.getByRole('link', { name: 'Search' }).click()
    await expect(palette(page)).toBeVisible()
    await expect(drawer).toHaveCount(0)
    await expect(field(page)).toBeFocused()
    // Nothing the Drawer does as it goes takes focus from the field.
    await page.waitForTimeout(700)
    await expect(field(page)).toBeFocused()
    await page.keyboard.type('vikshepa')
    await expect(options(page).first()).toHaveAccessibleName(/^Vikṣepa/)
    await page.keyboard.press('Escape')
    await expect(banner(page).getByRole('button', { name: 'Menu' })).toBeFocused()
  })

  test('opens and closes without movement under reduced motion, and still works', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoReady(page, '/')
    await page.keyboard.press('Control+k')
    await expect(palette(page)).toBeVisible()
    const moving = () =>
      page.evaluate(() =>
        document
          .getAnimations()
          .map((animation) => animation.effect?.getComputedTiming().duration)
          .filter((duration) => typeof duration === 'number' && duration > 1),
      )
    expect(await moving()).toEqual([])
    await page.keyboard.type('vikshepa')
    await expect(options(page).first()).toHaveAccessibleName(/^Vikṣepa/)
    await page.keyboard.press('Escape')
    await expect(palette(page)).toHaveCount(0)
    expect(await moving()).toEqual([])
  })

  test('passes axe while open, empty and with results', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    await page.keyboard.press('Control+k')
    await expect(field(page)).toBeFocused()
    await expectNoAxeViolations(page, 'the empty palette')
    await page.keyboard.type('vikshepa')
    await expect(options(page).first()).toBeVisible()
    await expectNoAxeViolations(page, 'the palette with results')
  })

  test('loads its code and the index only after the page has loaded', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const resources = () =>
      page.evaluate(() => {
        const loaded = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        return performance.getEntriesByType('resource').map(({ name, startTime }) => ({
          path: new URL(name).pathname,
          early: startTime < loaded.loadEventEnd,
        }))
      })
    // The palette's code is the script that names its field.
    const holdsPalette = async (path: string) =>
      path.endsWith('.js') &&
      (await (await page.request.get(path)).text()).includes('Search Care4Mind')

    await expect
      .poll(async () => (await resources()).some(({ path }) => path === '/search-index.json'))
      .toBe(true)
    const all = await resources()
    expect(all.find(({ path }) => path === '/search-index.json')?.early).toBe(false)
    const early = all.filter(({ early }) => early).map(({ path }) => path)
    for (const path of early) expect(await holdsPalette(path), path).toBe(false)
    const late = all.filter(({ early }) => !early).map(({ path }) => path)
    expect(await Promise.all(late.map(holdsPalette))).toContain(true)
  })
})

test.describe('the results page', () => {
  test('refines as you type, keeping the address, and focuses the results on search', async ({
    page,
  }) => {
    await gotoReady(page, '/search/')
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Search by any spelling')
    const input = page.getByRole('searchbox', { name: /A Concept, a term/ })
    await input.fill('brahma vihara')
    const results = page.getByRole('heading', { level: 2 })
    await expect(results).toHaveText(/^\d+ results? for “brahma vihara”$/)
    await expect(page).toHaveURL(/\/search\/\?q=brahma(%20|\+)vihara$/)
    await expect(
      page.getByRole('main').getByRole('link').filter({ hasText: 'Brahmavihāra' }).first(),
    ).toBeVisible()
    await input.press('Enter')
    await expect(results).toBeFocused()

    await input.fill('qqqqxz')
    await expect(results).toHaveText('Nothing found for “qqqqxz”')
    await expect(page.getByRole('main').getByRole('link', { name: 'Tomar' })).toBeVisible()
  })

  test('passes axe with results', async ({ page }) => {
    await gotoReady(page, '/search/?q=vikshepa')
    await expectNoAxeViolations(page, '/search/?q=vikshepa')
  })

  test('names its place: Home › Search', async ({ page }) => {
    await gotoReady(page, '/search/')
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(crumbs.getByRole('listitem')).toHaveText(['Home', 'Search'])
    await expect(crumbs.getByText('Search')).toHaveAttribute('aria-current', 'page')
  })
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('/search/?q=vikshepa lists the results, grouped, with the spelling that matched', async ({
    page,
  }) => {
    await page.goto('/search/?q=vikshepa')
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(/^\d+ results for “vikshepa”$/)
    const concepts = page.getByRole('region', { name: /^Concepts/ })
    await expect(page.getByRole('heading', { level: 3 }).first()).toHaveText(/^Concepts/)
    const first = concepts.getByRole('listitem').first()
    await expect(first.getByRole('link')).toHaveText('Vikṣepa')
    await expect(first.getByRole('link')).toHaveAttribute('href', '/concepts/vikshepa/')
    await expect(first).toContainText(/matched vikshepa/i)
  })

  test('searches by the form, and the header’s Search is a link to the page', async ({ page }) => {
    await page.goto('/')
    await expect(headerSearch(page)).toHaveAttribute('href', '/search/')
    await expect(headerSearch(page)).not.toHaveAttribute('aria-haspopup', /./)
    await page.goto('/search/')
    await page.getByRole('searchbox').fill('Sanshay')
    await page.getByRole('searchbox').press('Enter')
    await expect(page).toHaveURL(/\/search\/\?q=Sanshay$/)
    await expect(page.getByRole('link', { name: /^Saṃśaya/ })).toHaveAttribute(
      'href',
      '/concepts/vikshepa/#samsaya',
    )
  })
})

test('the index is built once, answers without a redirect, and stays under 45 kB gzipped', async ({
  request,
}) => {
  const response = await request.get('/search-index.json', { maxRedirects: 0 })
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/json')
  const body = await response.body()
  expect(gzipSync(body, { level: 9 }).length).toBeLessThanOrEqual(45 * 1024)
  const index = JSON.parse(body.toString()) as { rows: unknown[] }
  expect(index.rows.length).toBeGreaterThan(400)
})
