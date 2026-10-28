import type { Route } from 'next'

/** The four sections the header links to, besides Search (D01). */
export type SectionId = 'concepts' | 'texts' | 'questionnaires' | 'library'

/** The two sections whose header item opens a panel on a computer, and a list in the Drawer. */
export type PanelId = 'concepts' | 'library'

export interface NavLink {
  label: string
  href: Route
}

export interface Section extends NavLink {
  id: SectionId
  /** The paths below the section: a page under one of them is in the section (Topics sit under Concepts). */
  within: readonly string[]
}

export interface TopicLink extends NavLink {
  slug: string
  /** The topic's own term in IAST, where it has one (citta for Mind). */
  term?: string
  /** How many Concepts have it as their primary topic. */
  count: number
}

/** What a Library page holds, counted as the Library page counts it: "188 References". */
export interface Holding {
  count: number
  /** The unit, singular then plural: entries for a reading list, sections for a page. */
  one: string
  many: string
}

export interface LibraryLink extends NavLink {
  slug: string
  holds?: Holding
}

/**
 * The site's navigation, read once on the server and handed to the header's islands, the
 * Drawer and the footer as plain data. Every href comes from hrefFor(); a switched-off
 * feature (the Concept map, the proposals page) is absent, not hidden.
 */
export interface SiteNav {
  home: Route
  sections: readonly Section[]
  /** The Concepts panel: the A–Z, the topics with their Concept counts and, while it is on, the map. */
  concepts: { index: NavLink; topics: readonly TopicLink[]; map?: NavLink }
  /** The Library panel: References, then the reading lists from the fullest, then its pages. */
  library: { index: NavLink; pages: readonly LibraryLink[] }
  search: NavLink
  proposals?: NavLink
}
