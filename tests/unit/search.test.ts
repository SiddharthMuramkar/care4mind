import { gzipSync } from 'node:zlib'

import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, site, type SearchDocument } from '@/content'
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

  it('groups hits by kind, the kind holding the best hit first', () => {
    const hits = query(index, 'vikshepa')
    const kinds = hits.map(({ kind }) => kind)
    const groups = kinds.filter((kind, at) => kind !== kinds[at - 1])
    expect(new Set(groups).size).toBe(groups.length)
    expect(groups[0]).toBe('concept')
    for (const group of new Set(groups)) {
      const scores = hits.filter(({ kind }) => kind === group).map(({ score }) => score)
      expect(scores).toEqual(scores.toSorted((a, b) => b - a))
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

  it('orders groups by their first hit, not by a fixed order of kinds', () => {
    const groups = resultGroups([
      hitOf('reference', 1),
      hitOf('concept', 1),
      hitOf('reference', 2),
      hitOf('work', 1),
    ])
    expect(groups.map(({ kind, heading, total }) => ({ kind, heading, total }))).toEqual([
      { kind: 'reference', heading: 'References', total: 2 },
      { kind: 'concept', heading: 'Concepts', total: 1 },
      { kind: 'work', heading: 'Traditional texts', total: 1 },
    ])
    expect(groups[0]?.results.map(({ id }) => id)).toEqual(['reference:1', 'reference:2'])
  })

  it('heads each kind as the results page has', () => {
    const kinds = [
      'concept',
      'term',
      'topic',
      'glossary',
      'work',
      'passage',
      'questionnaire',
      'reference',
      'library-item',
      'page',
    ] as const
    expect(
      resultGroups(kinds.map((kind, n) => hitOf(kind, n))).map(({ heading }) => heading),
    ).toEqual([
      'Concepts',
      'Terms inside Concepts',
      'Topics',
      'Glossary',
      'Traditional texts',
      'Verses',
      'Questionnaires',
      'References',
      'In the Library',
      'Pages',
    ])
  })

  it('shows at most 25 of a kind and counts the rest in its total', () => {
    const hits = Array.from({ length: 30 }, (_, n) => hitOf('passage', n))
    const [group] = resultGroups(hits)
    expect(group).toMatchObject({ kind: 'passage', heading: 'Verses', total: 30 })
    expect(group?.results).toHaveLength(25)
    expect(group?.results.map(({ id }) => id)).toEqual(hits.slice(0, 25).map(({ id }) => id))
  })

  it('drops kinds with nothing found, and groups nothing from nothing', () => {
    expect(resultGroups([])).toEqual([])
    expect(resultGroups([hitOf('topic', 1)]).map(({ kind }) => kind)).toEqual(['topic'])
  })
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
