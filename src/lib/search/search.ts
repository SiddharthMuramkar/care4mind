import type { SearchHit } from './engine'

/**
 * The one way pages search: a query in, hits grouped by kind out. The results page calls only
 * this, through `@/lib/search/server`, so another engine or a content back end can answer it
 * without the page changing.
 */
export type Search = (q: string) => Promise<SearchHit[]>

export type { SearchField, SearchHit } from './engine'
