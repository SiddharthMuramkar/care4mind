import type { Features } from '@/config/features'

import type { ContentGraph, Relation } from '../graph'
import type { Block, ConceptRecord, Slug } from '../schema'
import {
  RELATION_STRENGTH,
  type ConceptCard,
  type ConceptView,
  type LinkedWork,
  type QuestionnaireCard,
  type RelatedConcept,
} from '../types'
import { conceptQuotes, sectionViews, tocOf, topicRef, type Owner } from './blocks'
import { byName, carriedOver, must, nameCopy, present } from './common'
import { hrefFor } from './href'
import { asciiSpellings, displayName, passageLabel } from '../names'
import { compareOrder, verseView, workRef } from './passage'
import { questionnaireCard } from './questionnaire'
import { citationMap, numberedReferences } from './reference'
import { conceptRef } from './refs'

const wordsIn = (text: string) => text.split(/\s+/).filter(Boolean).length

function blockWords(blocks: readonly Block[]): number {
  return blocks.reduce((words, block) => {
    switch (block.kind) {
      case 'paragraph':
        return words + wordsIn(block.text)
      case 'list':
        return words + block.items.reduce((sum, item) => sum + wordsIn(item), 0)
      case 'term':
        return words + wordsIn(block.gloss ?? '') + blockWords(block.blocks)
      case 'table':
        return (
          words +
          wordsIn(block.caption) +
          block.columns.reduce((sum, column) => sum + wordsIn(column), 0) +
          block.rows.reduce(
            (sum, row) =>
              sum +
              (typeof row.head === 'string' ? wordsIn(row.head) : 0) +
              row.cells.reduce((cellSum, cell) => cellSum + wordsIn(cell), 0),
            0,
          )
        )
      case 'verse':
        return words + wordsIn(block.quote.meaning ?? '')
      case 'topic-intro':
        return words
    }
  }, 0)
}

/** How long a Concept's page takes to read, from its own words at a plain reading pace. */
export function readingMinutes(record: ConceptRecord): number {
  const words =
    wordsIn(record.summary) +
    record.sections.reduce(
      (sum, section) => sum + wordsIn(section.heading) + blockWords(section.blocks),
      0,
    )
  return Math.max(1, Math.ceil(words / 200))
}

/** A Concept in brief, for lists and cards. */
export function conceptCard(record: ConceptRecord, graph: ContentGraph): ConceptCard {
  return {
    ...conceptRef(record),
    ...present({
      term: record.name.term && nameCopy(record.name.term),
      english: record.name.english,
    }),
    summary: record.summary,
    topic: topicRef(must(graph, 'topic', record.topics.primary)),
  }
}

// Below this many, a Concept's page would look bare, so shared-text-only links fill it back up.
const MIN_RELATED = 3

/**
 * Drops the Concepts whose only link is a shared traditional text, which is too weak on its own,
 * unless that leaves fewer than MIN_RELATED: then the strongest of them come back up to it.
 */
function keepRelated<T extends { relations: readonly Relation[] }>(sorted: readonly T[]): T[] {
  const workOnly = (group: T) => group.relations.every((relation) => relation.kind === 'work')
  const kept = new Set(sorted.filter((group) => !workOnly(group)))
  for (const group of sorted) {
    if (kept.size >= MIN_RELATED) break
    kept.add(group)
  }
  return sorted.filter((group) => kept.has(group))
}

/** The Concepts related to this one, strongest relation first, then by name. */
function relatedConcepts(record: ConceptRecord, graph: ContentGraph): RelatedConcept[] {
  const byConcept = new Map<Slug, Relation[]>()
  for (const relation of graph.related(record.slug)) {
    const list = byConcept.get(relation.concept)
    if (list) list.push(relation)
    else byConcept.set(relation.concept, [relation])
  }
  const strongest = (relations: readonly Relation[]) =>
    Math.min(...relations.map((relation) => RELATION_STRENGTH.indexOf(relation.kind)))
  const sorted = [...byConcept]
    .map(([slug, relations]) => ({
      card: conceptCard(must(graph, 'concept', slug), graph),
      relations,
    }))
    .sort(
      (a, b) => strongest(a.relations) - strongest(b.relations) || byName(a.card.name, b.card.name),
    )
  return keepRelated(sorted).map(({ card, relations }) => ({
    ...card,
    reasons: relations.map((relation) => ({ kind: relation.kind, text: relation.reason })),
  }))
}

