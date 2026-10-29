import type { Locator, Page } from '@playwright/test'

import { hrefFor, works, type PassageView, type WorkView } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, inScope, scrollsSideways, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'
import { ROUTES } from './routes'

// The traditional texts (front-end-site ticket 07): a shelf of the works the site quotes, and each
// work's page set like a manuscript, every verse it quotes at its own address. No JavaScript.

const shelf = await works.list()
const views = (await Promise.all(shelf.map(({ slug }) => works.get(slug)))).filter(
  (work): work is WorkView => work !== undefined,
)
const work = (slug: string) => {
  const found = views.find((view) => view.slug === slug)
  if (!found) throw new Error(`The ${slug} is in the content.`)
  return found
}
const yogaSutra = work('yoga-sutra')
const gita = work('bhagavad-gita')

const TEXTS = hrefFor({ page: 'texts' })

const main = (page: Page) => page.getByRole('main')
/** A work's card on the shelf, by its title. */
const card = (page: Page, title: string) =>
  main(page)
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: title }) })
/** One verse on a work's page, by its heading: "Sutra 1.30". */
const passage = (page: Page, name: string) => main(page).getByRole('region', { name, exact: true })
const nameOf = (view: WorkView, passage: PassageView) => `${view.locatorLabel} ${passage.locator}`
const rail = (page: Page) => page.getByRole('navigation', { name: 'Verses' })
const hrefs = (links: Locator) =>
  links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))

test.describe('the shelf', () => {
  test('lists every work as a card: its title in both scripts, who composed it, and how many verses it quotes', async ({
    page,
  }) => {
    await gotoReady(page, TEXTS)
    await expect(main(page).getByRole('article')).toHaveCount(shelf.length)
    for (const entry of shelf) {
      const leaf = card(page, entry.title)
      await expect(leaf.getByRole('link')).toHaveAttribute('href', entry.href)
      await expect(leaf.locator(`[lang="${entry.lang}"]`).first()).toHaveText(entry.title)
      if (entry.term.devanagari)
        await expect(leaf.getByRole('heading').locator('[lang="sa-Deva"]')).toHaveText(
          entry.term.devanagari,
        )
      if (entry.english) await expect(leaf).toContainText(entry.english)
      if (entry.attribution) await expect(leaf).toContainText(entry.attribution)
      await expect(leaf).toContainText(
        `${entry.passageCount} ${entry.passageCount === 1 ? 'verse' : 'verses'} quoted`,
      )
    }
    // As the content has them.
    await expect(card(page, 'Yoga Sūtra')).toContainText('Patanjali')
    await expect(card(page, 'Yoga Sūtra')).toContainText('15 verses quoted')
    await expect(
      card(page, 'Bhagavad Gītā').getByRole('heading').locator('[lang="sa-Deva"]'),
    ).toHaveText('भगवद्गीता')
    await expect(card(page, 'Dhammapada')).toContainText('1 verse quoted')
  })

  test('a card turns the page forward, its title flying into the work’s heading', async ({
    page,
  }) => {
    await recordPageTurns(page)
    await gotoReady(page, TEXTS)
    const link = card(page, 'Yoga Sūtra').getByRole('link')
    await prefetched(link)
    await link.click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Yoga Sūtra')
    const [turn] = await pageTurns(page)
    expectPageTurned(turn, 'forward')
    expect(turn?.flights.map(({ name }) => name)).toContain('work-title-yoga-sutra')
  })

  test('a press anywhere on a card opens its work, not only on the title', async ({ page }) => {
    await gotoReady(page, TEXTS)
    const count = card(page, 'Yoga Sūtra').getByText('15 verses quoted')
    await count.scrollIntoViewIfNeeded()
    const box = await count.boundingBox()
    if (!box) throw new Error('The card shows its count.')
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await expect(page).toHaveURL(new RegExp(`${yogaSutra.href}$`))
  })

  test('its breadcrumbs read Home › Texts, and a work’s Home › Texts › the work', async ({
    page,
  }) => {
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem')
    await gotoReady(page, TEXTS)
    await expect(crumbs).toHaveText(['Home', 'Texts'])
    await expect(crumbs.last().locator('[aria-current="page"]')).toHaveText('Texts')
    await gotoReady(page, gita.href)
    await expect(crumbs).toHaveText(['Home', 'Texts', 'Bhagavad Gītā'])
    await expect(crumbs.nth(1).getByRole('link')).toHaveAttribute('href', TEXTS)
    await expect(crumbs.last().locator('[aria-current="page"]')).toHaveText('Bhagavad Gītā')
  })
})

