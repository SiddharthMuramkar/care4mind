import type { ContentGraph, Relation } from '../graph'
import type { Block, ConceptRecord, Slug } from '../schema'
import type {
  ConceptCard,
  ConceptView,
  LinkedWork,
  QuestionnaireCard,
  RelatedConcept,
} from '../types'
import { RELATION_STRENGTH } from '../types'
import { conceptQuotes, sectionViews, tocOf, topicRef, type Owner } from './blocks'
import { byName, carriedOver, must, nameCopy, present } from './common'
import { hrefFor } from './href'
import { asciiSpellings, displayName, passageLabel } from '../names'
import { compareOrder, verseView, workRef } from './passage'
import { questionnaireCard } from './questionnaire'
import { citationMap, numberedReferences } from './reference'
import { conceptRef } from './refs'

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

/** The Concepts related to this one (D06), strongest relation first, then by name. */
function relatedConcepts(record: ConceptRecord, graph: ContentGraph): RelatedConcept[] {
  const byConcept = new Map<Slug, Relation[]>()
  for (const relation of graph.related(record.slug)) {
    const list = byConcept.get(relation.concept)
    if (list) list.push(relation)
    else byConcept.set(relation.concept, [relation])
  }
  const strongest = (relations: readonly Relation[]) =>
    Math.min(...relations.map((relation) => RELATION_STRENGTH.indexOf(relation.kind)))
  return [...byConcept]
    .map(([slug, relations]) => ({
      card: conceptCard(must(graph, 'concept', slug), graph),
      relations,
    }))
    .sort(
      (a, b) => strongest(a.relations) - strongest(b.relations) || byName(a.card.name, b.card.name),
    )
    .map(({ card, relations }) => ({
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

/** Its own Questionnaire first, then every other that lists the Concept, in source order. */
function linkedQuestionnaires(record: ConceptRecord, graph: ContentGraph): QuestionnaireCard[] {
  const own = record.questionnaire === undefined ? [] : [record.questionnaire]
  const listing = graph
    .records('questionnaire')
    .filter((questionnaire) => questionnaire.concepts.includes(record.slug))
    .map((questionnaire) => questionnaire.slug)
  return [...new Set([...own, ...listing])].map((slug) =>
    questionnaireCard(must(graph, 'questionnaire', slug), graph),
  )
}

/** The Concepts before and after this one in its primary topic, alphabetically (settled rule 16). */
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
export function conceptView(record: ConceptRecord, graph: ContentGraph): ConceptView {
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
      questionnaires: linkedQuestionnaires(record, graph),
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
