/**
 * The search corpus (design A4, D10): one document per Concept, term, glossary entry, work,
 * passage, Reference, library item, Questionnaire, topic and page. The front-end-site search
 * engine weighs the fields: names 10, title 8, keywords 4, people 4, excerpt 1.
 */
import { capitalise } from '@/lib/text'

import type { ContentGraph } from '../graph'
import type {
  Block,
  ConceptRecord,
  PassageRecord,
  SanskritName,
  TermBlock,
  TopicRecord,
  WorkRecord,
} from '../schema'
import type { SearchDocument } from '../types'
import { conceptQuotes, termsIn } from '../views/blocks'
import { must } from '../views/common'
import { hrefFor } from '../views/href'
import {
  asciiSpellings,
  authorNames,
  displayName,
  passageLabel,
  referenceLabel,
} from '../views/names'
import { questionnaireHref } from '../views/refs'

const EXCERPT = 300

/** At most 300 characters of real text, cut at a word and marked with an ellipsis if cut. */
function excerpt(text: string | undefined): string {
  const flat = (text ?? '').replace(/\s+/g, ' ').trim()
  if (flat.length <= EXCERPT) return flat
  const cut = flat.slice(0, EXCERPT - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > 0 ? cut.slice(0, space) : cut).trimEnd()}…`
}

/** The strings, once each, leaving out empty ones. */
function unique(strings: readonly (string | undefined)[]): string[] {
  return [...new Set(strings.filter((s): s is string => s !== undefined && s !== ''))]
}

/** Every spelling of a Sanskrit name: IAST, Devanagari, then its plain-keyboard spellings. */
function spellingsOf(name: SanskritName): string[] {
  return unique([name.iast, name.devanagari, ...asciiSpellings(name)])
}

/** A work's short form, from its plain title's initials: Yoga Sutra → YS. None for one word. */
function abbreviation(work: WorkRecord): string | undefined {
  const words = (work.title.ascii[0] ?? work.title.iast).split(/[\s-]+/).filter(Boolean)
  return words.length > 1 ? words.map((word) => word.charAt(0).toUpperCase()).join('') : undefined
}

/** A passage by its locator, each way a reader may write it: "YS 1.30", "Yoga Sutra 1.30". */
function locatorForms(passage: PassageRecord, work: WorkRecord): string[] {
  const short = abbreviation(work)
  return unique([
    short && `${short} ${passage.locator}`,
    passageLabel(passage, work),
    ...work.title.ascii.map((title) => `${title} ${passage.locator}`),
  ])
}

/** The first running text in a list of blocks: a paragraph, or a list's first item. */
function firstText(blocks: readonly Block[]): string | undefined {
  for (const block of blocks) {
    if (block.kind === 'paragraph') return block.text
    if (block.kind === 'list' && block.items[0] !== undefined) return block.items[0]
    if (block.kind === 'term') {
      const inner = firstText(block.blocks)
      if (inner !== undefined) return inner
    }
  }
  return undefined
}

function conceptDocuments(concept: ConceptRecord, graph: ContentGraph): SearchDocument[] {
  const title = displayName(concept.name)
  const { term, english } = concept.name
  const passages = unique(conceptQuotes(concept).map((quote) => quote.passage)).map((id) =>
    must(graph, 'passage', id),
  )
  const works = unique(passages.map((passage) => passage.work)).map((slug) =>
    must(graph, 'work', slug),
  )
  const topics = [concept.topics.primary, ...(concept.topics.also ?? [])].map(
    (slug) => must(graph, 'topic', slug).name.english,
  )
  const own: SearchDocument = {
    id: `concept:${concept.slug}`,
    kind: 'concept',
    title,
    href: hrefFor({ kind: 'concept', id: concept.slug }),
    names: term ? spellingsOf(term) : unique([english]),
    keywords: unique([
      term ? english : undefined,
      ...topics,
      ...works.flatMap((work) => [work.title.iast, ...work.title.ascii, work.title.english]),
      ...passages.flatMap((passage) => locatorForms(passage, must(graph, 'work', passage.work))),
    ]),
    // A Concept's people are the authors it cites, so "Tomar" finds the Concepts citing Tomar.
    people: unique(
      concept.references.flatMap((id) => authorNames(must(graph, 'reference', id).authors ?? '')),
    ),
    excerpt: excerpt(concept.summary),
  }

  const terms = concept.sections
    .flatMap((section) => termsIn(section.blocks))
    .map((block) =>
      termDocument(
        block,
        `term:${concept.slug}#${block.id}`,
        hrefFor({ kind: 'concept', id: concept.slug, anchor: block.id }),
        title,
      ),
    )
  return [own, ...terms]
}

/** A term's document, found under every spelling and linking to its anchor on its parent's page. */
function termDocument(block: TermBlock, id: string, href: string, parent: string): SearchDocument {
  return {
    id,
    kind: 'term',
    title: displayName(block),
    href,
    parent,
    names: spellingsOf(block.term),
    keywords: unique([block.gloss]),
    people: [],
    excerpt: excerpt(firstText(block.blocks)),
  }
}

/** The terms a topic's introduction explains (the values topic's yama and niyama). */
function topicTermDocuments(topic: TopicRecord): SearchDocument[] {
  return (topic.intro?.sections ?? [])
    .flatMap((section) => termsIn(section.blocks))
    .map((block) =>
      termDocument(
        block,
        `term:topic/${topic.slug}#${block.id}`,
        hrefFor({ kind: 'topic', id: topic.slug, anchor: block.id }),
        topic.name.english,
      ),
    )
}

