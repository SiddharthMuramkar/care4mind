import { describe, expect, it } from 'vitest'

import {
  asciiSpellings,
  getConcept,
  getHomepage,
  getQuestionnaire,
  listConcepts,
  listQuestionnaires,
  type SanskritTerm,
} from '@/content'

// What the foundation's pages get from the content module, recorded before content v1 re-homed
// its three items (vikṣepa, the KarmaYoga Scale and the homepage). The legacy adapter must keep
// returning exactly this until front-end-site ticket 03 moves the pages and deletes it.
//
// The one allowed difference: provenance edits may change as the migration lists more of them,
// so they are left out of the recording.

const NOT_PINNED = '(provenance edits are not pinned)'

/** A copy of the value with its provenance edits replaced by a marker. */
function withoutEdits(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutEdits)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      key === 'edits' ? NOT_PINNED : withoutEdits(inner),
    ]),
  )
}

/** Every Sanskrit term inside a value: anything with an IAST form and its ASCII spellings. */
function termsIn(value: unknown): SanskritTerm[] {
  if (Array.isArray(value)) return value.flatMap(termsIn)
  if (value && typeof value === 'object') {
    const own = 'iast' in value && 'ascii' in value ? [value as SanskritTerm] : []
    return [...own, ...Object.values(value).flatMap(termsIn)]
  }
  return []
}

describe('the foundation’s content, through the legacy functions', () => {
  it('returns the vikṣepa Concept as the foundation did', async () => {
    expect(withoutEdits(await getConcept('vikshepa'))).toMatchSnapshot()
  })

  it('lists exactly the foundation’s one Concept', async () => {
    expect(await listConcepts()).toEqual([await getConcept('vikshepa')])
  })

  it('returns the KarmaYoga Scale as the foundation did', async () => {
    expect(withoutEdits(await getQuestionnaire('karmayoga-scale'))).toMatchSnapshot()
  })

  it('lists exactly the foundation’s one Questionnaire', async () => {
    expect(await listQuestionnaires()).toEqual([await getQuestionnaire('karmayoga-scale')])
  })

  it('returns the homepage as the foundation did', async () => {
    expect(withoutEdits(await getHomepage())).toMatchSnapshot()
  })

  it('gives every term on the foundation’s pages the same ASCII spellings', async () => {
    const terms = termsIn(await getConcept('vikshepa'))
    const spellings = Object.fromEntries(terms.map((term) => [term.iast, asciiSpellings(term)]))
    expect(spellings).toMatchSnapshot()
  })

  it('returns null for anything else', async () => {
    expect(await getConcept('karmayoga-scale')).toBeNull()
    expect(await getQuestionnaire('vikshepa')).toBeNull()
  })

  it('keeps a provenance edit list on each item', async () => {
    const items = [
      await getConcept('vikshepa'),
      await getQuestionnaire('karmayoga-scale'),
      await getHomepage(),
    ]
    for (const item of items) expect(item?.provenance.edits.length).toBeGreaterThan(0)
  })
})
