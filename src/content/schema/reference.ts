import type { Provenance } from './common'

export type ReferenceType =
  | 'journal-article'
  | 'book'
  | 'chapter'
  | 'thesis'
  | 'web-page'
  | 'dictionary-entry'
  | 'report'
  | 'other'

/**
 * One published work, stored once however many pages cite it (D09). Every field comes from what
 * the pages say; a gap is flagged, never looked up.
 */
export interface ReferenceRecord {
  kind: 'reference'
  /** The first author's surname (both for two authors), else a short name; then the year. */
  id: string
  type: ReferenceType
  /** Free text, as the pages write it. */
  authors?: string
  year?: string
  title: string
  /** The journal, book or site it appears in. */
  container?: string
  publisher?: string
  volume?: string
  issue?: string
  pages?: string
  edition?: string
  doi?: string
  url?: string
  /** FR-03 wants a DOI or stable URL where one exists: this says why there is none. */
  noStableLink?: string
  /** Each distinct way a source page wrote it. */
  asCited: readonly string[]
  provenance: Provenance
}

/** Type-checks a Reference record file; returns it unchanged. */
export function defineReference(record: ReferenceRecord): ReferenceRecord {
  return record
}
