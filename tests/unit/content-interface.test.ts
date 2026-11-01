import { describe, expect, it } from 'vitest'

import { readFeatures, type Features } from '@/config/features'
import * as ownContent from '@/content'
import { asciiSpellings, displayName, hrefFor } from '@/content'
import { DanglingIdError } from '@/content/graph'
import {
  defineConcept,
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
  type QuestionnaireForm,
  type QuestionnaireRecord,
  type RecordOf,
} from '@/content/schema'
import type { ContentSource } from '@/content/source'
import { createContent } from '@/content/views'

// The content module's public interface (content-v1 spec, "Public interface"), tested at its one
// seam: each test builds a small made-up content source and reads it through the same
// namespaces the pages use. Every record and string here is made up for the test.

const ON: Features = {
  questionnairePreview: true,
  conceptMap: true,
  devanagariFirst: true,
  startHere: true,
}
const OFF: Features = {
  questionnairePreview: false,
  conceptMap: false,
  devanagariFirst: false,
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
  name: { english: 'Mind', term: { iast: 'citta', ascii: ['chitta'] } },
  order: 1,
})

const values = defineTopic({
  kind: 'topic',
  slug: 'values',
  name: { english: 'Values' },
  order: 2,
  intro: {
    sections: [
      {
        id: 'shared-ground',
        heading: 'Shared ground',
        blocks: [{ kind: 'paragraph', text: 'A made-up shared introduction (Rao, 2001).' }],
      },
    ],
    references: ['rao-2001'],
    provenance,
  },
})

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
  devanagari: ['उदाहरणम् प्रथमम्', 'उदाहरणम् द्वितीयम्'],
  transliteration: { lines: ['udāharaṇam prathamam', 'udāharaṇam dvitīyam'], scheme: 'iast' },
  translations: [
    { id: 'obstacles', text: 'A made-up translation, as one page gives it.' },
    { id: 'calm', text: 'Another made-up translation.', source: 'A made-up translator' },
  ],
  provenance,
})

const dp160 = definePassage({
  kind: 'passage',
  id: 'dhammapada/160',
  work: 'dhammapada',
  locator: '160',
  order: [160],
  devanagari: [],
  transliteration: { lines: ['made up line'], scheme: 'informal' },
  translations: [{ id: 'refuge', text: 'A made-up line about refuge.' }],
  provenance,
})

const rao = defineReference({
  kind: 'reference',
  id: 'rao-2001',
  type: 'journal-article',
  authors: 'Rao, K.',
  year: '2001',
  title: 'A made-up paper',
  container: 'Journal of Examples',
  url: 'https://example.org/rao',
  asCited: ['Rao, K. (2001). A made-up paper. Journal of Examples.'],
  provenance,
})

const jainDiwakar = defineReference({
  kind: 'reference',
  id: 'jain-diwakar-2019',
  type: 'journal-article',
  authors: 'Jain, R., & Diwakar, A.',
  year: '2019',
  title: 'A made-up review',
  container: 'Made-up Journal',
  volume: '4',
  issue: '2',
  pages: '1–2',
  doi: '10.0000/made-up',
  asCited: ['Jain, R., & Diwakar, A. (2019). A made-up review.'],
  provenance: { ...provenance, drafted: ['title'] },
})

const samsaya = { iast: 'saṃśaya', devanagari: 'संशय', ascii: ['Sanshay'] }

const concept: ConceptRecord = {
  kind: 'concept',
  slug: 'obstacles',
  name: { term: { iast: 'vighna', devanagari: 'विघ्न', ascii: ['Vigna'] }, english: 'Obstacle' },
  summary: 'A made-up summary.',
  topics: { primary: 'mind' },
  verses: [],
  sections: [],
  references: [],
  reviewStatus: 'carried-over-not-reviewed',
  provenance,
}

describe('concepts.get', () => {
  it('returns null for an unknown slug and a view for a known one', async () => {
    const content = createContent(sourceOf(mind, defineConcept(concept)), ON)
    expect(await content.concepts.get('nothing-here')).toBeNull()
    expect((await content.concepts.get('obstacles'))?.name).toBe('Vighna')
  })

  it('fails on a dangling id, naming the record, the field and the missing id', async () => {
    const broken = defineConcept({ ...concept, references: ['nobody-1999'] })
    const content = createContent(sourceOf(mind, broken), ON)
    await expect(content.concepts.get('obstacles')).rejects.toThrow(DanglingIdError)
    await expect(content.concepts.get('obstacles')).rejects.toThrow(
      'concept “obstacles”, field references[0]: no reference “nobody-1999”',
    )
  })
})

describe('the pure helpers', () => {
  it('builds every path in the site map, with trailing slashes (hrefFor)', () => {
    expect(hrefFor({ kind: 'concept', id: 'vikshepa' })).toBe('/concepts/vikshepa/')
    expect(hrefFor({ kind: 'concept', id: 'vikshepa', anchor: 'samsaya' })).toBe(
      '/concepts/vikshepa/#samsaya',
    )
    expect(hrefFor({ kind: 'topic', id: 'mind' })).toBe('/topics/mind/')
    expect(hrefFor({ kind: 'work', id: 'yoga-sutra' })).toBe('/texts/yoga-sutra/')
    expect(hrefFor({ kind: 'passage', id: 'yoga-sutra/1.30' })).toBe('/texts/yoga-sutra/#1-30')
    expect(hrefFor({ kind: 'passage', id: 'vedanta-sara/5.211' })).toBe(
      '/texts/vedanta-sara/#5-211',
    )
    expect(hrefFor({ kind: 'questionnaire', id: 'karmayoga-scale', status: 'preview' })).toBe(
      '/questionnaires/karmayoga-scale/',
    )
    expect(hrefFor({ kind: 'questionnaire', id: 'live-one', status: 'live' })).toBe(
      '/questionnaires/live-one/',
    )
    expect(
      hrefFor({ kind: 'questionnaire', id: 'karmayoga-scale', status: 'preview', flow: true }),
    ).toBe('/questionnaires/karmayoga-scale/take/')
    expect(hrefFor({ kind: 'questionnaire', id: 'dosha-survey', status: 'coming-later' })).toBe(
      '/questionnaires/#dosha-survey',
    )
    expect(hrefFor({ kind: 'glossary', id: 'anubandha-chatushtaya' })).toBe(
      '/concepts/#anubandha-chatushtaya',
    )
    expect(hrefFor({ kind: 'reference', id: 'tomar-2024' })).toBe(
      '/library/references/#ref-tomar-2024',
    )
    expect(hrefFor({ kind: 'resource-list', id: 'textbooks' })).toBe('/library/textbooks/')
    expect(hrefFor({ kind: 'resource-list', id: 'textbooks', anchor: 'positive-psychology' })).toBe(
      '/library/textbooks/#positive-psychology',
    )
    expect(hrefFor({ kind: 'page', id: 'methods' })).toBe('/library/methods/')
  })

  it('refuses a passage id that isn’t its work and locator (hrefFor)', () => {
    expect(() => hrefFor({ kind: 'passage', id: 'yoga-sutra' })).toThrow('work/locator')
  })

  it('builds the homepage and every fixed page (hrefFor)', () => {
    expect(hrefFor({ page: 'home' })).toBe('/')
    expect(hrefFor({ page: 'concepts' })).toBe('/concepts/')
    expect(hrefFor({ page: 'concept-map' })).toBe('/concepts/map/')
    expect(hrefFor({ page: 'texts' })).toBe('/texts/')
    expect(hrefFor({ page: 'questionnaires' })).toBe('/questionnaires/')
    expect(hrefFor({ page: 'library' })).toBe('/library/')
    expect(hrefFor({ page: 'references' })).toBe('/library/references/')
    expect(hrefFor({ page: 'search' })).toBe('/search/')
    expect(hrefFor({ page: 'proposals' })).toBe('/proposals/')
  })

  it('names a Concept by its capitalised IAST term, else its English title (displayName)', () => {
    const term = { iast: 'pañca kleśa', ascii: ['Panch Klesha'] }
    expect(displayName({ term, english: 'Five afflictions' })).toBe('Pañca kleśa')
    expect(displayName({ term: { iast: 'ātman', ascii: ['Atman'] } })).toBe('Ātman')
    expect(displayName({ english: 'Five steps of perfection' })).toBe('Five steps of perfection')
  })

  it('lists every plain-keyboard spelling, starting with IAST minus diacritics (asciiSpellings)', () => {
    const term = { iast: 'saṃśaya', ascii: ['Sanshay', 'Samsaya'] }
    expect(asciiSpellings(term)).toEqual(['samsaya', 'Sanshay'])
  })
})

