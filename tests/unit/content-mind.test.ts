import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, questionnaires, topics, type BlockView } from '@/content'
import type { ConceptRecord, QuestionnaireRecord } from '@/content/schema'
import { localSource } from '@/content/source'

// Content-v1 ticket 08: the mind topic. The four remaining "mind" description pages become
// Concepts, each with its coming-later Questionnaire, and vikṣepa (ticket 01) gets its own.
// Read through the public interface and the content source, as the other content tests are.

/**
 * Each mind Concept, by its slug (D02): its headword as a heading shows it, its page, the verses
 * at the top of the page with the census's translation ids (null where the page labels none),
 * the anchors of its sub-terms in the page's order, its reference list in the page's order
 * (census), how many tables its page holds, and what its Questionnaire takes from the page and
 * from research ticket 11.
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
    terms: [
      'vyadhi',
      'styana',
      'alasya',
      'samsaya',
      'pramada',
      'avirati',
      'bhrantidarsana',
      'alabdhabhumikatva',
      'anavasthitatva',
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
    tables: 1,
    questionnaire: { title: 'Vikshepa (Distraction)', candidateSource: 'tomar-2024' },
  },
  {
    slug: 'upa-vikshepa',
    name: 'Upa-vikṣepa',
    page: 'https://care4mind.org/upavikshepaprofiling/',
    verses: [['yoga-sutra/1.31', 'upavikshepaprofiling']],
    terms: ['duhkha', 'daurmanasya', 'angamejayatva', 'svasa', 'prasvasa'],
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
    tables: 3,
    questionnaire: { title: 'Upa-Vikshepa Profiling', candidateSource: 'tomar-2024' },
  },
  {
    slug: 'panch-klesha',
    name: 'Pañca kleśa',
    page: 'https://care4mind.org/panchkleshavikaarprofiling/',
    verses: [
      ['yoga-sutra/2.3', 'panchkleshavikaarprofiling'],
      ['yoga-sutra/2.5', 'panchkleshavikaarprofiling'],
      ['yoga-sutra/2.7', 'panchkleshavikaarprofiling'],
      ['yoga-sutra/2.9', 'panchkleshavikaarprofiling'],
    ],
    // The five kleśas, then the six enemies of the peaceful mind (the vikāras).
    terms: [
      'avidya',
      'asmita',
      'raga',
      'dvesa',
      'abhinivesa',
      'kama',
      'krodha',
      'lobha',
      'moha',
      'mada',
      'matsarya',
    ],
    references: [
      'hridaya-yoga-2024',
      'ias-express-2023',
      'jakubczak-2004',
      'jayswal-2020',
      'kshirsagar-2025',
      'praxis-2022',
      'roche-2018',
      'sharma-2021',
      'shlokam-2020-yogasutra-1-31',
      'singh-2020',
      'tomar-2024',
      'yogapedia',
      'yogitim-2024',
    ],
    tables: 2,
    questionnaire: { title: 'Panch Klesha – Vikaar Profiling', candidateSource: 'tomar-2024' },
  },
  {
    slug: 'chittabhumi',
    name: 'Citta-bhūmi',
    page: 'https://care4mind.org/knowyourmind/',
    // Both English lines are labelled "Meaning": neither quote names a translation.
    verses: [
      ['yoga-sutra/1.2', null],
      ['yoga-sutra/1.30', null],
    ],
    // The five states of mind.
    terms: ['mudha', 'ksipta', 'viksipta', 'ekagra', 'niruddha'],
    // The page lists Krishnappa et al. (2020) twice, as 2020a and 2020b: one Reference, once.
    references: [
      'prabhu-bhat-2013',
      'das-rai-2024',
      'krishnappa-2020',
      'jayasheela-salagame-2018',
      'sridhar-nagendra-2021',
      'tomar-2024',
      'shlokam-2020-yogasutra-1-2',
    ],
    tables: 2,
    questionnaire: { title: 'Know Your State of Mind Profile', candidateSource: 'tomar-2024' },
  },
  {
    slug: 'sthitaprajna',
    name: 'Sthitaprajña',
    page: 'https://care4mind.org/sthitaprajna/',
    verses: [
      ['bhagavad-gita/2.54', 'sthitaprajna'],
      ['bhagavad-gita/2.55', 'sthitaprajna'],
      ['bhagavad-gita/2.56', 'sthitaprajna'],
      ['bhagavad-gita/2.57', 'sthitaprajna'],
      ['bhagavad-gita/2.58', 'sthitaprajna'],
      ['bhagavad-gita/2.68', 'sthitaprajna'],
    ],
    terms: [],
    references: [
      'adkoli-2022',
      'apa-emotional-intelligence',
      'kaundinya-2024',
      'kp-2025',
      'samant',
      'sharma-1997',
      'shlokam-2025',
      'sivakumar-rajini-2022',
      'surti-ganga-2021',
      'tomar-2024',
      'wisdomlib-2022',
    ],
    tables: 1,
    // Research ticket 11 found no published source for its questionnaire.
    questionnaire: { title: 'Sthitaprajna', candidateSource: undefined },
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

type TableView = Extract<BlockView, { kind: 'table' }>

/** Every table in a list of blocks, those inside term blocks included, in reading order. */
const tablesIn = (blocks: readonly BlockView[]): TableView[] =>
  blocks.flatMap((block) =>
    block.kind === 'table' ? [block] : block.kind === 'term' ? tablesIn(block.blocks) : [],
  )

describe('the mind topic', () => {
  it('puts Sthitaprajña in the self topic too', async () => {
    const sthitaprajna = await concepts.get('sthitaprajna')
    expect(sthitaprajna?.secondaryTopics.map(({ slug }) => slug)).toEqual(['self'])
    const self = await topics.get('self')
    expect(self?.secondaryConcepts.map(({ slug }) => slug)).toContain('sthitaprajna')
  })
})

describe('the mind Concepts', () => {
  it.each(CARRIED_OVER)(
    'names $slug by its headword, in the mind topic, its keywords drafted, unreviewed',
    async ({ slug, name, page }) => {
      const concept = await concepts.get(slug)
      expect(concept).toMatchObject({
        name,
        topic: { slug: 'mind' },
        reviewStatus: 'drafted-not-reviewed',
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
    'anchors each of $slug’s sub-terms, in the page’s order',
    async ({ slug, terms }) => {
      const concept = await concepts.get(slug)
      expect(concept?.toc.flatMap((entry) => entry.terms.map(({ id }) => id))).toEqual(terms)
    },
  )

  it.each(MIND)('keeps the page’s Meaning on each of $slug’s verses', async ({ slug }) => {
    const concept = await concepts.get(slug)
    expect(concept?.verses.length).toBeGreaterThan(0)
    expect(concept?.verses.filter(({ meaning }) => !meaning)).toEqual([])
  })

  it.each(MIND)('keeps $slug’s tables, each with its caption', async ({ slug, tables }) => {
    const concept = await concepts.get(slug)
    const found = (concept?.sections ?? []).flatMap((section) => tablesIn(section.blocks))
    expect(found).toHaveLength(tables)
    expect(found.filter(({ caption }) => caption.trim() === '')).toEqual([])
  })

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

  it('flags Sthitaprajña’s Questionnaire for the Psychology expert: no published source found', async () => {
    const questionnaire = await questionnaires.get('sthitaprajna')
    expect(
      questionnaire?.provenance.flags.filter(
        (flag) => flag.for === 'psychology-expert' && /no published source/i.test(flag.note),
      ),
    ).toHaveLength(1)
  })
})
