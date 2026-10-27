import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, questionnaires } from '@/content'
import type { QuestionnaireRecord } from '@/content/schema'
import { localSource } from '@/content/source'

// Content-v1 ticket 08: the mind topic. The four remaining "mind" description pages become
// Concepts, each with its coming-later Questionnaire, and vikṣepa (ticket 01) gets its own.
// Read through the public interface and the content source, as the other content tests are.

/** Each mind Concept, by its slug (D02), with what the census and research ticket 11 expect. */
const MIND = [
  {
    slug: 'vikshepa',
    page: 'https://care4mind.org/vikshepa/',
    title: 'Vikshepa (Distraction)',
    candidateSource: 'tomar-2024',
  },
]

let questionnaireRecords: readonly QuestionnaireRecord[] = []

beforeAll(async () => {
  questionnaireRecords = await localSource.records('questionnaire')
})

const questionnaireRecord = (slug: string) =>
  questionnaireRecords.find((questionnaire) => questionnaire.slug === slug)

describe('each mind Concept’s coming-later Questionnaire', () => {
  it.each(MIND)('is $slug’s own, under its slug, linked both ways', async ({ slug }) => {
    const concept = await concepts.get(slug)
    expect(concept?.linked.questionnaires[0]).toMatchObject({ slug, status: 'coming-later' })
    const questionnaire = await questionnaires.get(slug)
    expect(questionnaire?.concepts.map((ref) => ref.slug)).toEqual([slug])
  })

  it.each(MIND)(
    'takes $slug’s page title as published, and its candidate source from research ticket 11',
    async ({ slug, title, candidateSource }) => {
      const questionnaire = await questionnaires.get(slug)
      expect(questionnaire?.title).toBe(title)
      expect(questionnaire?.candidateSource?.id).toBe(candidateSource)
    },
  )

  it.each(MIND)(
    'holds back $slug’s score sections, keeps its scoring pending and offers no form',
    async ({ slug, page }) => {
      const record = questionnaireRecord(slug)
      expect(record?.provenance.sources.map(({ url }) => url)).toEqual([page])
      expect(record?.heldBack.length).toBeGreaterThan(0)
      expect(record?.scoring.status).toBe('pending')
      expect(record?.form).toBeUndefined()
      expect(await questionnaires.form(slug)).toBeNull()
    },
  )
})