describe('a Concept’s verses', () => {
  const quoting = defineConcept({
    ...concept,
    verses: [
      { passage: 'yoga-sutra/1.30', translation: 'calm', meaning: 'The page’s own reading.' },
      { passage: 'dhammapada/160' },
    ],
  })
  const records = [mind, yogaSutra, dhammapada, ys130, dp160, quoting]

  it('resolves each verse with its work, its translation and a link to its passage', async () => {
    const view = await createContent(sourceOf(...records), ON).concepts.get('obstacles')
    expect(view?.verses[0]).toEqual({
      source: 'Yoga Sūtra 1.30',
      verse: '1.30',
      devanagari: ['उदाहरणम् प्रथमम्', 'उदाहरणम् द्वितीयम्'],
      transliteration: ['udāharaṇam prathamam', 'udāharaṇam dvitīyam'],
      transliterationScheme: 'iast',
      translation: 'Another made-up translation.',
      translationSource: 'A made-up translator',
      meaning: 'The page’s own reading.',
      passage: 'yoga-sutra/1.30',
      work: {
        slug: 'yoga-sutra',
        title: 'Yoga Sūtra',
        lang: 'sa-Latn',
        href: '/texts/yoga-sutra/',
      },
      href: '/texts/yoga-sutra/#1-30',
    })
  })

  it('shows no translation where the quote names none, and tags a Pali work as Pali', async () => {
    const view = await createContent(sourceOf(...records), ON).concepts.get('obstacles')
    expect(view?.verses[1]).toEqual({
      source: 'Dhammapada 160',
      verse: '160',
      devanagari: [],
      transliteration: ['made up line'],
      transliterationScheme: 'informal',
      translation: '',
      passage: 'dhammapada/160',
      work: {
        slug: 'dhammapada',
        title: 'Dhammapada',
        lang: 'pi-Latn',
        href: '/texts/dhammapada/',
      },
      href: '/texts/dhammapada/#160',
    })
  })
})

describe('a Concept’s sections', () => {
  const sectioned = defineConcept({
    ...concept,
    sections: [
      {
        id: 'what-it-is',
        heading: 'What it is',
        blocks: [
          { kind: 'paragraph', text: 'A made-up paragraph.' },
          { kind: 'list', style: 'bullet', items: ['One', 'Two'] },
        ],
      },
      {
        id: 'kinds',
        heading: 'Kinds',
        blocks: [
          {
            kind: 'term',
            id: 'samsaya',
            term: samsaya,
            gloss: 'Doubt',
            blocks: [
              { kind: 'paragraph', text: 'Made-up text about doubt.' },
              { kind: 'verse', quote: { passage: 'yoga-sutra/1.30', translation: 'obstacles' } },
            ],
          },
        ],
      },
      {
        id: 'compared',
        heading: 'Compared',
        role: 'comparison',
        blocks: [
          {
            kind: 'table',
            id: 'comparison',
            caption: 'A made-up caption.',
            columns: ['Term', 'Here', 'There'],
            rows: [
              { head: { term: samsaya, gloss: 'Doubt' }, cells: ['Inner', 'Outer'] },
              { head: 'Plain', cells: ['Left', 'Right'] },
              { cells: ['No head', 'At all'] },
            ],
          },
        ],
      },
      { id: 'shared', heading: 'Shared', blocks: [{ kind: 'topic-intro', topic: 'values' }] },
    ],
  })
  const records = [mind, values, rao, yogaSutra, ys130, sectioned]

  it('resolves every block kind, giving each term its anchor', async () => {
    const view = await createContent(sourceOf(...records), ON).concepts.get('obstacles')
    expect(view?.sections.slice(0, 3)).toEqual([
      {
        id: 'what-it-is',
        heading: 'What it is',
        href: '/concepts/obstacles/#what-it-is',
        blocks: [
          { kind: 'paragraph', text: 'A made-up paragraph.' },
          { kind: 'list', style: 'bullet', items: ['One', 'Two'] },
        ],
      },
      {
        id: 'kinds',
        heading: 'Kinds',
        href: '/concepts/obstacles/#kinds',
        blocks: [
          {
            kind: 'term',
            id: 'samsaya',
            href: '/concepts/obstacles/#samsaya',
            name: 'Saṃśaya',
            term: samsaya,
            spellings: ['samsaya', 'Sanshay'],
            gloss: 'Doubt',
            blocks: [
              { kind: 'paragraph', text: 'Made-up text about doubt.' },
              {
                kind: 'verse',
                verse: expect.objectContaining({
                  source: 'Yoga Sūtra 1.30',
                  translation: 'A made-up translation, as one page gives it.',
                  href: '/texts/yoga-sutra/#1-30',
                }),
              },
            ],
          },
        ],
      },
      {
        id: 'compared',
        heading: 'Compared',
        role: 'comparison',
        href: '/concepts/obstacles/#compared',
        blocks: [
          {
            kind: 'table',
            id: 'comparison',
            caption: 'A made-up caption.',
            columns: ['Term', 'Here', 'There'],
            rows: [
              {
                head: { term: samsaya, name: 'Saṃśaya', gloss: 'Doubt' },
                cells: ['Inner', 'Outer'],
              },
              { head: 'Plain', cells: ['Left', 'Right'] },
              { cells: ['No head', 'At all'] },
            ],
          },
        ],
      },
    ])
  })

  it('resolves a topic-intro block to the topic’s introduction, stored once', async () => {
    const view = await createContent(sourceOf(...records), ON).concepts.get('obstacles')
    expect(view?.sections[3]).toEqual({
      id: 'shared',
      heading: 'Shared',
      href: '/concepts/obstacles/#shared',
      blocks: [
        {
          kind: 'topic-intro',
          topic: { slug: 'values', name: 'Values', href: '/topics/values/' },
          sections: [
            {
              id: 'shared-ground',
              heading: 'Shared ground',
              href: '/concepts/obstacles/#shared-ground',
              blocks: [{ kind: 'paragraph', text: 'A made-up shared introduction (Rao, 2001).' }],
            },
          ],
        },
      ],
    })
  })

  it('gives a table of contents: the sections, with the terms inside each', async () => {
    const view = await createContent(sourceOf(...records), ON).concepts.get('obstacles')
    expect(view?.toc).toEqual([
      {
        id: 'what-it-is',
        heading: 'What it is',
        href: '/concepts/obstacles/#what-it-is',
        terms: [],
      },
      {
        id: 'kinds',
        heading: 'Kinds',
        href: '/concepts/obstacles/#kinds',
        terms: [{ id: 'samsaya', name: 'Saṃśaya', href: '/concepts/obstacles/#samsaya' }],
      },
      {
        id: 'compared',
        heading: 'Compared',
        role: 'comparison',
        href: '/concepts/obstacles/#compared',
        terms: [],
      },
      { id: 'shared', heading: 'Shared', href: '/concepts/obstacles/#shared', terms: [] },
    ])
  })
})

