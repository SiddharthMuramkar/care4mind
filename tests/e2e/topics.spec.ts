import type { Locator, Page } from '@playwright/test'

import { hrefFor, topics } from '@/content'

import { expectNoAxeViolations } from './axe'
import { undrawn } from './drawings'
import { focusRingContrast } from './focus-ring'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'

// The topic pages: each topic's Concepts as cards and as a contents
// plate set like a book's, the verses they quote, and the values topic's shared introduction.

const mind = await topics.get('mind')
const values = await topics.get('values')
if (!mind || !values) throw new Error('The mind and values topics are in the content.')
/** The verses the mind topic's Concepts quote, in the order its page lists them. */
const quoted = mind.works.flatMap((work) => work.verses)

/** Every Concept in a topic, those whose primary topic it is first, as the plate numbers them. */
const conceptsOf = (topic: NonNullable<typeof mind>) => [
  ...topic.concepts,
  ...topic.secondaryConcepts,
]

/** A Concept as the plate names it: its Sanskrit name, then its gloss where it has one. */
const plateName = (concept: { name: string; gloss?: string }) =>
  concept.gloss ? `${concept.name} · ${concept.gloss}` : concept.name

const plate = (page: Page) => page.getByRole('navigation', { name: 'Contents' })
const row = (page: Page, name: string) =>
  plate(page)
    .getByRole('listitem')
    .filter({ has: page.getByRole('link', { name, exact: true }) })
/** A Concept's card, by its one link. */
const card = (page: Page, name: string) =>
  page.getByRole('link', { name: `Read about ${name}`, exact: true })

/**
 * How a row looks: its name's colour, and how much of its dotted leader is inked, from 0 to 1
 * (the ink is uncovered from the centre, so `inset(0px 50%)` is none of it and `inset(0px)` all).
 */
const looks = (row: Locator) =>
  row.evaluate((item) => {
    const name = item.querySelector('a > :not([aria-hidden])')
    const ink = item.querySelector('[data-leader] > *')
    const sides = /^inset\(\S+(?: ([\d.]+)%)?/.exec(ink ? getComputedStyle(ink).clipPath : '')
    return {
      color: name ? getComputedStyle(name).color : '',
      ink: sides ? 1 - Number(sides[1] ?? 0) / 50 : NaN,
    }
  })

const UNINKED = 0
const INKED = 1

test('lists its Concepts as cards, and as contents rows that are links to them', async ({
  page,
}) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const concepts = conceptsOf(mind)
  const links = plate(page).getByRole('link')
  await expect(links).toHaveText(concepts.map(plateName))
  for (const [index, concept] of concepts.entries())
    await expect(links.nth(index)).toHaveAttribute('href', concept.href)
  for (const concept of concepts) await expect(card(page, concept.name)).toBeVisible()
  // The numerals and leaders are decoration: each row's link is named by its Concept's name and gloss.
  await expect(plate(page).locator('[aria-hidden="true"]').first()).toBeAttached()
})

test('every Concept card shows its topic chip and reading time', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  for (const concept of conceptsOf(mind)) {
    const article = page
      .getByRole('region', { name: 'Its Concepts' })
      .getByRole('listitem')
      .filter({ has: card(page, concept.name) })
    const minutes = concept.readingMinutes
    await expect(article.locator(`[data-topic="${concept.topic.slug}"]`)).toHaveText(
      concept.topic.name,
    )
    await expect(article).toContainText(
      `About ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} to read`,
    )
  }
})

test('says how many Concepts it has, how many verses they quote and from which works', async ({
  page,
}) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const facts = page.getByRole('main').getByText(/\d+ Concepts ·/)
  await expect(facts).toContainText(`${mind.conceptCount} Concepts`)
  await expect(facts).toContainText(`${quoted.length} verses quoted`)
  for (const work of mind.works) await expect(facts).toContainText(work.title)
})

test('lists the verses its Concepts quote, each leading to its passage', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const verses = page.getByRole('region', { name: 'Verses its Concepts quote' })
  const links = verses.getByRole('listitem').getByRole('link')
  await expect(links).toHaveCount(quoted.length)
  for (const [index, verse] of quoted.entries())
    await expect(links.nth(index)).toHaveAttribute('href', verse.href)
})

