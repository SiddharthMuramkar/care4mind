import type { ContentKind, RecordOf, Slug } from '../schema'
import type { RelationKind } from '../types'

/** A record named by its kind and id (ids are unique within a kind, not across kinds). */
export interface RecordKey {
  kind: ContentKind
  id: string
}

/** A place a passage is quoted, with the translation the quote shows. */
export interface Quotation {
  record: RecordKey
  translation?: string
}

/** An in-text citation, "(Tomar, 2024)", and the Reference it resolves to, if exactly one fits. */
export interface Citation {
  /** As the text writes it, without the parentheses: `Tomar, 2024`. */
  text: string
  /** One of the citing record's own References. */
  reference?: string
}

/** One fact that relates a Concept to another. */
export interface Relation {
  /** The other Concept. */
  concept: Slug
  kind: RelationKind
  /** The shared passage, work, Reference or topic, by its id. */
  via: string
  /** The fact, as a reader sees it: "Both quote Yoga Sūtra 2.30". */
  reason: string
}

export interface ContentGraph {
  /** Every record of a kind, in the source's order. */
  records<K extends ContentKind>(kind: K): readonly RecordOf<K>[]
  record<K extends ContentKind>(kind: K, id: string): RecordOf<K> | undefined
  /** The records that cite a Reference: Concepts, topic introductions, Questionnaires, lists. */
  citedBy(reference: string): readonly RecordKey[]
  /** Where a passage is quoted ("quoted in"), in source order. */
  quotedIn(passage: string): readonly Quotation[]
  /** The Concepts whose primary topic this is, and those that are also in it. */
  conceptsInTopic(topic: Slug): { primary: readonly Slug[]; also: readonly Slug[] }
  /** The Concepts that quote any passage of a work. */
  conceptsQuotingWork(work: Slug): readonly Slug[]
  /** The in-text citations in a Concept, or in a topic's introduction, in reading order. */
  citations(kind: 'concept' | 'topic', id: string): readonly Citation[]
  /**
   * Every fact relating a Concept to another (D06), by the other Concept in source order, then
   * by kind, then in the Concept's own order: shared passages, then works it quotes from with no
   * passage in common, then rarely cited References, then topics.
   */
  related(concept: Slug): readonly Relation[]
}

/** Thrown when a record names an id that doesn't exist, as the kind its field links to. */
export class DanglingIdError extends Error {
  readonly problems: readonly string[]

  constructor(problems: readonly string[]) {
    super(`Content links to ids that don’t exist:\n${problems.map((p) => `- ${p}`).join('\n')}`)
    this.name = 'DanglingIdError'
    this.problems = problems
  }
}