describe('a Concept’s References', () => {
  const citing = defineConcept({
    ...concept,
    sections: [
      {
        id: 'what-it-is',
        heading: 'What it is',
        blocks: [
          { kind: 'paragraph', text: 'Made up (Jain & Diwakar, 2019), and (Nobody, 1999).' },
          { kind: 'topic-intro', topic: 'values' },
        ],
      },
    ],
    references: ['jain-diwakar-2019', 'rao-2001'],
  })
  const other = defineConcept({
    ...concept,
    slug: 'calm',
    name: { english: 'Calm' },
    references: ['rao-2001'],
  })
  const records = [mind, values, rao, jainDiwakar, citing, other]

  it('numbers them in the page’s order, each with its anchor and every record citing it', async () => {
    const view = await createContent(sourceOf(...records), ON).concepts.get('obstacles')
    expect(view?.references).toEqual([
      {
        number: 1,
        id: 'jain-diwakar-2019',
        type: 'journal-article',
        authors: 'Jain, R., & Diwakar, A.',
        year: '2019',
        title: 'A made-up review',
        container: 'Made-up Journal',
        volume: '4',
        issue: '2',
        pages: '1–2',
        doi: '10.0000/made-up',
        asCited: ['Jain, R., & Diwakar, A. (2019). A made-up review.'],
        label: 'Jain & Diwakar (2019)',
        anchor: 'ref-jain-diwakar-2019',
        href: '/library/references/#ref-jain-diwakar-2019',
        citedIn: [
          {
            kind: 'concept',
            id: 'obstacles',
            title: 'Vighna',
            lang: 'sa-Latn',
            href: '/concepts/obstacles/',
          },
        ],
        provenance: { ...provenance, drafted: ['title'] },
        reviewStatus: 'drafted-not-reviewed',
      },
      {
        number: 2,
        id: 'rao-2001',
        type: 'journal-article',
        authors: 'Rao, K.',
        year: '2001',
        title: 'A made-up paper',
        container: 'Journal of Examples',
        url: 'https://example.org/rao',
        asCited: ['Rao, K. (2001). A made-up paper. Journal of Examples.'],
        label: 'Rao (2001)',
        anchor: 'ref-rao-2001',
        href: '/library/references/#ref-rao-2001',
        citedIn: [
          {
            kind: 'concept',
            id: 'obstacles',
            title: 'Vighna',
            lang: 'sa-Latn',
            href: '/concepts/obstacles/',
          },
          { kind: 'concept', id: 'calm', title: 'Calm', href: '/concepts/calm/' },
          { kind: 'topic', id: 'values', title: 'Values', href: '/topics/values/' },
        ],
        provenance,
        reviewStatus: 'carried-over-not-reviewed',
      },
    ])
  })

  it('maps each in-text citation it can resolve, the shared introduction’s included, to its Reference', async () => {
    const view = await createContent(sourceOf(...records), ON).concepts.get('obstacles')
    expect(view?.citations).toEqual({
      'Jain & Diwakar, 2019': 'jain-diwakar-2019',
      'Rao, 2001': 'rao-2001',
    })
  })
})

describe('a Concept’s related Concepts (D06)', () => {
  const self = defineTopic({ kind: 'topic', slug: 'self', name: { english: 'Self' }, order: 3 })
  const ys230 = definePassage({
    ...ys130,
    id: 'yoga-sutra/2.30',
    locator: '2.30',
    order: [2, 30],
    translations: [],
  })
  const reference = (id: string, authors: string, year: string) =>
    defineReference({ ...rao, id, authors, year, title: `A made-up work by ${authors}` })
  const tomar = reference('tomar-2024', 'Tomar, V. S.', '2024')
  const popular = reference('popular-2010', 'Popular, P.', '2010')
  const trio = reference('trio-2015', 'Trio, T.', '2015')
  const thapliyal = reference('thapliyal-2023', 'Thapliyal, A., Rawat, B., & Singh, C.', '2023')
  const relating = (
    slug: string,
    name: ConceptRecord['name'],
    topics: ConceptRecord['topics'],
    passage: string,
    references: string[],
  ) => defineConcept({ ...concept, slug, name, topics, verses: [{ passage }], references })
  const obstacles = relating('obstacles', concept.name, { primary: 'mind' }, 'yoga-sutra/1.30', [
    'tomar-2024',
    'jain-diwakar-2019',
    'popular-2010',
    'trio-2015',
  ])
  const calm = relating(
    'calm',
    { term: { iast: 'śānti', ascii: ['Shanti'] } },
    { primary: 'mind' },
    'yoga-sutra/1.30',
    ['tomar-2024', 'jain-diwakar-2019', 'popular-2010'],
  )
  const restraint = relating(
    'restraint',
    { term: { iast: 'ahiṃsā', ascii: ['Ahimsa'] } },
    { primary: 'values' },
    'yoga-sutra/2.30',
    ['popular-2010', 'thapliyal-2023', 'trio-2015'],
  )
  const refuge = relating(
    'refuge',
    { english: 'Refuge of the self' },
    { primary: 'self', also: ['mind'] },
    'dhammapada/160',
    ['popular-2010', 'thapliyal-2023', 'trio-2015'],
  )
  const records = [
    ...[mind, values, self, rao, yogaSutra, dhammapada, ys130, ys230, dp160],
    ...[tomar, jainDiwakar, popular, trio, thapliyal, obstacles, calm, restraint, refuge],
  ]
  const related = async (slug: string) =>
    (await createContent(sourceOf(...records), ON).concepts.get(slug))?.linked.related.map(
      ({ slug, reasons }) => ({ slug, reasons }),
    )

  it('relates Concepts by a shared passage, work, rarely cited Reference or topic, with reasons', async () => {
    expect(await related('obstacles')).toEqual([
      {
        slug: 'calm',
        reasons: [
          { kind: 'passage', text: 'Both quote Yoga Sūtra 1.30' },
          { kind: 'reference', text: 'Both cite Jain & Diwakar (2019)' },
          { kind: 'topic', text: 'Both are in the topic “Mind”' },
        ],
      },
      {
        slug: 'restraint',
        reasons: [
          { kind: 'work', text: 'Both quote the Yoga Sūtra' },
          { kind: 'reference', text: 'Both cite Trio (2015)' },
        ],
      },
      {
        slug: 'refuge',
        reasons: [
          { kind: 'reference', text: 'Both cite Trio (2015)' },
          { kind: 'topic', text: 'Both are in the topic “Mind”' },
        ],
      },
    ])
  })

  it('never relates through a Reference four Concepts cite, or through Tomar (2024)', async () => {
    expect(await related('refuge')).toEqual([
      {
        slug: 'restraint',
        reasons: [
          { kind: 'reference', text: 'Both cite Thapliyal et al. (2023)' },
          { kind: 'reference', text: 'Both cite Trio (2015)' },
        ],
      },
      {
        slug: 'obstacles',
        reasons: [
          { kind: 'reference', text: 'Both cite Trio (2015)' },
          { kind: 'topic', text: 'Both are in the topic “Mind”' },
        ],
      },
      { slug: 'calm', reasons: [{ kind: 'topic', text: 'Both are in the topic “Mind”' }] },
    ])
  })
})

