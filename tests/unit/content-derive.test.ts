import { describe, expect, it } from 'vitest'

import type { Features } from '@/config/features'
import * as content from '@/content'
import {
  defineConcept,
  defineGlossaryEntry,
  defineHome,
  definePage,
  definePassage,
  defineQuestionnaire,
  defineReference,
  defineResourceList,
  defineTopic,
  defineWork,
  type ConceptRecord,
  type ContentKind,
  type ContentRecord,
  type QuestionnaireRecord,
  type RecordOf,
} from '@/content/schema'
import { localSource, type ContentSource } from '@/content/source'
import { createContent } from '@/content/views'

// The site derivations (content-v1 spec, "What the site derivations return"): the routes, the
// breadcrumb trail, the A–Z, the search documents and the Concept-map data, each computed from
// whatever records a source holds. Each test builds a made-up source and reads `site` through
// the same interface the pages use. Every record and string here is made up for the test.

const ON: Features = {
  questionnairePreview: true,
  conceptMap: true,
  startHere: true,
}
const OFF: Features = {
  questionnairePreview: false,
  conceptMap: false,
  startHere: false,
}

const provenance = {
  sources: [{ url: 'https://example.org/page/', retrieved: '2026-10-27' }],
  edits: [],
  flags: [],
}

/** A made-up content source holding the given records. */
function sourceOf(...records: ContentRecord[]): ContentSource {
  return {
    async records<K extends ContentKind>(kind: K) {
      return records.filter((record): record is RecordOf<K> => record.kind === kind)
    },
  }
}

const mind = defineTopic({
  kind: 'topic',
  slug: 'mind',
  name: { english: 'Mind', term: { iast: 'citta', devanagari: 'चित्त', ascii: ['chitta'] } },
  order: 1,
})
const self = defineTopic({ kind: 'topic', slug: 'self', name: { english: 'Self' }, order: 2 })

const yogaSutra = defineWork({
  kind: 'work',
  slug: 'yoga-sutra',
  title: { iast: 'Yoga Sūtra', devanagari: 'योगसूत्र', ascii: ['Yoga Sutra'] },
  locatorLabel: 'Sutra',
  provenance,
})
const dhammapada = defineWork({
  kind: 'work',
  slug: 'dhammapada',
  title: { iast: 'Dhammapada', ascii: ['Dhammapada'] },
  language: 'pi',
  locatorLabel: 'Verse',
  provenance,
})
const ys130 = definePassage({
  kind: 'passage',
  id: 'yoga-sutra/1.30',
  work: 'yoga-sutra',
  locator: '1.30',
  order: [1, 30],
  devanagari: ['उदाहरणम्'],
  transliteration: { lines: ['udāharaṇam'], scheme: 'iast' },
  translations: [{ id: 'obstacles', text: 'A made-up translation of a made-up verse.' }],
  provenance,
})
const dp160 = definePassage({
  kind: 'passage',
  id: 'dhammapada/160',
  work: 'dhammapada',
  locator: '160',
  order: [160],
  devanagari: [],
  translations: [],
  provenance,
})

const tomar = defineReference({
  kind: 'reference',
  id: 'tomar-2024',
  type: 'book',
  authors: 'Tomar, V. S.',
  year: '2024',
  title: 'A made-up handbook',
  url: 'https://example.org/handbook',
  asCited: ['Tomar, V. S. (2024). A made-up handbook.'],
  provenance,
})
const rao = defineReference({
  kind: 'reference',
  id: 'rao-2001',
  type: 'journal-article',
  authors: 'Rao, K., & Sen, M.',
  year: '2001',
  title: 'A made-up paper',
  container: 'Journal of Examples',
  url: 'https://example.org/rao',
  asCited: ['Rao, K., & Sen, M. (2001). A made-up paper.'],
  provenance,
})

const concept: ConceptRecord = {
  kind: 'concept',
  slug: 'obstacles',
  name: { term: { iast: 'vighna', devanagari: 'विघ्न', ascii: ['Vigna'] }, english: 'Obstacle' },
  summary: 'A made-up summary.',
  keywords: ['focus', 'Obstacle', 'distraction', 'focus'],
  topics: { primary: 'mind' },
  verses: [{ passage: 'yoga-sutra/1.30', translation: 'obstacles' }],
  sections: [],
  references: ['tomar-2024', 'rao-2001'],
  reviewStatus: 'carried-over-not-reviewed',
  provenance,
}
const obstacles = defineConcept(concept)
const calm = defineConcept({
  ...concept,
  slug: 'calm',
  name: { term: { iast: 'śānti', ascii: ['Shanti'] } },
  verses: [{ passage: 'yoga-sutra/1.30' }],
  references: ['tomar-2024'],
})
const refuge = defineConcept({
  ...concept,
  slug: 'refuge',
  name: { english: 'Refuge of the self' },
  topics: { primary: 'self', also: ['mind'] },
  verses: [{ passage: 'dhammapada/160' }],
  references: ['rao-2001'],
})

