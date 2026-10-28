/**
 * The legacy adapter: the front-end foundation's content functions and types, unchanged, built
 * from content v1's records.
 *
 * It serves the foundation's pages until front-end-site ticket 03 moves them to the new
 * interface and deletes this file. It covers the foundation's three items only (vikṣepa, the
 * KarmaYoga Scale and the homepage), whatever else the data holds, and returns exactly what the
 * foundation returned: only provenance edits may differ, as the migration lists more of them.
 */
import { contentGraph, type ContentGraph } from './graph'
import type {
  Block as RecordBlock,
  ConceptRecord,
  HomepageRecord,
  PassageQuote,
  Provenance as RecordProvenance,
  QuestionnaireRecord,
  ReferenceRecord,
  SanskritName,
  Section as RecordSection,
  TableBlock,
} from './schema'

// The foundation's types (planning ticket 21), as pages see them.

/** Every item carried over from the current site starts here until someone reviews it. */
export type ReviewStatus = 'carried-over-not-reviewed'

export interface Provenance {
  /** The current-site page the text was read from. */
  url: string
  /** The date it was read, as YYYY-MM-DD. */
  retrieved: string
  /** Changes made while carrying it over, so a reviewer can check them. */
  edits: readonly string[]
}

/** A Sanskrit term in each stored form (NFR-03). All text is NFC, anusvara as ṃ. */
export type SanskritTerm = SanskritName

export interface Shloka {
  /** Work and verse, for example "Yoga Sūtra 1.30". */
  source: string
  /** Verse number, shown in Devanagari digits beside the Devanagari text. */
  verse: string
  devanagari: readonly string[]
  transliteration: readonly string[]
  /** "iast" when the transliteration follows IAST; "informal" when it is carried over as the current site wrote it. */
  transliterationScheme: 'iast' | 'informal'
  translation: string
  meaning?: string
}

/** One published work (GLOSSARY: Reference). FR-03 needs a title and, where one exists, a DOI or stable URL. */
export interface Reference {
  id: string
  authors?: string
  year?: string
  title: string
  publication?: string
  doi?: string
  url?: string
}

export type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'term'; term: SanskritTerm; gloss: string; paragraphs: readonly string[] }

export interface Section {
  heading: string
  blocks: readonly Block[]
}

export interface Comparison {
  caption: string
  columns: readonly [string, string, string, string]
  rows: readonly {
    term: SanskritTerm
    gloss: string
    cells: readonly [string, string, string]
  }[]
}

export interface Concept {
  slug: string
  term: SanskritTerm
  /** English gloss, as in "Vikṣepa (Distraction)". */
  gloss: string
  summary: string
  shlokas: readonly Shloka[]
  sections: readonly Section[]
  comparison?: Comparison
  references: readonly Reference[]
  relatedQuestionnaires: readonly string[]
  reviewStatus: ReviewStatus
  provenance: Provenance
}

export interface Questionnaire {
  slug: string
  title: string
  /** No in-scope Questionnaire runs yet: its questions and scoring rules are still being confirmed. */
  availability: 'coming-soon'
  summary: string
  purpose: readonly string[]
  format: readonly string[]
  source: Reference
  limitations: {
    items: readonly string[]
    /** Limitations belong to the Psychology expert; until one signs them off they are shown as a draft. */
    status: 'draft-pending-psychology-expert'
  }
  relatedConcepts: readonly string[]
  reviewStatus: ReviewStatus
  provenance: Provenance
}

export interface Homepage {
  shloka: { devanagari: string; iast: string; translation: string }
  intro: string
  areas: readonly { title: string; text: string; href?: '#concepts' | '#questionnaires' }[]
  questionnairesNote: string
  closing: string
  provenance: Provenance
}

// The foundation's items, and the interface text it kept in its records.

const CONCEPTS: readonly string[] = ['vikshepa']
const QUESTIONNAIRES: readonly string[] = ['karmayoga-scale']
const QUESTIONNAIRES_NOTE =
  'More Questionnaires from the current site follow once their questions and scoring rules are confirmed.'
/** The foundation's homepage linked one area, Concepts, to its own Concepts section. */
const AREA_LINKS: Readonly<Record<string, '#concepts'>> = { Concepts: '#concepts' }

/** The value, which the graph has already resolved; it throws only if that promise breaks. */
function resolved<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`The legacy adapter needs ${what}.`)
  return value
}

/** A copy without the keys whose value is undefined, so absent fields stay absent. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T
}

/** The values as the fixed-length tuple the foundation's comparison table types them as. */
function fixed<T extends readonly string[]>(
  values: readonly string[],
  length: number,
  what: string,
) {
  if (values.length !== length) throw new Error(`The legacy adapter needs ${length} ${what}.`)
  return values as T
}

function toProvenance({ sources, edits }: RecordProvenance): Provenance {
  const [first] = sources
  const source = resolved(first, 'a provenance source')
  return { url: source.url, retrieved: source.retrieved, edits }
}