describe('the rest of a Concept’s page', () => {
  const self = defineTopic({ kind: 'topic', slug: 'self', name: { english: 'Self' }, order: 3 })
  const ys230 = definePassage({ ...ys130, id: 'yoga-sutra/2.30', locator: '2.30', order: [2, 30] })
  const obstacles = defineConcept({
    ...concept,
    topics: { primary: 'mind', also: ['self'] },
    verses: [{ passage: 'dhammapada/160' }, { passage: 'yoga-sutra/2.30' }],
    sections: [
      {
        id: 'in-life',
        heading: 'In life',
        role: 'applications',
        blocks: [{ kind: 'verse', quote: { passage: 'yoga-sutra/1.30' } }],
      },
      { id: 'compared', heading: 'Compared', role: 'comparison', blocks: [] },
      { id: 'plain', heading: 'Plain', blocks: [] },
    ],
    questionnaire: 'obstacles',
    external: [{ label: 'DharmaWiki', url: 'https://dharmawiki.org/index.php/Example' }],
    reviewStatus: 'drafted-not-reviewed',
    provenance: { ...provenance, drafted: ['summary'] },
  })
  const calm = defineConcept({
    ...concept,
    slug: 'calm',
    name: { term: { iast: 'śānti', ascii: ['Shanti'] } },
  })
  const first = defineConcept({
    ...concept,
    slug: 'first',
    name: { term: { iast: 'ālasya', ascii: ['Alasya'] }, english: 'Laziness' },
  })
  const elsewhere = defineConcept({
    ...concept,
    slug: 'elsewhere',
    name: { english: 'Also in mind' },
    topics: { primary: 'self', also: ['mind'] },
  })
  const ownQuestionnaire = defineQuestionnaire({
    kind: 'questionnaire',
    slug: 'obstacles',
    title: 'Obstacles Profile',
    sourceTitle: 'Obstacles Profiling',
    status: 'coming-later',
    concepts: ['obstacles'],
    scoring: { status: 'pending', reason: 'No documented scoring rules yet.' },
    heldBack: [],
    reviewStatus: 'carried-over-not-reviewed',
    provenance,
  })
  const preview = defineQuestionnaire({
    ...ownQuestionnaire,
    slug: 'work-scale',
    title: 'Work Scale',
    sourceTitle: 'Work Scale',
    status: 'preview',
    summary: 'A made-up summary of a scale.',
    concepts: ['calm', 'obstacles'],
  })
  const records = [
    ...[mind, self, yogaSutra, dhammapada, ys130, ys230, dp160],
    ...[obstacles, calm, first, elsewhere, ownQuestionnaire, preview],
  ]
  const view = () => createContent(sourceOf(...records), ON).concepts.get('obstacles')

  it('links the works it quotes, each with its passages in order', async () => {
    expect((await view())?.linked.works).toEqual([
      {
        slug: 'dhammapada',
        title: 'Dhammapada',
        lang: 'pi-Latn',
        href: '/texts/dhammapada/',
        passages: [
          {
            id: 'dhammapada/160',
            locator: '160',
            label: 'Dhammapada 160',
            href: '/texts/dhammapada/#160',
          },
        ],
      },
      {
        slug: 'yoga-sutra',
        title: 'Yoga Sūtra',
        lang: 'sa-Latn',
        href: '/texts/yoga-sutra/',
        passages: [
          {
            id: 'yoga-sutra/1.30',
            locator: '1.30',
            label: 'Yoga Sūtra 1.30',
            href: '/texts/yoga-sutra/#1-30',
          },
          {
            id: 'yoga-sutra/2.30',
            locator: '2.30',
            label: 'Yoga Sūtra 2.30',
            href: '/texts/yoga-sutra/#2-30',
          },
        ],
      },
    ])
  })

  it('links its own Questionnaire first, then every other that lists it', async () => {
    expect((await view())?.linked.questionnaires).toEqual([
      {
        slug: 'obstacles',
        title: 'Obstacles Profile',
        sourceTitle: 'Obstacles Profiling',
        status: 'coming-later',
        anchor: 'obstacles',
        href: '/questionnaires/#obstacles',
        concepts: [
          { slug: 'obstacles', name: 'Vighna', lang: 'sa-Latn', href: '/concepts/obstacles/' },
        ],
        topics: [{ slug: 'mind', name: 'Mind', href: '/topics/mind/' }],
      },
      {
        slug: 'work-scale',
        title: 'Work Scale',
        sourceTitle: 'Work Scale',
        status: 'preview',
        summary: 'A made-up summary of a scale.',
        anchor: 'work-scale',
        href: '/questionnaires/work-scale/',
        concepts: [
          { slug: 'calm', name: 'Śānti', lang: 'sa-Latn', href: '/concepts/calm/' },
          { slug: 'obstacles', name: 'Vighna', lang: 'sa-Latn', href: '/concepts/obstacles/' },
        ],
        topics: [{ slug: 'mind', name: 'Mind', href: '/topics/mind/' }],
      },
    ])
  })

  it('links its applications and comparison sections', async () => {
    expect((await view())?.linked.sections).toEqual([
      {
        id: 'in-life',
        heading: 'In life',
        role: 'applications',
        href: '/concepts/obstacles/#in-life',
      },
      {
        id: 'compared',
        heading: 'Compared',
        role: 'comparison',
        href: '/concepts/obstacles/#compared',
      },
    ])
  })

  it('gives previous and next within its primary topic, in alphabetical order', async () => {
    const content = createContent(sourceOf(...records), ON)
    const around = async (slug: string) => {
      const found = await content.concepts.get(slug)
      return [found?.previous?.slug, found?.next?.slug]
    }
    expect(await around('first')).toEqual([undefined, 'calm'])
    expect(await around('calm')).toEqual(['first', 'obstacles'])
    expect(await around('obstacles')).toEqual(['calm', undefined])
    expect((await content.concepts.get('calm'))?.next).toEqual({
      slug: 'obstacles',
      name: 'Vighna',
      lang: 'sa-Latn',
      href: '/concepts/obstacles/',
    })
  })

  it('carries its names, topics, external links, provenance and review status', async () => {
    const found = await view()
    expect(found).toMatchObject({
      slug: 'obstacles',
      name: 'Vighna',
      lang: 'sa-Latn',
      href: '/concepts/obstacles/',
      term: { iast: 'vighna', devanagari: 'विघ्न', ascii: ['Vigna'] },
      english: 'Obstacle',
      spellings: ['Vigna'],
      summary: 'A made-up summary.',
      topic: { slug: 'mind', name: 'Mind', href: '/topics/mind/' },
      secondaryTopics: [{ slug: 'self', name: 'Self', href: '/topics/self/' }],
      external: [{ label: 'DharmaWiki', url: 'https://dharmawiki.org/index.php/Example' }],
      provenance: { ...provenance, drafted: ['summary'] },
      reviewStatus: 'drafted-not-reviewed',
    })
  })
})

