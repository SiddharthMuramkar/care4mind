# 14: Old-URL redirects in one hop (provisional, planning ticket 24)

Status: resolved
Blocked by: 03
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §B4 · Decisions: D11, D17 · Planning: [planning ticket 24](../../rebuild/issues/24-urls-and-redirects.md) confirms or changes these rules

**What to build:** every address the current site served still leads somewhere, in one hop (FR-07). A visitor following an old link lands straight on its new page with a single permanent redirect: from `/vikshepa/` to `/concepts/vikshepa/`, from `/institutes/` to `/library/courses/`, from `/dosha-survey/` to `/questionnaires/#dosha-survey`. Dropped pages lead to their nearest new page. Old archives and the feed are mapped by pattern, so no author's username is ever written down.

## Owns

- `src/config/redirects.ts` (from ticket 03)
- `tests/unit/redirects.test.ts` and `tests/e2e/redirects.spec.ts` (new)

## Acceptance criteria

- [x] **One row per old page (D11, design B4).** The 33 pages and 6 posts in the current site's table each have one row, except the two whose address the new site keeps:
  - `/` and `/concepts/` aren't redirected: they answer 200, and nothing loops.
  - `/home/`, `/home-2/` and `/sample-page/` go to `/`.
  - `/blog/` goes to `/concepts/`.
  - `/resources/` and `/webpages-and-av-material/` go to `/library/`.
  - `/surveys/` and `/teertha-yatra-quiz/` go to `/questionnaires/`.
  - `/text-books/` and `/text-books-2-2/` go to `/library/textbooks/`.
  - `/indian-philosophy/` goes to `/library/textbooks/#indian-psychology-and-philosophy`, and `/positive-psychology/` to `/library/textbooks/#positive-psychology`.
  - `/inspirational-books/` goes to `/library/inspirational-books/`, `/institutes/` to `/library/courses/` and `/methods/` to `/library/methods/`.
  - `/dosha-survey/` goes to `/questionnaires/#dosha-survey`, and `/karmayoga-scale/` to `/questionnaires/karmayoga-scale/`.
  - `/anubandha-chatushtaya/` goes to `/concepts/#anubandha-chatushtaya`.
  - `/atman/`, `/jiva/` and `/jagat/` go to their Concept pages.
  - Each of the 16 description pages goes to its Concept page (design B5), for example `/frienorfoeofself/` to `/concepts/atma-bandhu/` and `/knowyourmind/` to `/concepts/citta-bhumi/`.

  Targets always come from the slugs content-v1 actually shipped.
- [x] **Archives and the feed (D17):**
  - `/category/concepts/` goes to `/concepts/`, and `/category/uncategorized/` to `/`.
  - `/author/:name*` goes to `/`. This is a pattern only: no username appears in the table, the tests or anywhere else in the repo.
  - `/feed/` goes to `/`.
- [x] **One hop (FR-07):**
  - Every old address, exactly as the current site served it (with its trailing slash), answers a single 301 with its final new address as the `Location`, not Next's default 308.
  - That address answers 200, never another redirect.
  - Targets with a fragment land on an anchor that exists in the page's HTML.
- [x] **Variants:**
  - The slashless and upper-case forms of each old address also reach the right page. (The kept `/concepts/` in capitals is the one exception, left for planning ticket 24: see Comments.)
  - Record their measured hop counts in Comments: one hop where the framework allows it, and why not where it doesn't, for planning ticket 24.
- [x] **Cross-check (unit):**
  - Every target is a route in `site.routes()`, or one plus an anchor that `hrefFor()` produces.
  - Every source address in a kept record's provenance has exactly one row, pointing to that record's `hrefFor()`. Where a page became both a Concept and a Questionnaire record, the row points to the Concept (D12).
  - No two rows share a source, and no target is itself a source.
- [x] **Left for planning ticket 24:** media files (`/wp-content/uploads/…`), `?p=` and `?page_id=` shortlinks, attachment pages, comment and category feeds, and search addresses are listed in Comments as open, with what the current site serves for each. They have no rows yet.
- [x] **No network:** every test runs against the local build. Nothing requests care4mind.org.
- [x] **Tests:** `redirects.spec.ts` requests each old address without following redirects and checks the status, the `Location` and the target's 200. With `E2E_SCOPE=sample`, it checks one row of each kind plus the patterns.
- [x] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

**Built, 2026-10-28:**

- `src/config/redirects.ts` now holds 42 rows: the current site's 33 pages and 6 posts but `/` and `/concepts/` (37), the two category archives, `/author/:name*/`, `/feed/`, and ticket 03's `/topics/`. `next.config.ts` serves each as a 301, unchanged.
- Targets use the slugs content-v1 shipped, not the design's: `/knowyourmind/` goes to `/concepts/chittabhumi/` (design: `citta-bhumi`), `/panchkleshavikaarprofiling/` to `/concepts/panch-klesha/` (`pancha-klesha`), `/brahmavihara/` to `/concepts/brahma-vihara/` (`brahmavihara`).
- `tests/unit/redirects.test.ts` (10 tests) matches paths with Next's own matcher (`getPathMatch`, case-insensitive, slash exact) and checks the B4 rows, the archives, one row per source, every target against `site.routes()` and `hrefFor()`'s anchors, no target caught by another row, and the content's provenance: every care4mind.org page a kept record was read from has one row into that record, and the 16 pages that became both a Concept and a Questionnaire go to the Concept.
- `tests/e2e/redirects.spec.ts` runs once, at 1440 px, against the local build: each old address answers one 301 with its `Location`, the target answers 200, fragment targets exist as ids, and the slashless, capital and capital-slashless forms reach the same page in the hops below. The sample takes the first row for each kind of target (and of anchor) plus the archives and the feed. The author pattern is tested with made-up names.

