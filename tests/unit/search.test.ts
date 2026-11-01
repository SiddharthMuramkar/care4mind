import { describe, expect, it } from 'vitest'

import { site } from '@/content'
import { documentsMatching } from '@/lib/search'

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