/** The works a Concept quotes, in the order it first quotes each, with their passages in order. */
function linkedWorks(record: ConceptRecord, graph: ContentGraph): LinkedWork[] {
  const quoted = new Map<Slug, Set<string>>()
  for (const { passage } of conceptQuotes(record)) {
    const work = must(graph, 'passage', passage).work
    const passages = quoted.get(work) ?? new Set<string>()
    quoted.set(work, passages.add(passage))
  }
  return [...quoted].map(([slug, ids]) => {
    const work = must(graph, 'work', slug)
    const passages = [...ids]
      .map((id) => must(graph, 'passage', id))
      .sort((a, b) => compareOrder(a.order, b.order))
    return {
      ...workRef(work),
      passages: passages.map((passage) => ({
        id: passage.id,
        locator: passage.locator,
        label: passageLabel(passage, work),
        href: hrefFor({ kind: 'passage', id: passage.id }),
      })),
    }
  })
}

/** Its own Questionnaire first, then every other that lists the Concept, in id order. */
function linkedQuestionnaires(
  record: ConceptRecord,
  graph: ContentGraph,
  flags: Features,
): QuestionnaireCard[] {
  const own = record.questionnaire === undefined ? [] : [record.questionnaire]
  const listing = graph
    .records('questionnaire')
    .filter((questionnaire) => questionnaire.concepts.includes(record.slug))
    .map((questionnaire) => questionnaire.slug)
  return [...new Set([...own, ...listing])].map((slug) =>
    questionnaireCard(must(graph, 'questionnaire', slug), graph, flags),
  )
}

/** The Concepts before and after this one in its primary topic, alphabetically. */
function neighbours(record: ConceptRecord, graph: ContentGraph) {
  const inTopic = graph
    .conceptsInTopic(record.topics.primary)
    .primary.map((slug) => must(graph, 'concept', slug))
    .sort((a, b) => byName(displayName(a.name), displayName(b.name)))
  const at = inTopic.findIndex((concept) => concept.slug === record.slug)
  const card = (concept: ConceptRecord | undefined): ConceptCard | undefined =>
    concept && conceptCard(concept, graph)
  return present({ previous: card(inTopic[at - 1]), next: card(inTopic[at + 1]) })
}

/** The topics whose shared introduction a list of blocks shows. */
function introTopicsIn(blocks: readonly Block[]): string[] {
  return blocks.flatMap((block) =>
    block.kind === 'topic-intro'
      ? [block.topic]
      : block.kind === 'term'
        ? introTopicsIn(block.blocks)
        : [],
  )
}

/** The in-text citations on a Concept's page: its own, then those of any introduction it shows. */
function citationsOnPage(record: ConceptRecord, graph: ContentGraph) {
  const topics = record.sections.flatMap((section) => introTopicsIn(section.blocks))
  return [
    ...graph.citations('concept', record.slug),
    ...topics.flatMap((topic) => graph.citations('topic', topic)),
  ]
}

/** A Concept's page: the record with every id resolved. */
export function conceptView(
  record: ConceptRecord,
  graph: ContentGraph,
  flags: Features,
): ConceptView {
  const owner: Owner = { kind: 'concept', id: record.slug }
  return {
    ...conceptCard(record, graph),
    spellings: record.name.term ? asciiSpellings(record.name.term) : [],
    secondaryTopics: (record.topics.also ?? []).map((slug) => topicRef(must(graph, 'topic', slug))),
    verses: record.verses.map((quote) => verseView(quote, graph)),
    sections: sectionViews(record.sections, owner, graph),
    toc: tocOf(record.sections, owner),
    references: numberedReferences(record.references, graph),
    citations: citationMap(citationsOnPage(record, graph)),
    linked: {
      related: relatedConcepts(record, graph),
      works: linkedWorks(record, graph),
      questionnaires: linkedQuestionnaires(record, graph, flags),
      sections: record.sections.flatMap((section) =>
        section.role === undefined
          ? []
          : [
              {
                id: section.id,
                heading: section.heading,
                role: section.role,
                href: hrefFor({ ...owner, anchor: section.id }),
              },
            ],
      ),
    },
    ...neighbours(record, graph),
    external: (record.external ?? []).map((link) => ({ ...link })),
    ...carriedOver(record),
  }
}
