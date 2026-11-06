/**
 * The Concepts A–Z: every Concept, every term inside one or inside a topic's introduction,
 * and every glossary entry, by letter, sorted by name with diacritics ignored. A glossary entry
 * that names a Concept merges into that Concept's entry.
 */
import { stripDiacritics } from '@/lib/sanskrit'
import { capitalise } from '@/lib/text'

import { quotesInSections, quotesOf, termsInSections, type ContentGraph } from '../graph'
import type { ConceptRecord, GlossaryEntryRecord, Slug, TermBlock, TopicRecord } from '../schema'
import type { AzEntry, AzLetter } from '../types'
import { byName, must, present } from '../views/common'
import { hrefFor } from '../views/href'
import { asciiSpellings, displayName, glossOf } from '../names'
import { conceptRef } from '../views/refs'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const KIND_ORDER: readonly AzEntry['kind'][] = ['concept', 'term', 'glossary']

/** The other names an entry goes by: no repeats, and never its leading name again. */
function spellings(name: string, candidates: readonly (string | undefined)[]): string[] {
  const seen = new Set([name.toLowerCase()])
  return candidates.flatMap((candidate) => {
    if (candidate === undefined || candidate === '') return []
    const key = candidate.toLowerCase()
    if (seen.has(key)) return []
    seen.add(key)
    return [candidate]
  })
}

/** The topics and works a Concept's entries are filtered by. */
function facets(concept: ConceptRecord, graph: ContentGraph) {
  const works = quotesOf(concept).map(({ passage }) => must(graph, 'passage', passage).work)
  return {
    topics: [concept.topics.primary, ...(concept.topics.also ?? [])],
    works: [...new Set(works)],
  }
}

/** A term's entry, at its anchor on the page that explains it. */
function termEntry(
  block: TermBlock,
  href: NonNullable<AzEntry['href']>,
  filters: Pick<AzEntry, 'topics' | 'works'>,
): Omit<AzEntry, 'concept'> {
  const name = displayName(block)
  return {
    kind: 'term',
    name,
    lang: 'sa-Latn',
    spellings: spellings(name, asciiSpellings(block.term)),
    ...present({ devanagari: block.term.devanagari, gloss: block.gloss }),
    href,
    anchors: [],
    ...filters,
  }
}

/**
 * The terms a topic's introduction explains (the values topic's yama and niyama), at their
 * anchors on the topic's page, where the introduction is stored once.
 */
function introEntries(topic: TopicRecord, graph: ContentGraph): AzEntry[] {
  const sections = topic.intro?.sections ?? []
  const quoted = quotesInSections(sections)
  const filters = {
    topics: [topic.slug],
    works: [...new Set(quoted.map(({ passage }) => must(graph, 'passage', passage).work))],
  }
  return termsInSections(sections).map((block) =>
    termEntry(block, hrefFor({ kind: 'topic', id: topic.slug, anchor: block.id }), filters),
  )
}

function conceptEntries(
  concept: ConceptRecord,
  glossary: readonly GlossaryEntryRecord[],
  graph: ContentGraph,
): AzEntry[] {
  const { term } = concept.name
  const name = displayName(concept.name)
  const filters = facets(concept, graph)
  const own: AzEntry = {
    kind: 'concept',
    name,
    ...(term ? { lang: 'sa-Latn' as const } : {}),
    spellings: spellings(name, [
      ...(term ? asciiSpellings(term) : []),
      ...glossary.flatMap((entry) => [entry.name.iast, entry.name.ascii]),
    ]),
    ...present({
      devanagari:
        term?.devanagari ?? glossary.find((entry) => entry.name.devanagari)?.name.devanagari,
      gloss: glossOf(concept.name),
      definition: glossary.find((entry) => entry.definition)?.definition,
    }),
    href: hrefFor({ kind: 'concept', id: concept.slug }),
    anchors: glossary.map((entry) => entry.slug),
    ...filters,
  }
  const terms = termsInSections(concept.sections).map((block): AzEntry => ({
    ...termEntry(block, hrefFor({ kind: 'concept', id: concept.slug, anchor: block.id }), filters),
    concept: conceptRef(concept),
  }))
  return [own, ...terms]
}

function glossaryEntry(entry: GlossaryEntryRecord): AzEntry {
  const { ascii, iast, devanagari } = entry.name
  const name = iast ? capitalise(iast) : ascii
  return {
    kind: 'glossary',
    name,
    ...(iast ? { lang: 'sa-Latn' as const } : {}),
    spellings: spellings(name, [ascii]),
    ...present({ devanagari, definition: entry.definition, url: entry.url }),
    anchors: [entry.slug],
    topics: [],
    works: [],
  }
}

/** The letter an entry files under: its name's first letter, diacritics ignored. */
function letterOf(name: string): string {
  const first = stripDiacritics(name).charAt(0).toUpperCase()
  return first !== '' && LETTERS.includes(first) ? first : '#'
}

/** The A–Z: every letter from A to Z with its entries, and `#` after them if anything needs it. */
export function azIndex(graph: ContentGraph): AzLetter[] {
  const naming = new Map<Slug, GlossaryEntryRecord[]>()
  for (const entry of graph.records('glossary'))
    if (entry.concept !== undefined)
      naming.set(entry.concept, [...(naming.get(entry.concept) ?? []), entry])

  const entries = [
    ...graph
      .records('concept')
      .flatMap((concept) => conceptEntries(concept, naming.get(concept.slug) ?? [], graph)),
    ...graph.records('topic').flatMap((topic) => introEntries(topic, graph)),
    ...graph
      .records('glossary')
      .filter((entry) => entry.concept === undefined)
      .map(glossaryEntry),
  ].sort(
    (a, b) => byName(a.name, b.name) || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
  )

  const letters = [...LETTERS, '#'].map((letter) => ({
    letter,
    entries: entries.filter((entry) => letterOf(entry.name) === letter),
  }))
  return letters.filter(({ letter, entries }) => letter !== '#' || entries.length > 0)
}
