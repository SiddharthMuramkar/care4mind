import { gzipSync } from 'node:zlib'

import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, site, type SearchDocument } from '@/content'
import { stripDiacritics } from '@/lib/sanskrit'
import { buildIndex, query, type SearchHit, type SearchIndex } from '@/lib/search/engine'
import { resultGroups } from '@/lib/search/search'
import { search } from '@/lib/search/server'

let index: SearchIndex
let json: string

beforeAll(async () => {
  json = JSON.stringify(buildIndex(await site.searchDocuments()))
  // Read back from JSON, as the browser receives it from /search-index.json.
  index = JSON.parse(json) as SearchIndex
})

const ids = (hits: readonly SearchHit[]) => hits.map(({ id }) => id)
const hit = (q: string, id: string) => query(index, q).find((found) => found.id === id)

describe('the search engine, on the real corpus', () => {
  it.each(['vikshepa', 'viksepa', 'vikṣepa', 'विक्षेप', 'Vikshepa ', 'VIKṢEPA'])(
    'ranks the Vikṣepa Concept first for “%s”',
    (q) => {
      expect(query(index, q)[0]?.id).toBe('concept:vikshepa')
    },
  )

  it('finds the saṃśaya term inside Vikṣepa by “Sanshay”, with Vikṣepa as its parent', () => {
    expect(hit('Sanshay', 'term:vikshepa#samsaya')).toMatchObject({
      kind: 'term',
      title: expect.stringMatching(/^Saṃśaya/),
      href: '/concepts/vikshepa/#samsaya',
      parent: 'Vikṣepa',
      matched: { field: 'names', variant: 'Sanshay' },
    })
  })

  it.each(['panch klesha', 'pancha klesha', 'pañca kleśa', 'Panchaklesha'])(
    'ranks Pañca kleśa first for “%s”',
    (q) => {
      expect(query(index, q)[0]?.id).toBe('concept:panch-klesha')
    },
  )

  it.each(['brahma vihara', 'brahmavihara', 'Brahmavihāra'])('finds Brahmavihāra by “%s”', (q) => {
    expect(query(index, q)[0]?.id).toBe('concept:brahma-vihara')
  })

  it('finds the passage by its locator, “YS 1.30”, and by its work’s name and locator', () => {
    expect(query(index, 'YS 1.30')[0]).toMatchObject({
      id: 'passage:yoga-sutra/1.30',
      kind: 'passage',
      href: '/texts/yoga-sutra/#1-30',
    })
    expect(query(index, 'Yoga Sutra 1.30')[0]?.id).toBe('passage:yoga-sutra/1.30')
  })

  it('finds the Tomar Reference by “Tomar”, and every Concept citing it', async () => {
    const found = ids(query(index, 'Tomar'))
    const citing = (await concepts.list({ reference: 'tomar-2024' })).map(
      ({ slug }) => `concept:${slug}`,
    )
    expect(citing).toHaveLength(16)
    expect(found).toEqual(expect.arrayContaining(['reference:tomar-2024', ...citing]))
    expect(hit('Tomar', 'concept:vikshepa')?.matched).toEqual({
      field: 'people',
      variant: 'Tomar',
    })
  })

  it('reads पंच and पञ्च as one form, and ignores zero-width joiners', () => {
    // The content writes Pañca kleśa in IAST only, so a made-up document carries the Devanagari.
    const made: SearchDocument = {
      id: 'concept:made-up',
      kind: 'concept',
      title: 'Made up',
      href: '/concepts/made-up/',
      names: ['पञ्च क्लेश'],
      keywords: [],
      people: [],
      excerpt: '',
    }
    const small = buildIndex([made])
    expect(ids(query(small, 'पंच'))).toEqual(['concept:made-up'])
    expect(ids(query(small, 'पंच क्लेश'))).toEqual(['concept:made-up'])
    expect(ids(query(small, 'पञ्च'))).toEqual(['concept:made-up'])
    expect(query(index, 'विक्\u200dषेप')[0]?.id).toBe('concept:vikshepa')
  })

  it('forgives typos: one edit in a word of 5–7 letters, two from 8', () => {
    expect(query(index, 'vikshpa')[0]?.id).toBe('concept:vikshepa')
    expect(query(index, 'brahmachrya')[0]?.id).toBe('concept:brahmacharya')
    // Four letters are too few to guess at.
    expect(ids(query(index, 'satx'))).not.toContain('concept:satya')
  })

  it('finds only what holds the query, or a spelling of it', () => {
    const found = ids(query(index, 'vikshepa'))
    expect(found).toContain('questionnaire:vikshepa')
    expect(found).not.toContain('concept:satya')
    expect(found).not.toContain('concept:ahimsa')
    expect(found.length).toBeLessThan(40)
  })

  it('finds a name as it is being typed', () => {
    expect(query(index, 'viks')[0]?.id).toBe('concept:vikshepa')
    expect(query(index, 'brahma vih')[0]?.id).toBe('concept:brahma-vihara')
  })

  it('reads only the first eight words of a query, so a pasted page costs no more than a phrase', () => {
    // The ninth word would find nothing, were it read.
    expect(ids(query(index, `${'vikshepa '.repeat(8)}qqqqxz`))).toContain('concept:vikshepa')
  })

  it.each(['', '   ', '·', '—'])('returns nothing for the empty query “%s”', (q) => {
    expect(query(index, q)).toEqual([])
  })

  it('ranks hits best first, and within a kind the scores never rise', () => {
    const hits = query(index, 'vikshepa')
    expect(hits[0]?.id).toBe('concept:vikshepa')
    const scores = hits.map(({ score }) => score)
    expect(scores).toEqual(scores.toSorted((a, b) => b - a))
    for (const kind of new Set(hits.map((hit) => hit.kind))) {
      const within = hits.filter((hit) => hit.kind === kind).map(({ score }) => score)
      expect(within).toEqual(within.toSorted((a, b) => b - a))
    }
  })

  it('says which field and spelling matched', () => {
    expect(hit('विक्षेप', 'concept:vikshepa')?.matched).toEqual({
      field: 'names',
      variant: 'विक्षेप',
    })
    expect(hit('YS 1.30', 'passage:yoga-sutra/1.30')?.matched).toEqual({
      field: 'keywords',
      variant: 'YS 1.30',
    })
  })

  it('carries each result’s language: Pali for the Dhammapada, Sanskrit for Vikṣepa', () => {
    expect(hit('Dhammapada', 'work:dhammapada')).toMatchObject({
      title: 'Dhammapada',
      lang: 'pi-Latn',
    })
    expect(hit('Dhammapada 160', 'passage:dhammapada/160')?.lang).toBe('pi-Latn')
    expect(hit('vikshepa', 'concept:vikshepa')?.lang).toBe('sa-Latn')
    expect(hit('Tomar', 'reference:tomar-2024')).not.toHaveProperty('lang')
  })
})

