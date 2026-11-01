import type { ContentGraph, RecordKey } from '../graph'
import type { ConceptRecord, QuestionnaireRecord } from '../schema'
import type { ConceptRef, RecordRef } from '../types'
import { must, present } from './common'
import { hrefFor } from './href'
import { displayName } from '../names'

/** A link to a Concept's page, with its name's language where the name is IAST. */
export function conceptRef(concept: ConceptRecord): ConceptRef {
  return {
    slug: concept.slug,
    name: displayName(concept.name),
    ...(concept.name.term ? { lang: 'sa-Latn' as const } : {}),
    href: hrefFor({ kind: 'concept', id: concept.slug }),
  }
}

/** Where a Questionnaire lives: its own page, or its anchor on the index when coming later. */
export function questionnaireHref(questionnaire: QuestionnaireRecord): string {
  return hrefFor({ kind: 'questionnaire', id: questionnaire.slug, status: questionnaire.status })
}

/** A link to a record that cites a Reference or quotes a passage, named as its page names it. */
export function recordRef({ kind, id }: RecordKey, graph: ContentGraph): RecordRef {
  switch (kind) {
    case 'concept': {
      const { name, lang, href } = conceptRef(must(graph, 'concept', id))
      return { kind, id, title: name, ...present({ lang }), href }
    }
    case 'topic':
      return {
        kind,
        id,
        title: must(graph, 'topic', id).name.english,
        href: hrefFor({ kind: 'topic', id }),
      }
    case 'questionnaire': {
      const questionnaire = must(graph, 'questionnaire', id)
      return { kind, id, title: questionnaire.title, href: questionnaireHref(questionnaire) }
    }
    case 'resource-list':
      return { kind, id, title: must(graph, kind, id).title, href: hrefFor({ kind, id }) }
    case 'page':
      return { kind, id, title: must(graph, kind, id).title, href: hrefFor({ kind, id }) }
    default:
      throw new Error(`A ${kind} neither cites a Reference nor quotes a passage.`)
  }
}
