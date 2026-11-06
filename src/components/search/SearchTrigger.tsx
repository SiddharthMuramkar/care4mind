import Link from 'next/link'
import type { ReactNode } from 'react'

import { CurrentLink } from '@/components/nav'
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
 * The way into search.
 *
 * A plain link to the search page. A palette that opens from it (and from ⌘K) must keep these
 * props, keep it a working link without JavaScript, and keep its width the same before and after
 * the page is interactive (reserve the shortcut's space), so the header doesn't shift. Render it
 * from a server component; the header hands the Drawer its copy already rendered.
 */
export function SearchTrigger({
  placement = 'page',
  initialQuery,
  children,
  className,
}: SearchTriggerProps) {
  const search = hrefFor({ page: 'search' })
  const href =
    initialQuery === undefined ? search : { pathname: search, query: { q: initialQuery } }
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
