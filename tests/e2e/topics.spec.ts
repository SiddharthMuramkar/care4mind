import type { Locator, Page } from '@playwright/test'

import { hrefFor, topics } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'

// The topic pages (front-end-site ticket 06): each topic's Concepts as cards and as a contents
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
  await expect(links).toHaveText(concepts.map(({ name }) => name))
  for (const [index, concept] of concepts.entries())
    await expect(links.nth(index)).toHaveAttribute('href', concept.href)
  for (const concept of concepts) await expect(card(page, concept.name)).toBeVisible()
  // The numerals and leaders are decoration: each row's link is named by its Concept alone.
  await expect(plate(page).locator('[aria-hidden="true"]').first()).toBeAttached()
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

test('focusing a card lights its row and inks in the row’s leader', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const [first, second] = conceptsOf(mind)
  if (!first || !second) throw new Error('The mind topic has two Concepts.')
  const before = await looks(row(page, first.name))
  expect(before.ink, 'a leader is plain dots until its row lights').toBe(UNINKED)

  await card(page, first.name).focus()
  await expect.poll(async () => (await looks(row(page, first.name))).ink).toBe(INKED)
  expect((await looks(row(page, first.name))).color, 'the lit row changes colour').not.toBe(
    before.color,
  )
  expect((await looks(row(page, second.name))).ink, 'only its own row lights').toBe(UNINKED)

  // Pointing at another card moves the light to its row.
  await page.locator(':focus').blur()
  await card(page, second.name).hover()
  await expect.poll(async () => (await looks(row(page, second.name))).ink).toBe(INKED)
  await expect.poll(async () => (await looks(row(page, first.name))).ink).toBe(UNINKED)
})

test('focusing a row lights it too', async ({ page }) => {
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const [first] = conceptsOf(mind)
  if (!first) throw new Error('The mind topic has a Concept.')
  await plate(page).getByRole('link', { name: first.name, exact: true }).focus()
  await expect.poll(async () => (await looks(row(page, first.name))).ink).toBe(INKED)
})

test('under reduced motion a row lights at once, with nothing inking in', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'mind' }))
  const [first] = conceptsOf(mind)
  if (!first) throw new Error('The mind topic has a Concept.')
  await card(page, first.name).focus()
  expect((await looks(row(page, first.name))).ink).toBe(INKED)
  const long = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((animation) => Number(animation.effect?.getComputedTiming().duration) > 1).length,
  )
  expect(long, 'nothing runs longer than the reduced-motion 1 ms').toBe(0)
})

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

test('fits a 320 px screen, every contents row still a link', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await gotoReady(page, hrefFor({ kind: 'topic', id: 'self' }))
  expect(await scrollsSideways(page)).toEqual([])
  for (const link of await plate(page).getByRole('link').all()) await expect(link).toBeVisible()
})

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
