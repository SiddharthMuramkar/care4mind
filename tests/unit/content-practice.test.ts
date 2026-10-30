import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, questionnaires, topics, works } from '@/content'
import { contentGraph } from '@/content/graph'
import type {
  Block,
  ConceptRecord,
  QuestionnaireRecord,
  Section,
  TableBlock,
  TermBlock,
} from '@/content/schema'
import { localSource } from '@/content/source'

// Content-v1 ticket 09: the four "practice" description pages as Concepts, each with its
// coming-later Questionnaire. Read through the content source and the public interface, as the
// other content tests are. The verses and References expected are the census's
// (.scratch/content-v1/census/), page by page.

interface Page {
  slug: string
  url: string
  /** The page title as published. */
  title: string
  /** The name the page gives its questionnaire, else its title. */
  questionnaire: string
  candidateSource?: string
  /** [passage, translation] for each verse at the top of the page, in its order. */
  verses: [string, string][]
  /** The page's reference list, in its order. */
  references: string[]
  /** The in-text citations that match nothing on that list (the census notes them). */
  unresolved: string[]
}

const FIVE_STEPS: Page = {
  slug: 'five-steps-of-perfection',
  url: 'https://care4mind.org/fivestepsofperfectionprofiling/',
  title: 'Five Steps of Perfection Profiling',
  questionnaire: 'Five Steps of Perfection Profiling',
  verses: [['yoga-sutra/1.20', 'fivestepsofperfectionprofiling']],
  references: [
    'apa-perfectionism',
    'chundawat-panda-2022',
    'dharwadkar-2021',
    'dong-2022',
    'gangasagre',
    'indurkar',
    'jeste-vahia-2008',
    'kyeon-2010',
    'nazari-2022',
    'patterson-2021',
    'rao-1989',
    'shlokam-2020-yogasutra-1-20',
    'tomar-2024',
    'wisdomlib-2025-absorption',
    'wisdomlib-2025-prajna',
  ],
  unresolved: [],
}

const MOMENTUM: Page = {
  slug: 'momentum-of-spiritual-practice',
  url: 'https://care4mind.org/momentumofspiritualpractice/',
  title: 'Momentum of Spiritual Practice',
  questionnaire: 'Momentum of Spiritual Practice',
  candidateSource: 'tomar-2024',
  verses: [
    ['yoga-sutra/1.21', 'momentumofspiritualpractice'],
    ['yoga-sutra/1.22', 'momentumofspiritualpractice'],
  ],
  references: [
    'cucchi-qoronfleh-2025',
    'eaude-2024',
    'fopka-kowalczyk-2022',
    'ghahramani-2025',
    'lau-2020',
    'lee-park-2025',
    'milner-2019',
    'neathery-2019',
    'ryff-2021',
    'sargeant-yoxall-2023',
    'shlokam-2020-yogasutra',
    'staples-2022',
    'tomar-2024',
  ],
  unresolved: [],
}

const SPIRITUAL: Page = {
  slug: 'spiritual-practitioner',
  url: 'https://care4mind.org/spiritualpractitionerprofiling/',
  title: 'Spiritual Practitioner Profiling',
  questionnaire: 'Spiritual Practitioner Profile',
  candidateSource: 'tomar-2024',
  verses: [
    ['sadhana-panchakam/1', 'spiritualpractitionerprofiling'],
    ['sadhana-panchakam/2', 'spiritualpractitionerprofiling'],
    ['sadhana-panchakam/3', 'spiritualpractitionerprofiling'],
    ['sadhana-panchakam/4', 'spiritualpractitionerprofiling'],
    ['sadhana-panchakam/5', 'spiritualpractitionerprofiling'],
  ],
  references: [
    'choi-2020',
    'ford-2023',
    'ivtzan-jegatheeswaran-2015',
    'kaufman-2022',
    'malviya-greenham-2025',
    'padigapati-chandraiah-2020',
    'park-2011',
    'sekagya-2024',
    'shlokam-2020-sadhana-panchakam',
    'tamil-siddhas',
    'tomar-2024',
    'warber-2015',
  ],
  unresolved: ['Inbadas, 2017'],
}

