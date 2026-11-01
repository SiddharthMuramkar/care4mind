import type { Locator, Page } from '@playwright/test'

import {
  concepts,
  hrefFor,
  library,
  type PageView,
  references,
  type ResourceItemView,
  type ResourceListView,
  topics,
} from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'

// The Library: its shelf, every Reference in one style with a search box and filters, an author
// rail, "cited in" chips and "Copy citation", the two book lists as spines, the course cards and
// the Therapy approaches tables.

const LIBRARY = hrefFor({ page: 'library' })
const REFERENCES = hrefFor({ page: 'references' })
const all = await references.list()
const topicCards = await topics.list()
const cards = await library.list()
const views = (await Promise.all(cards.map(({ slug }) => library.get(slug)))).flatMap((view) =>
  view ? [view] : [],
)
const lists = views.filter((view): view is ResourceListView => view.kind === 'resource-list')
type Course = Extract<ResourceItemView, { type: 'course' }>
type BookItem = Extract<ResourceItemView, { type: 'reference' }>
const coursesOf = (list: ResourceListView) =>
  list.groups.flatMap(({ items }) => items.filter((item): item is Course => item.type === 'course'))
const booksOf = (group: ResourceListView['groups'][number]) =>
  group.items.filter((item): item is BookItem => item.type === 'reference')
const bookLists = lists.filter((list) => list.groups.some((group) => booksOf(group).length > 0))
const courseLists = lists.filter((list) => coursesOf(list).length > 0)
const textPages = views.filter((view): view is PageView => view.kind === 'page')
/** What each section holds, in the words its spine says it (an independent tally, by its slug). */
const UNITS: Readonly<Record<string, string>> = {
  textbooks: 'books',
  'inspirational-books': 'books',
  courses: 'courses',
  methods: 'sections',
}
const VOLUMES = [
  { title: 'References', href: REFERENCES, holds: `${all.length} sources` },
  ...views.map((view) => ({
    title: view.title,
    href: view.href,
    holds: `${view.kind === 'page' ? view.sections.length : view.groups.flatMap((g) => g.items).length} ${UNITS[view.slug] ?? '?'}`,
  })),
]
const LIBRARY_PAGES = [LIBRARY, ...VOLUMES.map(({ href }) => href)]

// A Reference's topics are those of the Concepts that cite it (and of a topic citing it itself).
const conceptTopics = new Map(
  await Promise.all(
    (await concepts.list()).map(async ({ slug }) => {
      const concept = await concepts.get(slug)
      const slugs = concept ? [concept.topic, ...concept.secondaryTopics].map((t) => t.slug) : []
      return [slug, slugs] as const
    }),
  ),
)
const topicsOf = (reference: (typeof all)[number]) =>
  new Set(
    reference.citedIn.flatMap((record) =>
      record.kind === 'concept'
        ? (conceptTopics.get(record.id) ?? [])
        : record.kind === 'topic'
          ? [record.id]
          : [],
    ),
  )

const entries = (count: number) => `${count} ${count === 1 ? 'entry' : 'entries'}`
const isWide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 768

const list = (page: Page) => page.locator('#az-list')
const entry = (page: Page, anchor: string) => page.locator(`li[id="${anchor}"]`)
const shown = (page: Page) => list(page).locator('li[id^="ref-"]').filter({ visible: true })
const count = (page: Page) => page.getByRole('main').locator('[aria-live="polite"]')
const chip = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const toolbar = (page: Page) => page.getByRole('toolbar', { name: 'Jump to a letter' })
const isFocused = (locator: Locator) =>
  locator.evaluate((element) => element === document.activeElement)
/** The open preview card: Base UI marks it open and the side it sits on. */
const previewCard = (page: Page) => page.locator('[data-open][data-side]').last()

const withDoi = all.find((reference) => reference.doi && reference.authors)
const withoutLink = all.find((reference) => !reference.doi && !reference.url)
if (!withDoi || !withoutLink)
  throw new Error('The content has a Reference with a DOI, and one without a link.')

