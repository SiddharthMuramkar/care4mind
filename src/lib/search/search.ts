import type { SearchKind } from '@/content'

import type { SearchHit } from './engine'

/**
 * The one way pages search: a query in, hits grouped by kind out. The results page calls only
 * this, through `@/lib/search/server`, so another engine or a content back end can answer it
 * without the page changing.
 */
export type Search = (q: string) => Promise<SearchHit[]>

export type { SearchField, SearchHit } from './engine'

/** Each kind of result under its heading. */
const HEADINGS: Record<SearchKind, string> = {
  concept: 'Concepts',
  term: 'Terms inside Concepts',
  topic: 'Topics',
  glossary: 'Glossary',
  work: 'Traditional texts',
  passage: 'Verses',
  questionnaire: 'Questionnaires',
  reference: 'References',
  'library-item': 'In the Library',
  page: 'Pages',
}

/** The most results shown of one kind. */
const SHOWN = 25

/** One kind of result: its heading, the results shown of it, and how many there are in all. */
export interface SearchGroup {
  kind: SearchKind
  heading: string
  results: SearchHit[]
  total: number
}

/**
 * Hits grouped for the results page: groups in the order their first hit ranks, so the kind
 * holding the best result leads; at most 25 shown of a kind, with the kind's full count.
 */
export function resultGroups(hits: readonly SearchHit[]): SearchGroup[] {
  const byKind = new Map<SearchKind, SearchHit[]>()
  for (const hit of hits) {
    const group = byKind.get(hit.kind)
    if (group) group.push(hit)
    else byKind.set(hit.kind, [hit])
  }
  return [...byKind].map(([kind, all]) => ({
    kind,
    heading: HEADINGS[kind],
    results: all.slice(0, SHOWN),
    total: all.length,
  }))
}
