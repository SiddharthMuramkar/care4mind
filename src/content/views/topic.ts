import type { ContentGraph } from '../graph'
import type { TopicRecord } from '../schema'
import type { QuotedWork, TopicCard, TopicView } from '../types'
import { conceptQuotes, sectionViews, tocOf, topicRef, type Owner } from './blocks'
import { byName, carriedOver, must, nameCopy, present } from './common'
import { conceptCard } from './concept'
import { inReadingOrder, passageView, workRef } from './passage'
import { citationMap, numberedReferences } from './reference'

/** A topic in brief: its name, its place among the topics and how many Concepts it has. */
export function topicCard(record: TopicRecord, graph: ContentGraph): TopicCard {
  return {
    ...topicRef(record),
    ...present({ term: record.name.term && nameCopy(record.name.term) }),
    order: record.order,
    conceptCount: graph.conceptsInTopic(record.slug).primary.length,
  }
}

/** A topic's page: its Concepts, the verses they quote and its introduction, where it has one. */
export function topicView(record: TopicRecord, graph: ContentGraph): TopicView {
  const owner: Owner = { kind: 'topic', id: record.slug }
  const { primary, also } = graph.conceptsInTopic(record.slug)
  const cards = (slugs: readonly string[]) =>
    slugs
      .map((slug) => conceptCard(must(graph, 'concept', slug), graph))
      .sort((a, b) => byName(a.name, b.name))
  const quoted = new Set(
    primary.flatMap((slug) =>
      conceptQuotes(must(graph, 'concept', slug)).map(({ passage }) => passage),
    ),
  )
  const passages = inReadingOrder(
    [...quoted].map((id) => must(graph, 'passage', id)),
    graph,
  )
  const works = new Map<string, QuotedWork>()
  for (const passage of passages) {
    const work = works.get(passage.work) ?? {
      ...workRef(must(graph, 'work', passage.work)),
      verses: [],
    }
    works.set(passage.work, { ...work, verses: [...work.verses, passageView(passage, graph)] })
  }
  const intro = record.intro
  return {
    ...topicCard(record, graph),
    concepts: cards(primary),
    secondaryConcepts: cards(also),
    works: [...works.values()],
    ...(intro === undefined
      ? {}
      : {
          intro: {
            sections: sectionViews(intro.sections, owner, graph),
            toc: tocOf(intro.sections, owner),
            references: numberedReferences(intro.references, graph),
            citations: citationMap(graph.citations('topic', record.slug)),
            ...carriedOver(intro),
          },
        }),
  }
}
