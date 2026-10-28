import type { Inline, Provenance, Slug } from './common'

/** A short entry from the current site's glossary, with no page of its own (D14). */
export interface GlossaryEntryRecord {
  kind: 'glossary'
  slug: Slug
  name: { ascii: string; devanagari?: string; iast?: string }
  definition?: Inline
  /** Its DharmaWiki article, exactly as the card links it. */
  url?: string
  /** The Concept it names, whose entry it merges into. */
  concept?: Slug
  provenance: Provenance
}

/** Type-checks a glossary entry record file; returns it unchanged. */
export function defineGlossaryEntry(record: GlossaryEntryRecord): GlossaryEntryRecord {
  return record
}
