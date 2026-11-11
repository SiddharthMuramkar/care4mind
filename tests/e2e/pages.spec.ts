import { siteConfig } from '@/config/site'
import { site } from '@/content'

import { concepts, library } from '@/content'

import { expectNoAxeViolations } from './axe'
import { unfinishedDrawings } from './drawings'
import { measureLayout, nearTheEdge, settle, showDeferred } from './edges'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { breathes, lotuses } from './lotuses'
import { at, MISSING, ROUTES_IN_SCOPE } from './routes'

// FR-06, NFR-01, NFR-04: every route in the registry, at 360, 768 and 1440 px. One visit runs
// every check, each soft, so a run names every failure: the route, the width and the rule.
for (const route of ROUTES_IN_SCOPE) {
  test(`${route.path} loads with one h1, fits the screen, passes axe, stays out of search engines, names itself and has its lotuses rest`, async ({
    page,
  }) => {
    const where = at(page, route.path)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const response = await gotoReady(page, route.path)

    expect.soft(response?.status(), `${where}: status`).toBe(200)
    await expect.soft(page.locator('h1'), `${where}: exactly one h1`).toHaveCount(1)
    await expect
      .soft(page.locator('main#main'), `${where}: exactly one main#main, the skip link’s target`)
      .toHaveCount(1)
    expect.soft(await scrollsSideways(page), `${where}: no sideways scroll`).toEqual([])

    // Until launch, search engines are told twice (siteConfig.indexable).
    expect
      .soft(response?.headers()['x-robots-tag'], `${where}: noindex in the X-Robots-Tag header`)
      .toContain('noindex')
    await expect
      .soft(page.locator('meta[name="robots"]'), `${where}: noindex in the robots meta tag`)
      .toHaveAttribute('content', /noindex/)

    const headers = response?.headers() ?? {}
    expect
      .soft(
        [headers['x-content-type-options'], headers['referrer-policy'], headers['x-frame-options']],
        `${where}: the security headers`,
      )
      .toEqual(['nosniff', 'strict-origin-when-cross-origin', 'DENY'])

    // "{name} · Care4Mind", a description and one canonical address, with its slash.
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
      .toHaveAttribute('href', `${siteConfig.url}${route.path}`)
    await expect
      .soft(canonical.first(), `${where}: canonical address ends in /`)
      .toHaveAttribute('href', /\/$/)

    // FR-01: every page below the homepage shows its trail, ending at itself. On a phone every
    // page shows one line of it instead: the link back to the page above.
    if (route.kind !== 'home') {
      const trail = page.getByRole('navigation', { name: 'Breadcrumb', exact: true })
      await expect.soft(trail, `${where}: one Breadcrumb landmark`).toHaveCount(1)
      if ((page.viewportSize()?.width ?? 0) < 768) {
        // A crumb's href is a typed route; read as a plain string, it compares with any other.
        const crumbs: readonly { href: string }[] = await site.trail(route.path)
        const above = crumbs.at(-2)?.href ?? 'the page above'
        const link = trail.getByRole('link')
        await expect
          .soft(link, `${where}: Breadcrumb’s one phone link, to the page above`)
          .toHaveCount(1)
        await expect.soft(link, `${where}: Breadcrumb links to the page above`).toBeVisible()
        await expect
          .soft(link, `${where}: Breadcrumb’s link to the page above`)
          .toHaveAttribute('href', above)
        const box = await trail.boundingBox()
        expect.soft(box?.height ?? 0, `${where}: Breadcrumb on one line`).toBeLessThanOrEqual(50)
      } else {
        const home = trail.getByRole('link', { name: 'Go to home', exact: true })
        await expect.soft(home, `${where}: Breadcrumb links to Home`).toBeVisible()
        await expect.soft(home, `${where}: Breadcrumb’s Home link`).toHaveAttribute('href', '/')
      }
      const current = trail.locator('[aria-current="page"]')
      await expect.soft(current, `${where}: one aria-current="page" crumb`).toHaveCount(1)
      await expect
        .soft(current, `${where}: the current crumb names the page`)
        .toHaveText(route.title)
    }

    // Every footer says where to call for help now, each number dialable and named digit by digit.
    const help = page.locator('footer [data-help-line]')
    for (const [visible, name, tel] of [
      ['14416', '14416: 1 4 4 1 6', 'tel:14416'],
      ['1-800-891-4416', '1-800-891-4416: 1, 8 0 0, 8 9 1, 4 4 1 6', 'tel:18008914416'],
      ['112', '112: 1 1 2', 'tel:112'],
    ] as const) {
      const link = help.getByRole('link', { name, exact: true })
      await expect.soft(link, `${where}: the footer's help line shows ${visible}`).toBeVisible()
      await expect.soft(link, `${where}: ${visible} is the link's visible text`).toHaveText(visible)
      await expect.soft(link, `${where}: ${visible} dials ${tel}`).toHaveAttribute('href', tel)
    }

    // Internal links point at slashed addresses, as rendered here too, after hydration.
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

    // Every lotus is decoration; only the home page's hero breathes.
    const onThisPage = await lotuses(page).all()
    expect.soft(onThisPage.length, `${where}: a lotus`).toBeGreaterThan(0)
    for (const lotus of onThisPage) {
      await expect
        .soft(lotus, `${where}: a lotus hidden from assistive technology`)
        .toHaveAttribute('aria-hidden', 'true')
    }
    const breathing = await Promise.all(onThisPage.map(breathes))
    expect
      .soft(breathing.filter(Boolean).length, `${where}: lotuses that breathe`)
      .toBeLessThanOrEqual(route.path === '/' ? 1 : 0)

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
    await expect(page.locator('main#main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/isn’t in the book/)
    await expect(page.getByRole('link', { name: 'Go to the homepage' })).toBeVisible()
    expect(await scrollsSideways(page)).toEqual([])
    await expectNoAxeViolations(page)
  })

  test('shows the Fleuron, whole and at rest, hidden from assistive technology', async ({
    page,
  }) => {
    await gotoReady(page, MISSING)
    const main = page.getByRole('main')
    const fleuron = main.locator('svg[data-lotus]')
    await expect(fleuron).toHaveCount(1)
    await expect(fleuron).toBeVisible()
    await expect(fleuron).toHaveAttribute('aria-hidden', 'true')
    await expect(main.getByRole('img')).toHaveCount(0)
    expect(await breathes(fleuron), 'it never breathes').toBe(false)
    expect(await unfinishedDrawings(page), 'every stroke whole').toEqual([])
  })
})

// Measured at the two sizes the page sets, on the Medallion's box when the picture has a ring.
test.describe('the 404 page picture', { tag: '@self-width' }, () => {
  for (const { width, size } of [
    { width: 1440, size: 200 },
    { width: 360, size: 160 },
  ]) {
    test(`is decorative, loaded and ${size} px across on a screen ${width} px wide`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await gotoReady(page, MISSING)
      const main = page.getByRole('main')
      const picture = main.locator('img')
      await expect(picture).toHaveCount(1)
      await expect(picture).toBeVisible()
      await expect(picture).toHaveAttribute('alt', '')
      await expect(picture).toHaveAttribute('width', '200')
      await expect(picture).toHaveAttribute('height', '200')
      await expect
        .poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0)
      const box = await main.locator('span:has(> img), img').first().boundingBox()
      expect(box).toMatchObject({ width: size, height: size })
    })
  }
})

