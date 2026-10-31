import type { APIRequestContext, Page } from '@playwright/test'

import { site as config } from '@/config/site'
import { concepts, library, questionnaires, site, topics, works } from '@/content'

import { expect, test } from './fixtures'
import { MISSING, PAGES, ROUTES } from './routes'

// NFR-04: no internal link is broken, and no page is out of reach. The crawler starts at the
// homepage and follows every same-origin <a href> in the HTML the server sends, running no
// JavaScript, as a visitor without it would. It crawls the whole site whatever E2E_SCOPE says:
// only the whole site can show an orphan.

/** The most addresses one crawl requests: far more than the site has, so a runaway stops. */
const LIMIT = 1000

/** How many requests the crawler keeps in flight: the server is shared with other tests. */
const AT_ONCE = 6

/** What the server answered for one address on this site: a path, and a query if it has one. */
interface Answer {
  status: number
  /** Where a redirect leads. */
  location?: string
  /** A page: 200 with HTML, read for its links and ids. */
  page: boolean
  ids: ReadonlySet<string>
}

/** A link, found on a page. */
interface Link {
  /** The address of the page it is on. */
  on: string
  /** Its href, as written. */
  href: string
  /** Where it leads: an address on this site, or the URL of another. */
  to: string
  /** Its #fragment, decoded; empty when it has none. */
  fragment: string
}

interface Crawl {
  answers: ReadonlyMap<string, Answer>
  internal: readonly Link[]
  /** Counted and listed in the report, never requested. */
  external: readonly Link[]
}

/** A URL's #fragment, decoded, without a text directive (`:~:text=…`), which names no id. */
function fragmentOf(hash: string): string {
  const fragment = hash.slice(1).split(':~:')[0] ?? ''
  try {
    return decodeURIComponent(fragment)
  } catch {
    return fragment
  }
}

/** An address without its query: links to /search/?q=… lead to the page /search/. */
const pathOf = (address: string) => address.split('?')[0] ?? address

/** Request one address on this site and, if it is a page, read its links and ids. */
async function visit(request: APIRequestContext, parser: Page, origin: string, address: string) {
  // Every address is a path on this origin, so nothing else is ever requested.
  const response = await request.get(origin + address, { maxRedirects: 0 })
  const status = response.status()
  const { location, 'content-type': type = '' } = response.headers()
  const isPage = status === 200 && type.startsWith('text/html')
  const html = isPage ? await response.text() : ''
  await response.dispose()
  if (!isPage)
    return { answer: { status, location, page: false, ids: new Set<string>() }, hrefs: [] }

  // DOMParser runs no script, and reads <noscript> as a browser without JavaScript does.
  const { ids, hrefs } = await parser.evaluate((html) => {
    const document = new DOMParser().parseFromString(html, 'text/html')
    return {
      ids: [...document.querySelectorAll('[id]')].map(({ id }) => id),
      hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? ''),
    }
  }, html)
  return { answer: { status, page: true, ids: new Set(ids) }, hrefs }
}

/** Follow every link on this site from the homepage, requesting each address once. */
async function crawl(request: APIRequestContext, parser: Page, origin: string): Promise<Crawl> {
  const answers = new Map<string, Answer>()
  const internal: Link[] = []
  const external: Link[] = []
  const queued = new Set(['/'])
  let frontier = ['/']
  while (frontier.length > 0) {
    const next: string[] = []
    for (let start = 0; start < frontier.length; start += AT_ONCE) {
      const batch = frontier.slice(start, start + AT_ONCE)
      for (const [address, { answer, hrefs }] of await Promise.all(
        batch.map(
          async (address) => [address, await visit(request, parser, origin, address)] as const,
        ),
      )) {
        answers.set(address, answer)
        for (const href of hrefs) {
          const url = new URL(href, origin + address)
          const fragment = fragmentOf(url.hash)
          if (url.origin !== origin) {
            external.push({ on: address, href, to: url.href.split('#')[0] ?? url.href, fragment })
            continue
          }
          const to = url.pathname + url.search
          internal.push({ on: address, href, to, fragment })
          if (queued.has(to)) continue
          if (queued.size >= LIMIT) throw new Error(`The crawl passed ${LIMIT} addresses at ${to}.`)
          queued.add(to)
          next.push(to)
        }
      }
    }
    frontier = next
  }
  return { answers, internal, external }
}

