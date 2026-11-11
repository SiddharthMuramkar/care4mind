import type { Route } from 'next'

/** The sections the header links to, besides Search; Questionnaires is always the last. */
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
  holds: Holding
}

/** What a topic or a Library page holds, counted as its own page counts it: "188 References". */
export interface Holding {
  count: number
  /** The unit as the count takes it: Concepts for a topic, entries for a reading list, sections for a page. */
  unit: string
  /** The count and its unit in words, as a panel shows them. */
  text: string
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
  /**
   * The footer's plain link to the Questionnaires page, always listed there. While none can be
   * taken it carries the home record's drafted label; the header and the phone menu always list
   * Questionnaires by name, as a section above.
   */
  questionnaires: NavLink
  search: NavLink
  /** The footer's link to the Picture credits, never beside a picture. */
  credits: NavLink
  proposals?: NavLink
  /** Start here, while its proposal is on: the header shows it after the wordmark. */
  start?: NavLink
  /** Log in, while the login switch is on: the header shows it beside Search. */
  login?: NavLink
  /** The Privacy page, which exists only while the login switch is on: the footer lists it. */
  privacy?: NavLink
}