test('opens a verse after its speaker’s line, even one joined by sandhi', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const verse = quoted.find(({ id }) => id === 'bhagavad-gita/2.55')
  if (!verse) throw new Error('The mind topic quotes Bhagavad Gītā 2.55.')
  const link = page
    .getByRole('region', { name: 'Verses its Concepts quote' })
    .locator(`a[href="${verse.href}"]`)
  await expect(link).toContainText('प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान्')
  await expect(link).not.toContainText('उवाच')
})

test('focusing a card lights its row and inks in the row’s leader', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const [first, second] = conceptsOf(mind)
  if (!first || !second) throw new Error('The mind topic has two Concepts.')
  const before = await looks(row(page, plateName(first)))
  expect(before.ink, 'a leader is plain dots until its row lights').toBe(UNINKED)

  await card(page, first.name).focus()
  await expect.poll(async () => (await looks(row(page, plateName(first)))).ink).toBe(INKED)
  expect((await looks(row(page, plateName(first)))).color, 'the lit row changes colour').not.toBe(
    before.color,
  )
  expect((await looks(row(page, plateName(second)))).ink, 'only its own row lights').toBe(UNINKED)

  // Pointing at another card moves the light to its row.
  await page.locator(':focus').blur()
  await card(page, second.name).hover()
  await expect.poll(async () => (await looks(row(page, plateName(second)))).ink).toBe(INKED)
  await expect.poll(async () => (await looks(row(page, plateName(first)))).ink).toBe(UNINKED)
})

test('focusing a row lights it too', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const [first] = conceptsOf(mind)
  if (!first) throw new Error('The mind topic has a Concept.')
  await plate(page)
    .getByRole('link', { name: plateName(first), exact: true })
    .focus()
  await expect.poll(async () => (await looks(row(page, plateName(first)))).ink).toBe(INKED)
})

test('under reduced motion a row lights at once, with nothing inking in', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const [first] = conceptsOf(mind)
  if (!first) throw new Error('The mind topic has a Concept.')
  await card(page, first.name).focus()
  expect((await looks(row(page, plateName(first)))).ink).toBe(INKED)
  const long = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((animation) => Number(animation.effect?.getComputedTiming().duration) > 1).length,
  )
  expect(long, 'nothing runs longer than the reduced-motion 1 ms').toBe(0)
})

/** Each topic's Frontispiece, by its file: written out so a wrong assignment fails here. */
const FRONTISPIECES = [
  ['self', 'sage-lights-mind'],
  ['mind', 'sage-paints-mind'],
  ['practice', 'painter-bowl'],
  ['values', 'tree-of-mind'],
  ['temperament', 'farmers'],
] as const

const titlePage = (page: Page) => page.getByRole('main').locator('header')
const frontispiece = (page: Page) => titlePage(page).locator('img')
const medallion = (page: Page) => titlePage(page).locator('span:has(> img)')
const ring = (page: Page) => titlePage(page).locator('span:has(> img) > svg')

/** What a CSS colour resolves to, read through a probe set inside the title page. */
const resolved = (page: Page, value: string, property: 'color' | 'backgroundColor') =>
  titlePage(page).evaluate(
    (header, [value, property]) => {
      const probe = document.createElement('i')
      probe.style[property as 'color'] = value as string
      header.append(probe)
      const colour = getComputedStyle(probe)[property as 'color']
      probe.remove()
      return colour
    },
    [value, property],
  )

for (const [slug, file] of FRONTISPIECES) {
  test(`the ${slug} topic opens with its Frontispiece, decorative and in its colour`, async ({
    page,
  }) => {
    await gotoReady(page, hrefFor({ kind: 'topic', id: slug }))
    const picture = frontispiece(page)
    await expect(picture).toHaveCount(1)
    await expect(picture).toHaveAttribute('alt', '')
    await expect(picture).toHaveAttribute('width', '240')
    await expect(picture).toHaveAttribute('src', new RegExp(`${file}\\.jpg`))
    expect((await picture.getAttribute('srcset'))?.split(', ')).toHaveLength(2)
    await expect(ring(page)).toHaveCSS(
      'color',
      await resolved(page, `var(--color-topic-${slug})`, 'color'),
    )
    await expect(titlePage(page).locator('[data-topic]')).toHaveCount(0)
  })
}