describe('concepts.list', () => {
  const self = defineTopic({ kind: 'topic', slug: 'self', name: { english: 'Self' }, order: 3 })
  const records = [
    ...[mind, self, values, rao, yogaSutra, dhammapada, ys130, dp160],
    defineConcept({
      ...concept,
      verses: [{ passage: 'yoga-sutra/1.30' }],
      references: ['rao-2001'],
    }),
    defineConcept({
      ...concept,
      slug: 'calm',
      name: { term: { iast: 'śānti', ascii: ['Shanti'] } },
      topics: { primary: 'self', also: ['mind'] },
      verses: [{ passage: 'dhammapada/160' }],
    }),
    defineConcept({
      ...concept,
      slug: 'restraint',
      name: { term: { iast: 'ahiṃsā', ascii: ['Ahimsa'] } },
      topics: { primary: 'values' },
      verses: [{ passage: 'yoga-sutra/1.30' }],
      references: ['rao-2001'],
    }),
  ]
  const slugs = async (q?: Parameters<ReturnType<typeof createContent>['concepts']['list']>[0]) =>
    (await createContent(sourceOf(...records), ON).concepts.list(q)).map(({ slug }) => slug)

  it('lists every Concept as a card, by name with diacritics ignored', async () => {
    expect(await slugs()).toEqual(['restraint', 'calm', 'obstacles'])
    const [first] = await createContent(sourceOf(...records), ON).concepts.list()
    expect(first).toEqual({
      slug: 'restraint',
      name: 'Ahiṃsā',
      lang: 'sa-Latn',
      href: '/concepts/restraint/',
      term: { iast: 'ahiṃsā', ascii: ['Ahimsa'] },
      summary: 'A made-up summary.',
      topic: { slug: 'values', name: 'Values', href: '/topics/values/' },
    })
  })

  it('filters by topic (primary or not), by work quoted and by Reference cited', async () => {
    expect(await slugs({ topic: 'mind' })).toEqual(['calm', 'obstacles'])
    expect(await slugs({ topic: 'values' })).toEqual(['restraint'])
    expect(await slugs({ work: 'dhammapada' })).toEqual(['calm'])
    expect(await slugs({ work: 'yoga-sutra' })).toEqual(['restraint', 'obstacles'])
    expect(await slugs({ reference: 'rao-2001' })).toEqual(['restraint', 'obstacles'])
    expect(await slugs({ topic: 'mind', reference: 'rao-2001' })).toEqual(['obstacles'])
    expect(await slugs({ topic: 'nowhere' })).toEqual([])
  })
})

describe('topics', () => {
  const self = defineTopic({ kind: 'topic', slug: 'self', name: { english: 'Self' }, order: 3 })
  const records = [
    ...[mind, values, self, rao, yogaSutra, dhammapada, ys130, dp160],
    defineConcept({
      ...concept,
      verses: [{ passage: 'yoga-sutra/1.30', translation: 'obstacles' }],
    }),
    defineConcept({
      ...concept,
      slug: 'calm',
      name: { term: { iast: 'śānti', ascii: ['Shanti'] } },
      verses: [{ passage: 'dhammapada/160' }, { passage: 'yoga-sutra/1.30', translation: 'calm' }],
    }),
    defineConcept({
      ...concept,
      slug: 'refuge',
      name: { english: 'Refuge of the self' },
      topics: { primary: 'self', also: ['mind'] },
    }),
    defineConcept({
      ...concept,
      slug: 'restraint',
      name: { term: { iast: 'ahiṃsā', ascii: ['Ahimsa'] } },
      topics: { primary: 'values' },
      references: ['rao-2001'],
    }),
  ]
  const content = () => createContent(sourceOf(...records), ON)

  it('returns null for an unknown topic and lists every topic in its order, with counts', async () => {
    expect(await content().topics.get('nowhere')).toBeNull()
    expect(await content().topics.list()).toEqual([
      {
        slug: 'mind',
        name: 'Mind',
        href: '/topics/mind/',
        term: { iast: 'citta', ascii: ['chitta'] },
        order: 1,
        conceptCount: 2,
      },
      { slug: 'values', name: 'Values', href: '/topics/values/', order: 2, conceptCount: 1 },
      { slug: 'self', name: 'Self', href: '/topics/self/', order: 3, conceptCount: 1 },
    ])
  })

  it('gives a topic its Concepts, then those also in it, and the verses its Concepts quote', async () => {
    const view = await content().topics.get('mind')
    expect(view?.concepts.map(({ slug }) => slug)).toEqual(['calm', 'obstacles'])
    expect(view?.secondaryConcepts.map(({ slug }) => slug)).toEqual(['refuge'])
    expect(view?.works).toEqual([
      { slug: 'dhammapada', title: 'Dhammapada', lang: 'pi-Latn', href: '/texts/dhammapada/' },
      { slug: 'yoga-sutra', title: 'Yoga Sūtra', lang: 'sa-Latn', href: '/texts/yoga-sutra/' },
    ])
    expect(view?.verses.map(({ id }) => id)).toEqual(['dhammapada/160', 'yoga-sutra/1.30'])
    expect(view?.verses[1]).toEqual({
      id: 'yoga-sutra/1.30',
      work: {
        slug: 'yoga-sutra',
        title: 'Yoga Sūtra',
        lang: 'sa-Latn',
        href: '/texts/yoga-sutra/',
      },
      locator: '1.30',
      label: 'Yoga Sūtra 1.30',
      anchor: '1-30',
      href: '/texts/yoga-sutra/#1-30',
      devanagari: ['उदाहरणम् प्रथमम्', 'उदाहरणम् द्वितीयम्'],
      transliteration: {
        lines: ['udāharaṇam prathamam', 'udāharaṇam dvitīyam'],
        scheme: 'iast',
      },
      translations: [
        {
          id: 'obstacles',
          text: 'A made-up translation, as one page gives it.',
          quotedIn: [
            {
              kind: 'concept',
              id: 'obstacles',
              title: 'Vighna',
              lang: 'sa-Latn',
              href: '/concepts/obstacles/',
            },
          ],
        },
        {
          id: 'calm',
          text: 'Another made-up translation.',
          source: 'A made-up translator',
          quotedIn: [
            {
              kind: 'concept',
              id: 'calm',
              title: 'Śānti',
              lang: 'sa-Latn',
              href: '/concepts/calm/',
            },
          ],
        },
      ],
      quotedIn: [
        {
          kind: 'concept',
          id: 'obstacles',
          title: 'Vighna',
          lang: 'sa-Latn',
          href: '/concepts/obstacles/',
        },
        { kind: 'concept', id: 'calm', title: 'Śānti', lang: 'sa-Latn', href: '/concepts/calm/' },
      ],
      provenance,
      reviewStatus: 'carried-over-not-reviewed',
    })
    expect(view).not.toHaveProperty('intro')
  })

  it('gives the values topic its shared introduction, stored once, with its own References', async () => {
    const view = await content().topics.get('values')
    expect(view?.intro).toEqual({
      sections: [
        {
          id: 'shared-ground',
          heading: 'Shared ground',
          href: '/topics/values/#shared-ground',
          blocks: [{ kind: 'paragraph', text: 'A made-up shared introduction (Rao, 2001).' }],
        },
      ],
      toc: [
        {
          id: 'shared-ground',
          heading: 'Shared ground',
          href: '/topics/values/#shared-ground',
          terms: [],
        },
      ],
      references: [expect.objectContaining({ number: 1, id: 'rao-2001', anchor: 'ref-rao-2001' })],
      citations: { 'Rao, 2001': 'rao-2001' },
      provenance,
      reviewStatus: 'carried-over-not-reviewed',
    })
  })
})

