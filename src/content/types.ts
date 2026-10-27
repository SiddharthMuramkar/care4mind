/**
 * Content types, provisional.
 *
 * These follow the brief's starting content model. The planning map's content
 * tickets (13–17) decide the real types, fields and links, and the Architecture
 * review decides where content lives. Pages only ever see these types through
 * the content module (`@/content`), so both can change without touching pages.
 */

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
export interface SanskritTerm {
  iast: string
  devanagari?: string
  /** Plain-keyboard spellings the term goes by, such as those the current site uses. */
  ascii: readonly string[]
}

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
