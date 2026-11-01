import type { Features } from '@/config/features'

import type { ContentGraph } from '../graph'
import type { QuestionnaireRecord, QuestionnaireStatus } from '../schema'
import type {
  QuestionnaireCard,
  QuestionnaireFormView,
  QuestionnaireView,
  TopicRef,
} from '../types'
import { topicRef } from './blocks'
import { byName, carriedOver, must, present } from './common'
import { conceptCard } from './concept'
import { referenceView } from './reference'
import { conceptRef, questionnaireHref } from './refs'

/**
 * Whether a Questionnaire can be taken in this build (D16): a live one always, a preview one only
 * while `questionnairePreview` is on, and only if it has a form. Coming soon or later, never.
 */
export function canTake(record: QuestionnaireRecord, flags: Features): boolean {
  if (!record.form) return false
  return record.status === 'live' || (record.status === 'preview' && flags.questionnairePreview)
}

/** Those that can be taken first, then coming soon, then coming later. */
export const STATUS_ORDER: readonly QuestionnaireStatus[] = [
  'live',
  'preview',
  'coming-soon',
  'coming-later',
]

/** A Questionnaire in brief, with its Concepts and their primary topics. */
export function questionnaireCard(
  record: QuestionnaireRecord,
  graph: ContentGraph,
): QuestionnaireCard {
  const concepts = record.concepts.map((slug) => must(graph, 'concept', slug))
  const topics = new Map<string, TopicRef>()
  for (const concept of concepts) {
    const topic = concept.topics.primary
    if (!topics.has(topic)) topics.set(topic, topicRef(must(graph, 'topic', topic)))
  }
  return {
    slug: record.slug,
    title: record.title,
    sourceTitle: record.sourceTitle,
    status: record.status,
    ...present({ summary: record.summary }),
    anchor: record.slug,
    href: questionnaireHref(record),
    concepts: concepts.map(conceptRef),
    topics: [...topics.values()],
  }
}

/**
 * A Questionnaire's page: what it is for, its format and limitations and its sources. Nothing
 * held back, no scoring and no rights note: those stay in the record.
 */
export function questionnaireView(
  record: QuestionnaireRecord,
  graph: ContentGraph,
): QuestionnaireView {
  const reference = (id: string | undefined) =>
    id === undefined ? undefined : referenceView(must(graph, 'reference', id), graph)
  return {
    ...questionnaireCard(record, graph),
    concepts: record.concepts
      .map((slug) => conceptCard(must(graph, 'concept', slug), graph))
      .sort((a, b) => byName(a.name, b.name)),
    ...present({
      purpose: record.purpose && [...record.purpose],
      format: record.format && [...record.format],
      limitations: record.limitations && {
        items: [...record.limitations.items],
        status: record.limitations.status,
      },
      source: reference(record.source),
      candidateSource: reference(record.candidateSource),
    }),
    ...carriedOver(record),
  }
}

/**
 * A Questionnaire's form: its parts in order, each item with its options in the order the source
 * lists them (reversed where the source reverses them). Nothing about scoring.
 */
export function questionnaireFormView(
  record: QuestionnaireRecord & { form: NonNullable<QuestionnaireRecord['form']> },
): QuestionnaireFormView {
  const { responseSets, parts } = record.form
  return {
    slug: record.slug,
    title: record.title,
    parts: parts.map((part) => ({
      id: part.id,
      title: part.title,
      instructions: part.instructions,
      items: part.items.map((item) => {
        const options = [...(responseSets[item.responseSet] ?? [])]
        return {
          id: item.id,
          text: item.text,
          options: item.reversed ? options.reverse() : options,
        }
      }),
    })),
  }
}
