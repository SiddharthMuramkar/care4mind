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
const GROUPS: readonly { kind: SearchGroupKind; heading: string; holds: readonly SearchKind[] }[] =
  [
    { kind: 'concept', heading: 'Concepts', holds: ['concept'] },
    { kind: 'term', heading: 'Terms', holds: ['term'] },
    { kind: 'topic', heading: 'Topics', holds: ['topic'] },
    { kind: 'glossary', heading: 'Glossary entries', holds: ['glossary'] },
    { kind: 'work', heading: 'Traditional texts', holds: ['work'] },
    { kind: 'passage', heading: 'Passages', holds: ['passage'] },
    { kind: 'questionnaire', heading: 'Questionnaires', holds: ['questionnaire'] },
    { kind: 'reference', heading: 'References', holds: ['reference'] },
    {
      kind: 'library-and-pages',
      heading: 'Library and other pages',
      holds: ['library-item', 'page'],
    },
  ]

/** The group each kind of hit belongs to, by its place in `GROUPS`. */
const GROUP_OF = new Map<SearchKind, number>(
  GROUPS.flatMap((group, at) => group.holds.map((kind) => [kind, at] as const)),
)

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
  for (const hit of hits) {
    const at = GROUP_OF.get(hit.kind)
    if (at === undefined) continue
    byGroup[at]?.push(hit)
  }
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
