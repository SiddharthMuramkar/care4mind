import type { SearchKind } from '@/content'

import type { SearchHit } from './engine'

/**
 * The one way pages search: a query in, hits ranked best first out. The results page calls only
 * this, through `@/lib/search/server`, so another engine or a content back end can answer it
 * without the page changing; `resultGroups` groups the hits for the page.
 */
export type Search = (q: string) => Promise<SearchHit[]>

export type { SearchField, SearchHit } from './engine'

/** A results group: one kind, or the Library's items and other pages together. */
export type SearchGroupKind = Exclude<SearchKind, 'library-item' | 'page'> | 'library-and-pages'

/** Each group in the order the results page shows them, under its heading. */
const GROUPS: readonly { kind: SearchGroupKind; heading: string }[] = [
  { kind: 'concept', heading: 'Concepts' },
  { kind: 'term', heading: 'Terms' },
  { kind: 'topic', heading: 'Topics' },
  { kind: 'glossary', heading: 'Glossary entries' },
  { kind: 'work', heading: 'Traditional texts' },
  { kind: 'passage', heading: 'Passages' },
  { kind: 'questionnaire', heading: 'Questionnaires' },
  { kind: 'reference', heading: 'References' },
  { kind: 'library-and-pages', heading: 'Library and other pages' },
]

/**
 * The group each kind of hit belongs to, by its place in `GROUPS`. Every kind of document
 * names its group here, so a new kind fails to compile until its heading is decided.
 */
const GROUP_OF: Record<SearchKind, number> = {
  concept: 0,
  term: 1,
  topic: 2,
  glossary: 3,
  work: 4,
  passage: 5,
  questionnaire: 6,
  reference: 7,
  'library-item': 8,
  page: 8,
}

/** The most results shown of one group before “Show all”. */
const SHOWN = 5

/** One group of results: its heading, the results shown of it, and how many there are in all. */
export interface SearchGroup {
  kind: SearchGroupKind
  heading: string
  results: SearchHit[]
  total: number
}

/** Whether a word names a results group, as the page's “Show all” address carries it. */
export function isSearchGroupKind(value: string): value is SearchGroupKind {
  return GROUPS.some(({ kind }) => kind === value)
}

/**
 * Hits grouped for the results page, in the groups' order however the hits rank, each group
 * keeping the hits' order: at most 5 shown of a group, with its full count, unless that group
 * is the expanded one, which shows them all.
 */
export function resultGroups(
  hits: readonly SearchHit[],
  expanded?: SearchGroupKind,
): SearchGroup[] {
  const byGroup = GROUPS.map((): SearchHit[] => [])
  for (const hit of hits) byGroup[GROUP_OF[hit.kind]]?.push(hit)
  return GROUPS.flatMap(({ kind, heading }, at) => {
    const all = byGroup[at] as SearchHit[]
    if (all.length === 0) return []
    return [
      {
        kind,
        heading,
        results: kind === expanded ? all : all.slice(0, SHOWN),
        total: all.length,
      },
    ]
  })
}
