import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, questionnaires, topics, type BlockView } from '@/content'
import type {
  Block,
  ConceptRecord,
  QuestionnaireRecord,
  SanskritName,
  TopicRecord,
} from '@/content/schema'
import { localSource } from '@/content/source'

// Content-v1 ticket 10: the values topic. The four "Know Your Values" pages become Concepts, each
// with its coming-later Questionnaire, and the yama–niyama section all four repeat is stored once,
// as the values topic's introduction. Read through the content source (what each record stores)
// and the public interface (what a page gets), as the other content tests are.

/** The four values pages, in the spec's page order. */
const PAGES = [
  'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
  'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
  'https://care4mind.org/knowyourvaluesasteyanonstealingprofiling/',
  'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
]

/** The translation of Yoga Sūtra 2.30 and 2.32 all four pages print: stored once, under Ahimsa's. */
const SHARED_TRANSLATION = 'knowyourvaluesahimsanon-violenceprofiling'

/**
 * Each values Concept, by its slug (D02, the page's own ASCII spelling of its headword): its page
 * and its title as published, its headword as a heading shows it, its term (split out of the
 * pages' Yoga Sūtra 2.30 compound) and the gloss its title gives, the verses at the top of its
 * page with the census's translation ids, its reference list in the page's order (census), and
 * whether it has an "Indian vs Western" comparison table.
 */