test('the Frontispiece stands centred above the heading, smaller on a phone', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const box = await medallion(page).boundingBox()
  const kicker = await titlePage(page).locator('p').first().boundingBox()
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
  if (!box || !kicker || !heading) throw new Error('The title page has its parts.')
  expect(box.y + box.height).toBeLessThanOrEqual(kicker.y)
  expect(Math.abs(box.x + box.width / 2 - (heading.x + heading.width / 2))).toBeLessThanOrEqual(1)
  const expected = (page.viewportSize()?.width ?? 1440) < 768 ? 200 : 240
  expect(box.width).toBe(expected)
  expect(box.height).toBe(expected)
})

test('while the Plate loads, its circle shows the pale paper colour', async ({ page }) => {
  await page.route('**/_next/image**', (route) => route.abort())
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  await expect(frontispiece(page)).toHaveCSS(
    'background-color',
    await resolved(page, 'var(--color-surface-pale-18)', 'backgroundColor'),
  )
  await expect(frontispiece(page)).toHaveCSS('border-radius', '50%')
})

test('under reduced motion the ring is drawn, with nothing inking in', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const paths = ring(page).locator('path')
  expect(await paths.count()).toBeGreaterThan(0)
  for (const path of await paths.all()) expect(await undrawn(path)).toBe(0)
  expect(await ring(page).evaluate((svg) => svg.getAnimations({ subtree: true }).length)).toBe(0)
})

test(
  'the ring inks in as it scrolls into view, and back as it scrolls out',
  { tag: '@one-width' },
  async ({ page }) => {
    // On so short a screen the Frontispiece is still coming into view at the top of the page.
    await page.setViewportSize({ width: 640, height: 360 })
    await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
    const hairline = ring(page).locator('path[pathLength]').first()
    const scrollTo = (top: number) =>
      page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), top)
    await expect.poll(() => undrawn(hairline)).toBeGreaterThan(0)
    await scrollTo(400)
    await expect.poll(() => undrawn(hairline)).toBe(0)
    await scrollTo(0)
    await expect.poll(() => undrawn(hairline)).toBeGreaterThan(0)
  },
)

test('the values topic shows its yama–niyama introduction; no other topic has one', async ({
  page,
}) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'values' }))
  const main = page.getByRole('main')
  for (const anchor of ['yama', 'niyama']) await expect(main.locator(`#${anchor}`)).toBeVisible()
  for (const entry of values.intro?.toc ?? [])
    await expect(main.getByRole('heading', { name: entry.heading, exact: true })).toBeVisible()

  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  await expect(page.getByRole('main').locator('#yama')).toHaveCount(0)
})

test('a topic card on the A–Z turns the page forward, its title flying into the heading', async ({
  page,
}) => {
  await recordPageTurns(page)
  await gotoReady(page, hrefFor({ page: 'concepts' }))
  const link = page.getByRole('main').getByRole('link', { name: mind.name, exact: true })
  await prefetched(link)
  await link.click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(mind.name)
  const [turn] = await pageTurns(page)
  expectPageTurned(turn, 'forward')
  expect(turn?.flights.map(({ name }) => name)).toContain('topic-title-mind')
})

test(
  'fits a 320 px screen, every contents row still a link',
  { tag: '@self-width' },
  async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await gotoReady(page, hrefFor({ kind: 'topic', id: 'self' }))
    expect(await scrollsSideways(page)).toEqual([])
    for (const link of await plate(page).getByRole('link').all()) await expect(link).toBeVisible()
  },
)

test('has no accessibility violations, with a row lit', async ({ page }) => {
  for (const id of ['mind', 'values']) {
    await gotoReady(page, hrefFor({ kind: 'topic', id }))
    // Fonts in and the whole plate in view, so axe measures the rows as a reader sees them.
    await page.waitForLoadState('networkidle')
    await plate(page).evaluate((nav) => {
      nav.scrollIntoView({ block: 'center', behavior: 'instant' })
      nav.querySelector('a')?.focus({ preventScroll: true })
    })
    await expectNoAxeViolations(page, id)
  }
})

test("a card's focus ring contrasts with the colour behind it", async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const [first] = conceptsOf(mind)
  if (!first) throw new Error('The mind topic has a Concept.')
  expect(await focusRingContrast(page, card(page, first.name))).toBeGreaterThanOrEqual(3)
})