const form: QuestionnaireRecord['form'] = {
  responseSets: { yes: ['Yes', 'No'] },
  parts: [
    {
      id: 'only',
      title: 'Only',
      instructions: 'Made up.',
      items: [{ id: '1', text: 'A made-up statement?', responseSet: 'yes' }],
    },
  ],
}
const questionnaire: QuestionnaireRecord = {
  kind: 'questionnaire',
  slug: 'later',
  title: 'Later Profile',
  sourceTitle: 'Later Profiling',
  status: 'coming-later',
  concepts: ['obstacles'],
  scoring: { status: 'pending', reason: 'No documented scoring rules yet.' },
  heldBack: [],
  reviewStatus: 'carried-over-not-reviewed',
  provenance,
}
const later = defineQuestionnaire({ ...questionnaire, form })
const preview = defineQuestionnaire({
  ...questionnaire,
  slug: 'work-scale',
  title: 'Work Scale',
  status: 'preview',
  form,
})
const live = defineQuestionnaire({
  ...questionnaire,
  slug: 'live-one',
  title: 'Live One',
  status: 'live',
  form,
})
const soon = defineQuestionnaire({
  ...questionnaire,
  slug: 'soon',
  title: 'Soon',
  status: 'coming-soon',
})

const reading = defineResourceList({
  kind: 'resource-list',
  slug: 'reading',
  title: 'Reading List',
  groups: [{ id: 'core', heading: 'Core', items: [{ type: 'reference', reference: 'rao-2001' }] }],
  provenance,
})
const methods = definePage({
  kind: 'page',
  slug: 'methods',
  title: 'Methods',
  summary: 'A made-up summary of methods.',
  sections: [],
  provenance,
})
const home = defineHome({
  kind: 'home',
  tagline: 'A made-up tagline.',
  hero: {
    promise: 'Made up.',
    subhead: 'Made up.',
    startHere: 'Start',
    browseConcepts: 'Browse',
    exploreConcepts: 'Explore',
  },
  sectionIntros: { concepts: 'Made up.', questionnaires: 'Made up.' },
  shloka: { devanagari: 'उदाहरणम्', iast: 'udāharaṇam', translation: 'Made up.' },
  intro: 'Made up.',
  areas: [],
  closing: 'Made up.',
  helpLine: 'Made up.',
  provenance,
})

const world = [
  ...[mind, self, yogaSutra, dhammapada, ys130, dp160, tomar, rao],
  ...[obstacles, calm, refuge, later, preview, live, soon, reading, methods, home],
]