const BRAHMA_VIHARA: Page = {
  slug: 'brahma-vihara',
  url: 'https://care4mind.org/brahmavihara/',
  title: 'Brahma Vihara',
  questionnaire: 'Brahma Vihara Profile',
  candidateSource: 'tomar-2024',
  verses: [['yoga-sutra/1.33', 'brahmavihara']],
  references: [
    'bhattacharjee-2016',
    'chatterjee-2018',
    'ford-2021',
    'gilbert-2015',
    'shlokam-2025',
    'mandal-2024',
    'sarkar-2019',
    'tomar-2024',
    'zeng-2015',
  ],
  unresolved: ['Gilbert & Choden, 2013', 'Mishra & Kumar, 2020', 'Bhattacharjee, 2024'],
}

const PAGES: Page[] = [FIVE_STEPS, MOMENTUM, SPIRITUAL, BRAHMA_VIHARA]

let conceptRecords: readonly ConceptRecord[] = []
let questionnaireRecords: readonly QuestionnaireRecord[] = []

/**
 * Reading every record and building the graph takes a few seconds, and more on a machine busy
 * with parallel builders; done once here, with room to spare, every test after it is quick.
 */
const LOADING_TIMEOUT = 60_000

beforeAll(async () => {
  conceptRecords = await localSource.records('concept')
  questionnaireRecords = await localSource.records('questionnaire')
  // Built once per process and shared with the views the tests ask for.
  await contentGraph()
}, LOADING_TIMEOUT)

const conceptOf = (slug: string) => conceptRecords.find((concept) => concept.slug === slug)
const questionnaireOf = (slug: string) =>
  questionnaireRecords.find((questionnaire) => questionnaire.slug === slug)

/** The notes of a record's flags for one role. */
const notesFor = (record: ConceptRecord | QuestionnaireRecord | undefined, role: string) =>
  (record?.provenance.flags ?? []).filter((flag) => flag.for === role).map((flag) => flag.note)

/** Every block in some sections, term blocks' own blocks included, in reading order. */
const blocksIn = (sections: readonly Section[] = []): Block[] => {
  const all = (blocks: readonly Block[]): Block[] =>
    blocks.flatMap((block) => (block.kind === 'term' ? [block, ...all(block.blocks)] : [block]))
  return sections.flatMap((section) => all(section.blocks))
}
const termsIn = (sections?: readonly Section[]) =>
  blocksIn(sections).filter((block): block is TermBlock => block.kind === 'term')
const tablesIn = (sections?: readonly Section[]) =>
  blocksIn(sections).filter((block): block is TableBlock => block.kind === 'table')

/** Every string in a value, leaving out its provenance. */
const contentStrings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(contentStrings)
      : value && typeof value === 'object'
        ? Object.entries(value).flatMap(([key, inner]) =>
            key === 'provenance' ? [] : contentStrings(inner),
          )
        : []

