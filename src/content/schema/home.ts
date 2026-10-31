import type { Inline, Provenance, Target } from './common'

/** The homepage's own text. There is one, and its id is always `home`. */
export interface HomepageRecord {
  kind: 'home'
  shloka: { devanagari: string; iast: string; translation: string }
  intro: Inline
  /** Each area leads to a target; one with no real destination has none (and is flagged). */
  areas: readonly { title: string; text: Inline; target?: Target }[]
  closing: Inline
  /** Where to call for help now, shown in every page's footer and on each Questionnaire page. */
  helpLine?: Inline
  provenance: Provenance
}

/** Type-checks the homepage record file; returns it unchanged. */
export function defineHome(record: HomepageRecord): HomepageRecord {
  return record
}
