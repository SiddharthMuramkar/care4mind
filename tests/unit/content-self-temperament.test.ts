import { beforeAll, describe, expect, it } from 'vitest'

import {
  concepts,
  questionnaires,
  topics,
  works,
  type BlockView,
  type ConceptView,
  type VerseView,
} from '@/content'
import {
  CONTENT_KINDS,
  type Block,
  type ConceptRecord,
  type PassageQuote,
  type QuestionnaireRecord,
  localSource,
} from '@/content/testing'

// Content-v1 ticket 11: the self and temperament topics. The last three description pages, Are
// you a Friend/Foe of Yourself?, Karta and Triguna, become Concepts, each with its coming-later
// Questionnaire. Read through the public interface and the content source, as the other content
// tests are.

/**
 * Each Concept, by its slug (D02): its headword as a heading shows it, its page, its topics, every
 * verse it quotes in the page's order with the census's translation id (null where the page
 * labels none), the anchors of its sub-terms, its reference list in the page's order (census),
 * how many tables its page keeps, and its Questionnaire's titles.
 */
const PAGES = [
  {
    slug: 'atma-bandhu',
    name: 'Ātma-bandhu',
    page: 'https://care4mind.org/frienorfoeofself/',
    topic: 'self',
    also: [],
    // Both English lines are labelled "Meaning": neither quote names a translation.
    verses: [
      ['bhagavad-gita/6.5', null],
      ['dhammapada/160', null],
    ],
    terms: ['atma-ripu'],
    references: [
      'arshavidyananda-2021',
      'shlokam-2024-gita-6-5',
      'hegde-nayak-2025',
      'nagar-2023',
      'saraswati-2014',
      'paranjpe-2010',
      'pepper-henry-1991',
      'tomar-2024',
      'vivekavani-2015',
    ],
    tables: 1,
    questionnaire: {
      title: 'Are you a Friend/Foe of Yourself?',
      sourceTitle: 'Are you a Friend/Foe of Yourself?',
    },
  },
  {
    slug: 'karta',
    name: 'Kartā',
    page: 'https://care4mind.org/karta-2/',
    topic: 'temperament',
    also: ['self'],
    // The English line under each verse has no label: the census stores it as the translation.
    verses: [
      ['bhagavad-gita/18.23', 'karta-2'],
      ['bhagavad-gita/18.24', 'karta-2'],
      ['bhagavad-gita/18.25', 'karta-2'],
    ],
    // The Sattvik, Rajasic and Tamasic Karta.
    terms: ['sattvika-karta', 'rajasa-karta', 'tamasa-karta'],
    references: [
      'coward-1983',
      'shlokam-2021',
      'ignou-2017',
      'rao-paranjpe-2016',
      'paranjpe-1996',
      'paranjpe-1998',
      'potter-1967',
      'tomar-2024',
      'shlokam-2020-yogasutra',
    ],
    tables: 1,
    // The page's first heading, “Karta Profile Introduction”, names its questionnaire.
    questionnaire: { title: 'Karta Profile', sourceTitle: 'Karta' },
  },
  {
    slug: 'triguna',
    name: 'Triguṇa',
    page: 'https://care4mind.org/triguna/',
    topic: 'temperament',
    also: [],
    // Every verse sits inside a section. 14.5's English line is labelled "Meaning", and
    // Suśruta Saṃhitā 4.35 has none: those two quotes name no translation.
    verses: [
      ['bhagavad-gita/14.5', null],
      ['bhagavad-gita/14.6', 'triguna'],
      ['bhagavad-gita/14.7', 'triguna'],
      ['bhagavad-gita/14.8', 'triguna'],
      ['bhagavad-gita/14.9', 'triguna'],
      ['bhagavad-gita/14.11', 'triguna'],
      ['bhagavad-gita/14.12', 'triguna'],
      ['bhagavad-gita/14.13', 'triguna'],
      ['sushruta-samhita/4.35', null],
    ],
    terms: ['sattva', 'rajas', 'tamas'],
    // The "Online Resources" line holds three: Shlokam.org, DharmaWiki and the Suśruta e-book.
    references: [
      'bonshe-srivastava-2023',
      'gupta-1977',
      'jayasheela-salagame-2018',
      'murthy-kiran-kumar-2007',
      'khanna-2013',
      'pandey-dubey-2020',
      'swaroop-2016',
      'sandhya-vinodkumar-2021',
      'tomar-2024',
      'shlokam-2025',
      'dharmawiki',
      'esushruta',
    ],
    // Its one table, of score-level characteristics, is held back with its Questionnaire.
    tables: 0,
    questionnaire: { title: 'Triguna Profile Questionnaire', sourceTitle: 'Triguna' },
  },
]