// The double frame marks only the hero, verse cards and featured cards; a reading page is a
// paper panel with one thin rule, and below 768 px paper with no frame that runs edge to edge,
// its text 20 px in from both sides (@self-width).
test.describe('the double frame', { tag: '@self-width' }, () => {
  const folio = (page: import('@playwright/test').Page) => page.locator('main [data-paper]').first()

  /** Where the paper stands across the screen, and where the text on it starts and ends. */
  const across = (panel: import('@playwright/test').Locator) =>
    panel.evaluate((element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      const screen = document.documentElement.clientWidth
      return {
        shadow: style.boxShadow,
        fromLeft: rect.left,
        fromRight: screen - rect.right,
        textFromLeft: rect.left + parseFloat(style.paddingLeft),
        textFromRight: screen - (rect.right - parseFloat(style.paddingRight)),
      }
    })

  for (const width of [360, 700]) {
    test(`a reading page at ${width} px (below 768) runs its paper edge to edge, unframed, its text 20 px in`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await gotoReady(page, '/concepts/')
      const panel = folio(page)
      await expect(panel.locator('[data-corner]')).toHaveCount(0)
      const box = await across(panel)
      expect(box.shadow).toBe('none')
      expect(box.fromLeft).toBeCloseTo(0, 0)
      expect(box.fromRight).toBeCloseTo(0, 0)
      expect(box.textFromLeft).toBeCloseTo(20, 0)
      expect(box.textFromRight).toBeCloseTo(20, 0)
    })
  }

  test('a reading page on a wide screen keeps one thin rule and no corners', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await gotoReady(page, '/concepts/')
    const panel = folio(page)
    await expect(panel.locator('[data-corner]')).toHaveCount(0)
    const shadow = await panel.evaluate((element) => getComputedStyle(element).boxShadow)
    expect(shadow).not.toBe('none')
    expect(shadow.match(/inset/g)).toHaveLength(1)
  })

  test('the 404 page below 768 px runs its paper edge to edge too, unframed', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await gotoReady(page, MISSING)
    const panel = folio(page)
    await expect(panel.locator('[data-corner]')).toHaveCount(0)
    const box = await across(panel)
    expect(box.shadow).toBe('none')
    expect(box.fromLeft).toBeCloseTo(0, 0)
    expect(box.fromRight).toBeCloseTo(0, 0)
    expect(box.textFromLeft).toBeCloseTo(20, 0)
    expect(box.textFromRight).toBeCloseTo(20, 0)
  })

  test('the hero and the featured cards keep the frame', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, '/')
    const hero = page.getByRole('heading', { level: 1 }).locator('..')
    await expect(hero.locator('[data-corner]')).toHaveCount(4)
    const cards = page.locator('main ul li article[data-paper]')
    expect(await cards.count()).toBeGreaterThan(0)
    for (const card of await cards.all()) {
      await expect.soft(card.locator('[data-corner]')).toHaveCount(4)
    }
  })

  test('verse cards keep the frame, the reading panel around them does not', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, '/concepts/karta/')
    const verses = page.locator('main figure:has(blockquote)')
    expect(await verses.count()).toBeGreaterThan(0)
    const panel = folio(page)
    // Every corner on the page belongs to a verse card: four each, none to the panel itself.
    const verseCorners = await page
      .locator('main [data-corner]')
      .evaluateAll(
        (corners) =>
          corners.filter((corner) => corner.parentElement?.querySelector('figure, blockquote'))
            .length,
      )
    expect(await page.locator('main [data-corner]').count()).toBe(verseCorners)
    expect(verseCorners).toBeGreaterThan(0)
    expect(verseCorners % 4).toBe(0)
    await expect(panel).toBeVisible()
  })

  test('cards the homepage does not feature keep a single rule', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, '/questionnaires/')
    await expect(page.locator('main [data-corner]')).toHaveCount(0)
  })
})

