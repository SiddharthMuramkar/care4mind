import type { Locator, Page } from '@playwright/test'

import { hrefFor, site, topics } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { inPageTransitions, recordPageTurns } from './page-turns'

// The Concepts A–Z (front-end-site ticket 06): one list of every Concept, term and glossary
// entry, a rail of letters, and filter chips whose state lives in the address.

const PATH = hrefFor({ page: 'concepts' })
const letters = await site.azIndex()
const all = letters.flatMap(({ entries }) => entries)
const mind = (await topics.list()).find(({ slug }) => slug === 'mind')
if (!mind) throw new Error('The mind topic is in the content.')
const filled = letters.filter(({ entries }) => entries.length > 0).map(({ letter }) => letter)
const blank = letters.filter(({ entries }) => entries.length === 0).map(({ letter }) => letter)
const entries = (count: number) => `${count} ${count === 1 ? 'entry' : 'entries'}`

const list = (page: Page) => page.getByRole('region', { name: 'From A to Z' })
const shown = (page: Page) => list(page).getByRole('listitem').filter({ visible: true })
const count = (page: Page) => page.getByRole('main').locator('[aria-live="polite"]')
const chip = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const rail = (page: Page) => page.getByRole('navigation', { name: 'Letters' })
/** Base UI's rail, once its code has arrived (when the browser is idle). */
const toolbar = (page: Page) => page.getByRole('toolbar', { name: 'Jump to a letter' })

const isFocused = (locator: Locator) =>
  locator.evaluate((element) => element === document.activeElement)

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('shows every entry, every filled letter as a link, and no chips', async ({ page }) => {
    await page.goto(PATH)
    await expect(list(page).getByRole('listitem')).toHaveCount(all.length)
    await expect(shown(page)).toHaveCount(all.length)
    for (const letter of filled)
      await expect(rail(page).getByRole('link', { name: letter, exact: true })).toHaveAttribute(
        'href',
        `#letter-${letter === '#' ? 'other' : letter.toLowerCase()}`,
      )
    for (const letter of blank)
      await expect(rail(page).getByRole('link', { name: letter, exact: true })).toHaveCount(0)
    await expect(chip(page, mind.name)).toBeHidden()
  })
})

test('lists every Concept, term and glossary entry, names in both scripts with their tags', async ({
  page,
}) => {
  await gotoReady(page, PATH)
  await expect(list(page).getByRole('listitem')).toHaveCount(all.length)
  const vikshepa = list(page).getByRole('link', { name: 'Vikṣepa विक्षेप', exact: true })
  await expect(vikshepa).toHaveAttribute('href', hrefFor({ kind: 'concept', id: 'vikshepa' }))
  await expect(vikshepa.locator('[lang="sa-Latn"]')).toHaveText('Vikṣepa')
  await expect(vikshepa.locator('[lang="sa-Deva"]')).toHaveText('विक्षेप')
  // A term explained in a topic's introduction leads to it there.
  await expect(list(page).getByRole('link', { name: /^Yama\b/ })).toHaveAttribute(
    'href',
    hrefFor({ kind: 'topic', id: 'values', anchor: 'yama' }),
  )
})

test('glossary entries lead to their Concept, to DharmaWiki in words, or nowhere', async ({
  page,
}) => {
  await gotoReady(page, PATH)
  const glossary = all.filter(({ kind }) => kind === 'glossary')
  const external = glossary.find(({ external }) => external)
  const plain = glossary.find(({ href }) => href === undefined)
  if (!external?.href) throw new Error('The glossary has entries with a DharmaWiki article.')
  const away = list(page).locator(`[id="${external.anchors[0]}"]`).getByRole('link').first()
  await expect(away).toHaveAttribute('href', external.href)
  await expect(away).toContainText('on DharmaWiki')
  // The content has no entry with neither today; one would show as text.
  if (plain)
    await expect(list(page).locator(`[id="${plain.anchors[0]}"]`).getByRole('link')).toHaveCount(0)
  // Atman's glossary entry is merged into its Concept's, which carries its anchor too.
  const atman = list(page).locator('[id="atman"]')
  await expect(atman.getByRole('link').first()).toHaveAttribute(
    'href',
    hrefFor({ kind: 'concept', id: 'atman' }),
  )
})

