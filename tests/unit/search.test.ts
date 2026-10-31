import { describe, expect, it } from 'vitest'

import type { SearchDocument } from '@/content'
import { fold, groupHits, SHOWN, substringHits, substringSearch } from '@/app/search/match'

function doc(
  over: Partial<SearchDocument> & Pick<SearchDocument, 'id' | 'kind' | 'title'>,
): SearchDocument {
  return { href: `/${over.id}/`, names: [], keywords: [], people: [], excerpt: '', ...over }
}

const vikshepa = doc({
  id: 'concept:vikshepa',
  kind: 'concept',
  title: 'Vikṣepa',
  lang: 'sa-Latn',
  names: ['vikṣepa', 'विक्षेप', 'vikshepa'],
})

describe('diacritic folding', () => {
  it('matches one spelling to another, ignoring case and marks', () => {
    // ṣ is an s with a mark: folding drops the mark. "vikshepa" is a stored spelling, not a fold.
    expect(fold('Vikṣepa')).toBe('viksepa')
    expect(fold('Vikṣepa')).toBe(fold('viksepa'))
    for (const query of ['viksepa', 'VIKṢEPA', 'vikshepa'])
      expect(substringHits([vikshepa], query).map(({ id }) => id)).toEqual(['concept:vikshepa'])
  })

  it('still matches Devanagari as written', () => {
    expect(substringHits([vikshepa], 'विक्षेप').map(({ title }) => title)).toEqual(['Vikṣepa'])
  })

  it('finds nothing for an empty query, and does not look in the excerpt', () => {
    const onlyExcerpt = doc({
      id: 'page:note',
      kind: 'page',
      title: 'A note',
      excerpt: 'vikshepa is mentioned here',
    })
    expect(substringHits([vikshepa, onlyExcerpt], '')).toEqual([])
    expect(substringHits([vikshepa, onlyExcerpt], '   ')).toEqual([])
    expect(substringHits([onlyExcerpt], 'vikshepa')).toEqual([])
  })
})

describe('grouping and the cap', () => {
  it('shows kinds in page order and drops kinds with nothing', () => {
    const term = doc({
      id: 'term:doubt',
      kind: 'term',
      title: 'Saṃśaya',
      parent: 'Vikṣepa',
      keywords: ['doubt'],
    })
    const concept = doc({
      id: 'concept:doubt',
      kind: 'concept',
      title: 'Doubt',
      keywords: ['doubt'],
    })
    const hits = substringHits([term, concept], 'doubt')
    expect(hits.map(({ kind }) => kind)).toEqual(['concept', 'term'])
    expect(groupHits(hits).map(({ heading, total }) => [heading, total])).toEqual([
      ['Concepts', 1],
      ['Terms inside Concepts', 1],
    ])
  })

  it('keeps the first 25 of a kind and counts the rest', () => {
    const concepts = Array.from({ length: SHOWN + 1 }, (_, index) =>
      doc({
        id: `concept:${index}`,
        kind: 'concept',
        title: `Concept ${index}`,
        keywords: ['needle'],
      }),
    )
    const term = doc({ id: 'term:1', kind: 'term', title: 'A needle', keywords: ['needle'] })
    const groups = groupHits(substringHits([...concepts, term], 'needle'))
    expect(groups.map(({ kind, total, results }) => [kind, total, results.length])).toEqual([
      ['concept', SHOWN + 1, SHOWN],
      ['term', 1, 1],
    ])
    expect(groups[0]?.results.map(({ id }) => id)).toEqual(
      concepts.slice(0, SHOWN).map(({ id }) => id),
    )
  })

  it('is the page’s Search', async () => {
    const search = substringSearch([vikshepa])
    expect((await search('vikshepa')).map(({ lang }) => lang)).toEqual(['sa-Latn'])
  })
})
