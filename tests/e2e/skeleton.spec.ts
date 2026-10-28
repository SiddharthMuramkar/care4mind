import { concepts, library, questionnaires, site, topics, works } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, inScope, test } from './fixtures'

// Front-end-site ticket 03: every page in the site map, at its final address. A quick sweep
// until ticket 02 replaces it with the full matrix and the link crawler.

const routes = await site.routes()
const ORIGIN = 'https://care4mind.org'

// The page-level sweep runs at 1440 px; the HTTP checks need no browser width at all.
test.skip(({ viewport }) => viewport?.width !== 1440, 'swept once, at 1440 px')

test.describe('every page in the route registry', () => {
  for (const route of inScope(routes)) {
    test(`${route.path} answers with one h1, its breadcrumbs and metadata, and passes axe`, async ({
      page,
    }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      const response = await page.goto(route.path)
      expect(response?.status(), route.path).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)

      if (route.kind !== 'home') {
        const trail = page.getByRole('navigation', { name: 'Breadcrumb' })
        await expect(trail.getByRole('link', { name: 'Home', exact: true })).toBeVisible()
        await expect(trail.locator('[aria-current="page"]')).toHaveText(route.title)
      }

      await expect(page).toHaveTitle(
        route.kind === 'home' ? 'Care4Mind: Indian psychology' : / · Care4Mind$/,
      )
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `${ORIGIN}${route.path}`,
      )

      // Every internal link points at a slashed address, so it never leans on a redirect (D02).
      const hrefs = await page
        .locator('a[href^="/"]')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
      for (const href of hrefs)
        expect(href.split(/[?#]/)[0], `${route.path} links to ${href}`).toMatch(/\/$/)

      const repeated = await page.evaluate(() => {
        const seen = new Set<string>()
        return [...document.querySelectorAll('[id]')].flatMap((element) => {
          if (seen.has(element.id)) return [element.id]
          seen.add(element.id)
          return []
        })
      })
      expect(repeated, `ids used twice on ${route.path}`).toEqual([])

      await expectNoAxeViolations(page)
      expect(errors).toEqual([])
    })
  }
})

test.describe('addresses (D02, D17)', () => {
  test('every route answers 200 at its slashed address, and redirects there without the slash', async ({
    request,
  }) => {
    for (const { path } of routes) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status(), path).toBe(200)
      if (path === '/') continue
      const bare = await request.get(path.slice(0, -1), { maxRedirects: 0 })
      expect(bare.status(), path.slice(0, -1)).toBe(308)
      expect(bare.headers().location, path.slice(0, -1)).toBe(path)
    }
  })

  test('/topics/ answers one 301 to the Concepts A–Z', async ({ request }) => {
    const response = await request.get('/topics/', { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toBe('/concepts/')
  })

  test('an unknown slug answers 404', async ({ request }) => {
    for (const path of ['/concepts/no-such-concept/', '/texts/no-such-text/', '/library/nothing/'])
      expect((await request.get(path)).status(), path).toBe(404)
  })
})

/** Every anchor the content links to, by the page it is on. */
async function anchorsByPage(): Promise<Map<string, Set<string>>> {
  const links: string[] = (await site.searchDocuments()).map(({ href }) => href)
  for (const { slug } of await concepts.list()) {
    const concept = await concepts.get(slug)
    if (!concept) continue
    links.push(...concept.toc.flatMap(({ href, terms }) => [href, ...terms.map((t) => t.href)]))
    links.push(...concept.references.map(({ anchor }) => `${concept.href}#${anchor}`))
    links.push(...concept.verses.map(({ href }) => href))
  }
  for (const { slug } of await topics.list()) {
    const topic = await topics.get(slug)
    links.push(
      ...(topic?.intro?.toc ?? []).flatMap(({ href, terms }) => [
        href,
        ...terms.map((t) => t.href),
      ]),
    )
    links.push(...(topic?.intro?.references ?? []).map(({ anchor }) => `${topic?.href}#${anchor}`))
    links.push(...(topic?.verses ?? []).map(({ href }) => href))
  }
  for (const { slug } of await works.list())
    links.push(...((await works.get(slug))?.passages ?? []).map(({ href }) => href))
  for (const { slug } of await library.list()) {
    const page = await library.get(slug)
    if (page?.kind === 'page') links.push(...page.toc.map(({ href }) => href))
    if (page?.kind === 'resource-list') links.push(...page.groups.map(({ href }) => href))
  }
  links.push(...(await questionnaires.list()).map(({ href }) => href))
  for (const { entries } of await site.azIndex())
    for (const entry of entries)
      links.push(...entry.anchors.map((anchor) => `/concepts/#${anchor}`))

  const pages = new Map<string, Set<string>>()
  for (const link of links) {
    const [path = '', fragment] = link.split('#')
    if (!fragment || !path.startsWith('/')) continue
    pages.set(path, (pages.get(path) ?? new Set()).add(fragment))
  }
  return pages
}

test('every anchor the content links to is an id on its page', async ({ request }) => {
  const pages = await anchorsByPage()
  expect(pages.size, 'pages with anchors').toBeGreaterThan(30)
  for (const [path, fragments] of pages) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    const html = await response.text()
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id))
    for (const fragment of fragments) expect(ids, `${path}#${fragment}`).toContain(fragment)
  }
})

test('the sitemap lists every route at its production address, and robots.txt names it', async ({
  request,
}) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url)
  expect(listed).toEqual(routes.map(({ path }) => `${ORIGIN}${path}`))

  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`)
  expect(robots).toMatch(/^Allow: \/$/m)
  expect(robots).not.toMatch(/^Disallow:/m)
})

test.describe('running text', () => {
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
