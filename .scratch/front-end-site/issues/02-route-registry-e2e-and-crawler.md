# 02: Route registry e2e and link crawler

Status: ready-for-agent
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

- [ ] **Routes from the registry:**
  - The end-to-end suite reads its routes from `site.routes()`.
  - `E2E_SCOPE=full` covers every entry, and `E2E_SCOPE=sample` covers the entries marked `sample`, one per kind.
  - Routes of switched-off features aren't in the registry, so they aren't tested as pages.
- [ ] **Pages and patterns agree:** a unit test lists the route pattern of every page file in the app and fails if:
  - a pattern has no registry entry;
  - a registry entry's pattern has no page.
- [ ] **Per route, at 360, 768 and 1440 px (FR-06, NFR-01, NFR-04):**
  - status 200 and exactly one `h1`;
  - no sideways scroll;
  - axe with the `wcag22aa` tags finds no violation;
  - noindex in both the `X-Robots-Tag` header and the robots meta tag;
  - a title ending "· Care4Mind" (the homepage keeps "Care4Mind: Indian psychology");
  - a non-empty description;
  - exactly one canonical link, equal to `site.url` plus the route's path, ending in `/`.
- [ ] **Breadcrumbs (FR-01):** every route except `/` has a navigation landmark named "Breadcrumb", with a link to Home and exactly one `aria-current="page"` item.
- [ ] **Reflow, motion and other browsers, over the registry in the same scope:**
  - every route reflows at 320 px with no sideways scroll (WCAG 1.4.10);
  - the reduced-motion check finds nothing moving on load, after scrolling or after a click;
  - the Firefox smoke run renders each route with no page errors, a visible `h1` and no sideways scroll;
  - WebKit runs the smoke in CI.
- [ ] **Crawler (NFR-04),** working from the server-rendered HTML, with no JavaScript run:
  - It starts at `/` and follows every same-origin `<a href>`.
  - Every internal link answers 200 directly: internal links never lean on a redirect, so a missing trailing slash fails.
  - Every `#fragment`, whether on the same page or another, exists as an `id` in its target page's HTML.
  - Every registry route is reached from `/`: no orphans.
  - No page outside the registry is reached. Links to `/search/` with a query count as `/search/`.
  - The sitemap's URLs, minus `site.url`, are exactly the registry's paths.
  - It never requests another origin. External links are counted and listed in the report, never fetched.
- [ ] **The old link check goes:** the crawler replaces the foundation's "every internal link leads to a page that exists" test.
- [ ] **Failures name the culprit:** every failure message names the route, the width, and the link, fragment or rule that failed.
- [ ] **Timing:** the run times of the sample and full scopes, with 4 workers on the lane machine, are recorded in Comments.
- [ ] **Pages owned by other lanes:** if a check fails on a page that a running lane owns, mark that one case `test.fixme`, naming the owning ticket, and record it in Comments. The owner removes the mark. Every other failure is fixed here.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI;
  - one `E2E_SCOPE=full` run passes too.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