test('a glossary anchor reached from the old address shows its entry, clear of the rail', async ({
  page,
}) => {
  await gotoReady(page, '/anubandha-chatushtaya/')
  await expect(page).toHaveURL(/\/concepts\/#anubandha-chatushtaya$/)
  const entry = page.locator('#anubandha-chatushtaya')
  await expect(entry).toBeInViewport()
  const top = (await entry.boundingBox())?.y ?? -1
  const band = await rail(page).boundingBox()
  expect(top, 'the entry starts below the letters').toBeGreaterThanOrEqual(
    (band?.y ?? 0) + (band?.height ?? 0) - 1,
  )
})

test.describe('the letter rail', () => {
  test('is one Tab stop, the arrow keys moving between letters', async ({ page }) => {
    await gotoReady(page, PATH)
    await expect(toolbar(page)).toBeVisible()
    const links = toolbar(page).getByRole('link')
    await expect(links).toHaveText(filled)
    const [first, second] = filled
    const a = toolbar(page).getByRole('link', { name: first, exact: true })
    const b = toolbar(page).getByRole('link', { name: second, exact: true })
    await a.focus()
    await page.keyboard.press('ArrowRight')
    expect(await isFocused(b)).toBe(true)
    await page.keyboard.press('Tab')
    expect(
      await toolbar(page).evaluate((rail) => rail.contains(document.activeElement)),
      'Tab leaves the rail',
    ).toBe(false)
    await page.keyboard.press('Shift+Tab')
    expect(await isFocused(b), 'and comes back to the letter it left').toBe(true)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(new RegExp(`#letter-${(second ?? '').toLowerCase()}$`))
    for (const letter of blank)
      await expect(toolbar(page).getByRole('link', { name: letter, exact: true })).toHaveCount(0)
  })

  test('marks the letter whose section is in view, with CSS alone', async ({ page }) => {
    await gotoReady(page, PATH)
    await expect(toolbar(page)).toBeVisible()
    const first = filled[0] ?? 'A'
    // Chrome marks the next letter when a section is shorter than the band it reads by, so
    // this reads to the fullest letter after the first.
    const middle =
      letters
        .filter(({ letter }) => letter !== first)
        .toSorted((a, b) => b.entries.length - a.entries.length)[0]?.letter ?? 'S'
    const colour = (letter: string) =>
      toolbar(page)
        .getByRole('link', { name: letter, exact: true })
        .evaluate((link) => getComputedStyle(link).color)
    const readTo = (letter: string) =>
      page.locator(`#letter-${letter.toLowerCase()}`).evaluate((section) => {
        section.scrollIntoView({ block: 'start', behavior: 'instant' })
      })
    const plain = await colour(middle)
    await readTo(middle)
    await expect.poll(() => colour(middle)).not.toBe(plain)
    const marked = await colour(middle)
    expect(await colour(first), 'only the letter in view').toBe(plain)
    await readTo(first)
    await expect.poll(() => colour(first), 'the mark follows the reader back').toBe(marked)
    expect(await colour(middle)).toBe(plain)
  })
})

test.describe('the filter chips', () => {
  const inMind = all.filter(({ topics }) => topics.includes('mind'))
  const mindConcepts = inMind.filter(({ kind }) => kind === 'concept')

  test('filter by mouse, announce the count, keep it in the address, and Back undoes it', async ({
    page,
  }) => {
    await gotoReady(page, PATH)
    await expect(count(page)).toHaveText(entries(all.length))
    await chip(page, mind.name).click()
    await expect(chip(page, mind.name)).toHaveAttribute('aria-pressed', 'true')
    await expect(count(page)).toHaveText(entries(inMind.length))
    await expect(shown(page)).toHaveCount(inMind.length)
    await expect(page).toHaveURL(/\?topic=mind$/)

    await chip(page, 'Concept pages').click()
    await expect(count(page)).toHaveText(entries(mindConcepts.length))
    await expect(shown(page)).toHaveCount(mindConcepts.length)
    await expect(page).toHaveURL(/\?topic=mind&kind=concept$/)

    await page.goBack()
    await expect(page).toHaveURL(/\?topic=mind$/)
    await expect(shown(page)).toHaveCount(inMind.length)
    await expect(chip(page, 'Concept pages')).toHaveAttribute('aria-pressed', 'false')
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(shown(page)).toHaveCount(all.length)
  })

  test('keeps the filtered count and rail after an entry and Back', async ({ page }) => {
    // Back remounts the island. The list is its own output, so a count read during render
    // still says the total and the rail still links letters whose sections are hidden.
    await gotoReady(page, PATH)
    await chip(page, mind.name).click()
    await expect(count(page)).toHaveText(entries(inMind.length))
    await expect(shown(page)).toHaveCount(inMind.length)
    const hidden = await list(page)
      .locator('[data-letter][hidden]')
      .evaluateAll((sections) => sections.map((section) => section.id))
    expect(hidden.length).toBeGreaterThan(0)
    await shown(page)
      .locator('a[href^="/concepts/"][href$="/"]:not([href="/concepts/"])')
      .first()
      .click()
    await expect(page).toHaveURL(/\/concepts\/[^/]+\/$/)
    await page.goBack()
    await expect(page).toHaveURL(/\?topic=mind$/)
    await expect(chip(page, mind.name)).toHaveAttribute('aria-pressed', 'true')
    await expect(count(page)).toHaveText(entries(inMind.length))
    await expect(shown(page)).toHaveCount(inMind.length)
    for (const id of hidden) await expect(rail(page).locator(`a[href="#${id}"]`)).toHaveCount(0)
  })

  test('Clear filters from the keyboard leaves focus on the first chip', async ({ page }) => {
    await gotoReady(page, PATH)
    await expect(toolbar(page)).toBeVisible()
    await chip(page, mind.name).click()
    await page.getByRole('button', { name: 'Clear filters' }).focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(count(page)).toHaveText(entries(all.length))
    const first = page
      .getByRole('group', { name: 'Filter the entries' })
      .getByRole('button')
      .first()
    await expect(first).toBeFocused()
    await expect(page.locator('body')).not.toBeFocused()
  })

  test('filter by keyboard: one Tab stop, arrows between chips, Space to press', async ({
    page,
  }) => {
    await gotoReady(page, PATH)
    await expect(toolbar(page)).toBeVisible()
    const chips = page.getByRole('group', { name: 'Filter the entries' })
    await chips.getByRole('button').first().focus()
    await page.keyboard.press('ArrowRight')
    const second = chips.getByRole('button').nth(1)
    expect(await isFocused(second)).toBe(true)
    await page.keyboard.press('Space')
    await expect(second).toHaveAttribute('aria-pressed', 'true')
    const topic = (await topics.list())[1]
    const expected = all.filter(({ topics }) => topics.includes(topic?.slug ?? '')).length
    await expect(count(page)).toHaveText(entries(expected))
    await page.keyboard.press('Tab')
    expect(
      await chips.evaluate((group) => group.contains(document.activeElement)),
      'Tab leaves the chips',
    ).toBe(false)
  })

  test('an address with a filter opens filtered, its empty letters plain text', async ({
    page,
  }) => {
    await gotoReady(page, `${PATH}?topic=mind&kind=concept`)
    await expect(chip(page, mind.name)).toHaveAttribute('aria-pressed', 'true')
    await expect(chip(page, 'Concept pages')).toHaveAttribute('aria-pressed', 'true')
    await expect(shown(page)).toHaveCount(mindConcepts.length)
    const initials = new Set(mindConcepts.map(({ name }) => name.normalize('NFD').charAt(0)))
    for (const letter of filled.filter((letter) => !initials.has(letter)))
      await expect(rail(page).getByRole('link', { name: letter, exact: true })).toHaveCount(0)
  })

  test('the list glides into its new order, naming at most 40 entries and nothing else', async ({
    page,
  }) => {
    // Which parts of the page each view transition captures, as it starts to run (beneath
    // recordPageTurns, which wraps the same method).
    await page.addInitScript(() => {
      const captured: string[][] = []
      Object.defineProperty(window, '__captured', { value: captured })
      const start = Document.prototype.startViewTransition
      Document.prototype.startViewTransition = function (this: Document, init) {
        const transition = start.call(this, init)
        transition.ready.then(
          () =>
            captured.push(
              document
                .getAnimations()
                .map(({ effect }) => (effect as KeyframeEffect | null)?.pseudoElement ?? '')
                .flatMap((pseudo) => /^::view-transition-group\((.+)\)$/.exec(pseudo)?.[1] ?? []),
            ),
          () => {},
        )
        return transition
      }
    })
    await recordPageTurns(page)
    await gotoReady(page, PATH)
    await chip(page, mind.name).click()
    await expect(shown(page)).toHaveCount(inMind.length)
    await expect.poll(async () => (await inPageTransitions(page)).length).toBe(1)
    const [reorder] = await inPageTransitions(page)
    const entriesFlying = (reorder?.flights ?? []).filter(({ name }) => name.startsWith('az-'))
    expect(entriesFlying.length).toBeGreaterThan(0)
    expect(entriesFlying.length).toBeLessThanOrEqual(40)
    // The chips, the count, the header and the rest of the page change in place, at once.
    const captured = () =>
      page.evaluate(() => (window as unknown as { __captured: string[][] }).__captured)
    await expect.poll(async () => (await captured()).length).toBe(1)
    const [groups = []] = await captured()
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.filter((name) => !name.startsWith('az-'))).toEqual([])
  })

  test('under reduced motion the list changes at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await recordPageTurns(page)
    await gotoReady(page, PATH)
    await chip(page, mind.name).click()
    await expect(shown(page)).toHaveCount(inMind.length)
    expect(await inPageTransitions(page)).toEqual([])
  })

  test('has no accessibility violations with a filter applied', async ({ page }) => {
    await gotoReady(page, PATH)
    await chip(page, mind.name).click()
    await expect(count(page)).toHaveText(entries(inMind.length))
    await expectNoAxeViolations(page, 'filtered A–Z')
  })
})

test('loads without shifting anything, and fits 320 px', async ({ page }) => {
  await page.addInitScript(() => {
    let shift = 0
    Object.defineProperty(window, '__shift', { get: () => shift })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[])
        shift += entry.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await gotoReady(page, PATH)
  await expect(toolbar(page)).toBeVisible()
  expect(
    await page.evaluate(() => (window as unknown as { __shift: number }).__shift),
  ).toBeLessThan(0.1)
  await page.setViewportSize({ width: 320, height: 720 })
  expect(await scrollsSideways(page)).toEqual([])
})