let conceptRecords: readonly ConceptRecord[] = []
let questionnaireRecords: readonly QuestionnaireRecord[] = []

beforeAll(async () => {
  conceptRecords = await localSource.records('concept')
  questionnaireRecords = await localSource.records('questionnaire')
  // The first read builds the content graph; doing it here keeps that out of each test's time.
  await concepts.list()
})

const conceptRecord = (slug: string) => conceptRecords.find((concept) => concept.slug === slug)
const questionnaireRecord = (slug: string) =>
  questionnaireRecords.find((questionnaire) => questionnaire.slug === slug)

/** Every verse quoted in a list of blocks, those inside term blocks included, in reading order. */
const versesIn = (blocks: readonly BlockView[]): VerseView[] =>
  blocks.flatMap((block) =>
    block.kind === 'verse' ? [block.verse] : block.kind === 'term' ? versesIn(block.blocks) : [],
  )

/** Every verse a Concept's page shows: those at the top, then those inside its sections. */
const versesOf = (concept: ConceptView | null) =>
  concept === null
    ? []
    : [...concept.verses, ...concept.sections.flatMap((section) => versesIn(section.blocks))]

/** The same, as the record quotes them. */
const quotesIn = (blocks: readonly Block[]): PassageQuote[] =>
  blocks.flatMap((block) =>
    block.kind === 'verse' ? [block.quote] : block.kind === 'term' ? quotesIn(block.blocks) : [],
  )
const quotesOf = (concept: ConceptRecord | undefined) =>
  concept === undefined
    ? []
    : [...concept.verses, ...concept.sections.flatMap((section) => quotesIn(section.blocks))]

type TableView = Extract<BlockView, { kind: 'table' }>

/** Every table in a list of blocks, those inside term blocks included, in reading order. */
const tablesIn = (blocks: readonly BlockView[]): TableView[] =>
  blocks.flatMap((block) =>
    block.kind === 'table' ? [block] : block.kind === 'term' ? tablesIn(block.blocks) : [],
  )

describe('the self and temperament Concepts', () => {
  it.each(PAGES)(
    'names $slug by its headword, in the topic $topic, carried over unreviewed',
    async ({ slug, name, page, topic, also }) => {
      const concept = await concepts.get(slug)
      expect(concept).toMatchObject({
        name,
        topic: { slug: topic },
        reviewStatus: 'carried-over-not-reviewed',
      })
      expect(concept?.secondaryTopics.map((ref) => ref.slug)).toEqual(also)
      expect(concept?.provenance.sources.map(({ url }) => url)).toEqual([page])
    },
  )

  it.each(PAGES)(
    'resolves every verse $slug quotes, in the page’s order, with the census’s translation',
    async ({ slug, verses }) => {
      const concept = await concepts.get(slug)
      expect(versesOf(concept).map(({ passage }) => passage)).toEqual(
        verses.map(([passage]) => passage),
      )
      expect(
        quotesOf(conceptRecord(slug)).map(({ passage, translation }) => [
          passage,
          translation ?? null,
        ]),
      ).toEqual(verses)
    },
  )

  it.each(PAGES)('resolves $slug’s reference list, in the page’s order', async (expected) => {
    const concept = await concepts.get(expected.slug)
    expect(concept?.references.map(({ id }) => id)).toEqual(expected.references)
  })

  it.each(PAGES)(
    'anchors each of $slug’s sub-terms, in the page’s order',
    async ({ slug, terms }) => {
      const concept = await concepts.get(slug)
      expect(concept?.toc.flatMap((entry) => entry.terms.map(({ id }) => id))).toEqual(terms)
    },
  )

  it.each(PAGES)('keeps $slug’s tables, each with its caption', async ({ slug, tables }) => {
    const concept = await concepts.get(slug)
    const found = (concept?.sections ?? []).flatMap((section) => tablesIn(section.blocks))
    expect(found).toHaveLength(tables)
    expect(found.filter(({ caption }) => caption.trim() === '')).toEqual([])
  })
})