describe('site.routes', () => {
  it('lists one entry per public page, with one sample per kind', async () => {
    expect(await createContent(sourceOf(...world), ON).site.routes()).toEqual([
      { path: '/', kind: 'home', pattern: '/', title: 'Home', sample: true },
      {
        path: '/start/',
        kind: 'start',
        pattern: '/start/',
        title: 'Start here',
        sample: true,
        proposal: true,
      },
      {
        path: '/concepts/',
        kind: 'concepts',
        pattern: '/concepts/',
        title: 'Concepts',
        sample: true,
      },
      {
        path: '/concepts/calm/',
        kind: 'concept',
        pattern: '/concepts/[slug]/',
        title: 'Śānti',
        sample: true,
      },
      {
        path: '/concepts/obstacles/',
        kind: 'concept',
        pattern: '/concepts/[slug]/',
        title: 'Vighna',
      },
      {
        path: '/concepts/refuge/',
        kind: 'concept',
        pattern: '/concepts/[slug]/',
        title: 'Refuge of the self',
      },
      {
        path: '/concepts/map/',
        kind: 'concept-map',
        pattern: '/concepts/map/',
        title: 'Concept map',
        sample: true,
        proposal: true,
      },
      {
        path: '/topics/mind/',
        kind: 'topic',
        pattern: '/topics/[slug]/',
        title: 'Mind',
        sample: true,
      },
      { path: '/topics/self/', kind: 'topic', pattern: '/topics/[slug]/', title: 'Self' },
      {
        path: '/texts/',
        kind: 'texts',
        pattern: '/texts/',
        title: 'Traditional texts',
        sample: true,
      },
      {
        path: '/texts/dhammapada/',
        kind: 'work',
        pattern: '/texts/[slug]/',
        title: 'Dhammapada',
        sample: true,
      },
      { path: '/texts/yoga-sutra/', kind: 'work', pattern: '/texts/[slug]/', title: 'Yoga Sūtra' },
      {
        path: '/questionnaires/',
        kind: 'questionnaires',
        pattern: '/questionnaires/',
        title: 'Questionnaires',
        sample: true,
      },
      {
        path: '/questionnaires/live-one/',
        kind: 'questionnaire',
        pattern: '/questionnaires/[slug]/',
        title: 'Live One',
        sample: true,
      },
      {
        path: '/questionnaires/live-one/take/',
        kind: 'questionnaire-flow',
        pattern: '/questionnaires/[slug]/take/',
        title: 'Take it',
        sample: true,
      },
      {
        path: '/questionnaires/soon/',
        kind: 'questionnaire',
        pattern: '/questionnaires/[slug]/',
        title: 'Soon',
      },
      {
        path: '/questionnaires/work-scale/',
        kind: 'questionnaire',
        pattern: '/questionnaires/[slug]/',
        title: 'Work Scale',
      },
      {
        path: '/questionnaires/work-scale/take/',
        kind: 'questionnaire-flow',
        pattern: '/questionnaires/[slug]/take/',
        title: 'Take it',
      },
      { path: '/library/', kind: 'library', pattern: '/library/', title: 'Library', sample: true },
      {
        path: '/library/references/',
        kind: 'references',
        pattern: '/library/references/',
        title: 'References',
        sample: true,
      },
      {
        path: '/library/methods/',
        kind: 'page',
        pattern: '/library/[slug]/',
        title: 'Methods',
        sample: true,
      },
      {
        path: '/library/reading/',
        kind: 'resource-list',
        pattern: '/library/[slug]/',
        title: 'Reading List',
        sample: true,
      },
      { path: '/search/', kind: 'search', pattern: '/search/', title: 'Search', sample: true },
      {
        path: '/proposals/',
        kind: 'proposals',
        pattern: '/proposals/',
        title: 'Proposals',
        sample: true,
        proposal: true,
      },
    ])
  })

  it('leaves out every route whose flag is off, and no more', async () => {
    const paths = async (flags: Features) =>
      (await createContent(sourceOf(...world), flags).site.routes()).map(({ path }) => path)
    const all = await paths(ON)
    const without = (...gone: string[]) => all.filter((path) => !gone.includes(path))

    expect(await paths(OFF)).toEqual(
      without('/start/', '/concepts/map/', '/proposals/', '/questionnaires/work-scale/take/'),
    )
    expect(await paths({ ...ON, questionnairePreview: false })).toEqual(
      without('/questionnaires/work-scale/take/'),
    )
    expect(await paths({ ...ON, conceptMap: false })).toEqual(
      without('/concepts/map/'),
    )
    expect(await paths({ ...ON, startHere: false })).toEqual(without('/start/'))
  })

  it('gives a Questionnaire coming later no route, one that can’t be taken no flow, and /topics/ none', async () => {
    const paths = (await createContent(sourceOf(...world), ON).site.routes()).map(
      ({ path }) => path,
    )
    expect(paths.filter((path) => path.includes('later'))).toEqual([])
    expect(paths.filter((path) => path.startsWith('/questionnaires/soon/'))).toEqual([
      '/questionnaires/soon/',
    ])
    expect(paths).not.toContain('/topics/')
  })
})

