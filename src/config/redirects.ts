/**
 * The redirect table (D17): every address the site moves elsewhere, in one place. Each leads to
 * its page in one hop, and next.config.ts answers each with a 301 (moved permanently), which
 * browsers follow and search engines remember.
 *
 * Next matches a source ignoring case, so `/VIKSHEPA/` takes one hop too. It adds a missing
 * trailing slash before it reads this table, with a 308 of its own, so an old address typed
 * without its slash takes two (front-end-site ticket 14's Comments).
 *
 * Destinations are written out rather than made by hrefFor(): next.config.ts loads this file
 * through a loader that can't follow the `@/` imports the content module uses. The unit test
 * (tests/unit/redirects.test.ts) holds each one to hrefFor() and to the content's provenance.
 */
export interface Redirect {
  /**
   * An old address exactly as the current site served it, with its trailing slash, or a Next.js
   * pattern (`:name*`) for a class of them.
   */
  source: string
  /** Its new page, as hrefFor() makes it: a route in the registry, or an anchor on one. */
  destination: string
}

export const redirects: readonly Redirect[] = [
  // Topics have pages of their own, but no index: the Concepts A–Z lists them (design B2).
  { source: '/topics/', destination: '/concepts/' },

  // The current site's 33 pages and 6 posts (D11, design B4), but `/` and `/concepts/`, whose
  // addresses the new site keeps.

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
  // The 16 description pages: each a Concept now, its Questionnaire coming later (D12, design B5).
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

  // Archives and the feed (D17). Any author's archive, and its feed, matches one pattern, so no
  // username is ever written down; the final slash makes it match the address as served.
  { source: '/category/concepts/', destination: '/concepts/' },
  { source: '/category/uncategorized/', destination: '/' },
  { source: '/author/:name*/', destination: '/' },
  { source: '/feed/', destination: '/' },
]
