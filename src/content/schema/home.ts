import type { Inline, Provenance, Target } from './common'

/** The hero's words. Start here and Browse concepts show while Start here is on. */
export interface HomepageHero {
  promise: string
  subhead: string
  startHere: string
  browseConcepts: string
  exploreConcepts: string
}

/** The homepage's own text. There is one, and its id is always `home`. */
export interface HomepageRecord {
  kind: 'home'
  /** The site's one-line description: the meta description and the footer's line. */
  tagline: string
  /** The motto, a small label above the hero's promise. */
  shloka: { devanagari: string; iast: string; translation: string }
  /** The hero: its H1, its subhead and its buttons' labels. */
  hero: HomepageHero
  /** The line under each section's heading. */
  sectionIntros: { concepts: string; questionnaires: string }
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
