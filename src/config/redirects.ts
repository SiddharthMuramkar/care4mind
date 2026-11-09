/**
 * The redirect table: every address the site moves elsewhere, in one place. Each leads to
 * its page or file in one hop, and next.config.ts answers each with a 301 (moved permanently), which
 * browsers follow and search engines remember.
 *
 * Next matches a source ignoring case, so `/VIKSHEPA/` takes one hop too. It adds a missing
 * trailing slash before it reads this table, with a 308 of its own, so an old address typed
 * without its slash takes two.
 *
 * Destinations are written out rather than made by hrefFor(): next.config.ts loads this file
 * through a loader that can't follow the `@/` imports the content module uses. The unit test
 * (tests/unit/redirects.test.ts) holds each page to hrefFor() and to the content's provenance,
 * and each file to `public/`.
 *
 * Each old page is declared once below. The feed the old site served under every page and
 * archive is derived from that declaration, and leads where its page leads, so it stays one
 * hop without a hand-copied row. Which old addresses there are is the checked-in inventory,
 * `src/config/old-site-urls.ts`. Its shortlinks lead where their page leads, and so do its media
 * addresses, unless the picture survives and `src/config/old-media-art.ts` names its new home.
 */

import { artFileOf } from './old-media-art'
import { oldMedia, oldShortlinks } from './old-site-urls'

/**
 * One condition on a request beyond its path, as Next reads it: a header, cookie or query
 * value must be there (and match `value`, a pattern, when given), or the host must match.
 * Written out here rather than imported, for the loader reason above; the shape is Next's
 * `RouteHas`. A query condition is what an old `?p=` shortlink needs.
 */
export type RouteHas =
  | { type: 'header' | 'cookie' | 'query'; key: string; value?: string }
  | { type: 'host'; key?: undefined; value: string }

export interface Redirect {
  /**
   * An old address exactly as the current site served it, with its trailing slash, or a Next.js
   * pattern (`:name*`) for a class of them.
   */
  source: string
  /**
   * Its new page, as hrefFor() makes it: a route in the registry, or an anchor on one. An old
   * media file that survives leads to its file under `public/` instead.
   */
  destination: string
  /** Conditions a request must also meet, for addresses a path alone can't tell apart. */
  has?: RouteHas[]
}

/**
 * The current site's 33 pages and 6 posts, but `/` and `/concepts/`, whose addresses the
 * new site keeps: each moved page, declared once.
 */
