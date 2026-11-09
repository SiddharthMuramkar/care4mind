import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  feedOf,
  oldArchives,
  oldFeed,
  oldMedia,
  oldPagesAndPosts,
  oldShortlinks,
} from '@/config/old-site-urls'
import { ART } from '@/art/registry'
import { artFileOf } from '@/config/old-media-art'
import { redirects, type Redirect } from '@/config/redirects'
import { hrefFor, site } from '@/content'
import { CONTENT_KINDS, type ContentRecord, type RecordOf, localSource } from '@/content/testing'

import nextConfig from '../../next.config'

// Every address the current site served leads to its new page in one
// hop (FR-07). The expected rows are the keep, merge or drop list's decisions, with the
// slugs the content shipped (`chittabhumi`, not the design's `citta-bhumi`).

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
  // The 16 description pages, each now a Concept.
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

/** Where an old page now leads: its row's page, or itself when the new site keeps it. */
const newPageOf = (old: string) => PAGES_AND_POSTS[old] ?? old

/** The old Karma Yoga picture's home: an anchor hrefFor() never makes, so named exactly here. */
const KARMA_CYCLE = '/questionnaires/karmayoga-scale/#karma-cycle'

/** Whether an address is a real file under `public/`. `/` is that folder itself, so it isn't. */
const isPublicFile = (address: string) =>
  statSync(join(process.cwd(), 'public', address), { throwIfNoEntry: false })?.isFile() ?? false

const readJson = (path: string) => JSON.parse(readFileSync(join(process.cwd(), path), 'utf8'))

/** The WordPress media list saved beside the masters: every address, with its file's id. */
const MEDIA_LIST = readJson('art/old-media-addresses.json') as {
  address: string
  wpId: number
}[]

/** All 71 uploaded files, with what the new site does with each. */
const ORIGINALS = (
  readJson('scripts/art/originals.json') as {
    files: { wpId: number; verdict: string }[]
  }
).files

/** The Elementor thumbnails the media list leaves out, by file name, with the file each was cut from. */
const ELEMENTOR_THUMBNAILS: Readonly<Record<string, number>> = {
  '52688095545_b9fa332de6_c': 276,
  'Indian-Farmer': 468,
  'Jewellry-making-2': 464,
  'Karmayoga-Main-image': 497,
  'Sculptor-3': 466,
  'WhatsApp-Image-2023-08-03-at-3.13.15-PM': 9,
  'Work-on-the-brain-1': 467,
  'atman-and-brahman': 324,
  'human-mind-and-sage-2': 460,
}

/** An old shortlink as a browser asks for it. */
const shortlinkOf = (id: string) => `/?p=${id}`

