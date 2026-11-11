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
const LIBRARY_PAGES: string[] = [LIBRARY, ...VOLUMES.map(({ href }): string => href)]

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

  test('shows every record that cites a Reference', async ({ page }) => {
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
  })

  test(
    'previews a citing Concept from its chip on the Reference',
    { tag: '@from-768' },
    async ({ page }) => {
      await gotoReady(page, REFERENCES)
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
    },
  )

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
    // The glide to it is smooth: measure where it comes to rest, not where it passes.
    await page.evaluate(
      () =>
        new Promise<void>((done) => {
          let [last, still] = [window.scrollY, 0]
          const check = () => {
            still = window.scrollY === last ? still + 1 : 0
            last = window.scrollY
            if (still >= 5) done()
            else requestAnimationFrame(check)
          }
          requestAnimationFrame(check)
        }),
    )
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

  test('sets the search box’s label directly above it, not at the top of the page', async ({
    page,
  }) => {
    await gotoReady(page, REFERENCES)
    const box = await page.getByRole('searchbox').boundingBox()
    const label = await page.getByText('Search by author, title or year').boundingBox()
    const gap = (box?.y ?? 0) - ((label?.y ?? 0) + (label?.height ?? 0))
    expect(gap, 'pixels from the label down to its box').toBeGreaterThanOrEqual(0)
    expect(gap, 'pixels from the label down to its box').toBeLessThanOrEqual(16)
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
  test(
    'at 390 px, every filled letter is on screen without swiping the rail',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await gotoReady(page, REFERENCES)
      await expect(toolbar(page)).toBeVisible()
      const boxes = await toolbar(page)
        .getByRole('link')
        .evaluateAll((links) =>
          links.map((link) => {
            const { x, width } = link.getBoundingClientRect()
            return { x, right: x + width }
          }),
        )
      expect(boxes.length).toBeGreaterThan(0)
      for (const { x, right } of boxes) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(right).toBeLessThanOrEqual(390)
      }
      expect(await toolbar(page).evaluate((rail) => rail.scrollWidth <= rail.clientWidth + 1)).toBe(
        true,
      )
    },
  )
  test(
    'at 390 px, a letter tap reaches an entry from the first, middle and last letters',
    { tag: '@self-width' },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      const initialOf = (r: (typeof all)[number]) =>
        (r.authors ?? r.title).normalize('NFD').charAt(0).toUpperCase()
      const filled = [...new Set(all.map(initialOf))].filter((l) => /^[A-Z]$/.test(l)).toSorted()
      const sample = [...new Set([filled[0], filled[Math.floor(filled.length / 2)], filled.at(-1)])]
      for (const letter of sample) {
        await gotoReady(page, REFERENCES)
        const target = all.find((r) => initialOf(r) === letter)
        const link = toolbar(page).getByRole('link', { name: letter, exact: true })
        const [rail, top] = await Promise.all([
          toolbar(page).boundingBox(),
          shown(page).first().boundingBox(),
        ])
        expect(rail?.y ?? Infinity, 'the rail comes before the list').toBeLessThan(top?.y ?? 0)
        await link.click()
        await expect(entry(page, target?.anchor ?? '?'), `${letter} in one tap`).toBeInViewport()
        await expect(toolbar(page), 'the rail stays to hand for the next tap').toBeInViewport()
      }
    },
  )
})