Decisions the spec left open:

- Destinations are written out, not made by `hrefFor()`: `next.config.ts`'s loader can't follow `@/content` (tried: "Cannot find module './src/content'"). The unit test holds each one to `hrefFor()` and the registry instead.
- `/author/:name*/` also catches `/author/`, author feeds (`/author/<name>/feed/`) and author paging (`/author/<name>/page/2/`); all go to `/`. No username is written anywhere.
- Query strings ride along, as Next does by default: `/vikshepa/?x=1` answers 301 to `/concepts/vikshepa/?x=1`.

Measured hops (local `next start`, 2026-10-28), for planning ticket 24:

- An old address as served (`/vikshepa/`): 1 hop, 301.
- In capitals or mixed case with its slash (`/VIKSHEPA/`): 1 hop, 301. Next matches redirect sources ignoring case.
- Without its slash, any case (`/vikshepa`, `/VIKSHEPA`): 2 hops, 308 then 301. With `trailingSlash: true` Next puts its own slash-adding 308 ahead of the table (`redirects.unshift(…, priority: true)` in `next/dist/lib/load-custom-routes.js`), so the table never sees the bare form. One hop would need `skipTrailingSlashRedirect: true` in `next.config.ts`, slashless rows and a slash rule of our own.
- Kept addresses: `/` and `/concepts/` 200; `/concepts` 308 then 200. `/CONCEPTS/` and `/Concepts/` answer 404: pages match case-sensitively, and a row for them would also catch `/concepts/` (sources ignore case) and loop. Lower-casing addresses needs a proxy (middleware), which is ticket 24's call. The spec holds `/CONCEPTS/` as an expected failure, so it flags when fixed.

Open for planning ticket 24 (no rows yet). What the current site serves comes from rebuild research ticket 03's findings (`git show 1fd8ef3:.scratch/rebuild/research/current-site-urls.md`); what the new build answers was measured locally:

- Media, `/wp-content/uploads/<yyyy>/<mm>/<file>`: about 71 files, each image with resized `-<w>x<h>` copies, two edited `-e<timestamp>` copies, and Elementor's generated `uploads/elementor/` files. Now 404.
- `/?p=<id>`, `/?page_id=<id>`, `/?attachment_id=<id>`: WordPress redirects any published id to its address; every page announces a `?p=` shortlink (11 seen in archives; `/concepts/` was page 294, then 725). Now 200 with the homepage, query ignored. A `has` query condition per id could map them, given the ids from the REST listing.
- Attachment pages: probably on (the site predates WordPress 6.4), at `/?attachment_id=<id>` and a page per upload; none archived. Now 404 (or the homepage for the query form).
- Feeds beyond `/feed/` and the author feeds: `/comments/feed/`, `/category/<name>/feed/`, `/<slug>/feed/`, the `rdf`, `rss`, `rss2` and `atom` forms (`/feed/atom/`) and `/?feed=rss2`. Now 404, or the homepage for `/?feed=`.
- Search: `/?s=<term>` and `/search/<term>/` (WordPress results). Now `/?s=` answers the homepage and `/search/<term>/` 404; the new search reads `/search/?q=<term>`.
- Also unmapped: date archives (`/2023/11/`), `/<slug>/embed/`, `/<slug>/trackback/`, `/page/<n>/` and category paging. All 404 now. `www.` and http-to-https are host settings at Vercel.

For the conventions doc (ticket 15):

- Add an old address as a row in `src/config/redirects.ts`, lower case with its slash, and write its destination out as `hrefFor()` makes it; `tests/unit/redirects.test.ts` fails on a target that isn't a route or an anchor `hrefFor()` makes, or that another row moves.
- Never give a source a dot in its last part: with `trailingSlash`, Next treats `/a.b/` as a file and strips its slash before the table is read, so the row never matches.
- Never add a row whose source, in any case, is a page the site keeps: Next matches sources ignoring case, so it would loop.

Done-check, green on the committed code (merged with `def90d0`): `pnpm check` (603 unit tests); `E2E_PORT=3120 E2E_SCOPE=sample scripts/lane/heavy.sh pnpm check:e2e` (460 passed, 125 skipped by design, the `/CONCEPTS/` expected failure among the passes). `E2E_SCOPE=full E2E_ONLY=redirects` once: 89 passed. No existing test changed. No page changed, so there were no screenshots to take. Left over: the open classes above, for planning ticket 24.