// On a phone no word or control comes closer than 16 px to a side of the surface it is set on:
// the paper, edge to edge, or the screen around it, at three phone widths (@self-width). The
// header's strip is the site navigation's, which sets its own inset, so the page's content and
// its footer are measured.
for (const route of ROUTES_IN_SCOPE) {
  test(
    `${route.path} keeps every word and control 16 px or more off its surface’s sides at 360, 390 and 412 px`,
    { tag: '@self-width' },
    async ({ page }) => {
      await gotoReady(page, route.path)
      await page.evaluate(() => document.fonts.ready)
      await showDeferred(page)
      for (const width of [360, 390, 412]) {
        await page.setViewportSize({ width, height: 800 })
        await settle(page)
        expect
          .soft(nearTheEdge(await measureLayout(page), 16), `${route.path} at ${width} px`)
          .toEqual([])
      }
    },
  )
}

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

// The plain prose renderer, checked once, at 1440 px (@from-1440).
test.describe('running text', { tag: '@from-1440' }, () => {
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

  test('keeps its paragraphs and lists to the reading measure on a wide screen', async ({
    page,
  }) => {
    const vikshepa = await concepts.get('vikshepa')
    const methods = await library.get('methods')
    if (!vikshepa || methods?.kind !== 'page')
      throw new Error('Vikṣepa and the Therapy approaches page are in the content.')
    for (const { href, sections } of [vikshepa, methods]) {
      await gotoReady(page, href)
      const blocks = page.locator(
        sections.map(({ id }) => `section[id="${id}"] :is(p, ul, ol)`).join(', '),
      )
      expect(await blocks.count(), `${href}: running text`).toBeGreaterThan(0)
      const wider = await blocks.evaluateAll((elements) =>
        elements.flatMap((block) => {
          // The measure in the block's own type, read off a probe set inside it.
          const probe = document.createElement('span')
          probe.style.cssText = 'display: block; width: var(--measure-text); height: 0'
          block.append(probe)
          const measure = probe.getBoundingClientRect().width
          probe.remove()
          const { width } = block.getBoundingClientRect()
          return width > measure + 0.5
            ? [`“${(block.textContent ?? '').slice(0, 40)}”: ${width} px, past ${measure} px`]
            : []
        }),
      )
      expect.soft(wider, `${href}: no block wider than the measure`).toEqual([])
    }
  })
})

test('the texts list sets each title in IAST before its Devanagari, each with its language tag', async ({
  page,
}) => {
  await gotoReady(page, '/texts/')
  const entries = await page.locator('main article').evaluateAll((cards) =>
    cards.map((card) => {
      const iast = card.querySelector('[lang="sa-Latn"], [lang="pi-Latn"]')
      const deva = card.querySelector('[lang="sa-Deva"]')
      return {
        name: card.textContent?.trim().slice(0, 40),
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
