import type { Features } from '@/config/features'

import { introTopicsInSections, quotesOf, type ContentGraph, type Relation } from '../graph'
import type { ConceptRecord, Slug } from '../schema'
import {
  RELATION_STRENGTH,
  type BlockView,
  type ConceptCard,
  type ConceptView,
  type LinkedWork,
  type QuestionnaireCard,
  type RelatedConcept,
  type SectionView,
  type VerseView,
} from '../types'
import { glanceOf, sectionViews, tocOf, type Owner } from './blocks'
import { byName, carriedOver, must, nameCopy, present } from './common'
import { hrefFor } from './href'
import { asciiSpellings, displayName, passageLabel } from '../names'
import { compareOrder, verseView } from './passage'
import { questionnaireCard } from './questionnaire'
import { citationMap, numberedReferences } from './reference'
import { conceptRef, topicRef, workRef } from './refs'

/** A Concept in brief, its reading time already counted from its page's sections and verses. */
function cardWith(record: ConceptRecord, graph: ContentGraph, readingMinutes: number): ConceptCard {
  return {
    ...conceptRef(record),
    ...present({
      term: record.name.term && nameCopy(record.name.term),
      english: record.name.english,
    }),
    summary: record.summary,
    topic: topicRef(must(graph, 'topic', record.topics.primary)),
    readingMinutes,
  }
}

/** A Concept in brief, for lists and cards: the same count its page shows, from the same words. */
export function conceptCard(record: ConceptRecord, graph: ContentGraph): ConceptCard {
  const owner: Owner = { kind: 'concept', id: record.slug }
  return cardWith(
    record,
    graph,
    readingMinutesOf(
      record,
      sectionViews(record.sections, owner, graph),
      record.verses.map((quote) => verseView(quote, graph)),
    ),
  )
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
  for (const { passage } of quotesOf(record)) {
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
  const listing = graph.questionnairesListing(record.slug)
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

/** The in-text citations on a Concept's page: its own, then those of any introduction it shows. */
function citationsOnPage(record: ConceptRecord, graph: ContentGraph) {
  const topics = introTopicsInSections(record.sections)
  return [
    ...graph.citations('concept', record.slug),
    ...topics.flatMap((topic) => graph.citations('topic', topic)),
  ]
}

const WORDS_PER_MINUTE = 200

/** The words in a list of blocks' body text, nested terms and shared introductions included. */
function wordsInBlocks(blocks: readonly BlockView[]): number {
  const count = (texts: readonly string[]) =>
    texts.reduce((words, text) => words + text.split(/\s+/).filter(Boolean).length, 0)
  return blocks.reduce((words, block) => {
    switch (block.kind) {
      case 'paragraph':
        return words + count([block.text])
      case 'list':
        return words + count(block.items)
      case 'term':
        return words + wordsInBlocks(block.blocks)
      case 'table':
        return (
          words +
          block.rows.reduce(
            (rowWords, row) =>
              rowWords + count(row.cells) + count(typeof row.head === 'string' ? [row.head] : []),
            0,
          )
        )
      case 'verse':
        return words + count([block.verse.translation, block.verse.meaning ?? ''])
      case 'topic-intro':
        return (
          words +
          block.sections.reduce((sectionWords, s) => sectionWords + wordsInBlocks(s.blocks), 0)
        )
    }
  }, 0)
}

/** About how long a Concept's page takes to read: its lead, sections and verses at 200 words a minute. */
function readingMinutesOf(
  record: ConceptRecord,
  sections: readonly SectionView[],
  verses: readonly VerseView[],
): number {
  const words =
    [record.summary, record.whyItMatters ?? ''].join(' ').split(/\s+/).filter(Boolean).length +
    sections.reduce((total, section) => total + wordsInBlocks(section.blocks), 0) +
    verses.reduce(
      (total, verse) =>
        total + `${verse.translation} ${verse.meaning ?? ''}`.split(/\s+/).filter(Boolean).length,
      0,
    )
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

/** A Concept's page: the record with every id resolved. */
export function conceptView(
  record: ConceptRecord,
  graph: ContentGraph,
  flags: Features,
): ConceptView {
  const owner: Owner = { kind: 'concept', id: record.slug }
  const sections = sectionViews(record.sections, owner, graph)
  const verses = record.verses.map((quote) => verseView(quote, graph))
  return {
    ...cardWith(record, graph, readingMinutesOf(record, sections, verses)),
    spellings: record.name.term ? asciiSpellings(record.name.term) : [],
    ...present({ whyItMatters: record.whyItMatters }),
    glance: glanceOf(record.sections, owner),
    secondaryTopics: (record.topics.also ?? []).map((slug) => topicRef(must(graph, 'topic', slug))),
    verses,
    sections,
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
