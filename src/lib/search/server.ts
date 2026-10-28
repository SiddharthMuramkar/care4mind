import { site } from '@/content'

import { buildIndex, query, type SearchIndex } from './engine'
import type { Search } from './search'

let built: Promise<SearchIndex> | undefined

/** The site's search index, built from the content once per server. */
export const siteIndex = () => (built ??= site.searchDocuments().then(buildIndex))

/** Search (D10), answered on the server: the results page, with or without JavaScript. */
export const search: Search = async (q) => query(await siteIndex(), q)
