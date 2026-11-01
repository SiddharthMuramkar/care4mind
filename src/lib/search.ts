/**
 * Search: what a query finds among the search documents, and how the results are grouped. The
 * engine that ranks and forgives misspellings waits for the decisions on what search finds and on
 * the architecture, and fills the `SearchEngine` seam in place of `substringSearch`.
 */
import type { SearchDocument, SearchKind } from '@/content'

import { stripDiacritics } from './sanskrit'

/** Finds the search documents a query matches. */
export interface SearchEngine {
  find(query: string): readonly SearchDocument[]
}

/** For matching: one form, lower case, no diacritics. */
const fold = (text: string) => stripDiacritics(text.normalize('NFC')).toLowerCase()

/**
 * The first engine: a document matches when one of its names, its title, a keyword or an author
 * holds the query, diacritics and case ignored.
 */
export function substringSearch(documents: readonly SearchDocument[]): SearchEngine {
  const folded = documents.map((document) => ({
    document,
    fields: [document.title, ...document.names, ...document.keywords, ...document.people].map(fold),
  }))
  return {
    find(query) {
      const q = fold(query.trim())
      if (q === '') return []
      return folded
        .filter(({ fields }) => fields.some((field) => field.includes(q)))
        .map(({ document }) => document)
    },
  }
}

/** The documents a query finds through the first engine, for a caller that keeps no engine. */
export function documentsMatching(
  documents: readonly SearchDocument[],
  query: string,
): SearchDocument[] {
  return [...substringSearch(documents).find(query)]
}

/** Each kind of result, in the order the search page shows them. */
const KINDS: readonly { kind: SearchKind; heading: string }[] = [
  { kind: 'concept', heading: 'Concepts' },
  { kind: 'term', heading: 'Terms inside Concepts' },
  { kind: 'topic', heading: 'Topics' },
  { kind: 'glossary', heading: 'Glossary' },
  { kind: 'work', heading: 'Traditional texts' },
  { kind: 'passage', heading: 'Verses' },
  { kind: 'questionnaire', heading: 'Questionnaires' },
  { kind: 'reference', heading: 'References' },
  { kind: 'library-item', heading: 'In the Library' },
  { kind: 'page', heading: 'Pages' },
]

/** The most results shown of one kind. */
export const SHOWN = 25

/** One kind's results: the first `SHOWN` of them, and how many more there are. */
export interface ResultGroup {
  kind: SearchKind
  heading: string
  shown: readonly SearchDocument[]
  more: number
}

/** The results grouped by kind, in the page's order, each kind that has none left out. */
export function resultGroups(found: readonly SearchDocument[]): ResultGroup[] {
  return KINDS.map(({ kind, heading }) => {
    const results = found.filter((document) => document.kind === kind)
    return {
      kind,
      heading,
      shown: results.slice(0, SHOWN),
      more: Math.max(0, results.length - SHOWN),
    }
  }).filter(({ shown }) => shown.length > 0)
}
