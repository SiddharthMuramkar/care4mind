import { beforeAll, describe, expect, it } from 'vitest'

import type { Features } from '@/config/features'
import { contentGraph, type ContentGraph } from '@/content/graph'
import { CONTENT_KINDS, type ContentRecord, type RecordOf } from '@/content/schema'
import { localSource } from '@/content/source'
import { createContent } from '@/content/views'

// What the migration from the old site carried over, as counted when it landed. These pin
// today's content, so they run apart from `pnpm check`: a new record must not need a test edit.
// Until the client signs off the migration, they are what guards it.

const ON: Features = { questionnairePreview: true, conceptMap: true, devanagariFirst: true }
const OFF: Features = { questionnairePreview: false, conceptMap: false, devanagariFirst: false }

const site = createContent(localSource, ON)

/** The 19 Concepts, by the slugs the batch tickets chose. */
const CONCEPTS = [
  'ahimsa',
  'asteya',
  'atma-bandhu',
  'atman',
  'brahma-vihara',
  'brahmacharya',
  'chittabhumi',
  'five-steps-of-perfection',
  'jagat',
  'jiva',
  'karta',
  'momentum-of-spiritual-practice',
  'panch-klesha',
  'satya',
  'spiritual-practitioner',
  'sthitaprajna',
  'triguna',
  'upa-vikshepa',
  'vikshepa',
]

/** The pages that only exist while their feature flag is on. */
const FLAGGED_PAGES = ['/questionnaires/karmayoga-scale/take/', '/concepts/map/', '/proposals/']

/** Every public page, with the slugs the migration carried over. */
const PAGES = [
  '/',
  '/concepts/',
  ...CONCEPTS.map((slug) => `/concepts/${slug}/`),
  '/concepts/map/',
  ...['self', 'mind', 'practice', 'values', 'temperament'].map((slug) => `/topics/${slug}/`),
  '/texts/',
  ...[
    'bhagavad-gita',
    'dhammapada',
    'sadhana-panchakam',
    'sushruta-samhita',
    'vedanta-sara',
    'yoga-sutra',
  ].map((slug) => `/texts/${slug}/`),
  '/questionnaires/',
  '/questionnaires/karmayoga-scale/',
  '/questionnaires/karmayoga-scale/take/',
  '/library/',
  '/library/references/',
  ...['textbooks', 'inspirational-books', 'courses', 'methods'].map((slug) => `/library/${slug}/`),
  '/search/',
  '/proposals/',
]

/** The 16 old pages that each describe a Concept and a Questionnaire. */
const DESCRIPTION_PAGES = [
  'vikshepa',
  'upavikshepaprofiling',
  'panchkleshavikaarprofiling',
  'knowyourmind',
  'sthitaprajna',
  'fivestepsofperfectionprofiling',
  'momentumofspiritualpractice',
  'spiritualpractitionerprofiling',
  'brahmavihara',
  'knowyourvaluesahimsanon-violenceprofiling',
  'knowyourvaluessatyatruthfulnessprofiling',
  'knowyourvaluesasteyanonstealingprofiling',
  'knowyourvaluesbrahmacharya-profiling',
  'frienorfoeofself',
  'karta-2',
  'triguna',
].map((slug) => `https://care4mind.org/${slug}/`)

let records: ContentRecord[] = []
let graph: ContentGraph

// Read once, with room for a busy machine: the graph under every view is built from all of it.
beforeAll(async () => {
  records = (await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))).flat()
  graph = await contentGraph()
  await site.site.routes()
}, 60_000)

function ofKind<K extends ContentRecord['kind']>(kind: K): RecordOf<K>[] {
  return records.filter((record): record is RecordOf<K> => record.kind === kind)
}