function toReference(reference: ReferenceRecord): Reference {
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

function toShloka(quote: PassageQuote, graph: ContentGraph): Shloka {
  const passage = resolved(graph.record('passage', quote.passage), `passage ${quote.passage}`)
  const work = resolved(graph.record('work', passage.work), `work ${passage.work}`)
  const translation =
    quote.translation === undefined
      ? passage.translations[0]
      : passage.translations.find((candidate) => candidate.id === quote.translation)
  return compact({
    source: `${work.title.iast} ${passage.locator}`,
    verse: passage.locator,
    devanagari: passage.devanagari,
    transliteration: passage.transliteration?.lines ?? [],
    transliterationScheme: passage.transliteration?.scheme ?? 'informal',
    translation: translation?.text ?? '',
    meaning: quote.meaning,
  })
}

function toBlocks(blocks: readonly RecordBlock[]): Block[] {
  return blocks.flatMap((block): Block[] => {
    if (block.kind === 'paragraph') return [{ kind: 'paragraph', text: block.text }]
    if (block.kind === 'term') {
      const paragraphs = block.blocks.flatMap((inner) =>
        inner.kind === 'paragraph' ? [inner.text] : [],
      )
      return [{ kind: 'term', term: block.term, gloss: block.gloss ?? '', paragraphs }]
    }
    // The comparison table is the Concept's `comparison`; the foundation had no other blocks.
    return []
  })
}

function toSection(section: RecordSection): Section {
  return { heading: section.heading, blocks: toBlocks(section.blocks) }
}

function toComparison(table: TableBlock): Comparison {
  return {
    caption: table.caption,
    columns: fixed<Comparison['columns']>(table.columns, 4, 'comparison columns'),
    rows: table.rows.map((row) => {
      const head = row.head
      if (head === undefined || typeof head === 'string')
        throw new Error('The legacy adapter needs a term at the head of each comparison row.')
      return {
        term: head.term,
        gloss: head.gloss ?? '',
        cells: fixed<Comparison['rows'][number]['cells']>(row.cells, 3, 'cells in a row'),
      }
    }),
  }
}

function toConcept(record: ConceptRecord, graph: ContentGraph): Concept {
  const comparison = record.sections
    .find((section) => section.role === 'comparison')
    ?.blocks.find((block): block is TableBlock => block.kind === 'table')
  return compact({
    slug: record.slug,
    term: resolved(record.name.term, `a Sanskrit term for ${record.slug}`),
    gloss: record.name.english ?? '',
    summary: record.summary,
    shlokas: record.verses.map((quote) => toShloka(quote, graph)),
    sections: record.sections.map(toSection),
    comparison: comparison && toComparison(comparison),
    references: record.references.map((id) =>
      toReference(resolved(graph.record('reference', id), `reference ${id}`)),
    ),
    relatedQuestionnaires: QUESTIONNAIRES.filter((slug) =>
      graph.record('questionnaire', slug)?.concepts.includes(record.slug),
    ),
    reviewStatus: 'carried-over-not-reviewed',
    provenance: toProvenance(record.provenance),
  })
}

function toQuestionnaire(record: QuestionnaireRecord, graph: ContentGraph): Questionnaire {
  const source = resolved(record.source, `a source for ${record.slug}`)
  return {
    slug: record.slug,
    title: record.title,
    // Every status maps back to the foundation's one: "preview" is "coming soon" here.
    availability: 'coming-soon',
    summary: record.summary ?? '',
    purpose: record.purpose ?? [],
    format: record.format ?? [],
    source: toReference(resolved(graph.record('reference', source), `reference ${source}`)),
    limitations: {
      items: record.limitations?.items ?? [],
      status: 'draft-pending-psychology-expert',
    },
    relatedConcepts: record.concepts.filter((slug) => CONCEPTS.includes(slug)),
    reviewStatus: 'carried-over-not-reviewed',
    provenance: toProvenance(record.provenance),
  }
}

function toHomepage(record: HomepageRecord): Homepage {
  return {
    shloka: record.shloka,
    intro: record.intro,
    areas: record.areas.map((area) =>
      compact({ title: area.title, text: area.text, href: AREA_LINKS[area.title] }),
    ),
    questionnairesNote: QUESTIONNAIRES_NOTE,
    closing: record.closing,
    provenance: toProvenance(record.provenance),
  }
}

export async function getConcept(slug: string): Promise<Concept | null> {
  if (!CONCEPTS.includes(slug)) return null
  const graph = await contentGraph()
  const record = graph.record('concept', slug)
  return record ? toConcept(record, graph) : null
}

export async function listConcepts(): Promise<readonly Concept[]> {
  const graph = await contentGraph()
  return CONCEPTS.flatMap((slug) => {
    const record = graph.record('concept', slug)
    return record ? [toConcept(record, graph)] : []
  })
}

export async function getQuestionnaire(slug: string): Promise<Questionnaire | null> {
  if (!QUESTIONNAIRES.includes(slug)) return null
  const graph = await contentGraph()
  const record = graph.record('questionnaire', slug)
  return record ? toQuestionnaire(record, graph) : null
}

export async function listQuestionnaires(): Promise<readonly Questionnaire[]> {
  const graph = await contentGraph()
  return QUESTIONNAIRES.flatMap((slug) => {
    const record = graph.record('questionnaire', slug)
    return record ? [toQuestionnaire(record, graph)] : []
  })
}

export async function getHomepage(): Promise<Homepage> {
  const graph = await contentGraph()
  return toHomepage(resolved(graph.record('home', 'home'), 'the homepage record'))
}
