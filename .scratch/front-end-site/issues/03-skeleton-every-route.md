# 03: Skeleton: every route, metadata, sitemap, robots, trailing slash, breadcrumbs and hrefFor

Status: ready-for-agent
Blocked by: 01
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §B2, §B6 · Decisions: D01, D02, D15, D19

**What to build:** every page in the site map exists at its final address, ending in a slash, and can be reached by following links from the homepage.

- Each page has breadcrumbs, a title, a description and a canonical address.
- Pages read the content module's v1 interface only, and the foundation's legacy adapter is deleted.
- The foundation's four pages keep everything they do today.
- Pages whose own ticket hasn't run yet show their real content plainly: their heading, their breadcrumbs, their summary where they have one, and links to their children or their content in simple lists.
- The sitemap lists every public page, and robots.txt is in place.
- Every internal link comes from `hrefFor()`, and a lint rule keeps it that way.

## Owns

- `next.config.ts`: turns on `trailingSlash` and reads the redirect table
- `src/config/site.ts`: adds `url`
- `src/config/redirects.ts` (new), created with the one `/topics/` → `/concepts/` row; ticket 14 owns it after this merges
- `eslint.config.mjs`: the `hrefFor` rule
- `lighthouserc.cjs`: the three existing paths gain their trailing slash, nothing else
- every route file in `src/app/` except `layout.tsx`:
  - `page.tsx` (home), `not-found.tsx`, `sitemap.ts`, `robots.ts` and `reading.module.css`
  - `concepts/page.tsx`, `concepts/[slug]/**` and `concepts/map/**`
  - `topics/[slug]/**`, `texts/**`, `questionnaires/**` (including `[slug]/take/`), `library/**`, `search/**` and `proposals/**`

  Each feature ticket owns its own folder once this merges.
- the foundation parts in `src/components/` adapted to the v1 views, with their CSS Modules: `Breadcrumbs`, `ConceptCard`, `QuestionnaireCard`, `Citation`, `ReferenceList`, `Shloka`, `SanskritTerm` and `SpellingsPopover`
- `src/components/prose/**` (new): the first, plain renderer for blocks and inline text; ticket 05 owns it after this merges
- a small metadata helper for pages, such as `src/lib/metadata.ts` (new)
- `src/content/legacy.ts` (deleted), and the lines of `src/content/index.ts` that export it
- `src/content/derive/routes.ts` and `trail.ts`: adjust only if needed, keeping `@/content`'s interface and the content tests unchanged
- tests:
  - `tests/e2e/concept.spec.ts`, `questionnaire.spec.ts` and `routes.ts`: addresses and v1 views
  - any other foundation spec that hard-codes an old address, for the address only, except the header and logo specs, which ticket 04 owns
  - `tests/e2e/home.spec.ts` (new): the homepage-card test moves here from `concept.spec.ts`; ticket 11 owns it afterwards
  - `tests/e2e/skeleton.spec.ts` (new); ticket 02 folds it in later
  - any unit test that still calls the legacy functions (today `tests/unit/content.test.ts`), ported to v1
  - `tests/unit/site.test.ts` (new)

## Acceptance criteria

- [ ] **Every route renders from `@/content`:**
  - the 19 Concepts and the A–Z;
  - the five topics;
  - the Texts index and each work;
  - the Questionnaires index, the KarmaYoga intro and its flow route;
  - the Library home and its five pages;
  - Search, the Concept map and `/proposals/`.

  Each is statically generated with unknown slugs returning 404, except `/search/`, which renders on each request.
- [ ] **Plain but real:**
  - Pages still waiting for their ticket show their heading, breadcrumbs, summary and real content as simple lists of links or text, rendered with the shared parts and the plain prose renderer.
  - No placeholder text stands in for content.
  - The flow route shows its heading and a link back to the intro until ticket 10 builds it.
- [ ] **Every block renders:** the plain prose renderer handles every block kind in the content model (paragraph, list, term, table, verse and the shared topic introduction) and inline text:
  - Devanagari runs are tagged `lang="sa-Deva"`;
  - "(Author, Year)" citations link to `#ref-<id>` on Concept pages.

  All 19 Concepts render without errors.
- [ ] **Every anchor `hrefFor()` can produce exists** as an `id` on its page:
  - passages (`/texts/yoga-sutra/#1-30`);
  - terms inside Concepts;
  - glossary entries (`/concepts/#<slug>`);
  - References, both `#ref-<id>` on Concept pages and the anchors on `/library/references/`;
  - coming-later Questionnaires (`/questionnaires/#dosha-survey`);
  - Library sections (`/library/textbooks/#positive-psychology`).
- [ ] **The foundation's four pages are kept.** The homepage, the Vikṣepa page, the KarmaYoga intro and the 404 keep every feature and test they have: logo, kolams, ink, page turn, title morph, reading thread, script switch, popover and accordion.
- [ ] **Trailing slash (D02):** every address ends in `/`, and the address without the slash redirects to it. Every internal link points at the slashed address.
- [ ] **`hrefFor()` only:**
  - every internal link in pages and components comes from `hrefFor()`;
  - a lint rule fails on an internal path typed into an `href`: a string or template literal starting with `/`;
  - links that are only a `#fragment`, like the skip link, and external URLs are allowed.
- [ ] **Metadata (D19, NFR-04),** through one helper every page uses:
  - the title is "{name} · Care4Mind", and the homepage keeps "Care4Mind: Indian psychology";
  - the description is the page's summary, or one sentence of interface text on index pages;
  - the canonical link is absolute: `site.url` (https://care4mind.org) plus the path, with its trailing slash, and with no query on `/search/`;
  - unit tests cover a Concept, a topic, a work, a Library page and `/search/`.
- [ ] **Sitemap and robots (NFR-04):**
  - The sitemap lists every route in `site.routes()` as an absolute URL from `site.url`, ending in `/`, and a unit test checks it against the registry.
  - robots.txt names the sitemap and blocks nothing: while `site.indexable` is false, the noindex header and meta tag do the hiding.
- [ ] **Breadcrumbs (D15, FR-01):**
  - Every page except `/` shows the trail from `site.trail(path)`, as in design B6. The last crumb is the current page, with `aria-current="page"`.
  - Breadcrumb links keep the "back" page-turn type.
  - A unit test checks one trail of each kind.
- [ ] **Redirect table:**
  - `next.config.ts` reads its redirects from the one table.
  - `/topics/` answers one 301 to `/concepts/`.
  - Redirects use status 301, not Next's default 308.
- [ ] **Legacy gone:** the legacy adapter is deleted, nothing imports it, and every test that used it now uses the v1 interface without losing an assertion.
- [ ] **Quick sweep:** a temporary end-to-end test requests every registry route at 1440 px. It expects status 200, one `h1`, breadcrumbs (except on `/`) and no axe violations. Ticket 02 replaces it with the full matrix.
- [ ] **Tests updated, not weakened:** the foundation specs use the slashed addresses and the v1 views, and the homepage-card test lives in `home.spec.ts`.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
