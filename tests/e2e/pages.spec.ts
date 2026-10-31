import { site } from '@/config/site'

import { expectNoAxeViolations } from './axe'
import { unfinishedDrawings } from './drawings'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { breathes, lotuses, moving } from './lotuses'
import { at, MISSING, ROUTES_IN_SCOPE } from './routes'

// FR-06, NFR-01, NFR-04: every route in the registry, at 360, 768 and 1440 px. One visit runs
// every check, each soft, so a run names every failure: the route, the width and the rule.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} loads with one h1, fits the screen, passes axe, stays out of search engines, names itself and has its lotuses breathe`, async ({
    page,
  }) => {
    const where = at(page, route.path)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const response = await gotoReady(page, route.path)

    expect.soft(response?.status(), `${where}: status`).toBe(200)
    await expect.soft(page.locator('h1'), `${where}: exactly one h1`).toHaveCount(1)
    expect.soft(await scrollsSideways(page), `${where}: no sideways scroll`).toEqual([])

    // Until launch, search engines are told twice (site.indexable).
    expect
      .soft(response?.headers()['x-robots-tag'], `${where}: noindex in the X-Robots-Tag header`)
      .toContain('noindex')
    await expect
      .soft(page.locator('meta[name="robots"]'), `${where}: noindex in the robots meta tag`)
      .toHaveAttribute('content', /noindex/)

    // D19: "{name} · Care4Mind", a description and one canonical address, with its slash.
    await expect
      .soft(page, `${where}: title`)
      .toHaveTitle(route.kind === 'home' ? 'Care4Mind: Indian psychology' : / · Care4Mind$/)
    await expect
      .soft(page.locator('meta[name="description"]'), `${where}: description`)
      .toHaveAttribute('content', /\S/)
    const canonical = page.locator('link[rel="canonical"]')
    await expect.soft(canonical, `${where}: exactly one canonical link`).toHaveCount(1)
    await expect
      .soft(canonical.first(), `${where}: canonical address`)
      .toHaveAttribute('href', `${site.url}${route.path}`)
    await expect
      .soft(canonical.first(), `${where}: canonical address ends in /`)
      .toHaveAttribute('href', /\/$/)

    // FR-01, D15: every page below the homepage shows its trail, ending at itself.
    if (route.kind !== 'home') {
      const trail = page.getByRole('navigation', { name: 'Breadcrumb', exact: true })
      await expect.soft(trail, `${where}: one Breadcrumb landmark`).toHaveCount(1)
      const home = trail.getByRole('link', { name: 'Home', exact: true })
      await expect.soft(home, `${where}: Breadcrumb links to Home`).toBeVisible()
      await expect.soft(home, `${where}: Breadcrumb’s Home link`).toHaveAttribute('href', '/')
      const current = trail.locator('[aria-current="page"]')
      await expect.soft(current, `${where}: one aria-current="page" crumb`).toHaveCount(1)
      await expect
        .soft(current, `${where}: the current crumb names the page`)
        .toHaveText(route.title)
    }

    // Every footer says where to call for help now, each number dialable.
    const help = page.locator('footer [data-help-line]')
    for (const tel of ['tel:14416', 'tel:18008914416', 'tel:112']) {
      await expect
        .soft(help.locator(`a[href="${tel}"]`), `${where}: the footer's help line links ${tel}`)
        .toHaveCount(1)
    }

    // D02: internal links point at slashed addresses, as rendered here too, after hydration.
    const unslashed = await page
      .locator('a[href^="/"]:not([href^="//"])')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute('href') ?? '')
          .filter((href) => !(href.split(/[?#]/)[0] ?? '').endsWith('/')),
      )
    expect.soft(unslashed, `${where}: internal links without their slash`).toEqual([])

    // A fragment can lead to one place only.
    const repeated = await page.evaluate(() => {
      const seen = new Set<string>()
      return [...document.querySelectorAll('[id]')].flatMap(({ id }) => {
        if (seen.has(id)) return [id]
        seen.add(id)
        return []
      })
    })
    expect.soft(repeated, `${where}: ids used twice`).toEqual([])

    // Every lotus is decoration, and breathes.
    const onThisPage = await lotuses(page).all()
    expect.soft(onThisPage.length, `${where}: a lotus`).toBeGreaterThan(0)
    for (const lotus of onThisPage) {
      await expect
        .soft(lotus, `${where}: a lotus hidden from assistive technology`)
        .toHaveAttribute('aria-hidden', 'true')
      expect.soft(await breathes(lotus), `${where}: a lotus that breathes`).toBe(true)
    }

    expect.soft(errors, `${where}: page errors`).toEqual([])
    await expectNoAxeViolations(page, `${where}: axe at WCAG 2.2 AA`)
  })
}

