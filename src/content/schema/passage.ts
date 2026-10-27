import type { Inline, Provenance, Slug } from './common'

/**
 * One verse of a work, quoted somewhere on the site. Its id is `work/locator`. Which Concepts
 * quote it is computed from their quotes, never stored here.
 */
export interface PassageRecord {
  kind: 'passage'
  /** `yoga-sutra/1.30`. */
  id: string
  work: Slug
  /** As the pages number it: `1.30`. */
  locator: string
  /** The locator as numbers, for reading order: 1.2 before 1.20 before 2.3. */
  order: readonly number[]
  /** Lines as a page gives them; empty, and flagged, when no page gives any. */
  devanagari: readonly string[]
  /** `iast` only when it follows IAST; anything else is carried over as `informal`. */
  transliteration?: { lines: readonly string[]; scheme: 'iast' | 'informal' }
  /** Each text a page labels "Translation", with an id unique within the passage. */
  translations: readonly { id: string; text: Inline; source?: string }[]
  provenance: Provenance
}

/** Type-checks a passage record file; returns it unchanged. */
export function definePassage(record: PassageRecord): PassageRecord {
  return record
}
