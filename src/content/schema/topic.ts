import type { Provenance, SanskritName, Section, Slug } from './common'

/**
 * One of the provisional topics (D03). Topics get no description of their own, except an
 * introduction where the current site has shared text that belongs to the topic.
 */
export interface TopicRecord {
  kind: 'topic'
  slug: Slug
  name: { english: string; term?: SanskritName }
  /** Position among the topics, from 1. */
  order: number
  /** Shared text stored once (the values topic's yama–niyama section), with its own provenance. */
  intro?: {
    sections: readonly Section[]
    /** The References its citations name, so they resolve on the topic page too. */
    references: readonly string[]
    provenance: Provenance
  }
}

/** Type-checks a topic record file; returns it unchanged. */
export function defineTopic(record: TopicRecord): TopicRecord {
  return record
}