const VALUES: {
  slug: string
  page: string
  title: string
  name: string
  term: SanskritName
  english?: string
  verses: [string, string][]
  references: string[]
  comparison: boolean
}[] = [
  {
    slug: 'ahimsa',
    page: 'https://care4mind.org/knowyourvaluesahimsanon-violenceprofiling/',
    title: 'Know Your Values: Ahimsa (Non-Violence) Profiling',
    name: 'Ahiṃsā',
    term: { iast: 'ahiṃsā', devanagari: 'अहिंसा', ascii: ['Ahimsa'] },
    english: 'Non-Violence',
    verses: [
      ['yoga-sutra/2.30', SHARED_TRANSLATION],
      ['yoga-sutra/2.32', SHARED_TRANSLATION],
      ['yoga-sutra/2.35', 'knowyourvaluesahimsanon-violenceprofiling'],
    ],
    references: [
      'ayoola-2024',
      'barai-2018',
      'bharadwaj-2024',
      'epra-2019',
      'mandal-pal-2023',
      'reznik-2019',
      'shlokam-2020-yogasutra-2-30',
      'shlokam-2020-yogasutra-2-32',
      'shlokam-2020-yogasutra-2-35',
      'srinivasan-2016',
      'sudrajat-2017',
      'thapliyal-2023',
      'tomar-2024',
    ],
    comparison: true,
  },
  {
    slug: 'satya',
    page: 'https://care4mind.org/knowyourvaluessatyatruthfulnessprofiling/',
    title: 'Know Your Values: Satya (Truthfulness) Profiling',
    name: 'Satya',
    term: { iast: 'satya', devanagari: 'सत्य', ascii: ['Satya'] },
    english: 'Truthfulness',
    verses: [
      ['yoga-sutra/2.30', SHARED_TRANSLATION],
      ['yoga-sutra/2.32', SHARED_TRANSLATION],
      ['yoga-sutra/2.36', 'knowyourvaluessatyatruthfulnessprofiling'],
      ['bhagavad-gita/17.15', 'knowyourvaluessatyatruthfulnessprofiling'],
    ],
    references: [
      'agrawal-aldons-2023',
      'chakraborty-2020',
      'geppert-2022',
      'kazmi-2019',
      'reinhardt-2022',
      'reynolds-2025',
      'shlokam-2024-gita-17-15',
      'shlokam-2020-yogasutra-2-36',
      'shlokam-2020-yogasutra-2-30',
      'shlokam-2020-yogasutra-2-32',
      'srinivasan-2016',
      'tandon-singh-2013',
      'testoni-2020',
      'thapliyal-2023',
      'tomar-2024',
      'zahedi-2011',
    ],
    comparison: true,
  },
  {
    slug: 'asteya',
    page: 'https://care4mind.org/knowyourvaluesasteyanonstealingprofiling/',
    title: 'Know Your Values: Asteya (Non-Stealing) Profiling',
    name: 'Asteya',
    term: { iast: 'asteya', devanagari: 'अस्तेय', ascii: ['Asteya'] },
    english: 'Non-Stealing',
    verses: [
      ['yoga-sutra/2.30', SHARED_TRANSLATION],
      ['yoga-sutra/2.32', SHARED_TRANSLATION],
    ],
    references: [
      'alam-2024',
      'dylan-muncaster-2021',
      'matko-2021',
      'parmar-2014',
      'shlokam-2020-yogasutra-2-30',
      'shlokam-2020-yogasutra-2-32',
      'srinivasan-2016',
      'thapliyal-2023',
      'tomar-2024',
    ],
    comparison: false,
  },
  {
    slug: 'brahmacharya',
    page: 'https://care4mind.org/knowyourvaluesbrahmacharya-profiling/',
    title: 'Know Your Values: Brahmacharya Profiling',
    name: 'Brahmacarya',
    term: { iast: 'brahmacarya', devanagari: 'ब्रह्मचर्य', ascii: ['Brahmacharya'] },
    // Its title gives no gloss, so it has no English name (flagged).
    verses: [
      ['yoga-sutra/2.30', SHARED_TRANSLATION],
      ['yoga-sutra/2.32', SHARED_TRANSLATION],
      ['bhagavad-gita/6.17', 'knowyourvaluesbrahmacharya-profiling'],
      ['bhagavad-gita/2.54', 'sthitaprajna'],
      ['bhagavad-gita/2.55', 'sthitaprajna'],
      ['bhagavad-gita/2.56', 'sthitaprajna'],
      ['bhagavad-gita/2.57', 'sthitaprajna'],
      ['bhagavad-gita/2.58', 'sthitaprajna'],
      ['bhagavad-gita/2.68', 'sthitaprajna'],
    ],
    references: [
      'alter-1997',
      'dylan-muncaster-2021',
      'kumar-2024',
      'manapat-2019',
      'meher-2023',
      'rodriguez-nieto-2021',
      'sahu-2023',
      'shlokam-2020-yogasutra-2-30',
      'shlokam-2020-yogasutra-2-32',
      'shlokam-2024-gita-6-17',
      'shlokam-2024-gita-2-54',
      'shlokam-2024-gita-2-55',
      'shlokam-2024-gita-2-56',
      'shlokam-2024-gita-2-57',
      'shlokam-2024-gita-2-58',
      'shlokam-2024-gita-2-68',
      'skandhan-2021',
      'srinivasan-2016',
      'thapliyal-2023',
      'tomar-2024',
    ],
    comparison: true,
  },
]

let values: TopicRecord | undefined
let conceptRecords: readonly ConceptRecord[] = []
let questionnaireRecords: readonly QuestionnaireRecord[] = []

/**
 * Reading every record and building the graph takes a few seconds, and more on a machine busy
 * with parallel lanes; done once here, with room to spare, every test after it is quick.
 */
const LOADING_TIMEOUT = 60_000

beforeAll(async () => {
  values = (await localSource.records('topic')).find(({ slug }) => slug === 'values')
  conceptRecords = await localSource.records('concept')
  questionnaireRecords = await localSource.records('questionnaire')
  // Built once per process and shared with the views the tests ask for.
  await concepts.list()
}, LOADING_TIMEOUT)

const conceptRecord = (slug: string) => conceptRecords.find((concept) => concept.slug === slug)
const questionnaireRecord = (slug: string) =>
  questionnaireRecords.find((questionnaire) => questionnaire.slug === slug)