describe('works', () => {
  const ys12 = definePassage({
    ...ys130,
    id: 'yoga-sutra/1.2',
    locator: '1.2',
    order: [1, 2],
    devanagari: [],
    translations: [],
  })
  const attributed = defineWork({
    ...yogaSutra,
    title: { ...yogaSutra.title, english: 'Threads of yoga' },
    attribution: 'A made-up sage',
    editions: ['A made-up edition'],
  })
  const records = [
    ...[mind, attributed, dhammapada, ys130, ys12, dp160],
    defineConcept({
      ...concept,
      verses: [{ passage: 'yoga-sutra/1.30', translation: 'obstacles' }],
    }),
  ]
  const content = () => createContent(sourceOf(...records), ON)

  it('lists every work by title, each with how many of its verses the site quotes', async () => {
    expect(await content().works.list()).toEqual([
      {
        slug: 'dhammapada',
        title: 'Dhammapada',
        lang: 'pi-Latn',
        href: '/texts/dhammapada/',
        term: { iast: 'Dhammapada', ascii: ['Dhammapada'] },
        language: 'pi',
        passageCount: 1,
      },
      {
        slug: 'yoga-sutra',
        title: 'Yoga Sūtra',
        lang: 'sa-Latn',
        href: '/texts/yoga-sutra/',
        term: { iast: 'Yoga Sūtra', devanagari: 'योगसूत्र', ascii: ['Yoga Sutra'] },
        english: 'Threads of yoga',
        attribution: 'A made-up sage',
        language: 'sa',
        passageCount: 2,
      },
    ])
  })

  it('gives a work its passages in order, and null for an unknown one', async () => {
    expect(await content().works.get('nothing-here')).toBeNull()
    const view = await content().works.get('yoga-sutra')
    expect(view).toMatchObject({
      slug: 'yoga-sutra',
      title: 'Yoga Sūtra',
      language: 'sa',
      locatorLabel: 'Sutra',
      editions: ['A made-up edition'],
      provenance,
      reviewStatus: 'carried-over-not-reviewed',
    })
    expect(view?.passages.map(({ id, quotedIn }) => [id, quotedIn.map((ref) => ref.id)])).toEqual([
      ['yoga-sutra/1.2', []],
      ['yoga-sutra/1.30', ['obstacles']],
    ])
  })
})

describe('references.list', () => {
  const tomar = defineReference({
    ...rao,
    id: 'tomar-2024',
    type: 'book',
    authors: 'Tomar, V. S.',
    year: '2024',
    title: 'A made-up handbook',
  })
  const site = defineReference({
    kind: 'reference',
    id: 'shared-verses',
    type: 'web-page',
    year: 'n.d.',
    title: 'Āshared verses online',
    url: 'https://example.org/verses',
    asCited: [],
    provenance,
  })
  const records = [
    ...[mind, rao, jainDiwakar, tomar, site],
    defineConcept({ ...concept, references: ['tomar-2024', 'rao-2001'] }),
  ]
  const ids = async (q?: Parameters<ReturnType<typeof createContent>['references']['list']>[0]) =>
    (await createContent(sourceOf(...records), ON).references.list(q)).map(({ id }) => id)

  it('lists every Reference once, by author or title with diacritics ignored', async () => {
    expect(await ids()).toEqual(['shared-verses', 'jain-diwakar-2019', 'rao-2001', 'tomar-2024'])
  })

  it('filters by type and by the Concept citing them', async () => {
    expect(await ids({ type: 'book' })).toEqual(['tomar-2024'])
    expect(await ids({ type: 'journal-article' })).toEqual(['jain-diwakar-2019', 'rao-2001'])
    expect(await ids({ citedBy: 'obstacles' })).toEqual(['rao-2001', 'tomar-2024'])
    expect(await ids({ type: 'book', citedBy: 'obstacles' })).toEqual(['tomar-2024'])
    expect(await ids({ citedBy: 'nothing-here' })).toEqual([])
  })
})

describe('questionnaires', () => {
  const form: QuestionnaireForm = {
    responseSets: {
      frequency: ['Always', 'Often', 'Never'],
      agreement: ['Disagree', 'Neutral', 'Agree'],
    },
    parts: [
      {
        id: 'everyday',
        title: 'Everyday',
        instructions: 'Made-up instructions for the first part.',
        items: [{ id: '1', text: 'A made-up statement.', responseSet: 'frequency' }],
      },
      {
        id: 'at-work',
        title: 'At work',
        instructions: 'Made-up instructions for the second part.',
        items: [
          { id: '2', text: 'Another made-up statement.', responseSet: 'agreement' },
          {
            id: '3',
            text: 'A statement whose options the source lists the other way round.',
            responseSet: 'agreement',
            reversed: true,
          },
        ],
      },
    ],
  }
  const base: QuestionnaireRecord = {
    kind: 'questionnaire',
    slug: 'base',
    title: 'Base',
    sourceTitle: 'Base',
    status: 'coming-later',
    concepts: ['obstacles'],
    scoring: { status: 'pending', reason: 'No documented scoring rules yet.' },
    heldBack: [{ what: 'three made-up result bands', where: 'the quiz settings' }],
    reviewStatus: 'carried-over-not-reviewed',
    provenance,
  }
  const preview = defineQuestionnaire({
    ...base,
    slug: 'work-scale',
    title: 'Work Scale',
    sourceTitle: 'Work Scale Page',
    status: 'preview',
    summary: 'A made-up summary.',
    purpose: ['A made-up purpose.'],
    format: ['A made-up format.'],
    source: 'rao-2001',
    candidateSource: 'jain-diwakar-2019',
    limitations: { items: ['A made-up limitation.'], status: 'draft-pending-psychology-expert' },
    form,
    rights: { status: 'permission-needed', holder: 'Made-up authors', note: 'A made-up note.' },
    reviewStatus: 'drafted-not-reviewed',
    provenance: { ...provenance, drafted: ['summary'] },
  })
  const live = defineQuestionnaire({
    ...base,
    slug: 'live-one',
    title: 'Live One',
    status: 'live',
    form,
  })
  const soon = defineQuestionnaire({
    ...base,
    slug: 'soon',
    title: 'Soon',
    status: 'coming-soon',
    form,
  })
  const later = defineQuestionnaire({ ...base, slug: 'later', title: 'Alpha Later', form })
  const bare = defineQuestionnaire({ ...base, slug: 'bare', title: 'Bare', status: 'live' })
  const records = [
    ...[mind, rao, jainDiwakar, defineConcept(concept)],
    ...[later, bare, soon, live, preview],
  ]
  const content = (flags: Features) => createContent(sourceOf(...records), flags)

  it('gives a Questionnaire’s page, with nothing held back and no scoring', async () => {
    expect(await content(ON).questionnaires.get('nothing-here')).toBeNull()
    const view = await content(ON).questionnaires.get('work-scale')
    expect(view).toEqual({
      slug: 'work-scale',
      title: 'Work Scale',
      sourceTitle: 'Work Scale Page',
      status: 'preview',
      summary: 'A made-up summary.',
      anchor: 'work-scale',
      href: '/questionnaires/work-scale/',
      concepts: [
        { slug: 'obstacles', name: 'Vighna', lang: 'sa-Latn', href: '/concepts/obstacles/' },
      ],
      topics: [{ slug: 'mind', name: 'Mind', href: '/topics/mind/' }],
      purpose: ['A made-up purpose.'],
      format: ['A made-up format.'],
      limitations: { items: ['A made-up limitation.'], status: 'draft-pending-psychology-expert' },
      source: expect.objectContaining({ id: 'rao-2001', label: 'Rao (2001)' }),
      candidateSource: expect.objectContaining({ id: 'jain-diwakar-2019' }),
      provenance: { ...provenance, drafted: ['summary'] },
      reviewStatus: 'drafted-not-reviewed',
    })
    expect(JSON.stringify(view)).not.toMatch(/held|scor|band|rights/i)
  })

  it('lists every Questionnaire, those that can be taken first', async () => {
    expect((await content(ON).questionnaires.list()).map(({ slug }) => slug)).toEqual([
      'bare',
      'live-one',
      'work-scale',
      'soon',
      'later',
    ])
  })

  it('gives the form, parts and options in the source’s order, nothing about scoring', async () => {
    expect(await content(ON).questionnaires.form('work-scale')).toEqual({
      slug: 'work-scale',
      title: 'Work Scale',
      parts: [
        {
          id: 'everyday',
          title: 'Everyday',
          instructions: 'Made-up instructions for the first part.',
          items: [{ id: '1', text: 'A made-up statement.', options: ['Always', 'Often', 'Never'] }],
        },
        {
          id: 'at-work',
          title: 'At work',
          instructions: 'Made-up instructions for the second part.',
          items: [
            {
              id: '2',
              text: 'Another made-up statement.',
              options: ['Disagree', 'Neutral', 'Agree'],
            },
            {
              id: '3',
              text: 'A statement whose options the source lists the other way round.',
              options: ['Agree', 'Neutral', 'Disagree'],
            },
          ],
        },
      ],
    })
  })

  it('gives a preview’s form only while questionnairePreview is on, and a live one’s always', async () => {
    expect(await content(OFF).questionnaires.form('work-scale')).toBeNull()
    expect(
      await content({ ...OFF, questionnairePreview: true }).questionnaires.form('work-scale'),
    ).not.toBeNull()
    expect(await content(OFF).questionnaires.form('live-one')).not.toBeNull()
  })

  it('never gives a form for one coming soon or later, one without a form, or an unknown one', async () => {
    expect(await content(ON).questionnaires.form('soon')).toBeNull()
    expect(await content(ON).questionnaires.form('later')).toBeNull()
    expect(await content(ON).questionnaires.form('bare')).toBeNull()
    expect(await content(ON).questionnaires.form('nothing-here')).toBeNull()
  })
})

