import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, questionnaires } from '@/content'
import type { ConceptRecord, QuestionnaireRecord } from '@/content/schema'
import { localSource } from '@/content/source'

// Content-v1 ticket 08: the mind topic. The four remaining "mind" description pages become
// Concepts, each with its coming-later Questionnaire, and vikṣepa (ticket 01) gets its own.
// Read through the public interface and the content source, as the other content tests are.

/**
 * Each mind Concept, by its slug (D02): its headword as a heading shows it, its page, the verses
 * at the top of the page with the census's translation ids (null where the page labels none),
 * its reference list in the page's order (census), and what its Questionnaire takes from the page
 * and from research ticket 11.
 */
const MIND = [
  {
    slug: 'vikshepa',
    name: 'Vikṣepa',
    page: 'https://care4mind.org/vikshepa/',
    verses: [
      ['yoga-sutra/1.30', 'vikshepa'],
      ['vedanta-sara/5.211', 'vikshepa'],
    ],
    references: [
      'apa-distraction',
      'bhavanani-2012',
      'gurubhaktananda-2018',
      'jain-diwakar-2019',
      'krishnananda-1996',
      'schleim-2025',
      'sharma-pareek',
      'shlokam-2025',
      'tomar-2024',
      'swamij-1-30',
    ],
    questionnaire: { title: 'Vikshepa (Distraction)', candidateSource: 'tomar-2024' },
  },
  {
    slug: 'upa-vikshepa',
    name: 'Upa-vikṣepa',
    page: 'https://care4mind.org/upavikshepaprofiling/',
    verses: [['yoga-sutra/1.31', 'upavikshepaprofiling']],
    references: [
      'aich-2013',
      'anderson-2016',
      'paikaray-2018',
      'salagame-2014',
      'saoji-2018',
      'shlokam-2020-yogasutra-1-31',
      'teasdale-chaskalson-2011',
      'tomar-2024',
      'yoga-sutras-patanjali',
      'yogapedia-2023-angamejayatva',
      'yogapedia-2023-shvasa-prashvasa',
    ],
    questionnaire: { title: 'Upa-Vikshepa Profiling', candidateSource: 'tomar-2024' },
  },
]

/** The Concepts this ticket carries over; vikṣepa is ticket 01's. */
const CARRIED_OVER = MIND.filter(({ slug }) => slug !== 'vikshepa')

let conceptRecords: readonly ConceptRecord[] = []
let questionnaireRecords: readonly QuestionnaireRecord[] = []

beforeAll(async () => {
  conceptRecords = await localSource.records('concept')
  questionnaireRecords = await localSource.records('questionnaire')
})

const conceptRecord = (slug: string) => conceptRecords.find((concept) => concept.slug === slug)
const questionnaireRecord = (slug: string) =>
  questionnaireRecords.find((questionnaire) => questionnaire.slug === slug)

describe('the mind Concepts', () => {
  it.each(CARRIED_OVER)(
    'names $slug by its headword, in the mind topic, carried over unreviewed',
    async ({ slug, name, page }) => {
      const concept = await concepts.get(slug)
      expect(concept).toMatchObject({
        name,
        topic: { slug: 'mind' },
        reviewStatus: 'carried-over-not-reviewed',
      })
      expect(concept?.provenance.sources.map(({ url }) => url)).toEqual([page])
    },
  )

  it.each(MIND)(
    'resolves every verse and Reference on $slug’s page, in its order',
    async (mind) => {
      const concept = await concepts.get(mind.slug)
      expect(concept?.verses.map(({ passage }) => passage)).toEqual(
        mind.verses.map(([passage]) => passage),
      )
      expect(concept?.references.map(({ id }) => id)).toEqual(mind.references)
    },
  )

  it.each(MIND)(
    'quotes each of $slug’s verses with the census’s translation',
    ({ slug, verses }) => {
      expect(
        conceptRecord(slug)?.verses.map(({ passage, translation }) => [
          passage,
          translation ?? null,
        ]),
      ).toEqual(verses)
    },
  )
})

describe('each mind Concept’s coming-later Questionnaire', () => {
  it.each(MIND)('is $slug’s own, under its slug, linked both ways', async ({ slug }) => {
    const concept = await concepts.get(slug)
    expect(concept?.linked.questionnaires[0]).toMatchObject({ slug, status: 'coming-later' })
    const questionnaire = await questionnaires.get(slug)
    expect(questionnaire?.concepts.map((ref) => ref.slug)).toEqual([slug])
  })

  it.each(MIND)(
    'takes $slug’s title from its page, and its candidate source from research ticket 11',
    async ({ slug, questionnaire: expected }) => {
      const questionnaire = await questionnaires.get(slug)
      expect(questionnaire?.title).toBe(expected.title)
      expect(questionnaire?.candidateSource?.id).toBe(expected.candidateSource)
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