describe('site.trail', () => {
  const trail = (path: string, flags: Features = ON) =>
    createContent(sourceOf(...world), flags).site.trail(path)
  const homeCrumb = { label: 'Home', href: '/' }
  const concepts = { label: 'Concepts', href: '/concepts/' }
  const questionnaires = { label: 'Questionnaires', href: '/questionnaires/' }
  const library = { label: 'Library', href: '/library/' }

  it('gives a Concept its primary topic’s trail, with the Concept last', async () => {
    expect(await trail('/concepts/obstacles/')).toEqual([
      homeCrumb,
      concepts,
      { label: 'Mind', href: '/topics/mind/' },
      { label: 'Vighna', href: '/concepts/obstacles/', lang: 'sa-Latn' },
    ])
    expect(await trail('/concepts/refuge/')).toEqual([
      homeCrumb,
      concepts,
      { label: 'Self', href: '/topics/self/' },
      { label: 'Refuge of the self', href: '/concepts/refuge/' },
    ])
  })

  it('gives every other kind of page design B6’s trail', async () => {
    expect(await trail('/')).toEqual([homeCrumb])
    expect(await trail('/concepts/')).toEqual([homeCrumb, concepts])
    expect(await trail('/concepts/map/')).toEqual([
      homeCrumb,
      concepts,
      { label: 'Concept map', href: '/concepts/map/' },
    ])
    expect(await trail('/topics/mind/')).toEqual([
      homeCrumb,
      concepts,
      { label: 'Mind', href: '/topics/mind/' },
    ])
    expect(await trail('/texts/')).toEqual([
      homeCrumb,
      { label: 'Traditional texts', href: '/texts/' },
    ])
    expect(await trail('/texts/dhammapada/')).toEqual([
      homeCrumb,
      { label: 'Traditional texts', href: '/texts/' },
      { label: 'Dhammapada', href: '/texts/dhammapada/', lang: 'pi-Latn' },
    ])
    expect(await trail('/questionnaires/')).toEqual([homeCrumb, questionnaires])
    expect(await trail('/questionnaires/work-scale/')).toEqual([
      homeCrumb,
      questionnaires,
      { label: 'Work Scale', href: '/questionnaires/work-scale/' },
    ])
    expect(await trail('/questionnaires/work-scale/take/')).toEqual([
      homeCrumb,
      questionnaires,
      { label: 'Work Scale', href: '/questionnaires/work-scale/' },
      { label: 'Take it', href: '/questionnaires/work-scale/take/' },
    ])
    expect(await trail('/library/')).toEqual([homeCrumb, library])
    expect(await trail('/library/references/')).toEqual([
      homeCrumb,
      library,
      { label: 'References', href: '/library/references/' },
    ])
    expect(await trail('/library/reading/')).toEqual([
      homeCrumb,
      library,
      { label: 'Reading List', href: '/library/reading/' },
    ])
    expect(await trail('/library/methods/')).toEqual([
      homeCrumb,
      library,
      { label: 'Methods', href: '/library/methods/' },
    ])
    expect(await trail('/search/')).toEqual([homeCrumb, { label: 'Search', href: '/search/' }])
    expect(await trail('/proposals/')).toEqual([
      homeCrumb,
      { label: 'Proposals', href: '/proposals/' },
    ])
  })

  it('ends every route’s trail with the page itself', async () => {
    const content = createContent(sourceOf(...world), ON)
    for (const route of await content.site.routes()) {
      const crumbs = await content.site.trail(route.path)
      expect(crumbs.at(-1)).toMatchObject({ label: route.title, href: route.path })
    }
  })

  it('reads a path without its slash, query or fragment, and gives none for a page that isn’t there', async () => {
    expect(await trail('/concepts/obstacles')).toEqual(await trail('/concepts/obstacles/'))
    expect(await trail('/search/?q=vighna')).toEqual(await trail('/search/'))
    expect(await trail('/concepts/obstacles/#kinds')).toEqual(await trail('/concepts/obstacles/'))
    expect(await trail('/nowhere/')).toEqual([])
    expect(await trail('/topics/')).toEqual([])
    expect(await trail('/concepts/map/', OFF)).toEqual([])
  })
})

