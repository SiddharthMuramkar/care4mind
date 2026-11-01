import { describe, expect, it } from 'vitest'

import {
  asciiSpellings,
  concepts,
  home,
  questionnaires,
  type BlockView,
  type ConceptView,
  type HomepageView,
  type QuestionnaireView,
  type ReferenceView,
  type SanskritName,
} from '@/content'

// What the foundation's pages showed of their three items (vikṣepa, the KarmaYoga Scale and the
// homepage), recorded before content v1 re-homed them. Front-end-site ticket 03 moved the pages
// to the v1 views and deleted the legacy adapter that kept this shape; each projection below
// reads the same facts back out of the views, so nothing the foundation's pages showed is lost.
//
// Where v1 differs, the recording says so: the KarmaYoga Scale's status is "preview" (the
// foundation could only say "coming soon"), the homepage's areas lead to their new pages, and
// the homepage's Questionnaires note was interface text, now written by the homepage itself.
// Provenance edits may change as the migration lists more of them, so they aren't recorded.

const NOT_PINNED = '(provenance edits are not pinned)'

/** A copy without the keys whose value is undefined, as the foundation's shapes left them out. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T
}

/** Where the text came from, as the foundation's pages named it: the first source page. */
function provenanceOf(view: {
  provenance: { sources: readonly { url: string; retrieved: string }[] }
}) {
  const [source] = view.provenance.sources
  return { url: source?.url, retrieved: source?.retrieved, edits: NOT_PINNED }
}

/** A Reference as the foundation listed it: its container or publisher, volume, issue and pages as one. */
function foundationReference(reference: ReferenceView) {
  const volume =
    reference.volume === undefined || reference.issue === undefined
      ? reference.volume
      : `${reference.volume}(${reference.issue})`
  const publication = [reference.container ?? reference.publisher, volume, reference.pages]
    .filter((part) => part !== undefined)
    .join(', ')
  return compact({
    id: reference.id,
    authors: reference.authors,
    year: reference.year,
    title: reference.title,
    publication: publication === '' ? undefined : publication,
    doi: reference.doi,
    url: reference.url,
  })
}

type FoundationBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'term'; term: SanskritName; gloss: string; paragraphs: string[] }

/** The paragraphs and terms of a section, as the foundation's Concept page drew them. */
function foundationBlocks(blocks: readonly BlockView[]): FoundationBlock[] {
  return blocks.flatMap((block): FoundationBlock[] => {
    if (block.kind === 'paragraph') return [{ kind: 'paragraph', text: block.text }]
    if (block.kind !== 'term') return []
    const paragraphs = block.blocks.flatMap((inner) =>
      inner.kind === 'paragraph' ? [inner.text] : [],
    )
    return [{ kind: 'term', term: block.term, gloss: block.gloss ?? '', paragraphs }]
  })
}

/** The Concept as the foundation's page showed it. */
function foundationConcept(view: ConceptView) {
  const table = view.sections
    .find((section) => section.role === 'comparison')
    ?.blocks.find((block) => block.kind === 'table')
  return compact({
    slug: view.slug,
    term: view.term,
    gloss: view.english ?? '',
    summary: view.summary,
    shlokas: view.verses.map((verse) =>
      compact({
        source: verse.source,
        verse: verse.verse,
        devanagari: verse.devanagari,
        transliteration: verse.transliteration,
        transliterationScheme: verse.transliterationScheme,
        translation: verse.translation,
        meaning: verse.meaning,
      }),
    ),
    sections: view.sections.map((section) => ({
      heading: section.heading,
      blocks: foundationBlocks(section.blocks),
    })),
    comparison: table && {
      caption: table.caption,
      columns: table.columns,
      rows: table.rows.map((row) => {
        const head = typeof row.head === 'object' ? row.head : undefined
        return { term: head?.term, gloss: head?.gloss ?? '', cells: row.cells }
      }),
    },
    references: view.references.map(foundationReference),
    // The foundation linked only the Questionnaires with pages of their own.
    relatedQuestionnaires: view.linked.questionnaires
      .filter((questionnaire) => questionnaire.status !== 'coming-later')
      .map((questionnaire) => questionnaire.slug),
    reviewStatus: view.reviewStatus,
    provenance: provenanceOf(view),
  })
}

