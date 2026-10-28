import type { Route } from 'next'
import type { ReactNode } from 'react'

import { hrefFor } from '@/content'

import { SearchLink } from './SearchLink'

export interface SearchTriggerProps {
  /**
   * Where it sits: `header` (always shown; an icon on narrow screens), `drawer` (the Menu's
   * sheet) or `page` (in a page, such as the homepage's sample spellings). In the header and the
   * Drawer it is marked as the current page on the search page.
   */
  placement?: 'header' | 'drawer' | 'page'
  /** Opens search already filled in with this query. Without JavaScript: `/search/?q=…`. */
  initialQuery?: string
  /** What it shows, "Search" by default. Its accessible name must still say Search, or the query. */
  children?: ReactNode
  className?: string
}

/**
 * The way into search (front-end-site ticket 09). Without JavaScript it is a link to the search
 * page, with `?q=` for an initial query. Once the page is interactive it opens the palette,
 * filled in with that query; pointing at it or focusing it fetches the palette and the index.
 * The header's copy also shows the shortcut (⌘K, or Ctrl K) from 72rem, in a box kept from the
 * start so nothing moves, and carries the ⌘K listener for every page.
 */
export function SearchTrigger({
  placement = 'page',
  initialQuery,
  children,
  className,
}: SearchTriggerProps) {
  const search = hrefFor({ page: 'search' })
  const href = (
    initialQuery === undefined ? search : `${search}?q=${encodeURIComponent(initialQuery)}`
  ) as Route
  return (
    <SearchLink
      href={href}
      searchPath={search}
      placement={placement}
      initialQuery={initialQuery}
      className={className}
    >
      {children ?? 'Search'}
    </SearchLink>
  )
}
