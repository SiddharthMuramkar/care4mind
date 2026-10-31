/**
 * The Concept map's data (D06, D20): the Concepts as nodes with their topics, and an edge for
 * each passage, work or rarely cited Reference two Concepts share. Topics make no edges: they
 * are the map's sectors. The map's layout is the front end's to add.
 */
import type { ContentGraph } from '../graph'
import { displayName } from '../names'
import type { ConceptGraph, ConceptGraphEdge } from '../types'
import { byName } from '../views/common'
import { conceptRef } from '../views/refs'

const EDGE_KINDS: readonly ConceptGraphEdge['kind'][] = ['passage', 'work', 'reference']

/** The Concept map's nodes, by topic then name, and its edges, each pair's facts once. */
export function conceptGraph(graph: ContentGraph): ConceptGraph {
  const order = new Map(graph.records('topic').map((topic) => [topic.slug, topic.order]))
  const concepts = [...graph.records('concept')].sort(
    (a, b) =>
      (order.get(a.topics.primary) ?? 0) - (order.get(b.topics.primary) ?? 0) ||
      byName(displayName(a.name), displayName(b.name)) ||
      byName(a.slug, b.slug),
  )
  const position = new Map(concepts.map((concept, index) => [concept.slug, index]))
  const at = (slug: string) => position.get(slug) ?? -1

  const edges: ConceptGraphEdge[] = []
  for (const concept of concepts)
    for (const relation of graph.related(concept.slug)) {
      if (relation.kind === 'topic' || at(relation.concept) <= at(concept.slug)) continue
      const { kind, via, reason } = relation
      edges.push({ source: concept.slug, target: relation.concept, kind, via, reason })
    }

  return {
    nodes: concepts.map((concept) => ({
      ...conceptRef(concept),
      topic: concept.topics.primary,
      topics: [concept.topics.primary, ...(concept.topics.also ?? [])],
    })),
    edges: edges.sort(
      (a, b) =>
        at(a.source) - at(b.source) ||
        at(a.target) - at(b.target) ||
        EDGE_KINDS.indexOf(a.kind) - EDGE_KINDS.indexOf(b.kind),
    ),
  }
}
