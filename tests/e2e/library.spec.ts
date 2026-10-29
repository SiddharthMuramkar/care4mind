import type { Locator, Page } from '@playwright/test'

import { concepts, hrefFor, references, topics } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'

// The Library (front-end-site ticket 08): its shelf, every Reference in one style with filters,
// an author rail, "cited in" chips and "Copy citation", the two book lists as spines, the course
// cards and the Methods tables.

const REFERENCES = hrefFor({ page: 'references' })
const all = await references.list()
const topicCards = await topics.list()

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

test('every Library page fits 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  for (const path of [hrefFor({ page: 'library' }), REFERENCES]) {
    await gotoReady(page, path)
    expect(await scrollsSideways(page), path).toEqual([])
  }
})
