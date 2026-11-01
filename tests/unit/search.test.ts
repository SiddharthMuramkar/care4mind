import { gzipSync } from 'node:zlib'

import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, site, type SearchDocument } from '@/content'
import { buildIndex, query, type SearchHit, type SearchIndex } from '@/lib/search/engine'
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