describe('the Library', () => {
  const reading = defineResourceList({
    kind: 'resource-list',
    slug: 'reading',
    title: 'Reading List',
    groups: [
      {
        id: 'core',
        heading: 'Core books',
        items: [
          { type: 'reference', reference: 'rao-2001', annotation: 'A made-up note.' },
          {
            type: 'course',
            provider: 'A Made-up University',
            name: 'A made-up course',
            description: 'Weekly, made up.',
            url: 'https://example.edu/course',
          },
        ],
      },
      {
        id: 'more',
        heading: 'More',
        items: [{ type: 'reference', reference: 'jain-diwakar-2019' }],
      },
    ],
    provenance,
  })
  const methods = definePage({
    kind: 'page',
    slug: 'methods',
    title: 'Methods',
    summary: 'A made-up summary of methods.',
    sections: [
      {
        id: 'two-ways',
        heading: 'Two ways',
        blocks: [{ kind: 'table', id: 'ways', caption: 'Made up.', columns: ['A'], rows: [] }],
      },
    ],
    provenance,
  })
  const content = () => createContent(sourceOf(rao, jainDiwakar, reading, methods), ON)

  it('lists its reading lists, then its pages', async () => {
    expect(await content().library.list()).toEqual([
      {
        kind: 'resource-list',
        slug: 'reading',
        title: 'Reading List',
        href: '/library/reading/',
        itemCount: 3,
      },
      {
        kind: 'page',
        slug: 'methods',
        title: 'Methods',
        href: '/library/methods/',
        summary: 'A made-up summary of methods.',
      },
    ])
  })

  it('gives a reading list with every book resolved to its Reference', async () => {
    expect(await content().library.get('nothing-here')).toBeNull()
    expect(await content().library.get('reading')).toEqual({
      kind: 'resource-list',
      slug: 'reading',
      title: 'Reading List',
      href: '/library/reading/',
      groups: [
        {
          id: 'core',
          heading: 'Core books',
          href: '/library/reading/#core',
          items: [
            {
              type: 'reference',
              reference: expect.objectContaining({
                id: 'rao-2001',
                href: '/library/references/#ref-rao-2001',
              }),
              annotation: 'A made-up note.',
            },
            {
              type: 'course',
              provider: 'A Made-up University',
              name: 'A made-up course',
              description: 'Weekly, made up.',
              url: 'https://example.edu/course',
            },
          ],
        },
        {
          id: 'more',
          heading: 'More',
          href: '/library/reading/#more',
          items: [
            { type: 'reference', reference: expect.objectContaining({ id: 'jain-diwakar-2019' }) },
          ],
        },
      ],
      provenance,
      reviewStatus: 'carried-over-not-reviewed',
    })
  })

  it('gives a page with its sections and table of contents', async () => {
    expect(await content().library.get('methods')).toEqual({
      kind: 'page',
      slug: 'methods',
      title: 'Methods',
      summary: 'A made-up summary of methods.',
      href: '/library/methods/',
      sections: [
        {
          id: 'two-ways',
          heading: 'Two ways',
          href: '/library/methods/#two-ways',
          blocks: [{ kind: 'table', id: 'ways', caption: 'Made up.', columns: ['A'], rows: [] }],
        },
      ],
      toc: [{ id: 'two-ways', heading: 'Two ways', href: '/library/methods/#two-ways', terms: [] }],
      provenance,
      reviewStatus: 'carried-over-not-reviewed',
    })
  })
})

describe('the homepage', () => {
  const later = defineQuestionnaire({
    kind: 'questionnaire',
    slug: 'later',
    title: 'Later',
    sourceTitle: 'Later',
    status: 'coming-later',
    concepts: [],
    scoring: { status: 'pending', reason: 'No documented scoring rules yet.' },
    heldBack: [],
    reviewStatus: 'carried-over-not-reviewed',
    provenance,
  })
  const methods = definePage({
    kind: 'page',
    slug: 'methods',
    title: 'Methods',
    summary: 'Made up.',
    sections: [{ id: 'two-ways', heading: 'Two ways', blocks: [] }],
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
    shloka: { devanagari: 'उदाहरणम्', iast: 'udāharaṇam', translation: 'A made-up line.' },
    intro: 'A made-up introduction.',
    areas: [
      { title: 'Concepts', text: 'Made-up text.', target: { index: 'concepts' } },
      {
        title: 'Methods',
        text: 'Made-up text.',
        target: { kind: 'page', id: 'methods', anchor: 'two-ways' },
      },
      { title: 'Later', text: 'Made-up text.', target: { kind: 'questionnaire', id: 'later' } },
      { title: 'Nowhere', text: 'Made-up text.' },
    ],
    closing: 'A made-up closing.',
    helpLine: 'A made-up help line.',
    provenance,
  })

  it('turns every area’s target into a path, and leaves an area without one unlinked', async () => {
    expect(await createContent(sourceOf(later, methods, home), ON).home.get()).toEqual({
      tagline: 'A made-up tagline.',
      hero: {
        promise: 'Made up.',
        subhead: 'Made up.',
        startHere: 'Start',
        browseConcepts: 'Browse',
        exploreConcepts: 'Explore',
      },
      sectionIntros: { concepts: 'Made up.', questionnaires: 'Made up.' },
      shloka: { devanagari: 'उदाहरणम्', iast: 'udāharaṇam', translation: 'A made-up line.' },
      intro: 'A made-up introduction.',
      areas: [
        { title: 'Concepts', text: 'Made-up text.', href: '/concepts/' },
        { title: 'Methods', text: 'Made-up text.', href: '/library/methods/#two-ways' },
        { title: 'Later', text: 'Made-up text.', href: '/questionnaires/#later' },
        { title: 'Nowhere', text: 'Made-up text.' },
      ],
      closing: 'A made-up closing.',
      helpLine: 'A made-up help line.',
      provenance,
      reviewStatus: 'carried-over-not-reviewed',
    })
  })

  it('fails, naming what is missing, when there is no homepage record', async () => {
    await expect(createContent(sourceOf(methods), ON).home.get()).rejects.toThrow('homepage')
  })
})