/** Every block in some blocks, those inside term blocks included. */
function allBlocks(blocks: readonly Block[]): Block[] {
  return blocks.flatMap((block) =>
    block.kind === 'term' ? [block, ...allBlocks(block.blocks)] : [block],
  )
}

/** Every string in a value, leaving out its provenance (where edits may quote a page's text). */
function stringsIn(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(stringsIn)
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, inner]) =>
      key === 'provenance' ? [] : stringsIn(inner),
    )
  return []
}

describe('the values topic’s introduction, stored once', () => {
  it('holds the yama–niyama section, with Yama and Niyama as term blocks', () => {
    const sections = values?.intro?.sections ?? []
    expect(sections.map(({ id, heading }) => [id, heading])).toEqual([
      ['raja-yoga-foundations-yama-niyama', 'Raja Yoga Foundations: Yama-Niyama'],
    ])
    expect(
      sections[0]?.blocks.map((block) =>
        block.kind === 'term' ? [block.id, block.term.iast] : block.kind,
      ),
    ).toEqual([
      ['yama', 'yama'],
      ['niyama', 'niyama'],
    ])
  })

  it('keeps the Asteya page’s copy, the one whose grammar the site itself corrected', () => {
    const text = JSON.stringify(values?.intro?.sections)
    expect(text).toContain(
      'Niyamas are intrapersonal observations that lead to internal improvement and peace with oneself.',
    )
    expect(text).toContain('which lead to peace with surroundings')
    expect(text).not.toContain('that leads to peace')
  })

  it('names all four values pages as its sources', () => {
    expect(values?.intro?.provenance.sources.map(({ url }) => url)).toEqual(PAGES)
  })

  it('lists the three References it cites, and resolves every citation on the topic page', async () => {
    const intro = (await topics.get('values'))?.intro
    expect(intro?.references.map(({ id }) => id)).toEqual([
      'srinivasan-2016',
      'thapliyal-2023',
      'tomar-2024',
    ])
    expect(intro?.citations).toEqual({
      'Tomar, 2024': 'tomar-2024',
      'Srinivasan, 2016': 'srinivasan-2016',
      'Thapliyal et al., 2023': 'thapliyal-2023',
    })
  })
})

describe('the values topic', () => {
  it('holds the four values Concepts, and no other', async () => {
    const view = await topics.get('values')
    expect(view?.concepts.map(({ slug }) => slug).sort()).toEqual([
      'ahimsa',
      'asteya',
      'brahmacharya',
      'satya',
    ])
    expect(view?.secondaryConcepts).toEqual([])
  })
})

