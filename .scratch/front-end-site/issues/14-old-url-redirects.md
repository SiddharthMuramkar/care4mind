# 14: Old-URL redirects in one hop (provisional, planning ticket 24)

Status: ready-for-agent
Blocked by: 03
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §B4 · Decisions: D11, D17 · Planning: [planning ticket 24](../../rebuild/issues/24-urls-and-redirects.md) confirms or changes these rules

**What to build:** every address the current site served still leads somewhere, in one hop (FR-07). A visitor following an old link lands straight on its new page with a single permanent redirect: from `/vikshepa/` to `/concepts/vikshepa/`, from `/institutes/` to `/library/courses/`, from `/dosha-survey/` to `/questionnaires/#dosha-survey`. Dropped pages lead to their nearest new page. Old archives and the feed are mapped by pattern, so no author's username is ever written down.

## Owns

- `src/config/redirects.ts` (from ticket 03)
- `tests/unit/redirects.test.ts` and `tests/e2e/redirects.spec.ts` (new)

## Acceptance criteria

- [ ] **One row per old page (D11, design B4).** The 33 pages and 6 posts in the current site's table each have one row, except the two whose address the new site keeps:
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
- [ ] **Archives and the feed (D17):**
  - `/category/concepts/` goes to `/concepts/`, and `/category/uncategorized/` to `/`.
  - `/author/:name*` goes to `/`. This is a pattern only: no username appears in the table, the tests or anywhere else in the repo.
  - `/feed/` goes to `/`.
- [ ] **One hop (FR-07):**
  - Every old address, exactly as the current site served it (with its trailing slash), answers a single 301 with its final new address as the `Location`, not Next's default 308.
  - That address answers 200, never another redirect.
  - Targets with a fragment land on an anchor that exists in the page's HTML.
- [ ] **Variants:**
  - The slashless and upper-case forms of each old address also reach the right page.
  - Record their measured hop counts in Comments: one hop where the framework allows it, and why not where it doesn't, for planning ticket 24.
- [ ] **Cross-check (unit):**
  - Every target is a route in `site.routes()`, or one plus an anchor that `hrefFor()` produces.
  - Every source address in a kept record's provenance has exactly one row, pointing to that record's `hrefFor()`. Where a page became both a Concept and a Questionnaire record, the row points to the Concept (D12).
  - No two rows share a source, and no target is itself a source.
- [ ] **Left for planning ticket 24:** media files (`/wp-content/uploads/…`), `?p=` and `?page_id=` shortlinks, attachment pages, comment and category feeds, and search addresses are listed in Comments as open, with what the current site serves for each. They have no rows yet.
- [ ] **No network:** every test runs against the local build. Nothing requests care4mind.org.
- [ ] **Tests:** `redirects.spec.ts` requests each old address without following redirects and checks the status, the `Location` and the target's 200. With `E2E_SCOPE=sample`, it checks one row of each kind plus the patterns.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