/** The pages something is on: "/a/", "/a/ and /b/", or "/a/, /b/ and 43 more pages". */
function pagesIn(addresses: readonly string[]): string {
  const pages = [...new Set(addresses)]
  if (pages.length <= 2) return pages.join(' and ')
  const more = pages.length - 2
  return `${pages.slice(0, 2).join(', ')} and ${more} more ${more === 1 ? 'page' : 'pages'}`
}

/** Links grouped by a key, each group non-empty, in the order its key first appears. */
function groupBy(links: readonly Link[], key: (link: Link) => string): [Link, ...Link[]][] {
  const groups = new Map<string, [Link, ...Link[]]>()
  for (const link of links) {
    const group = groups.get(key(link))
    if (group) group.push(link)
    else groups.set(key(link), [link])
  }
  return [...groups.values()]
}

/** Links that say the same, each once, with every page each is on. */
const grouped = (links: readonly Link[]) =>
  groupBy(links, ({ href, to }) => `${href} ${to}`).map((same) => ({
    link: same[0],
    on: same.map(({ on }) => on),
  }))

/** The site a URL is on: its host, or its scheme where it has none (mailto:). */
const siteOf = (url: string) => new URL(url).host || new URL(url).protocol

/** The crawl in words, for the run's report: what it read, and every link to another site. */
function reportOf({ answers, internal, external }: Crawl): string {
  const pages = [...answers.values()].filter(({ page }) => page).length
  const withFragment = internal.filter(({ fragment }) => fragment).length
  const bySite = groupBy(external, ({ to }) => siteOf(to)).sort((a, b) => b.length - a.length)
  return [
    `Crawled from / through the server's HTML, running no JavaScript.`,
    `${answers.size} addresses requested, ${pages} of them pages.`,
    `${internal.length} internal links, ${withFragment} of them to a #fragment.`,
    `${external.length} links to ${bySite.length} other sites, listed here and never requested:`,
    ...bySite.flatMap((links) => [
      '',
      `${siteOf(links[0].to)} (${links.length})`,
      ...groupBy(links, ({ to }) => to).map(
        (same) => `  ${same[0].to}  on ${pagesIn(same.map(({ on }) => on))}`,
      ),
    ]),
  ].join('\n')
}

test.describe('the crawl from the homepage', () => {
  // In order, in one worker, so the site is crawled once and every check reads that crawl.
  test.describe.configure({ mode: 'default' })

  let crawled: Crawl
  const registered = new Set(ROUTES.map(({ path }) => path))
  /** The paths of every page the crawl reached. */
  const reached = () =>
    new Set([...crawled.answers].filter(([, { page }]) => page).map(([address]) => pathOf(address)))

  test.beforeAll(async ({ browser, playwright }, testInfo) => {
    test.setTimeout(120_000)
    const { baseURL, extraHTTPHeaders } = testInfo.project.use
    if (!baseURL) throw new Error('The crawler needs a baseURL to start from.')
    const request = await playwright.request.newContext({ extraHTTPHeaders })
    const parser = await browser.newPage()
    try {
      crawled = await crawl(request, parser, new URL(baseURL).origin)
    } finally {
      await parser.close()
      await request.dispose()
    }
  })

  test('every internal link answers 200 directly, never leaning on a redirect', () => {
    const failing = crawled.internal.filter(({ to }) => crawled.answers.get(to)?.status !== 200)
    const lines = grouped(failing).map(({ link, on }) => {
      const answer = crawled.answers.get(link.to)
      const redirect = answer?.location ? `, redirecting to ${answer.location}` : ''
      return `<a href="${link.href}"> on ${pagesIn(on)}: ${link.to} answers ${answer?.status}${redirect}`
    })
    expect(lines, 'internal links that don’t answer 200 directly').toEqual([])
  })

  test('every #fragment is an id on the page it leads to', () => {
    const anchored = crawled.internal.filter(({ fragment }) => fragment)
    expect(anchored.length, 'links to a #fragment, such as the skip link').toBeGreaterThan(0)
    const missing = anchored.filter(({ to, fragment }) => {
      const answer = crawled.answers.get(to)
      return answer?.page === true && !answer.ids.has(fragment)
    })
    const lines = grouped(missing).map(
      ({ link, on }) =>
        `<a href="${link.href}"> on ${pagesIn(on)}: ${link.to} has no id “${link.fragment}”`,
    )
    expect(lines, 'links to a #fragment that isn’t there').toEqual([])
  })

  test('reaches every route in the registry: no page is an orphan', () => {
    const pages = reached()
    const orphans = ROUTES.map(({ path }) => path).filter((path) => !pages.has(path))
    expect(orphans, 'routes no link from / leads to').toEqual([])
  })

  test('reaches no page outside the registry', () => {
    const strays = [...reached()].filter((path) => !registered.has(path))
    const lines = strays.map((path) => {
      const on = crawled.internal.filter(({ to }) => pathOf(to) === path).map((link) => link.on)
      return `${path}, linked on ${pagesIn(on)}`
    })
    expect(lines, 'pages the crawl reached that site.routes() doesn’t list').toEqual([])
  })

  test('lists every link to another site in its report, requesting none', async () => {
    // Nothing but origin + a path is ever requested (visit), so this checks the report alone.
    expect(crawled.external.length, 'links to other sites, such as DOIs').toBeGreaterThan(0)
    const report = reportOf(crawled)
    await test.info().attach('crawl report', { body: report, contentType: 'text/plain' })
    test.info().annotations.push({ type: 'crawl', description: report.split('\n', 4).join(' ') })
  })
})

