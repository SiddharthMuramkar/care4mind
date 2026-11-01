import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match'
import { beforeAll, describe, expect, it } from 'vitest'

import { redirects } from '@/config/redirects'
import { hrefFor, site } from '@/content'
import { CONTENT_KINDS, type ContentRecord, type RecordOf, localSource } from '@/content/testing'

import nextConfig from '../../next.config'

// Front-end-site ticket 14: every address the current site served leads to its new page in one
// hop (FR-07, D11, D17). The expected rows are design B4's decisions, with the slugs content-v1
// shipped (`chittabhumi`, not the design's `citta-bhumi`).

/** Each of the current site's 33 pages and 6 posts but the two it keeps, and its new page. */
const PAGES_AND_POSTS: Readonly<Record<string, string>> = {
  // Duplicates of the homepage, and WordPress's placeholder: dropped.
  '/home/': '/',
  '/home-2/': '/',
  '/sample-page/': '/',
  // Empty pages: dropped, each to its nearest new page.
  '/blog/': '/concepts/',
  '/resources/': '/library/',
  '/webpages-and-av-material/': '/library/',
  '/surveys/': '/questionnaires/',
  '/teertha-yatra-quiz/': '/questionnaires/',
  // The Library's pages, merged into its lists.
  '/text-books/': '/library/textbooks/',
  '/text-books-2-2/': '/library/textbooks/',
  '/indian-philosophy/': '/library/textbooks/#indian-psychology-and-philosophy',
  '/positive-psychology/': '/library/textbooks/#positive-psychology',
  '/inspirational-books/': '/library/inspirational-books/',
  '/institutes/': '/library/courses/',
  '/methods/': '/library/methods/',
  // The two Questionnaires, and the stub merged into its glossary entry.
  '/dosha-survey/': '/questionnaires/#dosha-survey',
  '/karmayoga-scale/': '/questionnaires/karmayoga-scale/',
  '/anubandha-chatushtaya/': '/concepts/#anubandha-chatushtaya',
  // The posts that became Concepts.
  '/atman/': '/concepts/atman/',
  '/jiva/': '/concepts/jiva/',
  '/jagat/': '/concepts/jagat/',
  // The 16 description pages, each now a Concept (design B5).
  '/vikshepa/': '/concepts/vikshepa/',
  '/upavikshepaprofiling/': '/concepts/upa-vikshepa/',
  '/panchkleshavikaarprofiling/': '/concepts/panch-klesha/',
  '/knowyourmind/': '/concepts/chittabhumi/',
  '/sthitaprajna/': '/concepts/sthitaprajna/',
  '/fivestepsofperfectionprofiling/': '/concepts/five-steps-of-perfection/',
  '/momentumofspiritualpractice/': '/concepts/momentum-of-spiritual-practice/',
  '/spiritualpractitionerprofiling/': '/concepts/spiritual-practitioner/',
  '/brahmavihara/': '/concepts/brahma-vihara/',
  '/knowyourvaluesahimsanon-violenceprofiling/': '/concepts/ahimsa/',
  '/knowyourvaluessatyatruthfulnessprofiling/': '/concepts/satya/',
  '/knowyourvaluesasteyanonstealingprofiling/': '/concepts/asteya/',
  '/knowyourvaluesbrahmacharya-profiling/': '/concepts/brahmacharya/',
  '/frienorfoeofself/': '/concepts/atma-bandhu/',
  '/karta-2/': '/concepts/karta/',
  '/triguna/': '/concepts/triguna/',
}

let records: ContentRecord[] = []

// Read once, with room for a busy machine.
beforeAll(async () => {
  records = (await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))).flat()
}, 60_000)

/** Where hrefFor() puts a record: its page or entry, and a reading list's sections. */
function addressesOf(record: ContentRecord): string[] {
  switch (record.kind) {
    case 'concept':
    case 'topic':
    case 'page':
      return [hrefFor({ kind: record.kind, id: record.slug })]
    case 'resource-list':
      return [
        hrefFor({ kind: 'resource-list', id: record.slug }),
        ...record.groups.map(({ id }) =>
          hrefFor({ kind: 'resource-list', id: record.slug, anchor: id }),
        ),
      ]
    case 'work':
      return [hrefFor({ kind: 'work', id: record.slug })]
    case 'passage':
      return [hrefFor({ kind: 'passage', id: record.id })]
    case 'reference':
      return [hrefFor({ kind: 'reference', id: record.id })]
    case 'questionnaire':
      return [hrefFor({ kind: 'questionnaire', id: record.slug, status: record.status })]
    case 'glossary':
      return [hrefFor({ kind: 'glossary', id: record.slug })]
    case 'home':
      return [hrefFor({ page: 'home' })]
  }
}

/** The rows that catch a path, as Next matches a source: ignoring case, with the slash exact. */
function rowsCatching(path: string) {
  return redirects.filter(
    ({ source }) =>
      getPathMatch(source, { strict: true, removeUnnamedParams: true })(path) !== false,
  )
}

/** Where the one row catching a path sends it, or every destination when it isn't exactly one. */
function sends(path: string) {
  const destinations = rowsCatching(path).map(({ destination }) => destination)
  return destinations.length === 1 ? destinations[0] : destinations
}