/** The Questionnaire as the foundation's page showed it. */
function foundationQuestionnaire(view: QuestionnaireView) {
  return {
    slug: view.slug,
    title: view.title,
    status: view.status,
    summary: view.summary ?? '',
    purpose: view.purpose ?? [],
    format: view.format ?? [],
    source: view.source && foundationReference(view.source),
    limitations: view.limitations,
    relatedConcepts: view.concepts.map((concept) => concept.slug),
    reviewStatus: view.reviewStatus,
    provenance: provenanceOf(view),
  }
}

/** The homepage as the foundation showed it. */
function foundationHomepage(view: HomepageView) {
  return {
    shloka: view.shloka,
    intro: view.intro,
    areas: view.areas,
    closing: view.closing,
    provenance: provenanceOf(view),
  }
}

/** Every Sanskrit term inside a value: anything with an IAST form and its ASCII spellings. */
function termsIn(value: unknown): SanskritName[] {
  if (Array.isArray(value)) return value.flatMap(termsIn)
  if (value && typeof value === 'object') {
    const own = 'iast' in value && 'ascii' in value ? [value as SanskritName] : []
    return [...own, ...Object.values(value).flatMap(termsIn)]
  }
  return []
}

async function vikshepa(): Promise<ConceptView> {
  const view = await concepts.get('vikshepa')
  if (!view) throw new Error('vikṣepa is missing')
  return view
}

async function karmayoga(): Promise<QuestionnaireView> {
  const view = await questionnaires.get('karmayoga-scale')
  if (!view) throw new Error('the KarmaYoga Scale is missing')
  return view
}

describe('the foundation’s content, through the v1 interface', () => {
  it('returns the vikṣepa Concept as the foundation did', async () => {
    expect(foundationConcept(await vikshepa())).toMatchSnapshot()
  })

  it('lists vikṣepa among the Concepts, as its page names it', async () => {
    const view = await vikshepa()
    const card = (await concepts.list()).find((concept) => concept.slug === 'vikshepa')
    expect(card).toEqual({
      slug: view.slug,
      name: view.name,
      lang: view.lang,
      href: view.href,
      term: view.term,
      english: view.english,
      summary: view.summary,
      topic: view.topic,
    })
  })

  it('returns the KarmaYoga Scale as the foundation did', async () => {
    expect(foundationQuestionnaire(await karmayoga())).toMatchSnapshot()
  })

  it('lists the KarmaYoga Scale among the Questionnaires, before those coming later', async () => {
    const [first] = await questionnaires.list()
    expect(first).toMatchObject({ slug: 'karmayoga-scale', title: (await karmayoga()).title })
  })

  it('returns the homepage as the foundation did', async () => {
    expect(foundationHomepage(await home.get())).toMatchSnapshot()
  })

  it('gives every term on the foundation’s pages the same ASCII spellings', async () => {
    const view = await vikshepa()
    const terms = termsIn({ term: view.term, sections: view.sections })
    const spellings = Object.fromEntries(terms.map((term) => [term.iast, asciiSpellings(term)]))
    expect(spellings).toMatchSnapshot()
  })

  it('returns null for a slug no item of that kind has', async () => {
    expect(await concepts.get('karmayoga-scale')).toBeNull()
    expect(await questionnaires.get('no-such-questionnaire')).toBeNull()
  })

  it('keeps a provenance edit list on each item', async () => {
    const items = [await vikshepa(), await karmayoga(), await home.get()]
    for (const item of items) expect(item.provenance.edits.length).toBeGreaterThan(0)
  })
})