test.describe('References', () => {
  test('lists every Reference once, in the shared citation style, at the anchor hrefFor() builds', async ({
    page,
  }) => {
    await gotoReady(page, REFERENCES)
    const ids = await list(page)
      .locator('li[id^="ref-"]')
      .evaluateAll((items) => items.map(({ id }) => id))
    expect(ids.toSorted()).toEqual(all.map(({ anchor }) => anchor).toSorted())
    for (const reference of all.slice(0, 3))
      expect(hrefFor({ kind: 'reference', id: reference.id })).toBe(
        `${REFERENCES}#${reference.anchor}`,
      )

    // The Concept pages' style: authors (year). Title. Where. Then its DOI, in words leaving the site.
    const doi = entry(page, withDoi.anchor)
    await expect(doi).toContainText(`${withDoi.authors} (${withDoi.year}).`)
    await expect(doi.locator('cite').first()).toHaveText(withDoi.title)
    const link = doi.getByRole('link', { name: new RegExp(`doi:.*another site`) })
    await expect(link).toHaveAttribute('href', `https://doi.org/${withDoi.doi}`)

    // No DOI or stable address: the stated reason why.
    await expect(entry(page, withoutLink.anchor)).toContainText(withoutLink.noStableLink ?? '?')
  })

  test('shows every record that cites a Reference, and a Concept chip previews it', async ({
    page,
  }) => {
    await gotoReady(page, REFERENCES)
    const cited = await list(page)
      .locator('li[id^="ref-"]')
      .evaluateAll((items) =>
        Object.fromEntries(
          items.map((item) => [
            item.id,
            [...item.querySelectorAll('[data-cited-in] a')].map((a) => a.getAttribute('href')),
          ]),
        ),
      )
    for (const reference of all)
      expect(cited[reference.anchor], reference.id).toEqual(
        reference.citedIn.map(({ href }) => href),
      )

    test.skip(!isWide(page), 'previews open on hover with a mouse')
    const citing = withDoi.citedIn.find(({ kind }) => kind === 'concept')
    const reference = citing
      ? withDoi
      : all.find((r) => r.citedIn.some((c) => c.kind === 'concept'))
    const concept = reference?.citedIn.find(({ kind }) => kind === 'concept')
    if (!reference || !concept) throw new Error('A Reference is cited by a Concept.')
    const chipLink = entry(page, reference.anchor).getByRole('link', { name: concept.title })
    await chipLink.scrollIntoViewIfNeeded()
    await page.mouse.move(1, 1)
    await chipLink.hover()
    await expect(previewCard(page)).toContainText(concept.title)
  })

  test('a citation on a Concept page names the anchor its entry here carries, in view below the rail', async ({
    page,
  }) => {
    await gotoReady(page, hrefFor({ kind: 'concept', id: 'vikshepa' }))
    const citation = page.locator('section a[href^="#ref-"]').first()
    const anchor = ((await citation.getAttribute('href')) ?? '').slice(1)
    const reference = all.find((r) => r.anchor === anchor)
    if (!reference) throw new Error(`${anchor} is a Reference.`)

    await gotoReady(page, reference.href)
    const target = entry(page, anchor)
    await expect(target).toBeInViewport()
    expect(await target.evaluate((element) => element.matches(':target'))).toBe(true)
    // Clear of the sticky header and the letter rail under it.
    const rail = await page.getByRole('navigation', { name: 'Letters' }).boundingBox()
    const box = await target.boundingBox()
    expect(box?.y ?? 0).toBeGreaterThanOrEqual((rail?.y ?? 0) + (rail?.height ?? 0) - 1)
  })

  test('"Copy citation" copies it as plain text, by keyboard, and says so politely', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await gotoReady(page, `${REFERENCES}#${withDoi.anchor}`)
    const copy = entry(page, withDoi.anchor).getByRole('button', { name: /^Copy citation/ })
    await expect(copy).toHaveAccessibleName(`Copy citation ${withDoi.label}`)
    await copy.focus()
    await page.keyboard.press('Enter')
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toBe(
      `${await entry(page, withDoi.anchor).locator('[data-citation]').innerText()} https://doi.org/${withDoi.doi}`.replace(
        /\s+/g,
        ' ',
      ),
    )
    expect(copied).toContain(`${withDoi.authors} (${withDoi.year}). ${withDoi.title}`)
    expect(copied).not.toMatch(/[<>]|another site/)

    const notifications = page.getByRole('region', { name: 'Notifications' })
    await expect(notifications).toHaveAttribute('aria-live', 'polite')
    await expect(notifications.getByText('Citation copied')).toBeVisible()
    await expect(notifications).toContainText(withDoi.label)
    await expect(copy).toBeFocused()
    await expectNoAxeViolations(page, 'References with a toast')
  })
})

