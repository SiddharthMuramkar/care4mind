import type { Locator, Page } from '@playwright/test'

import { hrefFor, site } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { expectPageTurned, pageTurns, prefetched, recordPageTurns } from './page-turns'

// The Concept map (front-end-site ticket 12, a Proposal): the Concepts round a circle on a
// printed plate, joined by hairline curves, with the same connections listed in words. Expected
// values come from site.graph(): one curve, and one row, for each pair of Concepts and kind.

const PATH = hrefFor({ page: 'concept-map' })
const graph = await site.graph()
const nameOf = new Map(graph.nodes.map(({ slug, name }) => [slug, name]))
const named = (slug: string) => nameOf.get(slug) ?? slug
const connections = [
  ...new Set(graph.edges.map(({ source, target, kind }) => `${kind} ${source} ${target}`)),
]
const ofKind = (kind: string) => connections.filter((key) => key.startsWith(`${kind} `))
const neighbours = (slug: string) =>
  new Set(
    graph.edges.flatMap(({ source, target }) =>
      source === slug ? [target] : target === slug ? [source] : [],
    ),
  )

const plate = (page: Page) => page.getByRole('figure')
const point = (page: Page, slug: string) =>
  plate(page).getByRole('link', { name: named(slug), exact: true })
const list = (page: Page) => page.getByRole('region', { name: 'Connections' })
const rows = (page: Page) =>
  list(page)
    .getByRole('listitem')
    .filter({ has: page.getByRole('link') })
    .filter({ visible: true })
const announcement = (page: Page) => page.getByRole('main').locator('[aria-live="polite"]')
const group = (page: Page, name: 'Lines' | 'Topics') => page.getByRole('group', { name })
/** Base UI's two ToggleGroups, once their code has arrived (when the browser is idle). */
const keyboardReady = (page: Page) =>
  expect(page.locator('[data-map] [role="group"][data-orientation]')).toHaveCount(2)

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 600

/** A colour as 0–255 channels, whichever notation the browser computes it in. */
function channels(value: string) {
  const srgb = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/.exec(value)
  if (srgb) return srgb.slice(1, 4).map((part) => Math.round(Number(part) * 255))
  const rgb = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value)
  if (rgb) return rgb.slice(1, 4).map(Number)
  const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(value.trim())
  return hex ? hex.slice(1, 4).map((part) => parseInt(part, 16)) : []
}
const token = async (page: Page, name: string) =>
  channels(
    await page.evaluate((name) => getComputedStyle(document.body).getPropertyValue(name), name),
  )
const colourOf = async (locator: Locator, property = 'color') =>
  channels(
    await locator.evaluate(
      (element, property) => getComputedStyle(element).getPropertyValue(property),
      property,
    ),
  )