test.describe('References: a long list', () => {
  test('draws every entry in full, so an anchor lands true, and loads without a shift', async ({
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
    expect(style[0]).toBe('visible')
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
    // Its only picture is its Sticker, which is decorative: the shelf is words.
    const pictures = page.getByRole('main').locator('img, picture, video, svg image')
    await expect(pictures).toHaveCount(1)
    await expect(pictures).toHaveAttribute('alt', '')
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
    if ((page.viewportSize()?.width ?? 0) >= 768)
      await expect
        .poll(() => link.evaluate((element) => getComputedStyle(element).transform))
        .not.toBe('none')
    await link.click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(volume.title)
    const [turn] = await pageTurns(page)
    expectPageTurned(turn, 'forward')
  })
})

test('every Library page has its breadcrumbs: Go to home › Library › the page', async ({
  page,
}) => {
  for (const path of LIBRARY_PAGES) {
    await gotoReady(page, path)
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem')
    const title = VOLUMES.find(({ href }) => href === path)?.title
    await expect(crumbs, path).toHaveText(
      title ? ['Go to home', 'Library', title] : ['Go to home', 'Library'],
    )
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
        else
          await expect(
            section.getByRole('heading', { name: group.heading, exact: true }),
          ).toHaveCount(0)
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
          // Under a group heading a book's title is an h3; a lone group's books are h2s.
          await expect(book.getByRole('heading', { level: headed ? 3 : 2 })).toHaveText(
            reference.title,
          )
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

    test(
      'a spine leads to its book below, which takes the eye',
      { tag: '@from-768' },
      async ({ page }) => {
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
      },
    )
  })

test.describe('The hover label', { tag: '@from-768' }, () => {
  const INSPIRATIONAL = hrefFor({ kind: 'resource-list', id: 'inspirational-books' })
  const label = (page: Page) => page.locator('[data-hover-label]')
  const book = (page: Page, title: string) =>
    page
      .getByRole('navigation', { name: 'Shelf: Inspirational Books' })
      .getByRole('link', { name: new RegExp(`^${title}`) })

  test('names a book across the page, above its spine, under the pointer', async ({ page }) => {
    await gotoReady(page, INSPIRATIONAL)
    const spine = book(page, 'My experiments with truth')
    await spine.scrollIntoViewIfNeeded()
    await spine.hover()
    await expect(label(page)).toContainText('My experiments with truth')
    await expect(label(page)).toContainText('Gandhi, M. K. · 1993')
    const [plate, below] = await Promise.all([label(page).boundingBox(), spine.boundingBox()])
    expect((plate?.y ?? Infinity) + (plate?.height ?? 0)).toBeLessThanOrEqual(below?.y ?? 0)
  })

  test('comes with keyboard focus, adds nothing to the link’s name, and Escape closes it', async ({
    page,
  }) => {
    await gotoReady(page, INSPIRATIONAL)
    const spine = book(page, 'My experiments with truth')
    await spine.focus()
    await expect(label(page)).toContainText('My experiments with truth')
    await expect(spine).toBeFocused()
    await expect(spine).toHaveAccessibleName('My experiments with truth Gandhi')
    await page.keyboard.press('Escape')
    await expect(label(page)).toBeHidden()
    await expect(spine).toBeFocused()
  })

  test('follows the pointer along the shelf, and the pointer can move onto it', async ({
    page,
  }) => {
    await gotoReady(page, INSPIRATIONAL)
    await book(page, 'My experiments with truth').hover()
    await expect(label(page)).toContainText('My experiments with truth')
    await book(page, 'A search into secret India').hover()
    await expect(label(page)).toContainText('A search into secret India')

    const plate = await label(page).boundingBox()
    if (!plate) throw new Error('The hover label is open.')
    await page.mouse.move(plate.x + plate.width / 2, plate.y + plate.height / 2, { steps: 12 })
    await page.waitForTimeout(500)
    await expect(label(page)).toContainText('A search into secret India')
  })

  test('says what a volume on the Library home holds', async ({ page }) => {
    await gotoReady(page, LIBRARY)
    const volume = VOLUMES[1]
    if (!volume) throw new Error('The Library has a reading list.')
    await page
      .getByRole('navigation', { name: 'The Library’s sections' })
      .getByRole('link', { name: `${volume.title} ${volume.holds}` })
      .hover()
    await expect(label(page)).toContainText(volume.title)
    await expect(label(page)).toContainText(volume.holds)
  })

  test('stays on screen at the shelf’s edge and clear of the site header', async ({ page }) => {
    await gotoReady(page, INSPIRATIONAL)
    const spine = page
      .getByRole('navigation', { name: 'Shelf: Inspirational Books' })
      .getByRole('link')
      .first()
    await spine.hover()
    await expect(label(page)).toBeVisible()
    const beside = await label(page).boundingBox()
    expect(beside?.x ?? -1).toBeGreaterThanOrEqual(0)
    expect((beside?.x ?? 0) + (beside?.width ?? Infinity)).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? 0,
    )

    await page.mouse.move(1, 1)
    await expect(label(page)).toBeHidden()
    // The book's head under the header (64 px): the label slides down rather than under it.
    await spine.evaluate((element) =>
      window.scrollBy({ top: element.getBoundingClientRect().top - 20, behavior: 'instant' }),
    )
    await spine.hover()
    await expect(label(page)).toBeVisible()
    const [slid, under] = await Promise.all([label(page).boundingBox(), spine.boundingBox()])
    expect(slid?.y ?? 0).toBeGreaterThanOrEqual(64)
    // Not flipped to the far end of the book.
    expect((slid?.y ?? Infinity) + (slid?.height ?? 0)).toBeLessThan(
      (under?.y ?? 0) + (under?.height ?? 0),
    )
  })

  test('has no accessibility violations while open', async ({ page }) => {
    // Tall enough not to scroll: axe can't settle the header's colours over a scrolled page.
    await page.setViewportSize({ width: page.viewportSize()?.width ?? 1440, height: 1600 })
    await gotoReady(page, INSPIRATIONAL)
    await book(page, 'My experiments with truth').hover()
    await expect(label(page)).toBeVisible()
    await expectNoAxeViolations(page, 'a shelf with its hover label open')
  })
})

test(
  'at 390 px, the Library home’s lines show no hover label: they read across already',
  { tag: '@self-width' },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoReady(page, LIBRARY)
    await page
      .getByRole('navigation', { name: 'The Library’s sections' })
      .getByRole('link')
      .nth(1)
      .hover()
    const label = page.locator('[data-hover-label]')
    await expect(label, 'it opens, but out of sight').toHaveCount(1)
    await expect(label).toBeHidden()
  },
)

