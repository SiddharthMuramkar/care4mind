# 02: Route registry e2e and link crawler

Status: resolved
Blocked by: 03, 16
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §E2

**What to build:** every public page is tested the same way, straight from the route registry. A new page is covered the moment it exists, and no page links anywhere that isn't there.

- Every route is checked at 360, 768 and 1440 px: it loads, has one main heading, fits the screen, passes the accessibility checker, stays out of search engines, and has a title, a description and a canonical address.
- A crawler starts at the homepage and follows every internal link. It proves that each link works, that each `#anchor` exists, that no page is orphaned, and that the sitemap lists exactly the registry's pages.

## Owns

- `tests/e2e/routes.ts`, rewritten to read `site.routes()`
- `tests/e2e/pages.spec.ts`, `reflow.spec.ts`, `smoke.spec.ts`, `motion.spec.ts` and `axe.ts`. Ticket 16 (Press only, D21) edits the motion, smoke and pages specs first, so this ticket starts once it has merged.
- `tests/e2e/skeleton.spec.ts` (from ticket 03), folded into `pages.spec.ts` or deleted
- `tests/e2e/fixtures.ts` (from ticket 01): additions only, such as registry helpers
- `tests/e2e/crawler.spec.ts` (new)
- `tests/unit/routes.test.ts` (new)
- `playwright.config.ts`, only if the crawler needs a project of its own
- a skeleton page that fails these checks, but only while no running lane owns it; otherwise see the last criterion

## Acceptance criteria

- [x] **Routes from the registry:**
  - The end-to-end suite reads its routes from `site.routes()`.
  - `E2E_SCOPE=full` covers every entry, and `E2E_SCOPE=sample` covers the entries marked `sample`, one per kind.
  - Routes of switched-off features aren't in the registry, so they aren't tested as pages.
- [x] **Pages and patterns agree:** a unit test lists the route pattern of every page file in the app and fails if:
  - a pattern has no registry entry;
  - a registry entry's pattern has no page.
- [x] **Per route, at 360, 768 and 1440 px (FR-06, NFR-01, NFR-04):**
  - status 200 and exactly one `h1`;
  - no sideways scroll;
  - axe with the `wcag22aa` tags finds no violation;
  - noindex in both the `X-Robots-Tag` header and the robots meta tag;
  - a title ending "· Care4Mind" (the homepage keeps "Care4Mind: Indian psychology");
  - a non-empty description;
  - exactly one canonical link, equal to `site.url` plus the route's path, ending in `/`.
- [x] **Breadcrumbs (FR-01):** every route except `/` has a navigation landmark named "Breadcrumb", with a link to Home and exactly one `aria-current="page"` item.
- [x] **Reflow, motion and other browsers, over the registry in the same scope:**
  - every route reflows at 320 px with no sideways scroll (WCAG 1.4.10);
  - the reduced-motion check finds nothing moving on load, after scrolling or after a click;
  - the Firefox smoke run renders each route with no page errors, a visible `h1` and no sideways scroll;
  - WebKit runs the smoke in CI.
- [x] **Crawler (NFR-04),** working from the server-rendered HTML, with no JavaScript run:
  - It starts at `/` and follows every same-origin `<a href>`.
  - Every internal link answers 200 directly: internal links never lean on a redirect, so a missing trailing slash fails.
  - Every `#fragment`, whether on the same page or another, exists as an `id` in its target page's HTML.
  - Every registry route is reached from `/`: no orphans.
  - No page outside the registry is reached. Links to `/search/` with a query count as `/search/`.
  - The sitemap's URLs, minus `site.url`, are exactly the registry's paths.
  - It never requests another origin. External links are counted and listed in the report, never fetched.
- [x] **The old link check goes:** the crawler replaces the foundation's "every internal link leads to a page that exists" test.
- [x] **Failures name the culprit:** every failure message names the route, the width, and the link, fragment or rule that failed.
- [x] **Timing:** the run times of the sample and full scopes, with 4 workers on the lane machine, are recorded in Comments.
- [x] **Pages owned by other lanes:** if a check fails on a page that a running lane owns, mark that one case `test.fixme`, naming the owning ticket, and record it in Comments. The owner removes the mark. Every other failure is fixed here.
- [x] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI;
  - one `E2E_SCOPE=full` run passes too.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

**Built, 2026-10-28 (lane `lane/site-02`, merged with the integration branch at `145a03c`, ticket 16):**