test.describe('the sitemap and robots.txt (NFR-04)', () => {
  test('the sitemap lists exactly the registry’s routes, at their production addresses', async ({
    request,
  }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url = '']) => url)
    const elsewhere = urls.filter((url) => !url.startsWith(`${config.url}/`))
    expect(elsewhere, `sitemap URLs not on ${config.url}`).toEqual([])
    expect(
      urls.map((url) => url.slice(config.url.length)),
      `the sitemap’s URLs, minus ${config.url}, against the registry’s paths`,
    ).toEqual(ROUTES.map(({ path }) => path))
  })

  test('robots.txt names the sitemap and blocks nothing: noindex does the hiding', async ({
    request,
  }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain(`Sitemap: ${config.url}/sitemap.xml`)
    expect(robots).toMatch(/^Allow: \/$/m)
    expect(robots).toMatch(/^Disallow:/m)
  })
})

/** How every page's head links the tab icon, the home-screen icon and the manifest, and the type each answers with. */
const HEAD_LINKS = [
  { selector: 'link[rel="icon"][type="image/svg+xml"]', type: 'image/svg+xml' },
  { selector: 'link[rel="apple-touch-icon"]', type: 'image/png' },
  { selector: 'link[rel="manifest"]', type: 'application/manifest+json' },
] as const

test('every kind of page names the tab icon, the home-screen icon and the manifest, each answering 200 directly', async ({
  page,
  request,
}) => {
  for (const path of [...PAGES.map((sample) => sample.path), MISSING]) {
    const html = await (await request.get(path)).text()
    const hrefs = await page.evaluate(
      ({ html, selectors }) => {
        const { head } = new DOMParser().parseFromString(html, 'text/html')
        return selectors.map((selector) => head.querySelector(selector)?.getAttribute('href'))
      },
      { html, selectors: HEAD_LINKS.map(({ selector }) => selector) },
    )
    for (const [index, { selector, type }] of HEAD_LINKS.entries()) {
      const href = hrefs[index] ?? ''
      expect(href, `${selector} in the head of ${path}`).not.toBe('')
      const response = await request.get(href, { maxRedirects: 0 })
      expect(response.status(), `${href}, named on ${path}`).toBe(200)
      expect(response.headers()['content-type'], `${href}, named on ${path}`).toContain(type)
    }
  }
})

test.describe('addresses (D02, D17)', () => {
  test('every route answers 200 at its slashed address, and redirects there without the slash', async ({
    request,
  }) => {
    for (const { path } of ROUTES) {
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

// Whether or not a page links them yet, every anchor hrefFor() can make for the content exists.
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