for (const list of courseLists)
  test(`${list.title}: each course is a card with its name, institution, city, description and link`, async ({
    page,
  }) => {
    await gotoReady(page, list.href)
    for (const group of list.groups)
      await expect(
        page.locator(`section[id="${group.id}"]`).getByRole('heading', { level: 2 }),
      ).toHaveText(
        list.groups.length > 1
          ? group.heading
          : group.items.flatMap((item) => (item.type === 'course' ? [item.name] : [])),
      )
    for (const course of coursesOf(list)) {
      const card = page
        .getByRole('main')
        .getByRole('listitem')
        .filter({
          has: page.getByRole('heading', {
            level: list.groups.length > 1 ? 3 : 2,
            name: course.name,
            exact: true,
          }),
        })
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

for (const list of lists)
  test(`${list.title}: shows the one line that says what it holds`, async ({ page }) => {
    await gotoReady(page, list.href)
    await expect(page.getByRole('main').getByText(list.summary, { exact: false })).toHaveCount(1)
  })

test('the book lists switch between Inspirational and Academic, and Courses has no switch', async ({
  page,
}) => {
  const inspirational = lists.find(({ slug }) => slug === 'inspirational-books')
  const academic = lists.find(({ slug }) => slug === 'textbooks')
  const courses = lists.find(({ slug }) => slug === 'courses')
  if (!inspirational || !academic || !courses)
    throw new Error('The Library has both book lists and Courses.')
  for (const [list, other, otherLabel] of [
    [inspirational, academic, 'Academic'],
    [academic, inspirational, 'Inspirational'],
  ] as const) {
    await gotoReady(page, list.href)
    const nav = page.getByRole('navigation', { name: 'Book lists' })
    await expect(nav.getByRole('link')).toHaveCount(2)
    await expect(nav.getByRole('link', { name: otherLabel })).toHaveAttribute('href', other.href)
    expect(await nav.locator('[aria-current="page"]').innerText()).not.toBe(otherLabel)
    await nav.getByRole('link', { name: otherLabel }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(other.title)
  }
  await gotoReady(page, courses.href)
  await expect(page.getByRole('navigation', { name: 'Book lists' })).toHaveCount(0)
})

/**
 * How a table reads in its frame on a phone: whether the frame scrolls sideways; the words of
 * its rows cut off by the frame or the screen, and those broken across two lines; each row
 * whose cells don't stand stacked under its head; and each row head with a slash between two
 * words but no line break allowed after it.
 */
function reading(frame: Locator) {
  return frame.evaluate((element) => {
    const box = element.getBoundingClientRect()
    const right = Math.min(box.right, document.documentElement.clientWidth)
    const cut: string[] = []
    const broken: string[] = []
    const unstacked: string[] = []
    const unbroken: string[] = []
    for (const cell of element.querySelectorAll('tbody :is(th, td)')) {
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        // A word ends at a space, or after a slash, hyphen or dash, where a line may break.
        for (const match of (node.textContent ?? '').matchAll(/[^\s/‐–—-]+[/‐–—-]*/gu)) {
          const range = document.createRange()
          range.setStart(node, match.index)
          range.setEnd(node, match.index + match[0].length)
          const rects = [...range.getClientRects()].filter((rect) => rect.width > 0)
          if (rects.some((rect) => rect.left < box.left - 0.5 || rect.right > right + 0.5))
            cut.push(match[0])
          if (new Set(rects.map((rect) => Math.round(rect.top))).size > 1) broken.push(match[0])
        }
      }
    }
    for (const row of element.querySelectorAll('tbody tr')) {
      const [head, ...cells] = [...row.children].map((cell) => cell.getBoundingClientRect())
      if (
        head &&
        cells.some((cell) => cell.top < head.bottom - 1 || Math.abs(cell.left - head.left) > 1)
      )
        unstacked.push(row.textContent ?? '')
      const th = row.querySelector('th')
      const slashes = (th?.textContent ?? '').match(/\/(?=\S)/g)?.length ?? 0
      if (th && th.querySelectorAll('wbr').length < slashes) unbroken.push(th.textContent ?? '')
    }
    return {
      scrolls: element.scrollWidth > element.clientWidth + 1,
      cut,
      broken,
      unstacked,
      unbroken,
    }
  })
}

for (const textPage of textPages)
  test(
    `${textPage.title}: its sections, each table a stack of cards in its own named, focusable frame, every word in view`,
    { tag: '@self-width' },
    async ({ page }) => {
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
      await expect(
        page.getByRole('main').getByText(textPage.summary, { exact: false }),
      ).toHaveCount(1)
      await page.evaluate(() => document.fonts.ready)
      for (const table of tables) {
        const frame = page.getByRole('region', { name: table.caption })
        await frame.scrollIntoViewIfNeeded()
        await frame.focus()
        await expect(frame).toBeFocused()
        // Every word reads in place: nothing to scroll sideways, none cut off, none split.
        expect(await reading(frame), table.caption).toEqual({
          scrolls: false,
          cut: [],
          broken: [],
          unstacked: [],
          unbroken: [],
        })
        // Each cell is headed by its column's name.
        const labels = await frame
          .locator('tbody td')
          .evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell, '::before').content))
        expect(labels).toEqual(
          table.rows.flatMap((row) =>
            row.cells.map((_, column) =>
              JSON.stringify(table.columns[row.head === undefined ? column : column + 1]),
            ),
          ),
        )
      }
      expect(await scrollsSideways(page)).toEqual([])
    },
  )

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
      await expect(
        page.getByRole('main').getByRole('heading', { level: list.groups.length > 1 ? 3 : 2 }),
      ).toHaveCount(coursesOf(list).length)
    }
    for (const textPage of textPages) {
      await page.goto(textPage.href)
      await expect(page.getByRole('main').getByRole('table')).not.toHaveCount(0)
      await expect(page.getByRole('main').getByRole('table').first()).toBeVisible()
    }
  })
})

test('every Library page fits 320 px', { tag: '@self-width' }, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  for (const path of LIBRARY_PAGES) {
    await gotoReady(page, path)
    expect(await scrollsSideways(page), path).toEqual([])
  }
})