const movedPages: readonly Redirect[] = [
  // Duplicates of the homepage, and WordPress's placeholder: dropped.
  { source: '/home/', destination: '/' },
  { source: '/home-2/', destination: '/' },
  { source: '/sample-page/', destination: '/' },
  // Empty pages: dropped, each to its nearest new page.
  { source: '/blog/', destination: '/concepts/' },
  { source: '/resources/', destination: '/library/' },
  { source: '/webpages-and-av-material/', destination: '/library/' },
  { source: '/surveys/', destination: '/questionnaires/' },
  { source: '/teertha-yatra-quiz/', destination: '/questionnaires/' },
  // The book pages, merged into the Library's lists: two whole, two as sections of Textbooks.
  { source: '/text-books/', destination: '/library/textbooks/' },
  { source: '/text-books-2-2/', destination: '/library/textbooks/' },
  {
    source: '/indian-philosophy/',
    destination: '/library/textbooks/#indian-psychology-and-philosophy',
  },
  { source: '/positive-psychology/', destination: '/library/textbooks/#positive-psychology' },
  { source: '/inspirational-books/', destination: '/library/inspirational-books/' },
  // "Courses" lived at /institutes/.
  { source: '/institutes/', destination: '/library/courses/' },
  { source: '/methods/', destination: '/library/methods/' },
  // The Dosha Survey, coming later, is an entry on the Questionnaires page; the KarmaYoga Scale
  // has a page of its own.
  { source: '/dosha-survey/', destination: '/questionnaires/#dosha-survey' },
  { source: '/karmayoga-scale/', destination: '/questionnaires/karmayoga-scale/' },
  // A one-sentence post, merged into its glossary entry.
  { source: '/anubandha-chatushtaya/', destination: '/concepts/#anubandha-chatushtaya' },
  // Posts kept as Concepts.
  { source: '/atman/', destination: '/concepts/atman/' },
  { source: '/jiva/', destination: '/concepts/jiva/' },
  { source: '/jagat/', destination: '/concepts/jagat/' },
  // The 16 description pages: each a Concept now, its Questionnaire coming later.
  { source: '/vikshepa/', destination: '/concepts/vikshepa/' },
  { source: '/upavikshepaprofiling/', destination: '/concepts/upa-vikshepa/' },
  { source: '/panchkleshavikaarprofiling/', destination: '/concepts/panch-klesha/' },
  { source: '/knowyourmind/', destination: '/concepts/chittabhumi/' },
  { source: '/sthitaprajna/', destination: '/concepts/sthitaprajna/' },
  {
    source: '/fivestepsofperfectionprofiling/',
    destination: '/concepts/five-steps-of-perfection/',
  },
  {
    source: '/momentumofspiritualpractice/',
    destination: '/concepts/momentum-of-spiritual-practice/',
  },
  { source: '/spiritualpractitionerprofiling/', destination: '/concepts/spiritual-practitioner/' },
  { source: '/brahmavihara/', destination: '/concepts/brahma-vihara/' },
  { source: '/knowyourvaluesahimsanon-violenceprofiling/', destination: '/concepts/ahimsa/' },
  { source: '/knowyourvaluessatyatruthfulnessprofiling/', destination: '/concepts/satya/' },
  { source: '/knowyourvaluesasteyanonstealingprofiling/', destination: '/concepts/asteya/' },
  { source: '/knowyourvaluesbrahmacharya-profiling/', destination: '/concepts/brahmacharya/' },
  { source: '/frienorfoeofself/', destination: '/concepts/atma-bandhu/' },
  { source: '/karta-2/', destination: '/concepts/karta/' },
  { source: '/triguna/', destination: '/concepts/triguna/' },
]

/** The category archives. Any author's archive stays a pattern row below, never a name. */
const archives: readonly Redirect[] = [
  { source: '/category/concepts/', destination: '/concepts/' },
  { source: '/category/uncategorized/', destination: '/' },
]

/** The feed under a declared page or archive, leading where that page or archive leads. */
const itsFeed = ({ source, destination }: Redirect): Redirect => ({
  source: `${source}feed/`,
  destination,
})

/** Where an old page now leads: its declared row's page, or itself when the new site keeps it. */
const newPageOf = (old: string) =>
  movedPages.find(({ source }) => source === old)?.destination ?? old

/** Each uploaded file, to its new file if it survives, or where the page that showed it leads. */
const media: readonly Redirect[] = oldMedia.map(({ address, wpId, shownOn }) => ({
  source: address,
  destination: artFileOf[wpId] ?? newPageOf(shownOn[0] ?? '/'),
}))

/** Each post's `/?p=<id>`, to that post's new page; Next passes the query through. */
const shortlinks: readonly Redirect[] = oldShortlinks.map(({ id, post }) => ({
  source: '/',
  has: [{ type: 'query', key: 'p', value: id }],
  destination: newPageOf(post),
}))

export const redirects: readonly Redirect[] = [
  // Topics have pages of their own, but no index: the Concepts A–Z lists them.
  { source: '/topics/', destination: '/concepts/' },

  ...movedPages,
  ...archives,
  // Every moved page's and archive's feed, derived from its one declaration above.
  ...movedPages.map(itsFeed),
  ...archives.map(itsFeed),

  // The feed of /concepts/, whose address the new site keeps, so only its feed moves.
  { source: '/concepts/feed/', destination: '/concepts/' },
  // Any author's archive, and its feed, matches one pattern, so no username is ever
  // written down; the final slash makes it match the address as served.
  { source: '/author/:name*/', destination: '/' },
  // The front page's feed, the one feed the old site named at the top level.
  { source: '/feed/', destination: '/' },

  ...media,
  ...shortlinks,
]