describe('ātma-bandhu', () => {
  it('quotes Dhammapada 160 in Pali, and keeps the page’s Meaning on both its verses', async () => {
    const concept = await concepts.get('atma-bandhu')
    expect(concept?.verses.map(({ work }) => work.lang)).toEqual(['sa-Latn', 'pi-Latn'])
    expect((await works.get('dhammapada'))?.language).toBe('pi')
    expect(concept?.verses.filter(({ meaning }) => !meaning)).toEqual([])
  })

  it('sets “Contrast with Western Psychology” and its table out as a comparison', async () => {
    const concept = await concepts.get('atma-bandhu')
    const contrast = concept?.sections.find(
      ({ heading }) => heading === 'Contrast with Western Psychology',
    )
    expect(contrast?.role).toBe('comparison')
    expect(tablesIn(contrast?.blocks ?? []).map(({ columns }) => columns)).toEqual([
      ['Aspect', 'Western Perspective', 'Indian perspective'],
    ])
  })

  it('keeps “Self Management Strategies Propounded by Bhagavat Gita”', async () => {
    const concept = await concepts.get('atma-bandhu')
    expect(concept?.sections.map(({ heading }) => heading)).toContain(
      'Self Management Strategies Propounded by Bhagavat Gita',
    )
  })
})

describe('kartā', () => {
  it('takes its English name from the page’s own gloss, “‘karta’ or doer”', async () => {
    expect((await concepts.get('karta'))?.english).toBe('doer')
  })

  it('holds the Sattvik, Rajasic and Tamasic Karta as term blocks, each with its verse', async () => {
    const concept = await concepts.get('karta')
    const terms = (concept?.sections ?? [])
      .flatMap((section) => section.blocks)
      .filter((block) => block.kind === 'term')
    expect(
      terms.map((term) => [term.id, versesIn(term.blocks).map(({ passage }) => passage)]),
    ).toEqual([
      ['sattvika-karta', ['bhagavad-gita/18.23']],
      ['rajasa-karta', ['bhagavad-gita/18.24']],
      ['tamasa-karta', ['bhagavad-gita/18.25']],
    ])
    expect(terms.map((term) => term.term.ascii)).toEqual([
      ['Sattvik Karta'],
      ['Rajasic Karta'],
      ['Tamasic Karta'],
    ])
  })

  it('sets the comparative table on karma and determinism out as a comparison', async () => {
    const concept = await concepts.get('karta')
    const heading = 'Comparative Table: Indian vs. Western Perspectives of Karma & Determinism'
    const section = concept?.sections.find((candidate) => candidate.heading === heading)
    expect(section?.role).toBe('comparison')
    expect(tablesIn(section?.blocks ?? []).map(({ caption }) => caption)).toEqual([heading])
  })

  it('holds back the whole “Karta Score-Based Indicators” section, never quoting it', () => {
    const heldBack = questionnaireRecord('karta')?.heldBack ?? []
    expect(heldBack.map(({ where }) => where).join(' ')).toContain('Karta Score-Based Indicators')
    const everything = JSON.stringify([conceptRecord('karta'), questionnaireRecord('karta')])
    for (const phrase of ['1 to 10', 'Harmonious Doer', 'Passionate Doer', 'Deluded Doer'])
      expect(everything).not.toContain(phrase)
  })
})

