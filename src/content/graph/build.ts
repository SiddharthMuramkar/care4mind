/**
 * Builds the graph once per source (a memoised promise) and answers every question about it from
 * indexes computed then: the reverse links, each record's in-text citations and the relations.
 */
import {
  CONTENT_KINDS,
  idOf,
  type ContentKind,
  type ContentRecord,
  type RecordOf,
  type Slug,
} from '../schema'
import { localSource, type ContentSource } from '../source'
import { citationsIn, textsIn, type Citation } from './citations'
import {
  DanglingIdError,
  danglingLinks,
  lookup,
  quotesOf,
  referencesOf,
  type RecordKey,
} from './links'
import { relationsOf, type Relation } from './relations'

/** A place a passage is quoted, with the translation the quote shows. */
export interface Quotation {
  record: RecordKey
  translation?: string
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
   * Every fact relating a Concept to another, by the other Concept in source order, then by
   * kind, then in the Concept's own order: shared passages, then works it quotes from with no
   * passage in common, then rarely cited References, then topics.
   */
  related(concept: Slug): readonly Relation[]
}

/** Builds the graph from a source, refusing duplicate and dangling ids. */
export async function buildGraph(source: ContentSource): Promise<ContentGraph> {
  const byKind = new Map<ContentKind, readonly ContentRecord[]>(
    await Promise.all(
      CONTENT_KINDS.map(async (kind) => [kind, await source.records(kind)] as const),
    ),
  )

  const index = new Map<ContentKind, Map<string, ContentRecord>>()
  const duplicates: string[] = []
  for (const [kind, records] of byKind) {
    const ids = new Map<string, ContentRecord>()
    for (const record of records) {
      const id = idOf(record)
      if (ids.has(id)) duplicates.push(`${kind} “${id}”`)
      ids.set(id, record)
    }
    index.set(kind, ids)
  }
  if (duplicates.length > 0)
    throw new Error(`Two records of the same kind share an id: ${duplicates.join(', ')}`)

  const all = [...byKind.values()].flat()
  const problems = all.flatMap((record) => danglingLinks(record, index))
  if (problems.length > 0) throw new DanglingIdError(problems)

  const recordsOf = <K extends ContentKind>(kind: K) =>
    (byKind.get(kind) ?? []) as readonly RecordOf<K>[]
  const keyOf = (record: ContentRecord): RecordKey => ({ kind: record.kind, id: idOf(record) })
  const add = <T>(map: Map<string, T[]>, key: string, value: T) => {
    const list = map.get(key)
    if (list) list.push(value)
    else map.set(key, [value])
  }

  const citedBy = new Map<string, RecordKey[]>()
  const quotedIn = new Map<string, Quotation[]>()
  const quotingWork = new Map<string, Slug[]>()
  const inTopic = new Map<string, { primary: Slug[]; also: Slug[] }>()
  const citations = new Map<string, Citation[]>()

  for (const record of all) {
    for (const reference of new Set(referencesOf(record))) add(citedBy, reference, keyOf(record))

    const seen = new Set<string>()
    for (const { passage, translation } of quotesOf(record)) {
      if (seen.has(`${passage} ${translation}`)) continue
      seen.add(`${passage} ${translation}`)
      const by = keyOf(record)
      add(
        quotedIn,
        passage,
        translation === undefined ? { record: by } : { record: by, translation },
      )
    }
  }

  const topicLists = (slug: Slug) => {
    const lists = inTopic.get(slug) ?? { primary: [], also: [] }
    inTopic.set(slug, lists)
    return lists
  }

  for (const concept of recordsOf('concept')) {
    const works = new Set(
      quotesOf(concept).map(({ passage }) => lookup(index, 'passage', passage)?.work),
    )
    for (const work of works) if (work !== undefined) add(quotingWork, work, concept.slug)

    topicLists(concept.topics.primary).primary.push(concept.slug)
    for (const slug of concept.topics.also ?? []) topicLists(slug).also.push(concept.slug)

    const own = concept.references.flatMap((id) => lookup(index, 'reference', id) ?? [])
    const texts = [
      concept.summary,
      ...concept.verses.flatMap((verse) => (verse.meaning === undefined ? [] : [verse.meaning])),
      ...textsIn(concept.sections),
    ]
    citations.set(`concept/${concept.slug}`, citationsIn(texts, own))
  }

  for (const topic of recordsOf('topic')) {
    if (!topic.intro) continue
    const own = topic.intro.references.flatMap((id) => lookup(index, 'reference', id) ?? [])
    citations.set(`topic/${topic.slug}`, citationsIn(textsIn(topic.intro.sections), own))
  }

  const related = relationsOf(recordsOf('concept'), index, citedBy)

  return {
    records: recordsOf,
    record: (kind, id) => lookup(index, kind, id),
    citedBy: (reference) => citedBy.get(reference) ?? [],
    quotedIn: (passage) => quotedIn.get(passage) ?? [],
    conceptsInTopic: (topic) => inTopic.get(topic) ?? { primary: [], also: [] },
    conceptsQuotingWork: (work) => quotingWork.get(work) ?? [],
    citations: (kind, id) => citations.get(`${kind}/${id}`) ?? [],
    related: (concept) => related.get(concept) ?? [],
  }
}

const graphs = new WeakMap<ContentSource, Promise<ContentGraph>>()

/** The graph of a source, built the first time it is asked for and shared after that. */
export function graphFor(source: ContentSource): Promise<ContentGraph> {
  let graph = graphs.get(source)
  if (!graph) {
    graph = buildGraph(source)
    graphs.set(source, graph)
  }
  return graph
}

/** The graph of the site's own content: built once per process. */
export function contentGraph(): Promise<ContentGraph> {
  return graphFor(localSource)
}