describe.each(VALUES)('the Concept $slug', (expected) => {
  it('is in the values topic, named by its headword and the gloss its title gives', () => {
    const concept = conceptRecord(expected.slug)
    expect(concept?.topics).toEqual({ primary: 'values' })
    expect(concept?.name).toEqual(
      expected.english === undefined
        ? { term: expected.term }
        : { term: expected.term, english: expected.english },
    )
    expect(concept?.provenance.sources.map(({ url }) => url)).toEqual([expected.page])
    expect(concept?.reviewStatus).toBe('carried-over-not-reviewed')
  })

  it('quotes Yoga Sūtra 2.30 and 2.32 first, then its own verses, each one resolving', async () => {
    expect(
      conceptRecord(expected.slug)?.verses.map(({ passage, translation }) => [
        passage,
        translation,
      ]),
    ).toEqual(expected.verses)
    const view = await concepts.get(expected.slug)
    expect(view?.name).toBe(expected.name)
    expect(view?.verses.map(({ passage }) => passage)).toEqual(
      expected.verses.map(([passage]) => passage),
    )
    expect(view?.verses.filter(({ translation, meaning }) => !translation || !meaning)).toEqual([])
  })

  it('shows the values introduction once, where its page had it', async () => {
    const intros = (conceptRecord(expected.slug)?.sections ?? [])
      .flatMap(({ blocks }) => allBlocks(blocks))
      .filter((block) => block.kind === 'topic-intro')
    expect(intros).toEqual([{ kind: 'topic-intro', topic: 'values' }])
    // Every values page prints the shared section first, after its verses. The Concept marks the
    // place with the introduction's own id and heading, and holds nothing else there.
    const [first] = conceptRecord(expected.slug)?.sections ?? []
    const [shared] = values?.intro?.sections ?? []
    expect([first?.id, first?.heading]).toEqual([shared?.id, shared?.heading])
    const shown = (await concepts.get(expected.slug))?.sections[0]?.blocks
    expect(
      shown?.map((block: BlockView) =>
        block.kind === 'topic-intro'
          ? [block.topic.slug, block.sections.map(({ heading }) => heading)]
          : block.kind,
      ),
    ).toEqual([['values', ['Raja Yoga Foundations: Yama-Niyama']]])
  })

  it('repeats none of the introduction’s text', () => {
    const shared = (values?.intro?.sections ?? [])
      .flatMap(({ blocks }) => allBlocks(blocks))
      .flatMap((block) => (block.kind === 'paragraph' ? [block.text] : []))
    expect(shared).toHaveLength(5)
    const own = stringsIn(conceptRecord(expected.slug))
    expect(shared.filter((text) => own.some((string) => string.includes(text)))).toEqual([])
    const terms = (conceptRecord(expected.slug)?.sections ?? [])
      .flatMap(({ blocks }) => allBlocks(blocks))
      .flatMap((block) => (block.kind === 'term' ? [block.id] : []))
    expect(terms.filter((id) => id === 'yama' || id === 'niyama')).toEqual([])
  })

  it('lists its References in its page’s order, every one resolving', async () => {
    expect(conceptRecord(expected.slug)?.references).toEqual(expected.references)
    const view = await concepts.get(expected.slug)
    expect(view?.references.map(({ id, number }) => [number, id])).toEqual(
      expected.references.map((id, i) => [i + 1, id]),
    )
  })

  it('keeps its “Indian vs Western” table as a comparison, where its page has one', async () => {
    const view = await concepts.get(expected.slug)
    const comparisons = view?.linked.sections.filter(({ role }) => role === 'comparison') ?? []
    expect(comparisons.map(({ heading }) => heading)).toEqual(
      expected.comparison ? ['Indian vs Western concept'] : [],
    )
  })

  it('has its coming-later Questionnaire, which names it, with the candidate source tomar-2024', async () => {
    expect(conceptRecord(expected.slug)?.questionnaire).toBe(expected.slug)
    const view = await questionnaires.get(expected.slug)
    expect(view).toMatchObject({
      slug: expected.slug,
      title: expected.title,
      sourceTitle: expected.title,
      status: 'coming-later',
      concepts: [{ slug: expected.slug }],
      candidateSource: { id: 'tomar-2024' },
    })
    expect(await questionnaires.form(expected.slug)).toBeNull()
  })
})

describe.each(VALUES)('the Questionnaire $slug', (expected) => {
  it('holds no form, and its scoring is pending with a reason', () => {
    const questionnaire = questionnaireRecord(expected.slug)
    expect(questionnaire?.form).toBeUndefined()
    expect(questionnaire?.scoring.status).toBe('pending')
    expect(questionnaire?.scoring.reason).not.toBe('')
    expect(questionnaire?.provenance.sources.map(({ url }) => url)).toEqual([expected.page])
  })

  it('describes its page’s held-back score section, its note included, and where it was', () => {
    const heldBack = questionnaireRecord(expected.slug)?.heldBack ?? []
    expect(heldBack).toHaveLength(1)
    expect(heldBack[0]?.what).toMatch(/Score Wise Category Description/)
    expect(heldBack[0]?.what).toMatch(/referred from/)
    expect(heldBack[0]?.where).toContain(new URL(expected.page).pathname)
    expect(heldBack[0]?.where).toMatch(/Overall Score Indicator/i)
  })
})