describe('the matching order', () => {
  const named = (id: string, name: string): SearchDocument => ({
    id: `concept:${id}`,
    kind: 'concept',
    title: id,
    href: `/concepts/${id}/`,
    names: [name],
    keywords: [],
    people: [],
    excerpt: '',
  })

  it('ranks an exact match, then a prefix, then a sound, then a typo', () => {
    const small = buildIndex([
      named('typo', 'kelpa'),
      named('sound', 'kalph'),
      // A long word the query is only the start of still outranks a match by sound.
      named('prefix', 'kalpanatmakata'),
      named('exact', 'kalpa'),
    ])
    expect(ids(query(small, 'kalpa'))).toEqual([
      'concept:exact',
      'concept:prefix',
      'concept:sound',
      'concept:typo',
    ])
  })

  it('puts a whole name or title first, over a higher-scoring start of another name', () => {
    const titled = (id: string, title: string, names: readonly string[]): SearchDocument => ({
      id: `concept:${id}`,
      kind: 'concept',
      title,
      href: `/concepts/${id}/`,
      names: [...names],
      keywords: [],
      people: [],
      excerpt: '',
    })
    const small = buildIndex([
      // Its names prefix scores above a title's 8; only the whole-title match leads.
      titled('prefix', 'Something else', ['kalpas']),
      titled('whole', 'Kalpa', []),
    ])
    expect(query(small, 'kalpa')[0]?.id).toBe('concept:whole')
    // Diacritics ignored: the same whole name, typed either way.
    expect(query(buildIndex([named('accented', 'kalpā')]), 'kalpa')[0]?.id).toBe('concept:accented')
  })
})

describe('what search never finds', () => {
  it.each(['Score Wise Category', 'High indicators', 'Scoring Continuum'])(
    'finds nothing held back: “%s”',
    (q) => {
      expect(query(index, q)).toEqual([])
    },
  )
})