describe('the matcher these tests copy from Next', () => {
  // buildCustomRoute passes `sensitive: caseSensitiveRoutes`; rowsCatching() leaves it out.
  it('agrees with the server only while routes ignore case', () => {
    expect(nextConfig.experimental?.caseSensitiveRoutes).toBeFalsy()
  })
})

describe('the current site’s pages and posts (D11, design B4)', () => {
  it('sends each one to its new page, by one row', () => {
    expect(Object.keys(PAGES_AND_POSTS)).toHaveLength(37)
    for (const [old, page] of Object.entries(PAGES_AND_POSTS)) expect(sends(old), old).toBe(page)
  })

  it('leaves / and /concepts/ alone: the new site keeps both, so nothing loops', async () => {
    const paths = (await site.routes()).map(({ path }) => path)
    for (const kept of ['/', '/concepts/']) {
      expect(paths, kept).toContain(kept)
      expect(rowsCatching(kept), kept).toEqual([])
    }
  })
})

describe('archives and the feed (D17)', () => {
  it('sends the category archives to the A–Z and the homepage, and the feed home', () => {
    expect(sends('/category/concepts/')).toBe('/concepts/')
    expect(sends('/category/uncategorized/')).toBe('/')
    expect(sends('/feed/')).toBe('/')
  })

  it('sends any author’s archive and feed home by a pattern, never a username', () => {
    // Made-up names: the real ones never appear in the repo.
    for (const old of ['/author/any-name/', '/author/Another-Name/', '/author/any-name/feed/'])
      expect(sends(old), old).toBe('/')
    for (const { source } of redirects.filter(({ source }) => /^\/author\//i.test(source)))
      expect(source, 'an author’s archive is matched by a parameter').toMatch(/^\/author\/:/)
  })
})

describe('the table (FR-07)', () => {
  it('lists those old addresses and /topics/, each once, and nothing else', () => {
    const sources = redirects.map(({ source }) => source)
    expect([...sources].sort()).toEqual(
      [
        ...Object.keys(PAGES_AND_POSTS),
        '/category/concepts/',
        '/category/uncategorized/',
        '/author/:name*/',
        '/feed/',
        '/topics/',
      ].sort(),
    )
    // Next matches sources ignoring case, so two differing only in case would share a source too.
    expect(new Set(sources.map((source) => source.toLowerCase())).size).toBe(sources.length)
  })

  it('writes each old address as the current site served it: lower case, with its slash', () => {
    for (const { source } of redirects) expect(source).toMatch(/^\/(?:[a-z0-9:*-]+\/)+$/)
  })

  it('sends every row to a route in the registry, or to an anchor hrefFor() makes on one', async () => {
    const paths = new Set((await site.routes()).map(({ path }) => path))
    const anchors = new Set(records.flatMap(addressesOf).filter((address) => address.includes('#')))
    expect(anchors.size, 'anchors hrefFor() makes').toBeGreaterThan(100)
    for (const { destination } of redirects) {
      expect(paths, destination).toContain(destination.split('#')[0])
      if (destination.includes('#')) expect(anchors, destination).toContain(destination)
    }
  })

  it('never sends a row to an address the table moves, so each one is a single hop', () => {
    for (const { source, destination } of redirects) {
      const [path = ''] = destination.split('#')
      expect(rowsCatching(path), `${source} → ${destination}`).toEqual([])
    }
  })
})

describe('the table, cross-checked with the content’s provenance', () => {
  /**
   * The kinds a current page or post was carried into (design B4). Works, passages, References
   * and topics only quote or cite the pages they name.
   */
  const KEPT = ['concept', 'questionnaire', 'glossary', 'resource-list', 'page', 'home'] as const
  type KeptRecord = RecordOf<(typeof KEPT)[number]>
  const isKept = (record: ContentRecord): record is KeptRecord =>
    (KEPT as readonly string[]).includes(record.kind)

  /** Each current-site address a kept record was read from, with every kept record read from it. */
  function oldAddresses(): Map<string, ContentRecord[]> {
    const named = new Map<string, ContentRecord[]>()
    for (const record of records.filter(isKept))
      for (const { url } of record.provenance.sources) {
        const { hostname, pathname } = new URL(url)
        if (hostname === 'care4mind.org')
          named.set(pathname, [...(named.get(pathname) ?? []), record])
      }
    return named
  }

  it('sends each address a kept record was read from into that record, by one row, unless kept', async () => {
    const paths = new Set((await site.routes()).map(({ path }) => path))
    const named = oldAddresses()
    expect(named.size, 'old addresses the kept records were read from').toBeGreaterThan(25)
    for (const [old, heirs] of named) {
      if (paths.has(old)) {
        expect(rowsCatching(old), `${old} is kept`).toEqual([])
        continue
      }
      expect(rowsCatching(old), old).toHaveLength(1)
      expect(heirs.flatMap(addressesOf), old).toContain(sends(old))
    }
  })

  it('sends a page that became both a Concept and a Questionnaire to the Concept (D12)', () => {
    const both = [...oldAddresses()].filter(
      ([, heirs]) =>
        heirs.some(({ kind }) => kind === 'concept') &&
        heirs.some(({ kind }) => kind === 'questionnaire'),
    )
    expect(both).not.toHaveLength(0)
    for (const [old, heirs] of both) {
      const concepts = heirs.filter(({ kind }) => kind === 'concept').flatMap(addressesOf)
      expect(concepts, old).toEqual([sends(old)])
    }
  })
})