test.describe('a work’s page', () => {
  test('sets every verse the site quotes, in the work’s order, each at the anchor its locator makes, and nothing else', async ({
    page,
  }) => {
    for (const view of views) {
      await gotoReady(page, view.href)
      const verses = main(page).getByRole('region')
      await expect(verses).toHaveCount(view.passages.length)
      for (const [index, verse] of view.passages.entries()) {
        await expect(verses.nth(index)).toHaveAccessibleName(nameOf(view, verse))
        await expect(verses.nth(index)).toHaveAttribute(
          'id',
          new URL(hrefFor({ kind: 'passage', id: verse.id }), 'http://x').hash.slice(1),
        )
      }
      // Commentaries stay out (D08): no page's own reading of a verse comes with it.
      await expect(main(page)).not.toContainText('Meaning')
    }
    // The Yoga Sūtra's own order, as numbered; each locator also in Devanagari digits.
    await gotoReady(page, yogaSutra.href)
    const order = ['1.2', '1.20', '1.21', '1.22', '1.30', '1.31', '1.33']
      .concat(['2.3', '2.5', '2.7', '2.9', '2.30', '2.32', '2.35', '2.36'])
      .map((locator) => `Sutra ${locator}`)
    const regions = main(page).getByRole('region')
    await expect(regions).toHaveCount(order.length)
    for (const [index, name] of order.entries())
      await expect(regions.nth(index)).toHaveAccessibleName(name)
    await expect(passage(page, 'Sutra 1.30')).toHaveAttribute('id', '1-30')
    await expect(passage(page, 'Sutra 1.30')).toContainText('१.३०')
  })

  test('sets the Devanagari and the transliteration with their language tags, and says how the transliteration is written', async ({
    page,
  }) => {
    await gotoReady(page, yogaSutra.href)
    const verse = passage(page, 'Sutra 1.30')
    await expect(
      verse.locator('[lang="sa-Deva"]').filter({ hasText: 'चित्तविक्षेपास्तेऽन्तरायाः' }),
    ).toBeVisible()
    await expect(
      verse.locator('[lang="sa-Latn"]').filter({ hasText: 'cittavikṣepāste’ntarāyāḥ' }),
    ).toBeVisible()
    await expect(verse.getByText('IAST', { exact: true })).toBeVisible()

    await gotoReady(page, work('vedanta-sara').href)
    await expect(
      passage(page, 'Shloka 5.211').getByText('As the source wrote it', { exact: true }),
    ).toBeVisible()

    await gotoReady(page, work('dhammapada').href)
    await expect(passage(page, 'Verse 160').locator('[lang="pi-Latn"]')).toBeVisible()
  })

  test('attributes every translation, and leads to each Concept that quotes the verse', async ({
    page,
  }) => {
    await gotoReady(page, gita.href)
    for (const verse of gita.passages) {
      const region = passage(page, nameOf(gita, verse))
      const chips = region.getByRole('list', { name: 'Quoted in' }).getByRole('link')
      await expect(chips).toHaveText(verse.quotedIn.map(({ title }) => title))
      expect(await hrefs(chips)).toEqual(verse.quotedIn.map(({ href }) => href))

      const translations = region.getByRole('figure')
      await expect(translations).toHaveCount(verse.translations.length)
      for (const [index, translation] of verse.translations.entries()) {
        const caption = translations.nth(index).locator('figcaption')
        if (translation.source) await expect(caption).toContainText(translation.source)
        else {
          // No source named: it is credited to the pages that quote it.
          await expect(caption).toContainText('As quoted in')
          for (const record of translation.quotedIn)
            await expect(caption).toContainText(record.title)
        }
      }
      if (verse.translations.length === 0)
        await expect(region).toContainText('No page quotes a translation of this verse.')
    }
  })

  test('a verse’s address lands on it, marked, its locator clear of the header', async ({
    page,
  }) => {
    await gotoReady(page, `${yogaSutra.href}#1-30`)
    const verse = passage(page, 'Sutra 1.30')
    await expect(verse).toBeInViewport()
    expect(await verse.evaluate((element) => element.matches(':target'))).toBe(true)
    const heading = verse.getByRole('heading', { name: 'Sutra 1.30' })
    const header = page.getByRole('banner')
    await expect
      .poll(async () => {
        const [top, bar] = await Promise.all([heading.boundingBox(), header.boundingBox()])
        return (top?.y ?? 0) - ((bar?.y ?? 0) + (bar?.height ?? 0))
      }, 'the locator sits below the header')
      .toBeGreaterThanOrEqual(0)
    // It looks unlike the verses around it.
    const look = (region: Locator) =>
      region.evaluate((element) => {
        const style = getComputedStyle(element)
        return `${style.backgroundColor} ${style.boxShadow}`
      })
    expect(await look(verse)).not.toBe(await look(passage(page, 'Sutra 1.31')))

    // Each locator is the verse's own address, to cite: following it marks that verse instead.
    const next = passage(page, 'Sutra 1.31')
    await next.getByRole('link', { name: 'Sutra 1.31', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${yogaSutra.href}#1-31$`))
    await expect.poll(() => next.evaluate((element) => element.matches(':target'))).toBe(true)
    expect(await look(next)).not.toBe(await look(passage(page, 'Sutra 1.33')))
    expect(await look(verse)).toBe(await look(passage(page, 'Sutra 1.33')))
  })

  test('on a wide screen its verse rail lists every locator and stays in view as the text scrolls', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await gotoReady(page, gita.href)
    const links = rail(page).getByRole('link')
    await expect(links).toHaveCount(gita.passages.length)
    expect(await hrefs(links)).toEqual(gita.passages.map(({ anchor }) => `#${anchor}`))
    for (const [index, verse] of gita.passages.entries())
      await expect(links.nth(index)).toHaveAccessibleName(verse.locator)

    await passage(page, 'Verse 18.25').scrollIntoViewIfNeeded()
    await expect(rail(page)).toBeInViewport()
    await rail(page).getByRole('link', { name: '14.5', exact: true }).click()
    await expect(page).toHaveURL(/#14-5$/)
    await expect(passage(page, 'Verse 14.5')).toBeInViewport()
  })

  test('on a phone its verse rail is a compact list above the text that doesn’t stick', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await gotoReady(page, gita.href)
    const [list, first] = await Promise.all([
      rail(page).boundingBox(),
      passage(page, 'Verse 2.54').boundingBox(),
    ])
    expect((list?.y ?? 0) + (list?.height ?? 0)).toBeLessThanOrEqual(first?.y ?? 0)
    // Several locators to a line.
    const links = rail(page).getByRole('link')
    const [one, two] = await Promise.all([links.nth(0).boundingBox(), links.nth(1).boundingBox()])
    expect(one?.y).toBe(two?.y)
    await passage(page, 'Verse 18.25').scrollIntoViewIfNeeded()
    await expect(rail(page)).not.toBeInViewport()
  })

  test('wraps its longest verse at 320 px, every line on the page, the Devanagari unclipped on the base line height', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 720 })
    const widest = (verse: PassageView) =>
      Math.max(
        ...verse.devanagari.map((line) => line.length),
        ...(verse.transliteration?.lines ?? []).map((line) => line.length),
      )
    const [longest] = views
      .flatMap((view) => view.passages.map((verse) => ({ view, verse })))
      .sort((a, b) => widest(b.verse) - widest(a.verse))
    if (!longest) throw new Error('The content has verses.')
    await gotoReady(page, longest.view.href)
    await page.waitForLoadState('networkidle')
    expect(await scrollsSideways(page)).toEqual([])

    const verse = passage(page, nameOf(longest.view, longest.verse))
    await verse.scrollIntoViewIfNeeded()
    const spills = await verse.evaluate((region) => {
      const { left, right } = region.getBoundingClientRect()
      return [...region.querySelectorAll('[lang]')]
        .filter((line) => {
          const box = line.getBoundingClientRect()
          return box.left < left - 0.5 || box.right > right + 0.5
        })
        .map((line) => line.textContent)
    })
    expect(spills).toEqual([])

    const devanagari = verse.locator('[lang="sa-Deva"]').filter({ hasText: /[क-ह]/ }).first()
    const clipping = await devanagari.evaluate((line) => {
      const clips: string[] = []
      for (let at: Element | null = line; at && at !== document.body; at = at.parentElement) {
        const style = getComputedStyle(at)
        if (style.overflowX !== 'visible' || style.overflowY !== 'visible') clips.push(at.localName)
      }
      return clips
    })
    expect(clipping, 'nothing clips a conjunct or vowel sign').toEqual([])
    const ratio = (element: Locator) =>
      element.evaluate((node) => {
        const style = getComputedStyle(node)
        return parseFloat(style.lineHeight) / parseFloat(style.fontSize)
      })
    expect(await ratio(devanagari)).toBeCloseTo(await ratio(main(page).getByRole('article')), 2)

    await testInfo.attach(`${longest.verse.label} at 320 px`, {
      body: await verse.screenshot(),
      contentType: 'image/png',
    })
  })
})

