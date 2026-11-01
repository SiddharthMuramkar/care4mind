/**
 * The facts that relate one Concept to another: the passages, works, rarely cited References and
 * topics they share.
 */
import { displayName, passageLabel, referenceLabel } from '../names'
import type { RecordOf, Slug } from '../schema'
import { RELATION_STRENGTH, type RelationKind } from '../types'
import { lookup, quotesOf, type Index, type RecordKey } from './links'

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

/**
 * A Reference relates the Concepts citing it only while it is rarely cited: by at most this many
 * Concepts. A source most pages cite would relate everything to everything.
 */
const RARELY_CITED = 3

/** Tomar (2024) never relates Concepts: it is the handbook nearly every page cites. */
const NEVER_RELATES: ReadonlySet<string> = new Set(['tomar-2024'])

/** What a Concept may share with another, each in the Concept's own order. */
interface Shared {
  slug: Slug
  passages: readonly string[]
  works: readonly Slug[]
  references: readonly string[]
  topics: readonly Slug[]
}

/** The items of one list that another holds too, in the first list's order. */
const inBoth = <T>(mine: readonly T[], theirs: readonly T[]) =>
  mine.filter((item) => theirs.includes(item))

/** Every fact relating each Concept to each other one, by Concept slug. */
export function relationsOf(
  concepts: readonly RecordOf<'concept'>[],
  index: Index,
  citedBy: ReadonlyMap<string, readonly RecordKey[]>,
): Map<Slug, Relation[]> {
  const rare = (reference: string) =>
    !NEVER_RELATES.has(reference) &&
    (citedBy.get(reference) ?? []).filter((key) => key.kind === 'concept').length <= RARELY_CITED
  const workOf = (passage: string) => lookup(index, 'passage', passage)?.work
  const shared = concepts.map((concept): Shared => {
    const passages = [...new Set(quotesOf(concept).map((quote) => quote.passage))]
    return {
      slug: concept.slug,
      passages,
      works: [...new Set(passages.flatMap((passage) => workOf(passage) ?? []))],
      references: [...new Set(concept.references)].filter(rare),
      topics: [concept.topics.primary, ...(concept.topics.also ?? [])],
    }
  })

  const reasons = {
    passage: (id: string) => {
      const passage = lookup(index, 'passage', id)
      const work = passage && lookup(index, 'work', passage.work)
      return `Both quote ${passage && work ? passageLabel(passage, work) : id}`
    },
    work: (slug: string) => {
      const work = lookup(index, 'work', slug)
      return `Both quote the ${work ? displayName({ term: work.title }) : slug}`
    },
    reference: (id: string) => {
      const reference = lookup(index, 'reference', id)
      return `Both cite ${reference ? referenceLabel(reference) : id}`
    },
    topic: (slug: string) =>
      `Both are in the topic “${lookup(index, 'topic', slug)?.name.english ?? slug}”`,
  } satisfies Record<RelationKind, (via: string) => string>

  const related = new Map<Slug, Relation[]>()
  for (const mine of shared) {
    const relations: Relation[] = []
    for (const theirs of shared) {
      if (theirs === mine) continue
      const passages = inBoth(mine.passages, theirs.passages)
      // A shared passage already says both quote its work: the work counts only without one.
      const quotedTogether = new Set(passages.map(workOf))
      const byKind: Record<RelationKind, readonly string[]> = {
        passage: passages,
        work: inBoth(mine.works, theirs.works).filter((work) => !quotedTogether.has(work)),
        reference: inBoth(mine.references, theirs.references),
        topic: inBoth(mine.topics, theirs.topics),
      }
      for (const kind of RELATION_STRENGTH)
        for (const via of byKind[kind])
          relations.push({ concept: theirs.slug, kind, via, reason: reasons[kind](via) })
    }
    related.set(mine.slug, relations)
  }
  return related
}