/** Every view and card a content interface gives for the records it holds. */
async function everyView(content: Pick<ReturnType<typeof createContent>, ViewNamespace>) {
  const concepts = await content.concepts.list()
  const topics = await content.topics.list()
  const works = await content.works.list()
  const questionnaires = await content.questionnaires.list()
  const library = await content.library.list()
  return [
    ...[concepts, topics, works, questionnaires, library],
    await content.references.list(),
    await content.home.get(),
    ...(await Promise.all(concepts.map(({ slug }) => content.concepts.get(slug)))),
    ...(await Promise.all(topics.map(({ slug }) => content.topics.get(slug)))),
    ...(await Promise.all(works.map(({ slug }) => content.works.get(slug)))),
    ...(await Promise.all(questionnaires.map(({ slug }) => content.questionnaires.get(slug)))),
    ...(await Promise.all(questionnaires.map(({ slug }) => content.questionnaires.form(slug)))),
    ...(await Promise.all(library.map(({ slug }) => content.library.get(slug)))),
  ]
}

type ViewNamespace =
  'concepts' | 'topics' | 'works' | 'references' | 'questionnaires' | 'library' | 'home'

describe('every view', () => {
  const world = [
    ...[mind, values, rao, jainDiwakar, yogaSutra, dhammapada, ys130, dp160],
    defineConcept({
      ...concept,
      verses: [{ passage: 'yoga-sutra/1.30', translation: 'calm', meaning: 'Made up.' }],
      sections: [
        {
          id: 'all-blocks',
          heading: 'All blocks',
          role: 'applications',
          blocks: [
            { kind: 'paragraph', text: 'Made up (Rao, 2001).' },
            { kind: 'list', style: 'number', items: ['One'] },
            { kind: 'term', id: 'samsaya', term: samsaya, blocks: [] },
            {
              kind: 'table',
              id: 'table',
              caption: 'Made up.',
              columns: ['A', 'B'],
              rows: [{ head: { term: samsaya }, cells: ['C'] }, { cells: ['D', 'E'] }],
            },
            { kind: 'verse', quote: { passage: 'dhammapada/160' } },
            { kind: 'topic-intro', topic: 'values' },
          ],
        },
      ],
      references: ['rao-2001', 'jain-diwakar-2019'],
      questionnaire: 'obstacles',
    }),
    defineConcept({
      ...concept,
      slug: 'calm',
      name: { english: 'Calm' },
      verses: [{ passage: 'yoga-sutra/1.30' }],
    }),
    defineQuestionnaire({
      kind: 'questionnaire',
      slug: 'obstacles',
      title: 'Obstacles Profile',
      sourceTitle: 'Obstacles Profiling',
      status: 'preview',
      concepts: ['obstacles'],
      source: 'rao-2001',
      form: {
        responseSets: { yes: ['Yes', 'No'] },
        parts: [
          {
            id: 'only',
            title: 'Only',
            instructions: 'Made up.',
            items: [{ id: '1', text: 'Made up?', responseSet: 'yes', reversed: true }],
          },
        ],
      },
      scoring: { status: 'pending', reason: 'No documented scoring rules yet.' },
      heldBack: [],
      rights: { status: 'permission-needed', holder: 'Made up', note: 'Made up.' },
      reviewStatus: 'carried-over-not-reviewed',
      provenance,
    }),
    defineResourceList({
      kind: 'resource-list',
      slug: 'reading',
      title: 'Reading',
      groups: [
        {
          id: 'core',
          heading: 'Core',
          items: [
            { type: 'reference', reference: 'rao-2001' },
            { type: 'course', provider: 'Made up', name: 'Made up' },
          ],
        },
      ],
      provenance,
    }),
    definePage({
      kind: 'page',
      slug: 'methods',
      title: 'Methods',
      summary: 'Made up.',
      sections: [],
      provenance,
    }),
    defineHome({
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
      areas: [{ title: 'Made up', text: 'Made up.', target: { kind: 'concept', id: 'obstacles' } }],
      closing: 'Made up.',
      helpLine: 'Made up.',
      provenance,
    }),
  ]

  it('survives a JSON round trip unchanged, on made-up content', async () => {
    const views = await everyView(createContent(sourceOf(...world), ON))
    expect(views.length).toBeGreaterThan(10)
    for (const view of views) expect(JSON.parse(JSON.stringify(view))).toStrictEqual(view)
  })

  it('survives a JSON round trip unchanged, on the site’s own content', async () => {
    const views = await everyView(ownContent)
    expect(views.length).toBeGreaterThan(10)
    for (const view of views) expect(JSON.parse(JSON.stringify(view))).toStrictEqual(view)
  })
})

describe('the feature flags, from the environment to the interface (D16, D20)', () => {
  const form: QuestionnaireForm = {
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
  const records = [
    mind,
    defineConcept(concept),
    defineQuestionnaire({
      kind: 'questionnaire',
      slug: 'work-scale',
      title: 'Work Scale',
      sourceTitle: 'Work Scale',
      status: 'preview',
      concepts: ['obstacles'],
      form,
      scoring: { status: 'pending', reason: 'No documented scoring rules yet.' },
      heldBack: [],
      rights: { status: 'permission-needed', holder: 'Made up', note: 'Made up.' },
      reviewStatus: 'carried-over-not-reviewed',
      provenance,
    }),
  ]
  /** What a build in this environment offers: the preview's form, and the flagged routes. */
  const offered = async (env: Record<string, string>) => {
    const content = createContent(sourceOf(...records), readFeatures(env))
    const paths = (await content.site.routes()).map(({ path }) => path)
    return {
      form: (await content.questionnaires.form('work-scale')) !== null,
      flow: paths.includes('/questionnaires/work-scale/take/'),
      map: paths.includes('/concepts/map/'),
      proposals: paths.includes('/proposals/'),
      start: paths.includes('/start/'),
    }
  }
  const everything = { form: true, flow: true, map: true, proposals: true, start: true }
  const nothing = { form: false, flow: false, map: false, proposals: false, start: false }

  it('offers everything in local runs and Vercel previews, and none of it in production', async () => {
    expect(await offered({})).toEqual(everything)
    expect(await offered({ VERCEL_ENV: 'preview' })).toEqual(everything)
    expect(await offered({ VERCEL_ENV: 'production' })).toEqual(nothing)
  })

  it('follows each flag’s own variable, either way', async () => {
    const production = { VERCEL_ENV: 'production' }
    expect(await offered({ ...production, FEATURE_QUESTIONNAIRE_PREVIEW: '1' })).toEqual({
      ...nothing,
      form: true,
      flow: true,
    })
    expect(await offered({ ...production, FEATURE_CONCEPT_MAP: '1' })).toEqual({
      ...nothing,
      map: true,
      proposals: true,
    })
    expect(await offered({ ...production, FEATURE_DEVANAGARI_FIRST: '1' })).toEqual({
      ...nothing,
      proposals: true,
    })
    expect(await offered({ ...production, FEATURE_START_HERE: '1' })).toEqual({
      ...nothing,
      proposals: true,
      start: true,
    })
    expect(await offered({ FEATURE_QUESTIONNAIRE_PREVIEW: '0' })).toEqual({
      ...everything,
      form: false,
      flow: false,
    })
    expect(await offered({ FEATURE_CONCEPT_MAP: '0', FEATURE_DEVANAGARI_FIRST: '0' })).toEqual({
      ...everything,
      map: false,
    })
    expect(
      await offered({
        FEATURE_CONCEPT_MAP: '0',
        FEATURE_DEVANAGARI_FIRST: '0',
        FEATURE_START_HERE: '0',
      }),
    ).toEqual({ ...everything, map: false, proposals: false, start: false })
  })
})