test('every verse a Concept links to is at its anchor on its work’s page', async ({ page }) => {
  const anchors = new Map<string, Set<string>>()
  for (const route of inScope(ROUTES.filter(({ kind }) => kind === 'concept'))) {
    await page.goto(route.path)
    for (const href of await hrefs(main(page).locator('a[href^="/texts/"][href*="#"]'))) {
      const url = new URL(href ?? '', 'http://x')
      anchors.set(url.pathname, (anchors.get(url.pathname) ?? new Set()).add(url.hash.slice(1)))
    }
  }
  expect(anchors.size, 'the Concepts link to verses').toBeGreaterThan(0)
  for (const [path, ids] of anchors) {
    await page.goto(path)
    for (const id of ids) await expect(page.locator(`[id="${id}"]`), `${path}#${id}`).toHaveCount(1)
  }
})

test('a “quoted in” chip leads to a Concept page that shows the verse', async ({ page }) => {
  const verse = yogaSutra.passages.find(({ locator }) => locator === '1.30')
  const vikshepa = verse?.quotedIn.find(({ id }) => id === 'vikshepa')
  if (!verse || !vikshepa) throw new Error('Vikṣepa quotes Yoga Sūtra 1.30.')
  await recordPageTurns(page)
  await gotoReady(page, yogaSutra.href)
  const chip = passage(page, 'Sutra 1.30')
    .getByRole('list', { name: 'Quoted in' })
    .getByRole('link', { name: vikshepa.title, exact: true })
  await prefetched(chip)
  await chip.click()
  await expect(page).toHaveURL(new RegExp(`${vikshepa.href}$`))
  await expect(
    main(page)
      .getByRole('figure')
      .filter({ has: page.locator(`a[href="${verse.href}"]`) }),
  ).toBeVisible()
  const [turn] = await pageTurns(page)
  expectPageTurned(turn, 'forward')
})

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false })

  test('the shelf leads to a work, whose rail and verse addresses work in full', async ({
    page,
  }) => {
    await page.goto(TEXTS)
    await expect(main(page).getByRole('article')).toHaveCount(shelf.length)
    await card(page, 'Bhagavad Gītā').getByRole('link').click()
    await expect(page).toHaveURL(new RegExp(`${gita.href}$`))
    await expect(main(page).getByRole('region')).toHaveCount(gita.passages.length)
    await rail(page).getByRole('link', { name: '14.5', exact: true }).click()
    await expect(page).toHaveURL(/#14-5$/)
    await expect(passage(page, 'Verse 14.5')).toBeInViewport()

    await page.goto(`${yogaSutra.href}#2-30`)
    await expect(passage(page, 'Sutra 2.30')).toBeInViewport()
    await expect(
      passage(page, 'Sutra 2.30').getByRole('list', { name: 'Quoted in' }).getByRole('link'),
    ).toHaveCount(4)
  })
})

test('has no accessibility violations on the shelf, or on a work with a verse marked', async ({
  page,
}) => {
  await gotoReady(page, TEXTS)
  await page.waitForLoadState('networkidle')
  await expectNoAxeViolations(page, 'the shelf')
  await gotoReady(page, `${gita.href}#2-54`)
  await page.waitForLoadState('networkidle')
  await expectNoAxeViolations(page, 'a work')
})
