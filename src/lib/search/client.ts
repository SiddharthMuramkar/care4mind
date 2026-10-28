import { INDEX_PATH, query, warmIndex, type SearchIndex } from './engine'
import type { Search } from './search'

let loading: Promise<SearchIndex> | undefined

/**
 * The index, fetched once on intent or when the browser is idle, and unpacked for matching as
 * soon as it arrives. A failed load is tried again on the next call.
 */
export function loadIndex(): Promise<SearchIndex> {
  loading ??= fetch(INDEX_PATH, { priority: 'low' })
    .then((response) => {
      if (!response.ok) throw new Error(`The search index answered ${response.status}`)
      return response.json() as Promise<SearchIndex>
    })
    .then((index) => {
      warmIndex(index)
      return index
    })
  loading.catch(() => {
    loading = undefined
  })
  return loading
}

/** Search (D10), answered in the browser: the palette and the results page as you type. */
export const search: Search = async (q) => query(await loadIndex(), q)
