import type { Citation, ContentGraph } from '../graph'
import type { ReferenceRecord } from '../schema'
import type { NumberedReference, ReferenceView } from '../types'
import { byName, carriedOver, must, present } from './common'
import { hrefFor, referenceAnchor } from './href'
import { referenceLabel } from '../names'
import { recordRef } from './refs'

/** A Reference with every field, its anchor and every record that cites it. */
export function referenceView(record: ReferenceRecord, graph: ContentGraph): ReferenceView {
  return {
    id: record.id,
    type: record.type,
    ...present({
      authors: record.authors,
      year: record.year,
      container: record.container,
      publisher: record.publisher,
      volume: record.volume,
      issue: record.issue,
      pages: record.pages,
      edition: record.edition,
      doi: record.doi,
      url: record.url,
      noStableLink: record.noStableLink,
    }),
    title: record.title,
    asCited: [...record.asCited],
    label: referenceLabel(record),
    anchor: referenceAnchor(record.id),
    href: hrefFor({ kind: 'reference', id: record.id }),
    citedIn: graph.citedBy(record.id).map((key) => recordRef(key, graph)),
    ...carriedOver(record),
  }
}

/** The order of a list of References: by first author, or title where there is none, then year. */
export function compareReferences(a: ReferenceRecord, b: ReferenceRecord): number {
  return (
    byName(a.authors ?? a.title, b.authors ?? b.title) ||
    byName(a.year ?? '', b.year ?? '') ||
    byName(a.title, b.title)
  )
}

/** A page's own reference list, numbered in its order. */
export function numberedReferences(
  ids: readonly string[],
  graph: ContentGraph,
): NumberedReference[] {
  return ids.map((id, index) => ({
    number: index + 1,
    ...referenceView(must(graph, 'reference', id), graph),
  }))
}

/**
 * The in-text citations that resolve, as written inside their parentheses ("Tomar, 2024"), each
 * to its Reference id. The first of two identical citations decides.
 */
export function citationMap(citations: readonly Citation[]): Record<string, string> {
  const resolved = new Map<string, string>()
  for (const { text, reference } of citations)
    if (reference !== undefined && !resolved.has(text)) resolved.set(text, reference)
  return Object.fromEntries(resolved)
}