describe('the index', () => {
  it('is at most 45 kB gzipped', () => {
    const size = gzipSync(json, { level: 9 }).length
    expect(size).toBeLessThanOrEqual(45 * 1024)
  })

  it('holds every search document once', async () => {
    expect(index.rows).toHaveLength((await site.searchDocuments()).length)
  })
})

describe('search(), as the results page calls it', () => {
  const conceptsFound = async (q: string) =>
    (await search(q)).filter(({ kind }) => kind === 'concept').map(({ id }) => id)

  it.each(['vikshepa', 'viksepa', 'vikṣepa', 'विक्षेप'])(
    'leads with Vikṣepa for “%s”',
    async (q) => {
      expect((await search(q))[0]?.id).toBe('concept:vikshepa')
    },
  )

  it('finds Vikṣepa for “focus”, a word only its keywords carry', async () => {
    expect(await conceptsFound('focus')).toContain('concept:vikshepa')
  })

  it.each(['anger', 'calm', 'meditation'])('finds at least one Concept for “%s”', async (q) => {
    expect((await conceptsFound(q)).length).toBeGreaterThan(0)
  })

  it('finds the same Concept page for every spelling of Vikṣepa', async () => {
    const firstHref = new Set<string>()
    for (const q of ['vikshepa', 'viksepa', 'vikṣepa', 'विक्षेप']) {
      const [first] = await search(q)
      expect(first?.id).toBe('concept:vikshepa')
      firstHref.add(first?.href as string)
    }
    expect(firstHref.size).toBe(1)
  })

  it('leads with the Bhagavad Gītā itself for “gita”, ahead of Concepts and glossary entries', async () => {
    const found = await search('gita')
    expect(found[0]).toMatchObject({ id: 'work:bhagavad-gita', href: '/texts/bhagavad-gita/' })
  })

  it('leads with every Concept for its own name, diacritics or none', async () => {
    for (const card of await concepts.list()) {
      for (const q of new Set([card.name, stripDiacritics(card.name)])) {
        expect((await search(q))[0]?.id, `${card.slug} for “${q}”`).toBe(`concept:${card.slug}`)
      }
    }
  }, 60_000)

  it.each(['stress', 'anxiety'])(
    'finds no Concept for the construct “%s”: no keyword names it',
    async (q) => {
      expect(await conceptsFound(q)).toEqual([])
    },
  )

  it('finds nothing at all for “self-worth”, so the page reaches its no-results state', async () => {
    expect(await search('self-worth')).toEqual([])
  })

  it('carries a Concept’s and a term’s gloss, and none where the page gives none', async () => {
    const vikshepa = (await concepts.list()).find(({ slug }) => slug === 'vikshepa')
    const onConcept = (await search('vikshepa')).find(({ id }) => id === 'concept:vikshepa')
    expect(onConcept?.gloss).toBe(vikshepa?.english)
    const onTerm = (await search('samsaya')).find(({ id }) => id === 'term:vikshepa#samsaya')
    expect(onTerm?.gloss).toBe('Doubt')
    const onReference = (await search('Tomar')).find(({ id }) => id === 'reference:tomar-2024')
    expect(onReference).not.toHaveProperty('gloss')
  })
})

