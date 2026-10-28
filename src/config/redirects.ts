/**
 * The redirect table (D17): every address the site moves elsewhere, in one place. Each leads to
 * its page in one hop, and next.config.ts answers each with a 301 (moved permanently), which
 * browsers follow and search engines remember. Front-end-site ticket 14 adds the current site's
 * addresses.
 */
export interface Redirect {
  /** The old address, with its trailing slash. Next.js's `:param` patterns are allowed. */
  source: string
  /** The page it now lives at, with its trailing slash: a path in the route registry. */
  destination: string
}

export const redirects: readonly Redirect[] = [
  // Topics have pages of their own, but no index: the Concepts A–Z lists them (design B2).
  { source: '/topics/', destination: '/concepts/' },
]