- `tests/e2e/routes.ts` reads `site.routes()` once: `ROUTES` is every route for this build's flags, `ROUTES_IN_SCOPE` is `inScope(ROUTES)` (every route, or with `E2E_SCOPE=sample` the 16 marked `sample`, one per kind), and `at(page, path)` names the route and width for failure messages. `PAGES` stays for the font and logo specs, which check the foundation's three pages one by one.
- `tests/unit/routes.test.ts` lists every `page.*` file under `src/app/` as a pattern (route groups add nothing, private `_folders` serve nothing, a parallel or intercepting route throws rather than guess) and matches the patterns against the registry with every flag on, both ways, and against this build's registry for entries without a page. Checked by hand: a stray `src/app/zzz-probe/page.tsx` and a moved-away `texts/[slug]/` each fail it, naming the pattern.
- `pages.spec.ts`: one visit per route per width (360, 768, 1440) runs every check softly, so a run names every failure with its route and width: status 200, exactly one `h1`, no sideways scroll, noindex in the header and the meta tag, the title, a description, exactly one canonical equal to `site.url` plus the path and ending in `/`, the Breadcrumb landmark (one, Home linking to `/`, one `aria-current="page"` crumb naming the page), slashed internal links after hydration, no repeated ids, no page errors, then axe at WCAG 2.2 AA (`expectNoAxeViolations(page, where)` now names the route, width and each rule with its help text). The old breadcrumb and "every internal link leads to a page that exists" tests are gone; the running-text tests from `skeleton.spec.ts` moved here, still at 1440 px only.
- `reflow.spec.ts`, `motion.spec.ts` and `smoke.spec.ts` loop over the same scope: every route at 320 px; every route under reduced motion still on load, after a scroll and after a click, its drawings finished and its rules at full width (ticket 16's checks folded in); every route in Firefox, and WebKit in CI, with a visible `h1`, no errors or sideways scroll, the set wordmark and finished drawings and rules.
- `crawler.spec.ts`, in a `crawler` project of its own (no width, so it runs once): it requests `/` with Playwright's request context (`maxRedirects: 0`), parses each HTML answer with `DOMParser` in a browser page (no script runs, `<noscript>` reads as a browser without JavaScript reads it) and follows every same-origin `<a href>`, six requests at a time, stopping at 1,000 addresses. Then: every internal link answers 200 directly (a redirect names its `Location`); every `#fragment`, on the same page or another, is an id in the target's HTML (decoded, text directives stripped); every registry route is reached; nothing outside the registry is; external links are grouped by site in an attached "crawl report" and never requested. The sitemap, robots.txt, address (slash, `/topics/`, unknown slug) and content-anchor tests from `skeleton.spec.ts` live here too; the sitemap test also refuses any URL not on `site.url`. `skeleton.spec.ts` is deleted.
- Checked by hand with a throwaway build: an unslashed link, a 404 link, a missing anchor on another page and on the same page, a second `h1` and a 2000 px block on `/proposals/` each failed, naming `/proposals/`, the width where there is one, and the link or rule (`<a href="/texts"> on /proposals/: /texts answers 308, redirecting to /texts/`; `scrolls 1658 px sideways` and the elements past the edge).
- With every flag off (`FEATURE_*=0` for the build and the run), the crawler and reflow passed over the 42 routes, and the map, the flow and `/proposals/` weren't tested as pages.

The crawl today: 45 addresses, all pages; 1,332 internal links, 552 of them to a `#fragment`; 526 links to 49 other sites (170 to doi.org), listed and never requested. The crawler project takes about 2.2 s.

Decisions the spec left open:

- The crawler crawls the whole site whatever `E2E_SCOPE` says: only the whole site can show an orphan, and it is quick.
- A link with a query (`/search/?q=…`) is requested as written and must answer 200; for orphans and strays it counts as its path.
- `scrollsSideways(page)` (added to `fixtures.ts`) returns `[]` when the page fits, otherwise how far it scrolls and the outermost elements past the right edge, so a failure says what to fix.
- Per route, the checks share one visit and are soft: one page load per route and width, every failure reported.
- Reduced motion clicks the first enabled `button` or `summary` in `main` (the References disclosure counts) and follows the click if it leads to another page.

Timing, 4 workers on the lane machine (load average 6 rising to 15 with another lane building), wall time including the server's start:

- `E2E_SCOPE=sample`: 485 passed, 83 skipped by design, 1.9 min (113 s).
- `E2E_SCOPE=full`: 713 passed (ticket 14's `/CONCEPTS/` expected failure among them), 191 skipped by design, 2.4 min (145 s).

Pages owned by other lanes: nothing failed, so nothing is marked `test.fixme`. Ticket 04's shell lands later; the merger's full run checks it.

Tests changed (this ticket's own files):

- `pages.spec.ts`, `reflow.spec.ts`, `motion.spec.ts`, `smoke.spec.ts`: from the foundation's three pages to the registry's routes in scope, with the checks above; per-page tests that each loaded the page again were merged into one visit per route.
- `skeleton.spec.ts`: deleted, its tests moved as above.
- `axe.ts`: an optional `where` for the failure message, and each violation's help text.

For the conventions doc (ticket 15):

- Loop over routes with `ROUTES_IN_SCOPE` from `tests/e2e/routes.ts`, and start each failure message with `at(page, path)`.
- A new page file needs its route in `site.routes()`: the routes unit test fails until it has one, and from then on every route spec and the crawler cover it.
- Every route must be reachable from `/` through links in the server's HTML: the crawler runs no JavaScript, so a link a client island adds later doesn't count, and an id only a client island renders isn't an anchor.
- Build and test with the same `FEATURE_*` variables: the specs read the registry for the flags the test run sees.
- Check sideways scroll with `expect(await scrollsSideways(page)).toEqual([])`.

Left over:

- No page changed, so there were no screenshots to take and no Lighthouse run.
- WebKit's smoke over the registry runs only in CI (Fedora can't run it).
