/**
 * Shapes shared by every kind of record: the storage shape a CMS collection would hold
 * (design notes A2, content-v1 spec "Records").
 *
 * All text is NFC, with anusvara written ṃ, never ṁ.
 */
import type { ContentKind } from './kinds'

/** Lowercase ASCII words joined by hyphens (D02): `vikshepa`, `five-steps-of-perfection`. */
export type Slug = string

/** A Sanskrit term in each stored form (NFR-03). */
export interface SanskritName {
  /** IAST. */
  iast: string
  devanagari?: string
  /** The plain-keyboard spellings the term goes by, as the pages write them ("Sanshay"). */
  ascii: readonly string[]
}

/** Plain text. The renderer tags Devanagari runs and links "(Author, Year)" citations. */
export type Inline = string

/** Who must answer a flag. */
export type FlagRole = 'research-editor' | 'psychology-expert' | 'project-owner'

/** A question for a person, raised by an agent that noticed something it may not decide. */
export interface Flag {
  for: FlagRole
  note: string
  /** The planning ticket that decides it. */
  ticket?: number
}

/** Where a record came from, and every change made on the way. */
export interface Provenance {
  /** The current-site pages (or, for a record no page holds, the source) it was read from. */
  sources: readonly { url: string; retrieved: string }[]
  /** One change each. A replacement quotes old and new text: “Negliegence” → “Negligence”. */
  edits: readonly string[]
  flags: readonly Flag[]
  /** Field paths written for the new site rather than carried over, such as `summary`. */
  drafted?: readonly string[]
}

/** Whether anyone has checked a record. One with drafted fields is "drafted, not reviewed". */
export type ReviewStatus = 'carried-over-not-reviewed' | 'drafted-not-reviewed' | 'reviewed'

/** A verse as a record quotes it: the passage, the translation it shows and the page's reading. */
export interface PassageQuote {
  /** A passage id, `work/locator`: `yoga-sutra/1.30`. */
  passage: string
  /** The id of one of the passage's translations. */
  translation?: string
  /** What the page labels "Meaning": its own reading of the verse, kept apart from the text. */
  meaning?: Inline
}

/** A table row's heading cell: plain text, or a Sanskrit term with its gloss. */
export type TableRowHead = Inline | { term: SanskritName; gloss?: string }

export interface TableRow {
  head?: TableRowHead
  cells: readonly Inline[]
}

export interface ParagraphBlock {
  kind: 'paragraph'
  text: Inline
}

export interface ListBlock {
  kind: 'list'
  style: 'bullet' | 'number'
  items: readonly Inline[]
}

/** A sub-term inside a Concept (saṃśaya inside vikṣepa), with its own anchor `#id`. */
export interface TermBlock {
  kind: 'term'
  /** The term's IAST without diacritics. */
  id: Slug
  term: SanskritName
  gloss?: string
  blocks: readonly Block[]
}

export interface TableBlock {
  kind: 'table'
  id: Slug
  /** The page's own caption, else the heading above the table (listed in provenance). */
  caption: Inline
  columns: readonly string[]
  rows: readonly TableRow[]
}

/** A verse quoted in the middle of a section. */
export interface VerseBlock {
  kind: 'verse'
  quote: PassageQuote
}

/** Shared text stored once on a topic (the yama–niyama introduction), shown where the page had it. */
export interface TopicIntroBlock {
  kind: 'topic-intro'
  topic: Slug
}

export type Block =
  ParagraphBlock | ListBlock | TermBlock | TableBlock | VerseBlock | TopicIntroBlock

export interface Section {
  /** The heading's words, lowercase and hyphenated. */
  id: Slug
  heading: Inline
  /** Applications and "Indian vs Western" comparisons are roles of a section (D05), never types. */
  role?: 'applications' | 'comparison'
  blocks: readonly Block[]
}

/** The index pages a target may name instead of a record. */
export type IndexPage = 'concepts' | 'texts' | 'questionnaires' | 'library'

/**
 * Where a link goes: a record (by kind and id, with an optional anchor inside it) or an index
 * page. Only `hrefFor` turns a target into a path.
 */
export type Target =
  { kind: Exclude<ContentKind, 'home'>; id: string; anchor?: Slug } | { index: IndexPage }
