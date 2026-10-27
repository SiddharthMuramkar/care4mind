import { describe, expect, it } from 'vitest'

import {
  asciiSpellings,
  getConcept,
  getHomepage,
  getQuestionnaire,
  listConcepts,
  listQuestionnaires,
} from '@/content'
import { isNormalisedSanskrit } from '@/lib/sanskrit'

/** Every string anywhere inside a value. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

async function allContent() {
  return [...(await listConcepts()), ...(await listQuestionnaires()), await getHomepage()]
}

describe('content module', () => {
  it('finds a Concept by slug and returns null for an unknown one', async () => {
    expect((await getConcept('vikshepa'))?.term.iast).toBe('vikṣepa')
    expect(await getConcept('no-such-concept')).toBeNull()
  })

  it('finds a Questionnaire by slug and returns null for an unknown one', async () => {
    expect((await getQuestionnaire('karmayoga-scale'))?.availability).toBe('coming-soon')
    expect(await getQuestionnaire('no-such-questionnaire')).toBeNull()
  })

  it('lists every ASCII spelling of a term, starting with IAST minus diacritics', async () => {
    const concept = await getConcept('vikshepa')
    expect(concept && asciiSpellings(concept.term)).toEqual(['viksepa', 'Vikshepa'])
  })
})

describe('content integrity', () => {
  it('stores every string as NFC with anusvara as ṃ', async () => {
    const offenders = strings(await allContent()).filter((text) => !isNormalisedSanskrit(text))
    expect(offenders).toEqual([])
  })

  it('uses unique slugs', async () => {
    const slugs = [...(await listConcepts()), ...(await listQuestionnaires())].map(
      (item) => item.slug,
    )
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('links only to Questionnaires and Concepts that exist', async () => {
    for (const concept of await listConcepts()) {
      for (const slug of concept.relatedQuestionnaires)
        expect(await getQuestionnaire(slug)).not.toBeNull()
    }
    for (const questionnaire of await listQuestionnaires()) {
      for (const slug of questionnaire.relatedConcepts)
        expect(await getConcept(slug)).not.toBeNull()
    }
  })

  it('gives every Reference a title and a DOI or URL (FR-03)', async () => {
    const references = [
      ...(await listConcepts()).flatMap((concept) => concept.references),
      ...(await listQuestionnaires()).map((questionnaire) => questionnaire.source),
    ]
    for (const reference of references) {
      expect(reference.title.trim()).not.toBe('')
      expect(reference.doi ?? reference.url).toBeTruthy()
    }
  })

  it('keeps author usernames and account names out of content', async () => {
    const text = strings(await allContent()).join('\n')
    expect(text).not.toMatch(/\/author\//)
    expect(text).not.toMatch(/wp-admin|wp-json/)
  })
})