/** The search corpus: every document the site's search can find, built from the content. */
export function searchDocuments(graph: ContentGraph): SearchDocument[] {
  const concepts = graph.records('concept').flatMap((concept) => conceptDocuments(concept, graph))

  const glossary = graph.records('glossary').map((entry): SearchDocument => ({
    id: `glossary:${entry.slug}`,
    kind: 'glossary',
    title: entry.name.iast ? capitalise(entry.name.iast) : entry.name.ascii,
    href: hrefFor({ kind: 'glossary', id: entry.slug }),
    names: unique([entry.name.iast, entry.name.devanagari, entry.name.ascii]),
    keywords: [],
    people: [],
    excerpt: excerpt(entry.definition),
  }))

  const works = graph.records('work').map((work): SearchDocument => ({
    id: `work:${work.slug}`,
    kind: 'work',
    title: displayName({ term: work.title }),
    href: hrefFor({ kind: 'work', id: work.slug }),
    names: unique([work.title.iast, work.title.devanagari, ...work.title.ascii]),
    keywords: unique([abbreviation(work), work.title.english]),
    people: unique([work.attribution]),
    excerpt: '',
  }))

  const passages = graph.records('passage').map((passage): SearchDocument => {
    const work = must(graph, 'work', passage.work)
    return {
      id: `passage:${passage.id}`,
      kind: 'passage',
      title: passageLabel(passage, work),
      href: hrefFor({ kind: 'passage', id: passage.id }),
      parent: displayName({ term: work.title }),
      names: [],
      keywords: locatorForms(passage, work),
      people: [],
      excerpt: excerpt(
        passage.translations[0]?.text ??
          (passage.transliteration?.lines ?? passage.devanagari).join(' '),
      ),
    }
  })

  const references = graph.records('reference').map((reference): SearchDocument => ({
    id: `reference:${reference.id}`,
    kind: 'reference',
    title: reference.title,
    href: hrefFor({ kind: 'reference', id: reference.id }),
    names: [],
    keywords: unique([referenceLabel(reference), reference.container, reference.publisher]),
    people: authorNames(reference.authors ?? ''),
    excerpt: excerpt(reference.asCited[0]),
  }))

  const libraryItems = graph.records('resource-list').flatMap((list) =>
    list.groups.flatMap((group) =>
      group.items.map((item, index): SearchDocument => {
        const where = {
          id: `library-item:${list.slug}/${group.id}/${index}`,
          kind: 'library-item' as const,
          href: hrefFor({ kind: 'resource-list', id: list.slug, anchor: group.id }),
          parent: list.title,
          names: [],
        }
        if (item.type === 'course')
          return {
            ...where,
            title: item.name,
            keywords: unique([item.provider, group.heading]),
            people: [],
            excerpt: excerpt(item.description),
          }
        const reference = must(graph, 'reference', item.reference)
        return {
          ...where,
          title: reference.title,
          keywords: unique([group.heading]),
          people: authorNames(reference.authors ?? ''),
          excerpt: excerpt(item.annotation),
        }
      }),
    ),
  )

  const questionnaires = graph.records('questionnaire').map((questionnaire): SearchDocument => {
    const concepts = questionnaire.concepts.map((slug) => must(graph, 'concept', slug))
    return {
      id: `questionnaire:${questionnaire.slug}`,
      kind: 'questionnaire',
      title: questionnaire.title,
      href: questionnaireHref(questionnaire),
      names: [],
      keywords: unique([
        questionnaire.sourceTitle === questionnaire.title ? undefined : questionnaire.sourceTitle,
        ...concepts.map((concept) => displayName(concept.name)),
        ...concepts.map((concept) => must(graph, 'topic', concept.topics.primary).name.english),
      ]),
      people: [],
      excerpt: excerpt(questionnaire.summary ?? questionnaire.purpose?.[0]),
    }
  })

  const topics = graph.records('topic').map((topic): SearchDocument => ({
    id: `topic:${topic.slug}`,
    kind: 'topic',
    title: topic.name.english,
    href: hrefFor({ kind: 'topic', id: topic.slug }),
    names: topic.name.term ? spellingsOf(topic.name.term) : [],
    keywords: [],
    people: [],
    excerpt: excerpt(
      topic.intro?.sections.map((section) => firstText(section.blocks)).find(Boolean),
    ),
  }))

  const topicTerms = graph.records('topic').flatMap(topicTermDocuments)

  const pages = [
    ...graph.records('page').map((page): SearchDocument => ({
      id: `page:${page.slug}`,
      kind: 'page',
      title: page.title,
      href: hrefFor({ kind: 'page', id: page.slug }),
      names: [],
      keywords: unique(page.sections.map((section) => section.heading)),
      people: [],
      excerpt: excerpt(page.summary),
    })),
    ...graph.records('resource-list').map((list): SearchDocument => ({
      id: `resource-list:${list.slug}`,
      kind: 'page',
      title: list.title,
      href: hrefFor({ kind: 'resource-list', id: list.slug }),
      names: [],
      keywords: unique(list.groups.map((group) => group.heading)),
      people: [],
      excerpt: '',
    })),
  ]

  return [
    ...concepts,
    ...glossary,
    ...works,
    ...passages,
    ...references,
    ...libraryItems,
    ...questionnaires,
    ...topics,
    ...topicTerms,
    ...pages,
  ]
}