test.describe('the Concept map', () => {
  test('is labelled a proposal by its heading, under Home › Concepts › Concept map', async ({
    page,
  }) => {
    await gotoReady(page, PATH)
    const header = page.getByRole('main').locator('header').first()
    await expect(header.getByRole('link', { name: 'Proposal' })).toHaveAttribute(
      'href',
      hrefFor({ page: 'proposals' }),
    )
    await expect(header).toContainText('Awaiting the Project owner’s decision')
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem')
    await expect(crumbs).toHaveText(['Home', 'Concepts', 'Concept map'])
  })

  test('lists every connection with its reasons, both Concepts as links', async ({ page }) => {
    await gotoReady(page, PATH)
    await expect(rows(page)).toHaveCount(connections.length)
    const shown = await rows(page).evaluateAll((items) =>
      items.map((item) => ({
        names: [...item.querySelectorAll('a')].map((link) => link.textContent),
        text: item.textContent ?? '',
      })),
    )
    for (const { source, target, reason } of graph.edges) {
      const row = shown.find(
        ({ names, text }) =>
          names.join(' | ') === `${named(source)} | ${named(target)}` && text.includes(reason),
      )
      expect(row, `${named(source)} and ${named(target)}: ${reason}`).toBeDefined()
    }
    const shared = graph.edges.filter(
      (edge) =>
        (edge.source === 'brahmacharya' && edge.target === 'sthitaprajna') ||
        (edge.source === 'sthitaprajna' && edge.target === 'brahmacharya'),
    )
    const row = rows(page)
      .filter({ has: page.getByRole('link', { name: named('brahmacharya'), exact: true }) })
      .filter({ has: page.getByRole('link', { name: named('sthitaprajna'), exact: true }) })
    const text = (await row.evaluate((item) => item.textContent)) ?? ''
    const reasons = shared.filter((edge) => text.includes(edge.reason)).map((edge) => edge.reason)
    expect(reasons.length).toBeGreaterThan(1)
    for (let index = 0; index < reasons.length - 1; index += 1) {
      const left = reasons[index] ?? ''
      const right = reasons[index + 1] ?? ''
      expect(text).not.toContain(`${left}${right}`)
      expect(text).toContain(`${left} · ${right}`)
    }

    const link = list(page).getByRole('link', { name: named(graph.edges[0]?.source ?? '') })
    await expect(link.first()).toHaveAttribute(
      'href',
      hrefFor({ kind: 'concept', id: graph.edges[0]?.source ?? '' }),
    )
  })

  test('draws the plate with its points as links in the topics’ order, hiding the lines from assistive technology', async ({
    page,
  }) => {
    test.skip(!wide(page), 'Below 600 px the plate waits one tap away.')
    await gotoReady(page, PATH)
    const points = plate(page).getByRole('link')
    await expect(points).toHaveText(graph.nodes.map(({ name }) => name))
    const layers = page.locator('[data-map] svg')
    for (const layer of await layers.all())
      await expect(layer).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('[data-map] svg path[data-c]')).toHaveCount(connections.length)
    for (const name of [
      'Solid: a verse both quote',
      'Dotted: a rarely cited Reference both cite',
      'Dashed: a text both quote',
    ])
      await expect(plate(page).getByText(name)).toBeVisible()
  })

  test('focusing a Concept lights its neighbours and its curves, and dims the rest', async ({
    page,
  }) => {
    test.skip(!wide(page), 'Below 600 px the plate waits one tap away.')
    await gotoReady(page, PATH)
    const slug = 'sthitaprajna'
    const near = neighbours(slug)
    const lit = await token(page, '--color-surface-link')
    const muted = await token(page, '--color-surface-muted')
    const vermilion = await token(page, '--color-highlight')

    await point(page, slug).focus()
    expect(await point(page, slug).evaluate((link) => link.matches(':focus-visible'))).toBe(true)
    for (const node of graph.nodes) {
      if (node.slug === slug) continue
      const expected = near.has(node.slug) ? lit : muted
      expect(await colourOf(point(page, node.slug)), node.name).toEqual(expected)
    }
    const curves = page.locator('[data-map] svg path[data-c]')
    const own = curves.and(page.locator(`[data-ends~="${slug}"]`))
    await expect(own).toHaveCount(connections.filter((key) => key.split(' ').includes(slug)).length)
    for (const curve of await own.all()) expect(await colourOf(curve, 'stroke')).toEqual(vermilion)
    const other = curves.and(page.locator(`:not([data-ends~="${slug}"])`)).first()
    await expect
      .poll(() => other.evaluate((curve) => Number(getComputedStyle(curve).opacity)))
      .toBeLessThan(0.3)

    // Moving on lights the next Concept's neighbours instead.
    await page.keyboard.press('Tab')
    const next = graph.nodes[graph.nodes.findIndex((node) => node.slug === slug) + 1]
    expect(await colourOf(point(page, slug))).toEqual(
      neighbours(next?.slug ?? '').has(slug) ? lit : muted,
    )
  })

  test('a point opens its Concept with a forward page turn, its name flying into the heading', async ({
    page,
  }) => {
    test.skip(!wide(page), 'Below 600 px the plate waits one tap away.')
    await recordPageTurns(page)
    await gotoReady(page, PATH)
    const link = point(page, 'vikshepa')
    await prefetched(link)
    await link.click()
    await expect(page).toHaveURL(new RegExp(`${hrefFor({ kind: 'concept', id: 'vikshepa' })}$`))
    await expect(page.getByRole('heading', { level: 1 })).toContainText(named('vikshepa'))
    const [turn] = await pageTurns(page)
    expectPageTurned(turn, 'forward')
    expect(turn?.flights.map(({ name }) => name)).toContain('concept-title-vikshepa')
  })

  test('filters by keyboard: one Tab stop a group, arrows between, Space to press, announced politely', async ({
    page,
  }) => {
    await gotoReady(page, PATH)
    await keyboardReady(page)
    await expect(announcement(page)).toHaveText(`Showing all ${connections.length} connections`)
    const lines = group(page, 'Lines').getByRole('button')
    await lines.first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(lines.nth(1)).toBeFocused()
    await expect(lines.nth(1)).toHaveText('Shared text')
    await page.keyboard.press('Space')
    await expect(lines.nth(1)).toHaveAttribute('aria-pressed', 'true')
    await expect(page).toHaveURL(/\?kind=work$/)
    const works = ofKind('work').length
    await expect(announcement(page)).toHaveText(
      `Showing ${works} of ${connections.length} connections`,
    )
    await expect(rows(page)).toHaveCount(works)

    // One kind at a time: the next takes its place.
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')
    await expect(lines.nth(1)).toHaveAttribute('aria-pressed', 'false')
    await expect(rows(page)).toHaveCount(ofKind('reference').length)

    // Tab leaves the group for the topics, and Space there narrows by topic too.
    await page.keyboard.press('Tab')
    const topics = group(page, 'Topics').getByRole('button')
    await expect(topics.first()).toBeFocused()
    await page.keyboard.press('Space')
    await expect(page).toHaveURL(/\?kind=reference&topic=self$/)
    const self = new Set(
      graph.nodes.filter(({ topics }) => topics.includes('self')).map(({ slug }) => slug),
    )
    const touching = ofKind('reference').filter((key) =>
      key.split(' ').some((slug) => self.has(slug)),
    )
    await expect(rows(page)).toHaveCount(touching.length)

    await page.goBack()
    await expect(rows(page)).toHaveCount(ofKind('reference').length)
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(rows(page)).toHaveCount(connections.length)
  })

  test('keeps the filtered count after a Concept and Back', async ({ page }) => {
    // Back remounts the island. The plate is around it, so a count read during render
    // still says every connection is showing, over curves the filter has hidden.
    await gotoReady(page, PATH)
    const topic = group(page, 'Topics').getByRole('button').first()
    await topic.click()
    await expect(topic).toHaveAttribute('aria-pressed', 'true')
    await expect(announcement(page)).not.toHaveText(`Showing all ${connections.length} connections`)
    const filtered = (await announcement(page).textContent()) ?? ''
    const visible = await rows(page).count()
    await rows(page).getByRole('link').first().click()
    await expect(page).not.toHaveURL(new RegExp(`${PATH}`))
    await page.goBack()
    await expect(page).toHaveURL(/\?topic=/)
    await expect(topic).toHaveAttribute('aria-pressed', 'true')
    await expect(announcement(page)).toHaveText(filtered)
    await expect(rows(page)).toHaveCount(visible)
    if (wide(page))
      await expect(
        page.locator('[data-map] svg path[data-c]').filter({ visible: true }),
      ).toHaveCount(visible)
  })

  test('Clear filters from the keyboard leaves focus on the first chip', async ({ page }) => {
    await gotoReady(page, PATH)
    await keyboardReady(page)
    await group(page, 'Lines').getByRole('button').first().click()
    await page.getByRole('button', { name: 'Clear filters' }).focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(new RegExp(`${PATH}$`))
    await expect(announcement(page)).toHaveText(`Showing all ${connections.length} connections`)
    await expect(group(page, 'Lines').getByRole('button').first()).toBeFocused()
    await expect(page.locator('body')).not.toBeFocused()
  })

  test('an address with a topic opens filtered, the Concepts outside it in a lighter ink', async ({
    page,
  }) => {
    test.skip(!wide(page), 'Below 600 px the plate waits one tap away.')
    await gotoReady(page, `${PATH}?topic=temperament`)
    const inTopic = new Set(
      graph.nodes.filter(({ topics }) => topics.includes('temperament')).map(({ slug }) => slug),
    )
    const touching = connections.filter((key) =>
      key
        .split(' ')
        .slice(1)
        .some((slug) => inTopic.has(slug)),
    )
    await expect(rows(page)).toHaveCount(touching.length)
    await expect(page.locator('[data-map] svg path[data-c]').filter({ visible: true })).toHaveCount(
      touching.length,
    )
    const muted = await token(page, '--color-surface-muted')
    const ink = await token(page, '--color-surface-ink')
    for (const node of graph.nodes)
      expect(await colourOf(point(page, node.slug)), node.name).toEqual(
        inTopic.has(node.slug) ? ink : muted,
      )
  })

  test('at 360 px the list comes first, with the map one tap away', async ({ page }) => {
    test.skip(wide(page), 'Above 600 px the plate and the list share the page.')
    await gotoReady(page, PATH)
    await expect(plate(page)).toBeHidden()
    const toPlate = page.getByRole('link', { name: 'See the map' })
    await expect(toPlate).toBeVisible()
    const heading = list(page).getByRole('heading', { level: 2 })
    const [linkTop, listTop] = await Promise.all(
      [toPlate, heading].map((part) => part.evaluate((e) => e.getBoundingClientRect().top)),
    )
    expect(linkTop).toBeLessThan(listTop ?? 0)
    await toPlate.click()
    await expect(plate(page)).toBeVisible()
    await expect(point(page, 'vikshepa')).toBeVisible()
    expect(await scrollsSideways(page)).toEqual([])
    await page.getByRole('link', { name: 'Back to the list' }).click()
    await expect(plate(page)).toBeHidden()
  })

  test('without JavaScript, every connection shows and no filter does', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(PATH)
    await expect(rows(page)).toHaveCount(connections.length)
    await expect(page.getByRole('button')).toHaveCount(0)
    await context.close()
  })

  test('reserves the plate’s box, so nothing shifts as it loads', async ({ page }) => {
    await gotoReady(page, PATH)
    await keyboardReady(page)
    const shift = await page.evaluate(
      () =>
        new Promise<number>((done) => {
          let total = 0
          new PerformanceObserver((entries) => {
            for (const entry of entries.getEntries())
              total += (entry as PerformanceEntry & { value: number }).value
          }).observe({ type: 'layout-shift', buffered: true })
          setTimeout(() => done(total), 300)
        }),
    )
    expect(shift).toBeLessThan(0.01)
  })

  test('fits the screen and passes axe', async ({ page }) => {
    await gotoReady(page, PATH)
    expect(await scrollsSideways(page)).toEqual([])
    await expectNoAxeViolations(page)
  })
})