test.describe('References: filters', () => {
  const books = all.filter(({ type }) => type === 'book')
  const mind = topicCards.find(({ slug }) => slug === 'mind')
  if (!mind) throw new Error('The mind topic is in the content.')
  const mindBooks = books.filter((reference) => topicsOf(reference).has('mind'))

  test('by mouse: the count is announced, the address keeps it, and Back undoes it', async ({
    page,
  }) => {
    await gotoReady(page, REFERENCES)
    await expect(count(page)).toHaveText(entries(all.length))
    await chip(page, 'Books').click()
    await expect(chip(page, 'Books')).toHaveAttribute('aria-pressed', 'true')
    await expect(count(page)).toHaveText(entries(books.length))
    await expect(shown(page)).toHaveCount(books.length)
    await expect(page).toHaveURL(/\?kind=book$/)

    await chip(page, mind.name).click()
    await expect(count(page)).toHaveText(entries(mindBooks.length))
    await expect(shown(page)).toHaveCount(mindBooks.length)
    await expect(page).toHaveURL(/\?topic=mind&kind=book$/)

    await page.goBack()
    await expect(shown(page)).toHaveCount(books.length)
    await page.goBack()
    await expect(shown(page)).toHaveCount(all.length)
  })

  test('by keyboard: one Tab stop, arrows between chips, Space to press', async ({ page }) => {
    await gotoReady(page, REFERENCES)
    await expect(toolbar(page)).toBeVisible()
    const chips = page.getByRole('group', { name: 'Filter the entries' })
    await chips.getByRole('button').first().focus()
    await page.keyboard.press('ArrowRight')
    const second = chips.getByRole('button').nth(1)
    expect(await isFocused(second)).toBe(true)
    const name = (await second.innerText()).trim()
    await page.keyboard.press('Space')
    await expect(second).toHaveAttribute('aria-pressed', 'true')
    const topic = topicCards.find((card) => card.name === name)
    const expected = topic
      ? all.filter((reference) => topicsOf(reference).has(topic.slug)).length
      : undefined
    if (expected !== undefined) await expect(count(page)).toHaveText(entries(expected))
    else await expect(count(page)).not.toHaveText(entries(all.length))
    await page.keyboard.press('Tab')
    expect(
      await chips.evaluate((group) => group.contains(document.activeElement)),
      'Tab leaves the chips',
    ).toBe(false)
  })

  test('by Concept: a chip for each citing Concept leaves the References it cites', async ({
    page,
  }) => {
    const citing = new Map<string, number>()
    for (const reference of all)
      for (const { kind, id } of reference.citedIn)
        if (kind === 'concept') citing.set(id, (citing.get(id) ?? 0) + 1)
    const conceptCards = await concepts.list()
    const [slug, cites] = [...citing].toSorted((a, b) => b[1] - a[1])[0] ?? []
    const concept = conceptCards.find((card) => card.slug === slug)
    if (!concept || !cites) throw new Error('A Concept cites a Reference.')
    await gotoReady(page, REFERENCES)
    const row = page.getByRole('group', { name: 'Concept', exact: true })
    await expect(row.getByRole('button')).toHaveCount(citing.size)
    await row.getByRole('button', { name: concept.name, exact: true }).click()
    await expect(count(page)).toHaveText(entries(cites))
    await expect(shown(page)).toHaveCount(cites)
    await expect(page).toHaveURL(new RegExp(`\\?concept=${concept.slug}$`))
  })

  test('by search: the words typed leave the entries holding them, whatever their case or marks', async ({
    page,
  }) => {
    const author = withDoi.authors?.split(/[ ,]/)[0] ?? ''
    const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    const holding = all.filter((reference) =>
      fold([reference.authors, reference.title, reference.year].join(' ')).includes(fold(author)),
    )
    await gotoReady(page, REFERENCES)
    const box = page.getByRole('searchbox', { name: 'Search by author, title or year' })
    await box.fill(author.toUpperCase())
    await expect(shown(page).first()).toBeVisible()
    expect(await shown(page).count()).toBeGreaterThanOrEqual(holding.length)
    await expect(entry(page, withDoi.anchor)).toBeVisible()
    expect(await shown(page).count()).toBeLessThan(all.length)
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(box).toHaveValue('')
    await expect(shown(page)).toHaveCount(all.length)
  })

  test('has no accessibility violations with a filter applied', async ({ page }) => {
    await gotoReady(page, `${REFERENCES}?kind=book`)
    await expect(count(page)).toHaveText(entries(books.length))
    await expectNoAxeViolations(page, 'filtered References')
  })
})

