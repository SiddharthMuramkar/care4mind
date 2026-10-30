import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { CurrentLink } from '@/components/nav/CurrentLink'
import { hrefFor } from '@/content'

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
 * Slot, added by front-end-site ticket 04 and filled by ticket 09: the way into search.
 *
 * This stub is a plain link to the search page. Ticket 09 makes it open the palette (and ⌘K)
 * and show the shortcut, keeping these props, keeping it a working link without JavaScript,
 * and keeping its width the same before and after the page is interactive (reserve the
 * shortcut's space), so the header doesn't shift. Render it from a server component; the
 * header hands the Drawer its copy already rendered.
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
  const label = children ?? 'Search'
  if (placement === 'page') {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    )
  }
  return (
    <CurrentLink href={href} className={className}>
      {label}
    </CurrentLink>
  )
}