describe('site.azIndex', () => {
  const withTerms = [
    defineConcept({
      ...obstacles,
      sections: [
        {
          id: 'kinds',
          heading: 'Kinds',
          blocks: [
            {
              kind: 'term',
              id: 'samsaya',
              term: { iast: 'saṃśaya', devanagari: 'संशय', ascii: ['Sanshay'] },
              gloss: 'Doubt',
              blocks: [],
            },
          ],
        },
      ],
    }),
    defineConcept({
      ...calm,
      sections: [
        {
          id: 'kinds',
          heading: 'Kinds',
          blocks: [{ kind: 'term', id: 'alasya', term: { iast: 'ālasya', ascii: [] }, blocks: [] }],
        },
      ],
    }),
  ]
  const glossary = [
    defineGlossaryEntry({
      kind: 'glossary',
      slug: 'vighna',
      name: { ascii: 'Vighna', devanagari: 'विघ्न' },
      definition: 'A made-up definition.',
      url: 'https://dharmawiki.org/index.php/Vighna',
      concept: 'obstacles',
      provenance,
    }),
    defineGlossaryEntry({
      kind: 'glossary',
      slug: 'avarana',
      name: { ascii: 'Avarana', iast: 'āvaraṇa', devanagari: 'आवरण' },
      definition: 'A made-up covering.',
      url: 'https://dharmawiki.org/index.php/Avarana',
      provenance,
    }),
    defineGlossaryEntry({
      kind: 'glossary',
      slug: 'bhakti',
      name: { ascii: 'Bhakti' },
      provenance,
    }),
  ]
  const records = [
    ...world.filter((record) => record !== obstacles && record !== calm),
    ...withTerms,
    ...glossary,
  ]
  const az = () => createContent(sourceOf(...records), ON).site.azIndex()

  it('gives every letter from A to Z, each with its entries', async () => {
    const letters = await az()
    expect(letters.map(({ letter }) => letter).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    expect(
      Object.fromEntries(
        letters
          .filter(({ entries }) => entries.length > 0)
          .map(({ letter, entries }) => [
            letter,
            entries.map(({ kind, name }) => `${kind} ${name}`),
          ]),
      ),
    ).toEqual({
      A: ['term Ālasya', 'glossary Āvaraṇa'],
      B: ['glossary Bhakti'],
      R: ['concept Refuge of the self'],
      S: ['term Saṃśaya', 'concept Śānti'],
      V: ['concept Vighna'],
    })
  })

  it('merges a glossary entry that names a Concept into that Concept’s entry', async () => {
    const v = (await az()).find(({ letter }) => letter === 'V')
    expect(v?.entries).toEqual([
      {
        kind: 'concept',
        name: 'Vighna',
        lang: 'sa-Latn',
        spellings: ['Vigna'],
        devanagari: 'विघ्न',
        gloss: 'Obstacle',
        definition: 'A made-up definition.',
        href: '/concepts/obstacles/',
        external: false,
        anchors: ['vighna'],
        topics: ['mind'],
        works: ['yoga-sutra'],
      },
    ])
  })

  it('links a term to its anchor, and a glossary entry to its article or to nothing', async () => {
    const letters = await az()
    const entry = (letter: string, name: string) =>
      letters.find((at) => at.letter === letter)?.entries.find((found) => found.name === name)
    expect(entry('S', 'Saṃśaya')).toEqual({
      kind: 'term',
      name: 'Saṃśaya',
      lang: 'sa-Latn',
      spellings: ['samsaya', 'Sanshay'],
      devanagari: 'संशय',
      gloss: 'Doubt',
      href: '/concepts/obstacles/#samsaya',
      external: false,
      anchors: [],
      concept: { slug: 'obstacles', name: 'Vighna', lang: 'sa-Latn', href: '/concepts/obstacles/' },
      topics: ['mind'],
      works: ['yoga-sutra'],
    })
    expect(entry('A', 'Āvaraṇa')).toEqual({
      kind: 'glossary',
      name: 'Āvaraṇa',
      lang: 'sa-Latn',
      spellings: ['Avarana'],
      devanagari: 'आवरण',
      definition: 'A made-up covering.',
      href: 'https://dharmawiki.org/index.php/Avarana',
      external: true,
      anchors: ['avarana'],
      topics: [],
      works: [],
    })
    expect(entry('B', 'Bhakti')).toEqual({
      kind: 'glossary',
      name: 'Bhakti',
      spellings: [],
      external: false,
      anchors: ['bhakti'],
      topics: [],
      works: [],
    })
    expect(entry('R', 'Refuge of the self')).toEqual({
      kind: 'concept',
      name: 'Refuge of the self',
      spellings: [],
      href: '/concepts/refuge/',
      external: false,
      anchors: [],
      topics: ['self', 'mind'],
      works: ['dhammapada'],
    })
  })
})

describe('site.searchDocuments', () => {
  const long = `${'A made-up sentence that runs on. '.repeat(12)}The end.`
  const records = [
    ...world.filter((record) => record !== obstacles && record !== reading),
    defineConcept({
      ...obstacles,
      summary: long,
      sections: [
        {
          id: 'kinds',
          heading: 'Kinds',
          blocks: [
            {
              kind: 'term',
              id: 'samsaya',
              term: { iast: 'saṃśaya', devanagari: 'संशय', ascii: ['Sanshay'] },
              gloss: 'Doubt',
              blocks: [{ kind: 'paragraph', text: 'Made-up text about doubt.' }],
            },
          ],
        },
      ],
    }),
    defineResourceList({
      ...reading,
      groups: [
        {
          id: 'core',
          heading: 'Core',
          items: [
            { type: 'reference', reference: 'rao-2001', annotation: 'A made-up note.' },
            { type: 'course', provider: 'A Made-up University', name: 'A made-up course' },
          ],
        },
      ],
    }),
    defineGlossaryEntry({
      kind: 'glossary',
      slug: 'avarana',
      name: { ascii: 'Avarana', iast: 'āvaraṇa', devanagari: 'आवरण' },
      definition: 'A made-up covering.',
      url: 'https://dharmawiki.org/index.php/Avarana',
      provenance,
    }),
  ]
  const documents = () => createContent(sourceOf(...records), ON).site.searchDocuments()
  const find = async (id: string) => (await documents()).find((document) => document.id === id)

  it('gives one document per Concept, term, glossary entry, work, passage, Reference, library item, Questionnaire, topic and page', async () => {
    const count: Record<string, number> = {}
    for (const { kind } of await documents()) count[kind] = (count[kind] ?? 0) + 1
    expect(count).toEqual({
      concept: 3,
      term: 1,
      glossary: 1,
      work: 2,
      passage: 2,
      reference: 2,
      'library-item': 2,
      questionnaire: 4,
      topic: 2,
      page: 2,
    })
    const ids = (await documents()).map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives a Concept its names, keywords, the authors it cites and an excerpt of at most 300 characters', async () => {
    const concept = await find('concept:obstacles')
    expect(concept).toEqual({
      id: 'concept:obstacles',
      kind: 'concept',
      title: 'Vighna',
      href: '/concepts/obstacles/',
      names: ['vighna', 'विघ्न', 'Vigna'],
      keywords: [
        'Obstacle',
        'focus',
        'distraction',
        'Mind',
        'Yoga Sūtra',
        'Yoga Sutra',
        'YS 1.30',
        'Yoga Sūtra 1.30',
        'Yoga Sutra 1.30',
      ],
      people: ['Tomar', 'Rao', 'Sen'],
      excerpt: expect.any(String),
    })
    expect(concept?.excerpt.length).toBeLessThanOrEqual(300)
    expect(concept?.excerpt.endsWith('…')).toBe(true)
    expect(long.startsWith(concept?.excerpt.slice(0, -1) ?? '')).toBe(true)
  })

  it('gives a term its Concept as its parent', async () => {
    expect(await find('term:obstacles#samsaya')).toEqual({
      id: 'term:obstacles#samsaya',
      kind: 'term',
      title: 'Saṃśaya',
      href: '/concepts/obstacles/#samsaya',
      parent: 'Vighna',
      names: ['saṃśaya', 'संशय', 'samsaya', 'Sanshay'],
      keywords: ['Doubt'],
      people: [],
      excerpt: 'Made-up text about doubt.',
    })
  })

  it('finds a passage by its work and locator, and a work by its names', async () => {
    expect(await find('passage:yoga-sutra/1.30')).toEqual({
      id: 'passage:yoga-sutra/1.30',
      kind: 'passage',
      title: 'Yoga Sūtra 1.30',
      href: '/texts/yoga-sutra/#1-30',
      parent: 'Yoga Sūtra',
      names: [],
      keywords: ['YS 1.30', 'Yoga Sūtra 1.30', 'Yoga Sutra 1.30'],
      people: [],
      excerpt: 'A made-up translation of a made-up verse.',
    })
    expect(await find('work:yoga-sutra')).toEqual({
      id: 'work:yoga-sutra',
      kind: 'work',
      title: 'Yoga Sūtra',
      href: '/texts/yoga-sutra/',
      names: ['Yoga Sūtra', 'योगसूत्र', 'Yoga Sutra'],
      keywords: ['YS'],
      people: [],
      excerpt: '',
    })
  })

  it('finds a Reference by its authors, and a glossary entry by every spelling', async () => {
    expect(await find('reference:rao-2001')).toEqual({
      id: 'reference:rao-2001',
      kind: 'reference',
      title: 'A made-up paper',
      href: '/library/references/#ref-rao-2001',
      names: [],
      keywords: ['Rao & Sen (2001)', 'Journal of Examples'],
      people: ['Rao', 'Sen'],
      excerpt: 'Rao, K., & Sen, M. (2001). A made-up paper.',
    })
    expect(await find('glossary:avarana')).toEqual({
      id: 'glossary:avarana',
      kind: 'glossary',
      title: 'Āvaraṇa',
      href: '/concepts/#avarana',
      names: ['āvaraṇa', 'आवरण', 'Avarana'],
      keywords: [],
      people: [],
      excerpt: 'A made-up covering.',
    })
  })

  it('gives each library item its list as its parent, and Questionnaires, topics and pages their own', async () => {
    expect(await find('library-item:reading/core/1')).toEqual({
      id: 'library-item:reading/core/1',
      kind: 'library-item',
      title: 'A made-up course',
      href: '/library/reading/#core',
      parent: 'Reading List',
      names: [],
      keywords: ['A Made-up University', 'Core'],
      people: [],
      excerpt: '',
    })
    expect(await find('library-item:reading/core/0')).toMatchObject({
      title: 'A made-up paper',
      people: ['Rao', 'Sen'],
      excerpt: 'A made-up note.',
    })
    expect(await find('questionnaire:later')).toEqual({
      id: 'questionnaire:later',
      kind: 'questionnaire',
      title: 'Later Profile',
      href: '/questionnaires/#later',
      names: [],
      keywords: ['Later Profiling', 'Vighna', 'Mind'],
      people: [],
      excerpt: '',
    })
    expect(await find('topic:mind')).toEqual({
      id: 'topic:mind',
      kind: 'topic',
      title: 'Mind',
      href: '/topics/mind/',
      names: ['citta', 'चित्त', 'chitta'],
      keywords: [],
      people: [],
      excerpt: '',
    })
    expect(await find('page:methods')).toMatchObject({
      kind: 'page',
      title: 'Methods',
      href: '/library/methods/',
      excerpt: 'A made-up summary of methods.',
    })
  })
})

describe('site.graph', () => {
  it('gives the Concepts as nodes with their topics, and an edge per shared passage or rare Reference', async () => {
    expect(await createContent(sourceOf(...world), ON).site.graph()).toEqual({
      nodes: [
        {
          slug: 'calm',
          name: 'Śānti',
          lang: 'sa-Latn',
          href: '/concepts/calm/',
          topic: 'mind',
          topics: ['mind'],
        },
        {
          slug: 'obstacles',
          name: 'Vighna',
          lang: 'sa-Latn',
          href: '/concepts/obstacles/',
          topic: 'mind',
          topics: ['mind'],
        },
        {
          slug: 'refuge',
          name: 'Refuge of the self',
          href: '/concepts/refuge/',
          topic: 'self',
          topics: ['self', 'mind'],
        },
      ],
      edges: [
        {
          source: 'calm',
          target: 'obstacles',
          kind: 'passage',
          via: 'yoga-sutra/1.30',
          reason: 'Both quote Yoga Sūtra 1.30',
        },
        {
          source: 'obstacles',
          target: 'refuge',
          kind: 'reference',
          via: 'rao-2001',
          reason: 'Both cite Rao & Sen (2001)',
        },
      ],
    })
  })

  it('joins two Concepts quoting different verses of one work by that work', async () => {
    const ys230 = definePassage({
      ...ys130,
      id: 'yoga-sutra/2.30',
      locator: '2.30',
      order: [2, 30],
    })
    const apart = defineConcept({
      ...calm,
      verses: [{ passage: 'yoga-sutra/2.30' }],
      references: [],
    })
    const records = [...world.filter((record) => record !== calm), ys230, apart]
    const { edges } = await createContent(sourceOf(...records), ON).site.graph()
    expect(edges.filter(({ kind }) => kind === 'work')).toEqual([
      {
        source: 'calm',
        target: 'obstacles',
        kind: 'work',
        via: 'yoga-sutra',
        reason: 'Both quote the Yoga Sūtra',
      },
    ])
  })

  it('makes no edge through a Reference four Concepts cite, or through Tomar (2024)', async () => {
    const popular = defineReference({
      ...rao,
      id: 'popular-2010',
      authors: 'Popular, P.',
      year: '2010',
    })
    const citing = (slug: string, passage: string, references: string[]) =>
      defineConcept({ ...concept, slug, verses: [{ passage }], references })
    const records = [
      ...[mind, yogaSutra, dhammapada, ys130, dp160, tomar, popular],
      citing('one', 'yoga-sutra/1.30', ['tomar-2024', 'popular-2010']),
      citing('two', 'dhammapada/160', ['tomar-2024', 'popular-2010']),
      citing('three', 'yoga-sutra/1.30', ['popular-2010']),
      citing('four', 'dhammapada/160', ['popular-2010']),
    ]
    const { edges } = await createContent(sourceOf(...records), ON).site.graph()
    expect(edges.filter(({ kind }) => kind === 'reference')).toEqual([])
    expect(edges.map(({ via }) => via).sort()).toEqual(['dhammapada/160', 'yoga-sutra/1.30'])
  })
})

/** Every string under a key named `href` anywhere inside a value. */
function hrefsIn(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(hrefsIn)
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, inner]) =>
      key === 'href' && typeof inner === 'string' ? [inner] : hrefsIn(inner),
    )
  return []
}

