import { describe, expect, it } from 'vitest'

import { site, type SearchDocument, type SearchKind } from '@/content'
import { documentsMatching, resultGroups, SHOWN, substringSearch } from '@/lib/search'

function document(id: string, kind: SearchKind, title: string, more: Partial<SearchDocument> = {}) {
  return {
    id,
    kind,
    title,
    href: `/${id}/`,
    names: [],
    keywords: [],
    people: [],
    excerpt: '',
    ...more,
  } satisfies SearchDocument
}

const vikshepa = document('concept:vikshepa', 'concept', 'Vikṣepa', {
  names: ['vikṣepa', 'विक्षेप', 'viksepa'],
})
const doubt = document('term:vikshepa#samsaya', 'term', 'Saṃśaya', {
  keywords: ['Doubt'],
  parent: 'Vikṣepa',
})
const paper = document('reference:rao-2001', 'reference', 'A paper', { people: ['Rao'] })
const essay = document('page:essay', 'page', 'An essay', { excerpt: 'Rao wrote of saṃśaya.' })

describe('substringSearch', () => {
  const search = substringSearch([vikshepa, doubt, paper, essay])
  const ids = (query: string) => search.find(query).map(({ id }) => id)

  it('finds a query inside a name, title, keyword or author, case ignored', () => {
    expect(ids('VIKṢEPA')).toEqual(['concept:vikshepa'])
    expect(ids('doubt')).toEqual(['term:vikshepa#samsaya'])
    expect(ids('rao')).toEqual(['reference:rao-2001'])
  })

  it('ignores diacritics on either side, and decomposed input', () => {
    expect(ids('samsaya')).toEqual(['term:vikshepa#samsaya'])
    expect(ids('vikṣ')).toEqual(['concept:vikshepa'])
    expect(ids('saṃśaya')).toEqual(['term:vikshepa#samsaya'])
  })

  it('finds a Devanagari name', () => {
    expect(ids('विक्षेप')).toEqual(['concept:vikshepa'])
  })

  it('finds nothing for a blank query, and never matches the excerpt', () => {
    expect(ids('   ')).toEqual([])
    expect(ids('wrote')).toEqual([])
  })
})

describe('resultGroups', () => {
  it('groups results by kind in the page’s order, leaving out empty kinds', () => {
    const groups = resultGroups([essay, paper, doubt, vikshepa])
    expect(groups.map(({ kind, heading }) => [kind, heading])).toEqual([
      ['concept', 'Concepts'],
      ['term', 'Terms inside Concepts'],
      ['reference', 'References'],
      ['page', 'Pages'],
    ])
    expect(groups[1]).toEqual({
      kind: 'term',
      heading: 'Terms inside Concepts',
      shown: [doubt],
      more: 0,
    })
  })

  it(`shows at most ${SHOWN} of one kind and counts the rest`, () => {
    const many = Array.from({ length: 31 }, (_, n) =>
      document(`passage:p/${n}`, 'passage', `P ${n}`),
    )
    const [verses] = resultGroups(many)
    expect(SHOWN).toBe(25)
    expect(verses?.shown).toEqual(many.slice(0, 25))
    expect(verses?.more).toBe(6)
  })
})

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