test.describe('404 page', () => {
  test('returns 404, is not indexed, and passes axe', async ({ page }) => {
    const response = await gotoReady(page, MISSING)
    expect(response?.status()).toBe(404)
    expect(response?.headers()['x-robots-tag']).toContain('noindex')
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/isn’t in the book/)
    await expect(page.getByRole('link', { name: 'Go to the homepage' })).toBeVisible()
    expect(await scrollsSideways(page)).toEqual([])
    await expectNoAxeViolations(page)
  })

  test('shows the Fleuron, whole and breathing, hidden from assistive technology', async ({
    page,
  }) => {
    await gotoReady(page, MISSING)
    const main = page.getByRole('main')
    const fleuron = main.locator('svg')
    await expect(fleuron).toHaveCount(1)
    await expect(fleuron).toBeVisible()
    await expect(fleuron).toHaveAttribute('aria-hidden', 'true')
    await expect(main.getByRole('img')).toHaveCount(0)
    expect(await moving(fleuron), 'it breathes').toBe(true)
    expect(await unfinishedDrawings(page), 'every stroke whole as it breathes').toEqual([])
  })
})

test('the skip link is the first thing keyboard focus reaches, and it works', async ({ page }) => {
  await gotoReady(page, '/concepts/vikshepa/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
})

test('keyboard focus is visible', async ({ page }) => {
  await gotoReady(page, '/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement
    const style = getComputedStyle(element)
    return { width: style.outlineWidth, style: style.outlineStyle }
  })
  expect(outline.style).not.toBe('none')
  expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2)
})

// The plain prose renderer (front-end-site ticket 03), checked once, at 1440 px.
test.describe('running text', () => {
  test.skip(({ viewport }) => viewport?.width !== 1440, 'checked once, at 1440 px')

  test('tags each Devanagari run in it as Sanskrit', async ({ page }) => {
    await page.goto('/concepts/jagat/')
    const run = page.locator('main section p [lang="sa-Deva"]').first()
    await expect(run).toHaveText(/^[ऀ-ॿ]/)
  })

  test('leads an in-text citation to its entry in the page’s References, opening them', async ({
    page,
  }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const citation = page.getByRole('main').getByRole('link', { name: 'Tomar, 2024' }).first()
    await expect(citation).toHaveAttribute('href', '#ref-tomar-2024')
    await citation.click()
    const entry = page.locator('#ref-tomar-2024')
    await expect(entry).toBeVisible()
    await expect(entry).toBeInViewport()
  })

  test('draws every kind of block: lists, terms, tables, verses and shared introductions', async ({
    page,
  }) => {
    await page.goto('/concepts/atma-bandhu/')
    await expect(page.locator('main section :is(ul, ol) > li').first()).toBeVisible()

    await page.goto('/concepts/vikshepa/')
    await expect(page.locator('#samsaya')).toContainText('Saṃśaya')
    await expect(
      page.getByRole('region', { name: /Comparison between Indian and Western/ }),
    ).toBeVisible()

    await page.goto('/concepts/karta/')
    await expect(
      page.locator('main section figure blockquote [lang="sa-Deva"]').first(),
    ).toBeVisible()

    // A values Concept shows the topic's shared introduction once, in its section's place.
    await page.goto('/concepts/ahimsa/')
    const shared = page.getByRole('heading', { name: 'Raja Yoga Foundations: Yama-Niyama' })
    await expect(shared).toHaveCount(1)
    await expect(page.locator('#yama')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Values: yama and niyama' }).first()).toBeVisible()
  })
})

test('the texts list sets each title in IAST before its Devanagari, each with its language tag', async ({
  page,
}) => {
  await gotoReady(page, '/texts/')
  const entries = await page.locator('main li').evaluateAll((items) =>
    items.map((li) => {
      const iast = li.querySelector('[lang="sa-Latn"], [lang="pi-Latn"]')
      const deva = li.querySelector('[lang="sa-Deva"]')
      return {
        name: li.textContent?.trim().slice(0, 40),
        iast: Boolean(iast),
        order:
          !deva || (iast && iast.compareDocumentPosition(deva) & Node.DOCUMENT_POSITION_FOLLOWING)
            ? 'ok'
            : 'wrong',
      }
    }),
  )
  expect(entries.length).toBeGreaterThan(0)
  for (const entry of entries) {
    expect.soft(entry.iast, `${entry.name} has a transliteration`).toBe(true)
    expect.soft(entry.order, `${entry.name} sets IAST first`).toBe('ok')
  }
})
