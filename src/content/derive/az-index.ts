/**
 * The Concepts A–Z (D14): every Concept, every term inside one and every glossary entry, by
 * letter, sorted by name with diacritics ignored. A glossary entry that names a Concept merges
 * into that Concept's entry.
 */
import { stripDiacritics } from '@/lib/sanskrit'
import { capitalise } from '@/lib/text'

import type { ContentGraph } from '../graph'
import type { ConceptRecord, GlossaryEntryRecord, Slug } from '../schema'
import type { AzEntry, AzLetter } from '../types'
import { conceptQuotes, termsIn } from '../views/blocks'
import { byName, must, present } from '../views/common'
import { hrefFor } from '../views/href'
import { asciiSpellings, displayName } from '../views/names'
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
  const works = conceptQuotes(concept).map(({ passage }) => must(graph, 'passage', passage).work)
  return {
    topics: [concept.topics.primary, ...(concept.topics.also ?? [])],
    works: [...new Set(works)],
  }
}

function conceptEntries(
  concept: ConceptRecord,
  glossary: readonly GlossaryEntryRecord[],
  graph: ContentGraph,
): AzEntry[] {
  const { term, english } = concept.name
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
      gloss: term ? english : undefined,
      definition: glossary.find((entry) => entry.definition)?.definition,
    }),
    href: hrefFor({ kind: 'concept', id: concept.slug }),
    external: false,
    anchors: glossary.map((entry) => entry.slug),
    ...filters,
  }
  const terms = concept.sections
    .flatMap((section) => termsIn(section.blocks))
    .map((block): AzEntry => {
      const termName = displayName(block)
      return {
        kind: 'term',
        name: termName,
        lang: 'sa-Latn',
        spellings: spellings(termName, asciiSpellings(block.term)),
        ...present({ devanagari: block.term.devanagari, gloss: block.gloss }),
        href: hrefFor({ kind: 'concept', id: concept.slug, anchor: block.id }),
        external: false,
        anchors: [],
        concept: conceptRef(concept),
        ...filters,
      }
    })
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
    ...present({ devanagari, definition: entry.definition, href: entry.url }),
    external: entry.url !== undefined,
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