describe('the result groups', () => {
  const hitOf = (kind: SearchHit['kind'], n: number): SearchHit => ({
    id: `${kind}:${n}`,
    kind,
    title: `${kind} ${n}`,
    href: `/${kind}/${n}/`,
    matched: { field: 'title', variant: `${kind} ${n}` },
    score: 0,
  })

  it('orders groups as the page has them, however the hits rank', () => {
    const groups = resultGroups([
      hitOf('reference', 1),
      hitOf('concept', 1),
      hitOf('reference', 2),
      hitOf('work', 1),
    ])
    expect(groups.map(({ kind, heading, total }) => ({ kind, heading, total }))).toEqual([
      { kind: 'concept', heading: 'Concepts', total: 1 },
      { kind: 'work', heading: 'Traditional texts', total: 1 },
      { kind: 'reference', heading: 'References', total: 2 },
    ])
    // Within a group the hits keep their ranked order.
    expect(groups.at(-1)?.results.map(({ id }) => id)).toEqual(['reference:1', 'reference:2'])
  })

  it('heads each group as the results page has, Library items and pages together last', () => {
    const kinds = [
      'page',
      'library-item',
      'reference',
      'questionnaire',
      'passage',
      'work',
      'glossary',
      'topic',
      'term',
      'concept',
    ] as const
    const groups = resultGroups(kinds.map((kind, n) => hitOf(kind, n)))
    expect(groups.map(({ kind, heading }) => ({ kind, heading }))).toEqual([
      { kind: 'concept', heading: 'Concepts' },
      { kind: 'term', heading: 'Terms' },
      { kind: 'topic', heading: 'Topics' },
      { kind: 'glossary', heading: 'Glossary entries' },
      { kind: 'work', heading: 'Traditional texts' },
      { kind: 'passage', heading: 'Passages' },
      { kind: 'questionnaire', heading: 'Questionnaires' },
      { kind: 'reference', heading: 'References' },
      { kind: 'library-and-pages', heading: 'Library and other pages' },
    ])
    const merged = groups.at(-1)
    expect(merged?.total).toBe(2)
    expect(merged?.results.map(({ kind }) => kind)).toEqual(['page', 'library-item'])
  })

  it('shows at most 5 of a group, counts the rest, and shows all of the expanded group', () => {
    const hits = Array.from({ length: 30 }, (_, n) => hitOf('passage', n))
    const [group] = resultGroups(hits)
    expect(group).toMatchObject({ kind: 'passage', heading: 'Passages', total: 30 })
    expect(group?.results).toHaveLength(5)
    expect(group?.results.map(({ id }) => id)).toEqual(hits.slice(0, 5).map(({ id }) => id))
    const [expanded] = resultGroups(hits, 'passage')
    expect(expanded?.results).toHaveLength(30)
    expect(expanded?.total).toBe(30)
  })

  it('drops groups with nothing found, and groups nothing from nothing', () => {
    expect(resultGroups([])).toEqual([])
    expect(resultGroups([hitOf('topic', 1)]).map(({ kind }) => kind)).toEqual(['topic'])
  })

  it('shows no group over 5 before “Show all” on the real corpus, and counts every hit once', async () => {
    const names = (await concepts.list()).slice(0, 5).map(({ name }) => name)
    for (const q of [...names, 'gita', 'a', 'yoga']) {
      const hits = query(index, q)
      const groups = resultGroups(hits)
      expect(
        groups.reduce((sum, { total }) => sum + total, 0),
        q,
      ).toBe(hits.length)
      for (const group of groups) {
        expect(group.results.length, `${q} ${group.kind}`).toBeLessThanOrEqual(5)
        // “Show all n” stands exactly where the cap holds results back.
        expect(group.total > group.results.length, `${q} ${group.kind}`).toBe(group.total > 5)
        const scores = group.results.map(({ score }) => score)
        expect(scores, `${q} ${group.kind}`).toEqual(scores.toSorted((a, b) => b - a))
      }
    }
  }, 60_000)
})

describe('the language a hit carries', () => {
  it('passes a document’s language through the packed index to its hit', () => {
    const documents: SearchDocument[] = [
      {
        id: 'work:pali-verses',
        kind: 'work',
        title: 'Pali Verses',
        lang: 'pi-Latn',
        href: '/texts/pali-verses/',
        names: ['Pali Verses'],
        keywords: [],
        people: [],
        excerpt: '',
      },
      {
        id: 'concept:calm-term',
        kind: 'concept',
        title: 'Upekkha Term',
        lang: 'sa-Latn',
        href: '/concepts/calm-term/',
        names: ['Upekkha Term'],
        keywords: [],
        people: [],
        excerpt: '',
      },
      {
        id: 'page:plain-guide',
        kind: 'page',
        title: 'Plain Guide',
        href: '/library/plain-guide/',
        names: [],
        keywords: [],
        people: [],
        excerpt: '',
      },
    ]
    // Through JSON, as the packed index travels.
    const packed = JSON.parse(JSON.stringify(buildIndex(documents))) as SearchIndex
    expect(query(packed, 'Pali')[0]).toMatchObject({ id: 'work:pali-verses', lang: 'pi-Latn' })
    expect(query(packed, 'Upekkha')[0]).toMatchObject({
      id: 'concept:calm-term',
      lang: 'sa-Latn',
    })
    expect(query(packed, 'Plain')[0]).toMatchObject({ id: 'page:plain-guide' })
    expect(query(packed, 'Plain')[0]).not.toHaveProperty('lang')
  })
})