describe('triguṇa', () => {
  it('quotes no verse above its sections: each sits in the section the page sets it in', async () => {
    const concept = await concepts.get('triguna')
    expect(concept?.verses).toEqual([])
    const section = (heading: string) =>
      versesIn(concept?.sections.find((candidate) => candidate.heading === heading)?.blocks ?? [])
    expect(section('Guna Predominance').map(({ passage }) => passage)).toEqual([
      'bhagavad-gita/14.11',
      'bhagavad-gita/14.12',
      'bhagavad-gita/14.13',
    ])
    expect(section('Ayurvedic Perspectives').map(({ source }) => source)).toEqual([
      'Suśruta Saṃhitā 4.35',
    ])
  })

  it('flags the page’s short name for Suśruta Saṃhitā 4.35 for the Research editor', () => {
    expect(
      conceptRecord('triguna')?.provenance.flags.filter(
        (flag) => flag.for === 'research-editor' && flag.note.includes('“Sush Samh 4.35”'),
      ),
    ).toHaveLength(1)
  })

  it('keeps the guṇas as term blocks, and the Ayurveda and psychology sections', async () => {
    const concept = await concepts.get('triguna')
    expect(concept?.sections.map(({ heading }) => heading)).toEqual(
      expect.arrayContaining([
        'Guna Predominance',
        'Ayurvedic Perspectives',
        'Psychology Perspectives',
      ]),
    )
    const terms = (concept?.sections ?? [])
      .flatMap((section) => section.blocks)
      .filter((block) => block.kind === 'term')
    expect(terms.map(({ term }) => term.iast)).toEqual(['sattva', 'rajas', 'tamas'])
  })

  it('holds back the characteristics table under “Triguna Profile Questionnaire”, never quoting it', () => {
    const heldBack = questionnaireRecord('triguna')?.heldBack ?? []
    expect(heldBack.map(({ where }) => where).join(' ')).toContain('Triguna Profile Questionnaire')
    const everything = JSON.stringify([conceptRecord('triguna'), questionnaireRecord('triguna')])
    for (const phrase of ['Wise, calm', 'Mentally clear', 'high and low traits'])
      expect(everything).not.toContain(phrase)
  })

  it('drops the leftover test shortcode and its message from every record, and lists the drop', async () => {
    const everything = JSON.stringify(
      (await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))).flat(),
    )
    for (const leftover of [/my_php_code/i, /Hello, Mind!/i, /dynamic PHP/i])
      expect(everything).not.toMatch(leftover)
    expect(conceptRecord('triguna')?.provenance.edits.join(' ')).toMatch(/test shortcode/)
  })
})

describe('the self and temperament topics', () => {
  it('hold their Concepts: ātma-bandhu in self; kartā and triguṇa in temperament, kartā also in self', async () => {
    const self = await topics.get('self')
    expect(self?.concepts.map(({ slug }) => slug)).toContain('atma-bandhu')
    expect(self?.secondaryConcepts.map(({ slug }) => slug)).toContain('karta')
    const temperament = await topics.get('temperament')
    expect(temperament?.concepts.map(({ slug }) => slug).sort()).toEqual(['karta', 'triguna'])
  })
})

describe('each Concept’s coming-later Questionnaire', () => {
  it.each(PAGES)('is $slug’s own, under its slug, linked both ways', async ({ slug }) => {
    // The view lists any Questionnaire naming the Concept, so the Concept's own link is read here.
    expect(conceptRecord(slug)?.questionnaire).toBe(slug)
    const concept = await concepts.get(slug)
    expect(concept?.linked.questionnaires[0]).toMatchObject({ slug, status: 'coming-later' })
    const questionnaire = await questionnaires.get(slug)
    expect(questionnaire?.concepts.map((ref) => ref.slug)).toEqual([slug])
  })

  it.each(PAGES)(
    'takes $slug’s titles from its page, and Tomar (2024) as its candidate source',
    async ({ slug, questionnaire: expected }) => {
      const questionnaire = await questionnaires.get(slug)
      expect(questionnaire).toMatchObject(expected)
      expect(questionnaire?.candidateSource?.id).toBe('tomar-2024')
    },
  )

  it.each(PAGES)(
    'holds back $slug’s score section, keeps its scoring pending and offers no form',
    async ({ slug, page }) => {
      const record = questionnaireRecord(slug)
      expect(record?.provenance.sources.map(({ url }) => url)).toEqual([page])
      expect(record?.heldBack.length).toBeGreaterThan(0)
      expect(record?.scoring.status).toBe('pending')
      expect(record?.form).toBeUndefined()
      expect(await questionnaires.form(slug)).toBeNull()
    },
  )

  it('takes Triguna’s purpose from the page’s sentence on what it estimates, flagged', async () => {
    const questionnaire = await questionnaires.get('triguna')
    expect(questionnaire?.purpose).toEqual([
      'A Triguna Profile Questionnaire is a tool to estimate the characteristics of Trigunas in a person.',
    ])
    expect(
      questionnaire?.provenance.flags.filter(
        (flag) => flag.for === 'psychology-expert' && /purpose/.test(flag.note),
      ),
    ).toHaveLength(1)
  })

  it.each(['atma-bandhu', 'karta'])(
    'gives %s’s no purpose, flagged: its page says nothing outside the score section about what it measures',
    async (slug) => {
      const questionnaire = await questionnaires.get(slug)
      expect(questionnaire?.purpose).toBeUndefined()
      expect(
        questionnaire?.provenance.flags.filter(
          (flag) => flag.for === 'psychology-expert' && /no purpose/.test(flag.note),
        ),
      ).toHaveLength(1)
    },
  )
})