describe('the practice Concepts', () => {
  it.each(PAGES)('make $url a Concept in the practice topic, carried over', ({ slug, url }) => {
    const concept = conceptOf(slug)
    expect(concept?.topics).toEqual({ primary: 'practice' })
    expect(concept?.reviewStatus).toBe('carried-over-not-reviewed')
    expect(concept?.provenance.sources.map((source) => source.url)).toEqual([url])
    expect(concept?.provenance.drafted).toBeUndefined()
  })

  it.each(PAGES)(
    'quote the verses at the top of $url in its order, each with its translation and Meaning',
    ({ slug, verses }) => {
      const quotes = conceptOf(slug)?.verses ?? []
      expect(quotes.map(({ passage, translation }) => [passage, translation])).toEqual(verses)
      for (const quote of quotes) expect(quote.meaning, quote.passage).toMatch(/\S/)
    },
  )

  it.each(PAGES)(
    'resolve every verse of $slug to its work, and its References in the page’s order',
    async ({ slug, verses, references }) => {
      const view = await concepts.get(slug)
      expect(view?.verses.map(({ passage }) => passage)).toEqual(verses.map(([passage]) => passage))
      for (const verse of view?.verses ?? []) {
        expect(verse.translation, verse.passage).toMatch(/\S/)
        expect(verse.href, verse.passage).toMatch(/^\/texts\/[a-z-]+\/#[0-9-]+$/)
      }
      expect(view?.references.map(({ id }) => id)).toEqual(references)
    },
  )

  it.each(PAGES)(
    'resolve each in-text citation in $slug to its list, flagging those that match none',
    async ({ slug, unresolved }) => {
      const citations = (await contentGraph()).citations('concept', slug)
      expect(citations.length).toBeGreaterThan(0)
      expect(citations.filter(({ reference }) => !reference).map(({ text }) => text)).toEqual(
        unresolved,
      )
      const notes = notesFor(conceptOf(slug), 'research-editor').join(' ')
      for (const text of unresolved) expect(notes, text).toContain(`(${text})`)
    },
  )

  it.each(PAGES)('let no score interpretation into $slug', ({ slug }) => {
    expect(conceptOf(slug)).toBeDefined()
    const offenders = contentStrings(conceptOf(slug)).filter((text) =>
      /\bscor(?:e|es|ed|ing)\b|\b(?:high|moderate|low) indicators?\b/i.test(text),
    )
    expect(offenders).toEqual([])
  })

  it.each(PAGES)(
    'drop every link from $slug’s text; its page links no DharmaWiki article of its own',
    ({ slug }) => {
      const concept = conceptOf(slug)
      expect(concept).toBeDefined()
      expect(contentStrings(concept).filter((text) => /https?:|dharmawiki/i.test(text))).toEqual([])
      expect(concept?.external).toBeUndefined()
    },
  )

  it('complete the practice topic with these four Concepts', async () => {
    const practice = await topics.get('practice')
    expect(practice?.concepts.map(({ slug }) => slug).sort()).toEqual(
      PAGES.map(({ slug }) => slug).sort(),
    )
  })

  it('name Brahma Vihara by its headword brahmavihāra, with the page’s spellings, flagged', () => {
    const concept = conceptOf(BRAHMA_VIHARA.slug)
    expect(concept?.name).toEqual({
      term: { iast: 'brahmavihāra', ascii: ['Brahma Vihara', 'Brahmavihara'] },
    })
    const notes = notesFor(concept, 'research-editor').join(' ')
    expect(notes).toContain('“brahmavihāra”')
    expect(notes).toMatch(/no English gloss/)
  })

  it('keep Brahma Vihara’s four components as term blocks, named from its Yoga Sūtra 1.33', () => {
    const concept = conceptOf(BRAHMA_VIHARA.slug)
    const components = termsIn(concept?.sections)
    expect(
      components.map(({ id, term, gloss }) => [id, term.iast, term.devanagari, gloss]),
    ).toEqual([
      ['maitri', 'maitrī', 'मैत्री', 'Loving-kindness or Benevolence'],
      ['karuna', 'karuṇā', 'करुणा', 'Compassion'],
      ['mudita', 'muditā', 'मुदिता', 'Altruistic Joy'],
      ['upeksa', 'upekṣā', 'उपेक्षा', 'Equanimity or Inner Balance'],
    ])
    expect(components.map(({ term }) => term.ascii[0])).toEqual([
      'Maitra',
      'Karuna',
      'Mudita',
      'Upeksha',
    ])
    // Split out of a compound, not printed on its own: listed and flagged.
    const flagged = notesFor(concept, 'research-editor').join(' ')
    for (const { term } of components) expect(flagged, term.iast).toContain(term.iast)
  })

  it('keep Brahma Vihara’s summative table, with a row for each component', () => {
    const tables = tablesIn(conceptOf(BRAHMA_VIHARA.slug)?.sections)
    expect(tables.map(({ id, caption, columns }) => ({ id, caption, columns }))).toEqual([
      {
        id: 'summative-table',
        caption: 'Summative Table: Core Functions & Interpretations of Brahma Vihara Components',
        columns: ['Component', 'Synonymous Term', 'Core Function', 'Interpretation'],
      },
    ])
    expect(
      tables[0]?.rows.map(({ head }) => (typeof head === 'object' ? head.term.iast : head)),
    ).toEqual(['maitrī', 'karuṇā', 'muditā', 'upekṣā'])
  })

  it('list the inline DharmaWiki links dropped from Brahma Vihara’s text', () => {
    const edits = conceptOf(BRAHMA_VIHARA.slug)?.provenance.edits.join(' ')
    for (const word of ['Brahman', 'Vedanta', 'kilesas', 'maya'])
      expect(edits, word).toContain(`“${word}”`)
  })

  it.each([
    { slug: FIVE_STEPS.slug, english: 'Five Steps of Perfection' },
    { slug: SPIRITUAL.slug, english: 'Spiritual Practitioner' },
  ])(
    'name $slug by its English title, flagged as having no Sanskrit headword',
    ({ slug, english }) => {
      const concept = conceptOf(slug)
      expect(concept?.name).toEqual({ english })
      expect(notesFor(concept, 'research-editor').join(' ')).toMatch(/no Sanskrit headword/)
    },
  )

  it('keep the five steps as term blocks, named from the page’s Yoga Sūtra 1.20', () => {
    const concept = conceptOf(FIVE_STEPS.slug)
    const steps = termsIn(concept?.sections)
    expect(steps.map(({ id, term, gloss }) => [id, term.iast, gloss])).toEqual([
      ['sraddha', 'śraddhā', 'Unconditional Faith'],
      ['virya', 'vīrya', 'Strength'],
      ['smrti', 'smṛti', 'Memory'],
      ['samadhi', 'samādhi', 'Absorption'],
      ['prajna', 'prajñā', 'Wisdom'],
    ])
    expect(steps.map(({ term }) => term.ascii[0])).toEqual([
      'Shraddha',
      'Virya',
      'Smriti',
      'Samadhi',
      'Prajna',
    ])
    // Split out of a compound, not printed on its own: listed and flagged.
    const flagged = notesFor(concept, 'research-editor').join(' ')
    for (const { term } of steps) expect(flagged, term.iast).toContain(`“${term.iast}”`)
  })

  it('name Momentum of Spiritual Practice by its English title, flagging saṃvega as a possible headword', () => {
    const concept = conceptOf(MOMENTUM.slug)
    expect(concept?.name).toEqual({ english: 'Momentum of Spiritual Practice' })
    const [note] = notesFor(concept, 'research-editor').filter((text) => text.includes('saṃvega'))
    expect(note).toMatch(/no Sanskrit headword/)
    expect(note).toContain('Yoga Sūtra 1.21')
  })

  it.each([
    {
      slug: FIVE_STEPS.slug,
      caption:
        /^Comparative table of Indian vs Western concepts for Prajna\/Wisdom, .+\(Indurkar, n\.d\.; Jeste & Vahia, 2008\)$/,
      columns: ['Concept', 'Indian Perspective', 'Western Perspective'],
      rows: 5,
    },
    {
      slug: MOMENTUM.slug,
      caption:
        /^Comparative table of Indian vs Western concepts for Momentum of Spiritual Practice \(Lau et al\., 2020\)\.$/,
      columns: ['Category/Themes', 'Western Perspective (USA)', 'Indian Perspective (India)'],
      rows: 11,
    },
  ])(
    'keep $slug’s comparison table, with its own caption, in its comparison section',
    ({ slug, caption, columns, rows }) => {
      const sections = conceptOf(slug)?.sections ?? []
      const comparison = sections.filter((section) => section.role === 'comparison')
      expect(comparison).toHaveLength(1)
      const tables = tablesIn(comparison)
      expect(tables).toHaveLength(1)
      expect(tables[0]?.caption).toMatch(caption)
      expect(tables[0]?.columns).toEqual(columns)
      expect(tables[0]?.rows).toHaveLength(rows)
    },
  )

  it('mark Spiritual Practitioner’s applications and comparison sections', () => {
    const roles = (conceptOf(SPIRITUAL.slug)?.sections ?? []).flatMap(({ id, role }) =>
      role ? [[id, role]] : [],
    )
    expect(roles).toEqual([
      ['applications', 'applications'],
      ['indian-vs-western-views', 'comparison'],
    ])
  })

  it('quote the Sādhana Pañcakam verses under the work the page attributes to Adi Sankaracharya', async () => {
    const view = await concepts.get(SPIRITUAL.slug)
    expect(view?.linked.works.map(({ slug }) => slug)).toEqual(['sadhana-panchakam'])
    expect((await works.get('sadhana-panchakam'))?.attribution).toBe('Adi Sankaracharya')
  })

  it('drop the stray file name the page left in a table cell, and list it', () => {
    const concept = conceptOf(MOMENTUM.slug)
    expect(contentStrings(concept).filter((text) => text.includes('paste.txt'))).toEqual([])
    expect(concept?.provenance.edits.join(' ')).toContain('“importantpaste.txt.” → “important.”')
  })

  it.each([
    { slug: FIVE_STEPS.slug, heading: 'Shlokas of Perfection from Chapter 1, Sutra 20' },
    { slug: MOMENTUM.slug, heading: 'Chapter 1, Sutra 21,22' },
  ])('flag $slug’s verses, whose heading names no work', ({ slug, heading }) => {
    expect(notesFor(conceptOf(slug), 'research-editor').join(' ')).toContain(`${heading}”`)
  })
})

describe('their Questionnaires', () => {
  it.each(PAGES)(
    'give $slug a coming-later Questionnaire under its own slug, with no form',
    async ({ slug }) => {
      const questionnaire = questionnaireOf(slug)
      expect(questionnaire?.status).toBe('coming-later')
      expect(questionnaire?.concepts).toEqual([slug])
      expect(conceptOf(slug)?.questionnaire).toBe(slug)
      expect(questionnaire?.form).toBeUndefined()
      expect(await questionnaires.form(slug)).toBeNull()
      expect(questionnaire?.reviewStatus).toBe('carried-over-not-reviewed')
    },
  )

  it.each(PAGES)(
    'title $slug’s Questionnaire by the name its page gives it, keeping the page title',
    ({ slug, title, questionnaire }) => {
      expect(questionnaireOf(slug)?.title).toBe(questionnaire)
      expect(questionnaireOf(slug)?.sourceTitle).toBe(title)
    },
  )

  it.each(PAGES)(
    'give $slug’s Questionnaire its candidate source from research ticket 11',
    async ({ slug, candidateSource }) => {
      expect(questionnaireOf(slug)).toBeDefined()
      expect(questionnaireOf(slug)?.candidateSource).toBe(candidateSource)
      expect((await questionnaires.get(slug))?.candidateSource?.id).toBe(candidateSource)
    },
  )

  it.each(PAGES)(
    'hold back $url’s score section, described, with its “referred from” note, and keep scoring pending',
    ({ slug }) => {
      const questionnaire = questionnaireOf(slug)
      expect(questionnaire?.scoring.status).toBe('pending')
      expect(questionnaire?.scoring.reason).toMatch(/\S/)
      const heldBack = questionnaire?.heldBack ?? []
      expect(heldBack.length).toBeGreaterThanOrEqual(2)
      expect(heldBack.some(({ what }) => /referred from/i.test(what))).toBe(true)
    },
  )

  it('flag Five Steps of Perfection for the Psychology expert: no published source was found', () => {
    const notes = notesFor(questionnaireOf(FIVE_STEPS.slug), 'psychology-expert').join(' ')
    expect(notes).toMatch(/no published source/i)
    expect(notes).toMatch(/planning ticket 11/)
  })

  it('hold back Brahma Vihara’s line about section-wise scores too', () => {
    const heldBack = questionnaireOf(BRAHMA_VIHARA.slug)?.heldBack ?? []
    expect(heldBack.some(({ what }) => /section-wise scores/i.test(what))).toBe(true)
  })
})