test.describe('References: the author rail', () => {
  test('is one Tab stop, arrows between letters, Enter jumps to the first author', async ({
    page,
  }) => {
    await gotoReady(page, REFERENCES)
    await expect(toolbar(page)).toBeVisible()
    const initials = new Set(
      all.map((r) => (r.authors ?? r.title).normalize('NFD').charAt(0).toUpperCase()),
    )
    const letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
    const filled = letters.filter((letter) => initials.has(letter))
    const [first, second] = filled
    const a = toolbar(page).getByRole('link', { name: first, exact: true })
    const b = toolbar(page).getByRole('link', { name: second, exact: true })
    await a.focus()
    await page.keyboard.press('ArrowRight')
    expect(await isFocused(b)).toBe(true)
    await page.keyboard.press('Tab')
    expect(await toolbar(page).evaluate((rail) => rail.contains(document.activeElement))).toBe(
      false,
    )
    await page.keyboard.press('Shift+Tab')
    expect(await isFocused(b), 'Shift+Tab comes back to the letter it left').toBe(true)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(new RegExp(`#letter-${(second ?? '').toLowerCase()}$`))
    const firstAuthor = all.find(
      (r) => (r.authors ?? r.title).normalize('NFD').charAt(0).toUpperCase() === second,
    )
    await expect(entry(page, firstAuthor?.anchor ?? '?')).toBeInViewport()
    for (const letter of letters.filter((letter) => !initials.has(letter))) {
      await expect(toolbar(page).getByRole('link', { name: letter, exact: true })).toHaveCount(0)
      await expect(toolbar(page).getByText(letter, { exact: true })).toHaveCount(1)
    }
  })
})

test.describe('References: a long list', () => {
  test('lets the browser skip off-screen entries, keeping their space, and loads without a shift', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      let shift = 0
      Object.defineProperty(window, '__shift', { get: () => shift })
      new PerformanceObserver((records) => {
        for (const record of records.getEntries() as (PerformanceEntry & { value: number })[])
          shift += record.value
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await gotoReady(page, REFERENCES)
    await expect(toolbar(page)).toBeVisible()
    const style = await entry(page, all.at(-1)?.anchor ?? '?').evaluate((element) => {
      const computed = getComputedStyle(element)
      return [computed.contentVisibility, computed.containIntrinsicBlockSize]
    })
    expect(style[0]).toBe('auto')
    expect(style[1]).toMatch(/^auto \d/)
    expect(
      await page.evaluate(() => (window as unknown as { __shift: number }).__shift),
    ).toBeLessThan(0.1)
  })
})

test.describe('References without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('shows every entry and every filled letter, and no chips', async ({ page }) => {
    await page.goto(`${REFERENCES}?kind=book`)
    await expect(shown(page)).toHaveCount(all.length)
    await expect(page.getByRole('button', { name: 'Books', exact: true })).toBeHidden()
    await expect(
      page.getByRole('navigation', { name: 'Letters' }).getByRole('link'),
    ).not.toHaveCount(0)
  })
})

