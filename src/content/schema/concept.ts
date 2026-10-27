import type {
  Inline,
  PassageQuote,
  Provenance,
  ReviewStatus,
  SanskritName,
  Section,
  Slug,
} from './common'

/**
 * A Concept's name: its Sanskrit term, an English name, or both (settled rule 6). The English
 * name is only a gloss the page itself gives; a page without one leaves it empty, flagged.
 */
export type ConceptName =
  { term: SanskritName; english?: string } | { term?: undefined; english: string }

/** A single idea from Indian psychology, carried over from one page of the current site. */
export interface ConceptRecord {
  kind: 'concept'
  slug: Slug
  name: ConceptName
  /** Sentence(s) from the page, never newly written. */
  summary: Inline
  /** Exactly one primary topic (D03), which sets the breadcrumb; `also` never repeats it. */
  topics: { primary: Slug; also?: readonly Slug[] }
  /** The verses at the top of the page, in source order. */
  verses: readonly PassageQuote[]
  sections: readonly Section[]
  /** The page's reference list, in source order, as Reference ids. */
  references: readonly string[]
  /** Its own Questionnaire, which lists this Concept among its `concepts`. */
  questionnaire?: Slug
  /** Curated links with an editor's note; empty until planning ticket 14. */
  related?: readonly { concept: Slug; note: string }[]
  /** Links that leave the site, such as the Concept's own DharmaWiki article. */
  external?: readonly { label: string; url: string }[]
  reviewStatus: ReviewStatus
  provenance: Provenance
}

/** Type-checks a Concept record file; returns it unchanged. */
export function defineConcept(record: ConceptRecord): ConceptRecord {
  return record
}
