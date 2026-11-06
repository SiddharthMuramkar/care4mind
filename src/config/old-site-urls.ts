/**
 * The old site's URL inventory: every address the current site served, pages and feeds only.
 * FR-07 holds the new site to answering each one with its page, or one 301 to it.
 *
 * Sources: the saved copies of the current site (its pages and posts as the WordPress REST
 * API listed them, kept apart from this repo) for the pages below, and the sitemap list
 * FR-07 cites for the archives. The sitemap's two author archives are named here only as
 * the pattern the redirect table matches, so no username is ever written down. The old
 * site's media files are not in this inventory: where they land is not built yet.
 *
 * This file is data, not a table of where anything goes: the redirect table declares each
 * moved page's new home, and the tests hold every address here to the route registry.
 */

/**
 * The current site's 33 pages and 6 posts, front page first. Two of them, `/` and
 * `/concepts/`, keep their addresses on the new site.
 */
export const oldPagesAndPosts: readonly string[] = [
  '/',
  '/home/',
  '/home-2/',
  '/sample-page/',
  '/blog/',
  '/concepts/',
  '/triguna/',
  '/methods/',
  '/resources/',
  '/text-books/',
  '/text-books-2-2/',
  '/inspirational-books/',
  '/webpages-and-av-material/',
  '/indian-philosophy/',
  '/positive-psychology/',
  '/institutes/',
  '/surveys/',
  '/dosha-survey/',
  '/karta-2/',
  '/brahmavihara/',
  '/frienorfoeofself/',
  '/sthitaprajna/',
  '/vikshepa/',
  '/knowyourmind/',
  '/momentumofspiritualpractice/',
  '/upavikshepaprofiling/',
  '/panchkleshavikaarprofiling/',
  '/spiritualpractitionerprofiling/',
  '/fivestepsofperfectionprofiling/',
  '/knowyourvaluesahimsanon-violenceprofiling/',
  '/knowyourvaluessatyatruthfulnessprofiling/',
  '/knowyourvaluesasteyanonstealingprofiling/',
  '/knowyourvaluesbrahmacharya-profiling/',
  '/atman/',
  '/jiva/',
  '/jagat/',
  '/anubandha-chatushtaya/',
  '/karmayoga-scale/',
  '/teertha-yatra-quiz/',
]

/** The category archives, and the author archives as a pattern: never a username. */
export const oldArchives: readonly string[] = [
  '/category/concepts/',
  '/category/uncategorized/',
  '/author/:name*/',
]

/** The old site's one named feed, the front page's. */
export const oldFeed = '/feed/'

/** The feed an old page or archive served under its own address; the front page's is oldFeed. */
export function feedOf(address: string): string {
  return address === '/' ? oldFeed : `${address}feed/`
}