test.describe('The Library home', () => {
  test('stands its five sections on a shelf, each leading to its page with what it holds', async ({
    page,
  }) => {
    await gotoReady(page, LIBRARY)
    const links = page.getByRole('navigation', { name: 'The Library’s sections' }).getByRole('link')
    await expect(links).toHaveCount(5)
    for (const [at, volume] of VOLUMES.entries()) {
      await expect(links.nth(at)).toHaveAccessibleName(`${volume.title} ${volume.holds}`)
      await expect(links.nth(at)).toHaveAttribute('href', volume.href)
      await expect(links.nth(at)).toBeVisible()
    }
    // No images: nothing from the current site but its words.
    await expect(page.getByRole('main').locator('img, picture, video, svg image')).toHaveCount(0)
  })

  test('a volume lifts from the shelf under the pointer and turns the page forward', async ({
    page,
  }) => {
    await recordPageTurns(page)
    await gotoReady(page, LIBRARY)
    const volume = VOLUMES[1]
    if (!volume) throw new Error('The Library has a reading list.')
    const link = page
      .getByRole('navigation', { name: 'The Library’s sections' })
      .getByRole('link', { name: `${volume.title} ${volume.holds}` })
    await prefetched(link)
    if ((page.viewportSize()?.width ?? 0) >= 640)
      await expect
        .poll(() => link.evaluate((element) => getComputedStyle(element).transform))
        .not.toBe('none')
    await link.click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(volume.title)
    const [turn] = await pageTurns(page)
    expectPageTurned(turn, 'forward')
  })
})

test('every Library page has its breadcrumbs: Home › Library › the page', async ({ page }) => {
  for (const path of LIBRARY_PAGES) {
    await gotoReady(page, path)
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem')
    const title = VOLUMES.find(({ href }) => href === path)?.title
    await expect(crumbs, path).toHaveText(title ? ['Home', 'Library', title] : ['Home', 'Library'])
    await expect(crumbs.last().locator('[aria-current="page"]')).toHaveCount(1)
  }
})

for (const list of bookLists)
  test.describe(`${list.title}: the books`, () => {
    test('stand on a shelf per group, set in type, over each book with its note', async ({
      page,
    }) => {
      await gotoReady(page, list.href)
      // A list's only group shows no heading: it would repeat the page's title.
      const headed = list.groups.length > 1
      for (const group of list.groups) {
        // The group keeps the anchor the old addresses redirect to.
        const section = page.locator(`section[id="${group.id}"]`)
        if (headed)
          await expect(section.getByRole('heading', { level: 2 })).toHaveText(group.heading)
        else await expect(section.getByRole('heading', { level: 2 })).toHaveCount(0)
        const shelf = section.getByRole('navigation', { name: `Shelf: ${group.heading}` })
        if (isWide(page)) {
          await expect(shelf.getByRole('link')).toHaveCount(booksOf(group).length)
          for (const [at, { reference }] of booksOf(group).entries()) {
            const spine = shelf.getByRole('link').nth(at)
            await expect(spine).toHaveAttribute('href', `#${reference.anchor}`)
            await expect(spine).toContainText(reference.title)
          }
        } else await expect(shelf, 'a phone shows the list alone').toBeHidden()
        for (const { reference, annotation } of booksOf(group)) {
          const book = section.locator(`li[id="${reference.anchor}"]`)
          await expect(book.getByRole('heading', { level: 3 })).toHaveText(reference.title)
          if (reference.authors) await expect(book).toContainText(reference.authors)
          if (annotation) await expect(book).toContainText(annotation)
          await expect(book.getByRole('link', { name: 'In References' })).toHaveAttribute(
            'href',
            reference.href,
          )
        }
      }
      // Shops and other sites are named as such, in words (the provenance's sources are the old site's pages).
      const away = page.getByRole('main').locator('section[id] a[href^="http"]')
      await expect(away).not.toHaveCount(0)
      for (const link of await away.all())
        await expect(link).toHaveAccessibleName(/, another site$/)
    })

    test('a spine leads to its book below, which takes the eye', async ({ page }) => {
      test.skip(!isWide(page), 'the shelf stands on wide screens')
      await gotoReady(page, list.href)
      const group = list.groups.at(-1)
      const book = group && booksOf(group).at(-1)
      if (!group || !book) throw new Error(`${list.title} has a book.`)
      const spine = page
        .getByRole('navigation', { name: `Shelf: ${group.heading}` })
        .getByRole('link')
        .last()
      await spine.scrollIntoViewIfNeeded()
      await spine.click()
      await expect(page).toHaveURL(new RegExp(`#${book.reference.anchor}$`))
      const entry = page.locator(`li[id="${book.reference.anchor}"]`)
      await expect(entry).toBeInViewport()
      expect(await entry.evaluate((element) => element.matches(':target'))).toBe(true)
    })
  })