describe('the records the migration carried over', () => {
  it('are 19 Concepts, by the slugs the batch tickets chose', () => {
    expect(
      ofKind('concept')
        .map(({ slug }) => slug)
        .toSorted(),
    ).toEqual(CONCEPTS.toSorted())
  })

  it('are 18 Questionnaires: 1 preview and 17 coming later', () => {
    const questionnaires = ofKind('questionnaire')
    expect(questionnaires).toHaveLength(18)
    expect(questionnaires.filter(({ status }) => status === 'preview')).toHaveLength(1)
    expect(questionnaires.filter(({ status }) => status === 'coming-later')).toHaveLength(17)
  })

  it('are 5 topics, 3 reading lists, 1 page and the homepage', () => {
    expect(ofKind('topic')).toHaveLength(5)
    expect(ofKind('resource-list')).toHaveLength(3)
    expect(ofKind('page')).toHaveLength(1)
    expect(ofKind('home')).toHaveLength(1)
  })

  it('are 78 glossary entries', () => {
    expect(ofKind('glossary')).toHaveLength(78)
  })

  it('put five Concepts in the mind topic, vikṣepa’s among them', async () => {
    const mind = await site.topics.get('mind')
    expect(mind?.concepts.map(({ slug }) => slug).sort()).toEqual([
      'chittabhumi',
      'panch-klesha',
      'sthitaprajna',
      'upa-vikshepa',
      'vikshepa',
    ])
  })
})

describe('the links the migration made', () => {
  it('pairs each description page’s Concept and Questionnaire', () => {
    const fromPage =
      (url: string) => (record: { provenance: { sources: readonly { url: string }[] } }) =>
        record.provenance.sources.some((source) => source.url === url)
    const problems = DESCRIPTION_PAGES.flatMap((url) => {
      const concept = ofKind('concept').find(fromPage(url))
      const questionnaire = ofKind('questionnaire').find(fromPage(url))
      if (!concept || !questionnaire) return [`${url}: no Concept or no Questionnaire`]
      return concept.questionnaire === questionnaire.slug &&
        questionnaire.concepts.includes(concept.slug)
        ? []
        : [`${url}: ${concept.slug} and ${questionnaire.slug} don’t point at each other`]
    })
    expect(problems).toEqual([])
  })

  it('links the Atman, Jiva, Jagat and Chitta Bhumis entries to their Concepts', () => {
    const problems = ['Atman', 'Jiva', 'Jagat', 'Chitta Bhumis'].flatMap((name) => {
      const entry = ofKind('glossary').find((glossary) => glossary.name.ascii === name)
      if (!entry) return [`no glossary entry “${name}”`]
      if (entry.concept === undefined) return [`“${name}” links to no Concept`]
      return graph.record('concept', entry.concept) ? [] : [`“${name}” links to a missing Concept`]
    })
    expect(problems).toEqual([])
  })
})

describe('what the site derives from them', () => {
  it('is 45 pages, every flag on', async () => {
    const paths = (await site.site.routes()).map(({ path }) => path)
    expect(paths).toHaveLength(45)
    expect(paths.toSorted()).toEqual(PAGES.toSorted())
  })

  it('is 42 pages with the flags off', async () => {
    const paths = (await createContent(localSource, OFF).site.routes()).map(({ path }) => path)
    expect(paths.toSorted()).toEqual(
      PAGES.filter((page) => !FLAGGED_PAGES.includes(page)).toSorted(),
    )
  })

  it('is an A–Z of the 19 Concepts and 74 glossary entries of their own', async () => {
    const entries = (await site.site.azIndex()).flatMap(({ entries }) => entries)
    expect(entries.filter(({ kind }) => kind === 'glossary')).toHaveLength(74)
    expect(
      entries
        .filter(({ kind }) => kind === 'concept')
        .map(({ href }) => href)
        .toSorted(),
    ).toEqual(CONCEPTS.map((slug) => `/concepts/${slug}/`).toSorted())
  })

  it('is 448 search documents, by the counts the tickets record', async () => {
    const documents = await site.site.searchDocuments()
    const count: Record<string, number> = {}
    for (const { kind } of documents) count[kind] = (count[kind] ?? 0) + 1
    // 19 Concepts and their 46 term blocks, 78 glossary entries, 6 works and 43 passages,
    // 188 References, the 41 books and courses on the three reading lists, 18 Questionnaires,
    // 5 topics, and the Methods page with the three lists as pages.
    expect(count).toEqual({
      concept: 19,
      term: 46,
      glossary: 78,
      work: 6,
      passage: 43,
      reference: 188,
      'library-item': 41,
      questionnaire: 18,
      topic: 5,
      page: 4,
    })
    expect(documents).toHaveLength(448)
  })

  it('is a Concept map of the 19 Concepts', async () => {
    const { nodes } = await site.site.graph()
    expect(nodes.map(({ slug }) => slug).toSorted()).toEqual(CONCEPTS.toSorted())
  })

  it('has 16 Concepts citing Tomar (2024)', async () => {
    expect(await site.concepts.list({ reference: 'tomar-2024' })).toHaveLength(16)
  })
})
