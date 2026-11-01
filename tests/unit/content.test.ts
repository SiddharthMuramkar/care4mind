import { describe, expect, it } from 'vitest'

import {
  concepts,
  home,
  questionnaires,
  site,
  type ConceptView,
  type QuestionnaireView,
} from '@/content'
import { asciiSpellings } from '@/content'
import { isNormalisedSanskrit } from '@/content/testing'

/** Every string anywhere inside a value. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

/** Every Concept and Questionnaire as its page sees it. */
async function pages() {
  const conceptViews = await Promise.all(
    (await concepts.list()).map(({ slug }) => concepts.get(slug)),
  )
  const questionnaireViews = await Promise.all(
    (await questionnaires.list()).map(({ slug }) => questionnaires.get(slug)),
  )
  return {
    concepts: conceptViews.filter((view): view is ConceptView => view !== null),
    questionnaires: questionnaireViews.filter((view): view is QuestionnaireView => view !== null),
  }
}

async function allContent() {
  const { concepts, questionnaires } = await pages()
  return [...concepts, ...questionnaires, await home.get()]
}

describe('content module', () => {
  it('finds a Concept by slug and returns null for an unknown one', async () => {
    expect((await concepts.get('vikshepa'))?.term?.iast).toBe('vikṣepa')
    expect(await concepts.get('no-such-concept')).toBeNull()
  })

  it('finds a Questionnaire by slug and returns null for an unknown one', async () => {
    expect((await questionnaires.get('karmayoga-scale'))?.status).toBe('preview')
    expect(await questionnaires.get('no-such-questionnaire')).toBeNull()
  })

  it('lists every ASCII spelling of a term, starting with IAST minus diacritics', async () => {
    const term = (await concepts.get('vikshepa'))?.term
    expect(term && asciiSpellings(term)).toEqual(['viksepa', 'Vikshepa'])
  })
})

describe('content integrity', () => {
  it('stores every string as NFC with anusvara as ṃ', async () => {
    const offenders = strings(await allContent()).filter((text) => !isNormalisedSanskrit(text))
    expect(offenders).toEqual([])
  })

  it('uses unique slugs within each kind, and gives every page its own address', async () => {
    const { concepts, questionnaires } = await pages()
    for (const views of [concepts, questionnaires]) {
      const slugs = views.map((view) => view.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    }
    const paths = (await site.routes()).map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('links only to Questionnaires and Concepts that exist', async () => {
    const all = await pages()
    for (const concept of all.concepts) {
      for (const { slug } of concept.linked.questionnaires)
        expect(await questionnaires.get(slug)).not.toBeNull()
    }
    for (const questionnaire of all.questionnaires) {
      for (const { slug } of questionnaire.concepts) expect(await concepts.get(slug)).not.toBeNull()
    }
  })

  it('gives every Reference a title and a DOI or URL, or says why it has none (FR-03)', async () => {
    const all = await pages()
    const references = [
      ...all.concepts.flatMap((concept) => concept.references),
      ...all.questionnaires.flatMap((questionnaire) =>
        questionnaire.source ? [questionnaire.source] : [],
      ),
    ]
    for (const reference of references) {
      expect(reference.title.trim()).not.toBe('')
      expect(reference.doi ?? reference.url ?? reference.noStableLink).toBeTruthy()
    }
    // Every Reference on the foundation's two pages has a link.
    const vikshepa = all.concepts.find((concept) => concept.slug === 'vikshepa')
    const karmayoga = all.questionnaires.find(({ slug }) => slug === 'karmayoga-scale')
    for (const reference of [...(vikshepa?.references ?? []), karmayoga?.source])
      expect(reference?.doi ?? reference?.url).toBeTruthy()
  })

  it('keeps author usernames and account names out of content', async () => {
    const text = strings(await allContent()).join('\n')
    expect(text).not.toMatch(/\/author\//)
    expect(text).not.toMatch(/wp-admin|wp-json/)
  })
})
