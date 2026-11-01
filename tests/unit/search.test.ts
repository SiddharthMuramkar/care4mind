import { describe, expect, it } from 'vitest'

import { site, type SearchDocument } from '@/content'
import { documentsMatching, resultGroups, SHOWN, substringSearch } from '@/lib/search'

describe('documentsMatching, over the site’s own search documents', () => {
  const conceptsFound = async (query: string) =>
    documentsMatching(await site.searchDocuments(), query)
      .filter(({ kind }) => kind === 'concept')
      .map(({ id }) => id)

  it('finds Vikṣepa for “focus”, a word only its keywords carry', async () => {
    expect(await conceptsFound('focus')).toContain('concept:vikshepa')
  })

  it.each(['calm', 'meditation'])('finds at least one Concept for “%s”', async (query) => {
    expect((await conceptsFound(query)).length).toBeGreaterThan(0)
  })

  it('ignores case and diacritics, and finds nothing for an empty query', async () => {
    expect(await conceptsFound('VIKSEPA')).toEqual(await conceptsFound('vikṣepa'))
    expect(documentsMatching(await site.searchDocuments(), '  ')).toEqual([])
  })
})

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

describe('substringSearch', () => {
  it('matches across case and diacritics, and Devanagari as written', async () => {
    const search = substringSearch([vikshepa])
    for (const query of ['viksepa', 'VIKṢEPA', 'vikshepa', 'विक्षेप'])
      expect((await search(query)).map(({ id }) => id)).toEqual(['concept:vikshepa'])
  })

  it('returns hits carrying the title’s lang, and does not look in the excerpt', async () => {
    const onlyExcerpt = doc({ id: 'page:note', kind: 'page', title: 'A note', excerpt: 'vikshepa' })
    const search = substringSearch([vikshepa, onlyExcerpt])
    expect(await search('vikshepa')).toEqual([
      {
        id: 'concept:vikshepa',
        kind: 'concept',
        title: 'Vikṣepa',
        href: '/concept:vikshepa/',
        lang: 'sa-Latn',
      },
    ])
    expect(await search('   ')).toEqual([])
  })
})

describe('resultGroups', () => {
  it('shows kinds in page order and drops kinds with nothing', async () => {
    const term = doc({ id: 'term:doubt', kind: 'term', title: 'Saṃśaya', keywords: ['doubt'] })
    const concept = doc({ id: 'concept:doubt', kind: 'concept', title: 'Doubt' })
    const groups = resultGroups(await substringSearch([term, concept])('doubt'))
    expect(groups.map(({ heading, total }) => [heading, total])).toEqual([
      ['Concepts', 1],
      ['Terms inside Concepts', 1],
    ])
  })

  it('keeps the first 25 of a kind and counts the rest', async () => {
    const concepts = Array.from({ length: SHOWN + 1 }, (_, index) =>
      doc({
        id: `concept:${index}`,
        kind: 'concept',
        title: `Concept ${index}`,
        keywords: ['needle'],
      }),
    )
    const term = doc({ id: 'term:1', kind: 'term', title: 'A needle' })
    const groups = resultGroups(await substringSearch([...concepts, term])('needle'))
    expect(SHOWN).toBe(25)
    expect(groups.map(({ kind, total, results }) => [kind, total, results.length])).toEqual([
      ['concept', SHOWN + 1, SHOWN],
      ['term', 1, 1],
    ])
    expect(groups[0]?.results.map(({ id }) => id)).toEqual(
      concepts.slice(0, SHOWN).map(({ id }) => id),
    )
  })
})