/** The six posts' WordPress ids, as the saved copies list them. */
const POST_IDS: Readonly<Record<string, string>> = {
  '431': '/karmayoga-scale/',
  '353': '/anubandha-chatushtaya/',
  '329': '/teertha-yatra-quiz/',
  '300': '/jagat/',
  '298': '/jiva/',
  '296': '/atman/',
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
      return [hrefFor({ kind: 'resource-list', id: record.slug })].concat(
        record.groups.map(({ id }) =>
          hrefFor({ kind: 'resource-list', id: record.slug, anchor: id }),
        ),
      )
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

/** Whether a row's conditions hold for a query, as Next reads a query condition. */
function conditionsHold({ has }: Redirect, query: URLSearchParams) {
  // Only query conditions can be judged from an address alone here; a header, cookie or
  // host condition is left to the browser tests, and counts as not holding.
  return (has ?? []).every((condition) => {
    if (condition.type !== 'query') return false
    const value = query.get(condition.key)
    // Next reads a condition's value as a pattern the query value must match.
    return (
      value !== null &&
      (condition.value === undefined || new RegExp(`^${condition.value}$`).test(value))
    )
  })
}

/** The rows that catch an address, as Next matches a source: ignoring case, with the slash exact. */
function rowsCatching(address: string) {
  const [path = '', query = ''] = address.split('?')
  const search = new URLSearchParams(query)
  return redirects.filter(
    (row) =>
      getPathMatch(row.source, { strict: true, removeUnnamedParams: true })(path) !== false &&
      conditionsHold(row, search),
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

describe('the current site’s pages and posts', () => {
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

describe('archives and the feed', () => {
  it('sends the category archives to the A–Z and the homepage, and the feed home', () => {
    expect(sends('/category/concepts/')).toBe('/concepts/')
    expect(sends('/category/uncategorized/')).toBe('/')
    expect(sends('/feed/')).toBe('/')
  })

  it('sends each page’s and archive’s feed where its page goes, in one hop', () => {
    for (const [old, page] of Object.entries(PAGES_AND_POSTS))
      expect(sends(feedOf(old)), feedOf(old)).toBe(page)
    expect(sends('/category/concepts/feed/')).toBe('/concepts/')
    expect(sends('/category/uncategorized/feed/')).toBe('/')
    // The one kept page with a feed of its own: its feed leads back to it.
    expect(sends(feedOf('/concepts/'))).toBe('/concepts/')
  })

  it('sends any author’s archive and feed home by a pattern, never a username', () => {
    // Made-up names: the real ones never appear in the repo.
    for (const old of ['/author/any-name/', '/author/Another-Name/', '/author/any-name/feed/'])
      expect(sends(old), old).toBe('/')
    for (const { source } of redirects.filter(({ source }) => /^\/author\//i.test(source)))
      expect(source, 'an author’s archive is matched by a parameter').toMatch(/^\/author\/:/)
  })
})

describe('the checked-in inventory of the old site’s addresses (FR-07)', () => {
  it('names the 33 pages and 6 posts, the archives as a pattern, and the feed', () => {
    expect(oldPagesAndPosts).toHaveLength(39)
    expect([...oldPagesAndPosts].sort()).toEqual(
      [...Object.keys(PAGES_AND_POSTS), '/', '/concepts/'].sort(),
    )
    expect(oldArchives).toEqual([
      '/category/concepts/',
      '/category/uncategorized/',
      '/author/:name*/',
    ])
    expect(oldFeed).toBe('/feed/')
    expect(Object.fromEntries(oldShortlinks.map(({ id, post }) => [id, post]))).toEqual(POST_IDS)
    // No address here is a username: the only author entry is the pattern itself.
    for (const address of [...oldPagesAndPosts, ...oldArchives, oldFeed])
      expect(address, address).toMatch(/^\/$|^\/(?:[a-z0-9:*-]+\/)+$/)
  })

  it('lands every inventoried page, archive and feed address on a route in one hop', async () => {
    const paths = new Set<string>((await site.routes()).map(({ path }) => path))
    // The author archives under made-up names: the real ones never appear in the repo.
    const authorExamples = ['/author/any-name/', '/author/any-name/feed/']
    const inventoried = [
      ...oldPagesAndPosts,
      ...oldPagesAndPosts.map(feedOf),
      '/category/concepts/',
      '/category/uncategorized/',
      '/category/concepts/feed/',
      '/category/uncategorized/feed/',
      ...authorExamples,
      oldFeed,
      ...oldMedia.map(({ address }) => address),
      ...oldShortlinks.map(({ id }) => shortlinkOf(id)),
    ]
    for (const address of inventoried) {
      if (paths.has(address)) {
        expect(rowsCatching(address), `${address} is kept`).toEqual([])
        continue
      }
      const destination = sends(address)
      expect(typeof destination, `${address} is caught by exactly one row`).toBe('string')
      const [path = ''] = (destination as string).split('#')
      if (!isPublicFile(path)) expect(paths, `${address} → ${destination}`).toContain(path)
      expect(rowsCatching(path), `${address} → ${destination} is one hop`).toEqual([])
    }
  })
})

describe('the map of surviving pictures', () => {
  const kept = ORIGINALS.filter(({ verdict }) => verdict === 'KEEP')

  it('has an entry for every kept picture', () => {
    expect(kept).toHaveLength(22)
    for (const { wpId } of kept) expect(artFileOf[wpId], `wpId ${wpId}`).toBeDefined()
  })

  it('leads each entry, but the Karma Yoga picture, to a file in the art registry', () => {
    const files = new Set<string>(ART.map(({ src }) => src))
    for (const [wpId, file] of Object.entries(artFileOf)) {
      if (Number(wpId) === 38) {
        expect(file).toBe(KARMA_CYCLE)
        continue
      }
      expect(files, `wpId ${wpId}`).toContain(file)
      expect(isPublicFile(file), file).toBe(true)
    }
  })
})

describe('the old site’s media and shortlinks', () => {
  it('names all 282 media addresses, each once, with the pages that showed it', () => {
    expect(oldMedia).toHaveLength(282)
    const addresses = oldMedia.map(({ address }) => address.toLowerCase())
    expect(new Set(addresses).size).toBe(addresses.length)
    for (const { address, shownOn } of oldMedia) {
      expect(address).toMatch(
        /^\/wp-content\/uploads\/(?:[a-z0-9]+\/)+[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|ttf|otf)$/,
      )
      for (const page of shownOn) expect(oldPagesAndPosts, address).toContain(page)
      // Shown on several pages, it goes where the first of them in the inventory goes.
      const inInventoryOrder = [...shownOn].sort(
        (a, b) => oldPagesAndPosts.indexOf(a) - oldPagesAndPosts.indexOf(b),
      )
      expect(shownOn, address).toEqual(inInventoryOrder)
    }
  })

  it('gives each address the WordPress id the media list names', () => {
    const idOf = new Map(oldMedia.map(({ address, wpId }) => [address, wpId]))
    for (const { address, wpId } of MEDIA_LIST) expect(idOf.get(address), address).toBe(wpId)
    const known = new Set(ORIGINALS.map(({ wpId }) => wpId))
    for (const { address, wpId } of oldMedia) expect(known, address).toContain(wpId)
  })

  it('keeps the 9 Elementor thumbnails beside the list, each matched by its file name', () => {
    const listed = new Set(MEDIA_LIST.map(({ address }) => address))
    const others = oldMedia.filter(({ address }) => !listed.has(address))
    const idOf = Object.fromEntries(
      others.map(({ address, wpId }) => [
        address
          .replace('/wp-content/uploads/elementor/thumbs/', '')
          .replace(/-q[a-z0-9]+\.\w+$/, ''),
        wpId,
      ]),
    )
    expect(idOf).toEqual(ELEMENTOR_THUMBNAILS)
  })

  it('sends a picture that survives to its new file, whatever page showed it', () => {
    const uploads = '/wp-content/uploads'
    expect(sends(`${uploads}/2024/05/Jewellry-making-2.jpeg`)).toBe('/art/plates/jeweller.jpg')
    expect(sends(`${uploads}/2024/05/Jewellry-making-2-300x300.jpeg`)).toBe(
      '/art/plates/jeweller.jpg',
    )
    expect(
      sends(
        `${uploads}/elementor/thumbs/Jewellry-making-2-qnpn6ncwphyxex69sd5av7hqigz6mf2kaj9s96qlc8.jpeg`,
      ),
    ).toBe('/art/plates/jeweller.jpg')
    expect(sends(`${uploads}/2024/05/Gear-Icon.png`)).toBe('/art/stickers/gear.png')
  })

  it('sends all three old copies of the Emblem, every size, to the Emblem', () => {
    const copies = oldMedia.filter(({ wpId }) => [643, 624, 614].includes(wpId))
    expect(copies).toHaveLength(10)
    for (const { address } of copies)
      expect(sends(address), address).toBe('/art/emblem/emblem-ring.png')
  })

  it('sends every size of the old Karma Yoga picture to the cycle on the KarmaYoga Scale page', () => {
    const sizes = oldMedia.filter(({ address }) => address.includes('/Karma-Yoga'))
    expect(sizes).toHaveLength(5)
    for (const { address } of sizes) expect(sends(address), address).toBe(KARMA_CYCLE)
  })

  it('sends any other file to the page that showed it, or home when no page did', () => {
    const uploads = '/wp-content/uploads'
    expect(sends(`${uploads}/2023/11/atman-and-brahman.jpg`)).toBe(newPageOf('/home-2/'))
    expect(
      sends(`${uploads}/2025/03/brahma-madurai-meenakshi-amman-temple-1576032-1024x821-1.jpg`),
    ).toBe('/concepts/')
    const unshown = oldMedia.find(
      ({ wpId, shownOn }) => artFileOf[wpId] === undefined && shownOn.length === 0,
    )
    expect(unshown).toBeDefined()
    expect(sends(unshown?.address ?? '')).toBe('/')
  })

  it('sends each media address to its new file, else where the first page that showed it leads, by one row', () => {
    for (const { address, wpId, shownOn } of oldMedia)
      expect(sends(address), address).toBe(artFileOf[wpId] ?? newPageOf(shownOn[0] ?? '/'))
    // Capitals in a file name match as typed, and any other case too.
    const named = oldMedia.find(({ address }) => /[A-Z]/.test(address))?.address ?? ''
    expect(named).not.toBe('')
    expect(sends(named.toLowerCase())).toBe(sends(named))
  })

  it('sends each post’s ?p= shortlink to that post’s new page, and leaves / alone without one', () => {
    for (const [id, post] of Object.entries(POST_IDS))
      expect(sends(shortlinkOf(id)), id).toBe(newPageOf(post))
    expect(rowsCatching('/?p=1')).toEqual([])
    expect(rowsCatching('/?p=4310')).toEqual([])
    expect(rowsCatching('/')).toEqual([])
  })
})

describe('the table (FR-07)', () => {
  it('lists those old addresses, their feeds, media and shortlinks, and /topics/, each once, and nothing else', () => {
    const sources = redirects.map(({ source }) => source)
    const moved = Object.keys(PAGES_AND_POSTS)
    const categories = ['/category/concepts/', '/category/uncategorized/']
    expect([...sources].sort()).toEqual(
      [
        ...moved,
        ...moved.map(feedOf),
        ...categories,
        ...categories.map(feedOf),
        feedOf('/concepts/'),
        '/author/:name*/',
        '/feed/',
        '/topics/',
        ...oldMedia.map(({ address }) => address),
        ...oldShortlinks.map(() => '/'),
      ].sort(),
    )
    // Next matches sources ignoring case, so two differing only in case would share a source too.
    const keys = redirects.map(
      ({ source, has }) => `${source.toLowerCase()} ${JSON.stringify(has)}`,
    )
    expect(new Set(keys).size).toBe(redirects.length)
  })

  it('writes each old address as the current site served it: lower case, ending in its slash or a file name as uploaded', () => {
    for (const { source } of redirects)
      expect(source).toMatch(
        /^\/(?:[a-z0-9:*-]+\/)*$|^\/(?:[a-z0-9:*-]+\/)*[A-Za-z0-9._-]+\.[a-z0-9]+$/,
      )
  })

  it('can express a query-conditioned address, and serves the table to Next as 301s', async () => {
    // An old shortlink is told apart by its query alone; the type has room for it.
    const shortlink: Redirect = {
      source: '/',
      destination: '/',
      has: [{ type: 'query', key: 'p' }],
    }
    expect(shortlink.has).toEqual([{ type: 'query', key: 'p' }])
    const served = await nextConfig.redirects?.()
    expect(served).toEqual(redirects.map((row) => ({ ...row, statusCode: 301 })))
  })

  it('sends every row to a route in the registry, an anchor hrefFor() makes on one, or a file in public', async () => {
    const paths = new Set<string>((await site.routes()).map(({ path }) => path))
    const anchors = new Set(records.flatMap(addressesOf).filter((address) => address.includes('#')))
    expect(anchors.size, 'anchors hrefFor() makes').toBeGreaterThan(100)
    for (const { destination } of redirects) {
      if (isPublicFile(destination)) continue
      expect(paths, destination).toContain(destination.split('#')[0])
      if (destination.includes('#') && destination !== KARMA_CYCLE)
        expect(anchors, destination).toContain(destination)
    }
  })

  it('holds 370 rows, 282 of them the old media addresses', () => {
    expect(redirects).toHaveLength(370)
    const sources = new Set(redirects.map(({ source }) => source))
    for (const { address } of oldMedia) expect(sources, address).toContain(address)
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
   * The kinds a current page or post was carried into. Works, passages, References
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
    const paths = new Set<string>((await site.routes()).map(({ path }) => path))
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

  it('sends a page that became both a Concept and a Questionnaire to the Concept', () => {
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
