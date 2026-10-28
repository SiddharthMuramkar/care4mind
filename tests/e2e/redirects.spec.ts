import type { APIRequestContext } from '@playwright/test'

import { redirects } from '@/config/redirects'
import { site } from '@/content'

import { expect, inScope, test } from './fixtures'

// Front-end-site ticket 14: every address the current site served leads to its new page in one
// hop (FR-07, D11, D17). Each is requested from the local build without following redirects;
// nothing here requests the current site.

// HTTP checks need no width, so they run once, in the 1440 px project.
test.skip(({ viewport }) => viewport?.width !== 1440, 'run once, at 1440 px')

const routes = await site.routes()

/** The addresses a pattern row stands for, under made-up names: real usernames never enter the repo. */
const PATTERN_EXAMPLES: Readonly<Record<string, readonly string[]>> = {
  '/author/:name*/': ['/author/any-name/', '/author/any-name/feed/'],
}

/** WordPress's archives and feed (D17), all of which the sample checks. */
const isArchiveOrFeed = (source: string) => /^\/(?:category|author|feed)\//.test(source)

/**
 * Every old address with the page it now leads to. With E2E_SCOPE=sample: the first that leads to
 * each kind of page (and each kind of anchor), plus the archives and the feed.
 */
const olds = (() => {
  const sampled = new Set<string>()
  return redirects.flatMap(({ source, destination }) => {
    const [path = '', anchor] = destination.split('#')
    const kind = `${routes.find((route) => route.path === path)?.kind}${anchor ? '#' : ''}`
    const sample = isArchiveOrFeed(source) || !sampled.has(kind)
    sampled.add(kind)
    const addresses = source.includes(':') ? (PATTERN_EXAMPLES[source] ?? [source]) : [source]
    return addresses.map((address) => ({ address, destination, ...(sample && { sample: true }) }))
  })
})()

/**
 * Follow an address by hand, as a browser would: the status of each request on the way, and the
 * address it ends at, anchor included.
 */
async function follow(request: APIRequestContext, address: string) {
  const statuses: number[] = []
  let at = address
  for (let hop = 0; hop <= 3; hop++) {
    const [path = ''] = at.split('#')
    const response = await request.get(path, { maxRedirects: 0 })
    statuses.push(response.status())
    const location = response.headers().location
    if (location === undefined) return { statuses, at }
    expect(location, `${path} redirects within the site`).toMatch(/^\/(?!\/)/)
    at = location
  }
  throw new Error(`${address} redirects more than three times: ${statuses.join(' → ')}`)
}

const ids = (html: string) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id))

test.describe('every old address (FR-07)', () => {
  test('stands for each pattern row with made-up addresses', () => {
    for (const { source } of redirects.filter(({ source }) => source.includes(':')))
      expect(PATTERN_EXAMPLES[source], source).toBeDefined()
  })

  for (const { address, destination } of inScope(olds)) {
    test(`${address} answers one 301 to ${destination}, which answers 200`, async ({ request }) => {
      const response = await request.get(address, { maxRedirects: 0 })
      expect(response.status(), 'a permanent redirect, not Next’s default 308').toBe(301)
      expect(response.headers().location).toBe(destination)

      const [path = '', fragment] = destination.split('#')
      const page = await request.get(path, { maxRedirects: 0 })
      expect(page.status(), `${path} answers itself, never another redirect`).toBe(200)
      if (fragment) expect(ids(await page.text()), `#${fragment} on ${path}`).toContain(fragment)
    })
  }
})

test.describe('an old address typed another way (ticket 14’s Comments)', () => {
  // Next adds a missing trailing slash, with a 308 of its own, before it reads the redirect
  // table; it matches the table's sources ignoring case.
  const VARIANTS = [
    { name: 'without its slash', form: (old: string) => old.slice(0, -1), hops: [308, 301] },
    { name: 'in capitals', form: (old: string) => old.toUpperCase(), hops: [301] },
    {
      name: 'in capitals, without its slash',
      form: (old: string) => old.slice(0, -1).toUpperCase(),
      hops: [308, 301],
    },
  ]

  for (const { address, destination } of inScope(olds))
    test(`${address} still reaches ${destination}`, async ({ request }) => {
      const [path = ''] = destination.split('#')
      for (const { name, form, hops } of VARIANTS) {
        const { statuses, at } = await follow(request, form(address))
        expect(statuses, `${form(address)}, ${name}`).toEqual([...hops, 200])
        expect(at.split('#')[0], `${form(address)}, ${name}`).toBe(path)
      }
    })

  test('/ and /concepts/, which the new site keeps, answer 200, and /concepts in one hop', async ({
    request,
  }) => {
    expect((await follow(request, '/')).statuses).toEqual([200])
    expect((await follow(request, '/concepts/')).statuses).toEqual([200])
    const bare = await follow(request, '/concepts')
    expect(bare.statuses).toEqual([308, 200])
    expect(bare.at).toBe('/concepts/')
  })

  test('/CONCEPTS/ reaches the A–Z (expected to fail until planning ticket 24)', async ({
    request,
  }) => {
    test.fail(
      true,
      'Not yet: pages match case-sensitively, and a row from /concepts/ would catch /concepts/ ' +
        'itself and loop. Left for planning ticket 24 (ticket 14’s Comments).',
    )
    const { statuses, at } = await follow(request, '/CONCEPTS/')
    expect(statuses.at(-1)).toBe(200)
    expect(at).toBe('/concepts/')
  })
})