/** Every internal link the views and derivations of a content interface give. */
async function internalLinks(site: ReturnType<typeof createContent>) {
  const views = [
    ...(await Promise.all((await site.concepts.list()).map(({ slug }) => site.concepts.get(slug)))),
    ...(await Promise.all((await site.topics.list()).map(({ slug }) => site.topics.get(slug)))),
    ...(await Promise.all((await site.works.list()).map(({ slug }) => site.works.get(slug)))),
    ...(await Promise.all(
      (await site.questionnaires.list()).map(({ slug }) => site.questionnaires.get(slug)),
    )),
    ...(await Promise.all((await site.library.list()).map(({ slug }) => site.library.get(slug)))),
    await site.references.list(),
    await site.home.get(),
    await site.site.azIndex(),
    await site.site.searchDocuments(),
    await site.site.graph(),
  ]
  return hrefsIn(views).filter((href) => href.startsWith('/'))
}

describe('the derivations together', () => {
  it('link only to pages in the route registry (made-up content)', async () => {
    const site = createContent(sourceOf(...world), ON)
    const paths = new Set((await site.site.routes()).map(({ path }) => path))
    const outside = (await internalLinks(site)).filter(
      (href) => !paths.has(href.replace(/#.*$/, '')),
    )
    expect(outside).toEqual([])
  })
})

describe('the derivations, on the site’s own content', () => {
  // The batches keep adding records, so these hold for any amount of content.
  const own = createContent(localSource, ON)

  it('list each public page once, at a slashed address, with exactly one sample per kind', async () => {
    const routes = await own.site.routes()
    const paths = routes.map(({ path }) => path)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths.filter((path) => !path.endsWith('/'))).toEqual([])
    const kinds = new Set(routes.map(({ kind }) => kind))
    for (const kind of kinds)
      expect(routes.filter((route) => route.kind === kind && route.sample)).toHaveLength(1)
    for (const { slug } of await own.concepts.list()) expect(paths).toContain(`/concepts/${slug}/`)
    for (const { slug } of await own.topics.list()) expect(paths).toContain(`/topics/${slug}/`)
    for (const { slug } of await own.works.list()) expect(paths).toContain(`/texts/${slug}/`)
  })

  it('end every route’s trail with the page itself', async () => {
    for (const route of await own.site.routes())
      expect((await own.site.trail(route.path)).at(-1)).toMatchObject({
        label: route.title,
        href: route.path,
      })
  })

  it('link only to pages in the route registry', async () => {
    const paths = new Set((await own.site.routes()).map(({ path }) => path))
    const outside = (await internalLinks(own)).filter(
      (href) => !paths.has(href.replace(/#.*$/, '')),
    )
    expect(outside).toEqual([])
  })

  it('give every Concept one A–Z entry and every glossary anchor once', async () => {
    const entries = (await own.site.azIndex()).flatMap(({ entries }) => entries)
    const concepts = entries.filter(({ kind }) => kind === 'concept')
    expect(concepts).toHaveLength((await own.concepts.list()).length)
    const anchors = entries.flatMap(({ anchors }) => anchors)
    expect(new Set(anchors).size).toBe(anchors.length)
  })

  it('give each search document its own id and an excerpt of at most 300 characters', async () => {
    const documents = await content.site.searchDocuments()
    const ids = documents.map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(documents.filter(({ excerpt }) => excerpt.length > 300)).toEqual([])
    expect(documents.filter(({ kind }) => kind === 'concept')).toHaveLength(
      (await content.concepts.list()).length,
    )
  })

  it('make no Concept-map edge through Tomar (2024)', async () => {
    const { nodes, edges } = await content.site.graph()
    expect(nodes).toHaveLength((await content.concepts.list()).length)
    expect(edges.filter(({ via }) => via === 'tomar-2024')).toEqual([])
  })
})