for (const list of courseLists)
  test(`${list.title}: each course is a card with its name, institution, city, description and link`, async ({
    page,
  }) => {
    await gotoReady(page, list.href)
    for (const group of list.groups)
      await expect(
        page.locator(`section[id="${group.id}"]`).getByRole('heading', { level: 2 }),
      ).toHaveText(list.groups.length > 1 ? group.heading : [])
    for (const course of coursesOf(list)) {
      const card = page
        .getByRole('main')
        .getByRole('listitem')
        .filter({ has: page.getByRole('heading', { level: 3, name: course.name, exact: true }) })
        .filter({ hasText: course.provider })
      await expect(card, course.name).toHaveCount(1)
      if (course.city) await expect(card).toContainText(course.city)
      if (course.description) await expect(card).toContainText(course.description)
      if (course.url) {
        const link = card.getByRole('link')
        await expect(link).toHaveAttribute('href', course.url)
        await expect(link).toHaveAccessibleName(/^Visit .+, another site$/)
      } else await expect(card.getByRole('link')).toHaveCount(0)
    }
  })

for (const textPage of textPages)
  test(`${textPage.title}: its sections, each table scrolling in its own named, focusable frame`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await gotoReady(page, textPage.href)
    const contents = page.getByRole('navigation', { name: 'Contents' })
    await expect(contents.getByRole('link')).toHaveCount(textPage.toc.length)
    for (const section of textPage.sections)
      await expect(
        page.locator(`section[id="${section.id}"]`).getByRole('heading', { level: 2 }),
      ).toHaveText(section.heading)
    const tables = textPage.sections.flatMap(({ blocks }) =>
      blocks.flatMap((block) => (block.kind === 'table' ? [block] : [])),
    )
    expect(tables.length).toBeGreaterThan(0)
    // The summary opens the page once: no section repeats it.
    await expect(page.getByRole('main').getByText(textPage.summary, { exact: false })).toHaveCount(
      1,
    )
    for (const table of tables) {
      const frame = page.getByRole('region', { name: table.caption })
      await frame.scrollIntoViewIfNeeded()
      await frame.focus()
      await expect(frame).toBeFocused()
      expect(await frame.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
        true,
      )
      await page.keyboard.press('ArrowRight')
      await expect.poll(() => frame.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
    }
    expect(await scrollsSideways(page)).toEqual([])
  })

test.describe('Every Library page without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('shows its whole content', async ({ page }) => {
    await page.goto(LIBRARY)
    await expect(
      page.getByRole('navigation', { name: 'The Library’s sections' }).getByRole('link'),
    ).toHaveCount(5)
    for (const list of bookLists) {
      await page.goto(list.href)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(list.title)
      for (const group of list.groups)
        for (const { reference } of booksOf(group))
          await expect(page.locator(`li[id="${reference.anchor}"]`)).toBeVisible()
    }
    for (const list of courseLists) {
      await page.goto(list.href)
      await expect(page.getByRole('main').getByRole('heading', { level: 3 })).toHaveCount(
        coursesOf(list).length,
      )
    }
    for (const textPage of textPages) {
      await page.goto(textPage.href)
      await expect(page.getByRole('main').getByRole('table')).not.toHaveCount(0)
      await expect(page.getByRole('main').getByRole('table').first()).toBeVisible()
    }
  })
})

test('every Library page fits 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  for (const path of LIBRARY_PAGES) {
    await gotoReady(page, path)
    expect(await scrollsSideways(page), path).toEqual([])
  }
})
