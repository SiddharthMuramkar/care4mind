import type { SearchHit } from './engine'

/**
 * The one way pages search (D10): a query in, hits grouped by kind out. The palette and the
 * results page call only this: `@/lib/search/client` answers it in the browser, from the index
 * it loads, and `@/lib/search/server` on the server, from the content. A content back end can
 * later answer it instead (Postgres, with unaccent and pg_trgm) without either page changing.
 */
export type Search = (q: string) => Promise<SearchHit[]>

export type { SearchField, SearchHit } from './engine'
