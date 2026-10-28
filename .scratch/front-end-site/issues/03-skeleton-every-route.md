# 03: Skeleton: every route, metadata, sitemap, robots, trailing slash, breadcrumbs and hrefFor

Status: resolved
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

- [x] **Every route renders from `@/content`:**
  - the 19 Concepts and the A–Z;
  - the five topics;
  - the Texts index and each work;
  - the Questionnaires index, the KarmaYoga intro and its flow route;
  - the Library home and its five pages;
  - Search, the Concept map and `/proposals/`.

  Each is statically generated with unknown slugs returning 404, except `/search/`, which renders on each request.
- [x] **Plain but real:**
  - Pages still waiting for their ticket show their heading, breadcrumbs, summary and real content as simple lists of links or text, rendered with the shared parts and the plain prose renderer.
  - No placeholder text stands in for content.
  - The flow route shows its heading and a link back to the intro until ticket 10 builds it.
- [x] **Every block renders:** the plain prose renderer handles every block kind in the content model (paragraph, list, term, table, verse and the shared topic introduction) and inline text:
  - Devanagari runs are tagged `lang="sa-Deva"`;
  - "(Author, Year)" citations link to `#ref-<id>` on Concept pages.

  All 19 Concepts render without errors.
- [x] **Every anchor `hrefFor()` can produce exists** as an `id` on its page:
  - passages (`/texts/yoga-sutra/#1-30`);
  - terms inside Concepts;
  - glossary entries (`/concepts/#<slug>`);
  - References, both `#ref-<id>` on Concept pages and the anchors on `/library/references/`;
  - coming-later Questionnaires (`/questionnaires/#dosha-survey`);
  - Library sections (`/library/textbooks/#positive-psychology`).
- [x] **The foundation's four pages are kept.** The homepage, the Vikṣepa page, the KarmaYoga intro and the 404 keep every feature and test they have: logo, kolams, ink, page turn, title morph, reading thread, script switch, popover and accordion.
- [x] **Trailing slash (D02):** every address ends in `/`, and the address without the slash redirects to it. Every internal link points at the slashed address.
- [x] **`hrefFor()` only:**
  - every internal link in pages and components comes from `hrefFor()`;
  - a lint rule fails on an internal path typed into an `href`: a string or template literal starting with `/`;
  - links that are only a `#fragment`, like the skip link, and external URLs are allowed.
- [x] **Metadata (D19, NFR-04),** through one helper every page uses:
  - the title is "{name} · Care4Mind", and the homepage keeps "Care4Mind: Indian psychology";
  - the description is the page's summary, or one sentence of interface text on index pages;
  - the canonical link is absolute: `site.url` (https://care4mind.org) plus the path, with its trailing slash, and with no query on `/search/`;
  - unit tests cover a Concept, a topic, a work, a Library page and `/search/`.
- [x] **Sitemap and robots (NFR-04):**
  - The sitemap lists every route in `site.routes()` as an absolute URL from `site.url`, ending in `/`, and a unit test checks it against the registry.
  - robots.txt names the sitemap and blocks nothing: while `site.indexable` is false, the noindex header and meta tag do the hiding.
- [x] **Breadcrumbs (D15, FR-01):**
  - Every page except `/` shows the trail from `site.trail(path)`, as in design B6. The last crumb is the current page, with `aria-current="page"`.
  - Breadcrumb links keep the "back" page-turn type.
  - A unit test checks one trail of each kind.
- [x] **Redirect table:**
  - `next.config.ts` reads its redirects from the one table.
  - `/topics/` answers one 301 to `/concepts/`.
  - Redirects use status 301, not Next's default 308.
- [x] **Legacy gone:** the legacy adapter is deleted, nothing imports it, and every test that used it now uses the v1 interface without losing an assertion.
- [x] **Quick sweep:** a temporary end-to-end test requests every registry route at 1440 px. It expects status 200, one `h1`, breadcrumbs (except on `/`) and no axe violations. Ticket 02 replaces it with the full matrix.
- [x] **Tests updated, not weakened:** the foundation specs use the slashed addresses and the v1 views, and the homepage-card test lives in `home.spec.ts`.
- [x] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

**From content-v1, 2026-10-28:**
- `site.trail()` gives every crumb an `href`, the last one included; the Breadcrumbs component marks the last as the current page (`aria-current="page"`).
- `hrefFor()` returns `string` until this ticket narrows it to Next's `Route`.
- A slug equal to a fixed page (a Concept called `map`, a reading list called `references`) would give two routes one path; the real-content route test already fails on it.

**Built, 2026-10-28:**

- Every page in the site map exists at its final address, with its slash: 45 routes with the flags on (42 with them off), each statically built from `@/content`, unknown slugs 404, `/search/` rendered on request. From the homepage every route is a few links away: the Contents areas lead to their new pages, "All 19 Concepts, from A to Z" and "17 more Questionnaires" lead to the indexes, and breadcrumbs, verse sources, topic and record links do the rest.
- Pages still waiting for their ticket are plain but real, on the Concept page's folio: their heading, breadcrumbs, summary or one line of interface text, and their content as lists (entries set like a dictionary's, contents with dotted leaders). Their shared styles are in `src/app/listing.module.css`, which the reading pages never import.
- `metadataFor(path)` (`src/lib/metadata.ts`) gives every page its title, description and canonical address from the route registry and the page's content; a path that is no page in this build answers 404. The 404 page takes `notFoundMetadata`. `absoluteUrl()` builds the sitemap's addresses.
- `<Breadcrumbs path>` reads `site.trail(path)`: every crumb but the last is a link turning the page back, the last is `aria-current="page"`, IAST crumbs carry their `lang`.
- The prose renderer (`src/components/prose/`): `Sections` and `Blocks` draw every block kind (paragraph, list, term at its own id, table in a scrolling region, verse, topic introduction); `Text` tags Devanagari runs `sa-Deva` and links each in-text citation the page lists (`citationLinks(view.citations, view.references)`) to `#ref-<id>`; `Provenance` says where the text came from, what was drafted and its review; `RecordLink` links a quoting or citing record. A values Concept's shared yama–niyama section is drawn once, in its section's place, with a line naming its topic.
- `src/config/redirects.ts` holds `{ source, destination }` rows; `next.config.ts` serves each as a 301. `/topics/` answers one 301 to `/concepts/`. A bare address answers Next's 308 to its slashed one.
- The lint rule `care4mind/href-from-hreffor` (in `eslint.config.mjs`) fails on an internal path typed into an `href`: a JSX attribute or an object's `href`, as a string, template literal, concatenation, conditional or cast. Fragments, other sites and paths a view made pass.
- `hrefFor()` is typed as Next's `Route` at `@/content`'s export (`src/content/index.ts`), as content-v1 asked. The views' `href` fields stay strings, so a page that links one casts it once (`as Route`) beside a comment.
- The legacy adapter is deleted. `content-legacy.test.ts` became `content-foundation.test.ts`: it projects the v1 views onto the foundation's shapes and checks them against the same recording. Every recorded value is unchanged except, as the v1 content has them: the KarmaYoga Scale's status is "preview" (the foundation could only say "coming soon"); vikṣepa and the KarmaYoga Scale are "drafted, not reviewed" (their summaries were drafted); the homepage's areas lead to their new pages; and the homepage's Questionnaires note was interface text, now in the homepage. `content.test.ts` reads the v1 views too, and checks every Concept and Questionnaire rather than the foundation's two.

Decisions the spec left open:

- A Concept with a Sanskrit headword is titled with its gloss, as the foundation's was: "Vikṣepa (Distraction) · Care4Mind". The flow is "Take the KarmaYoga Scale · Care4Mind". The homepage's description stays the site's tagline. Index descriptions are one sentence each, in `metadata.ts`.
- The homepage features the Questionnaires with pages of their own (the KarmaYoga Scale) and the Concepts they draw on (vikṣepa), as the foundation did, now chosen from the content; everything else is a link away. Each Contents area shows where it leads ("Library › Methods"), or "In preparation".
- Where the preview can be taken, the KarmaYoga intro's Start is a link to the flow (forward turn, ink) and its badge says "Preview"; with the flag off it keeps the foundation's disabled Start and "Coming soon". The flow's page shows its heading, its status and a link back to the purpose and limitations, and nothing from the form.
- `/search/` is a plain search over `site.searchDocuments()`: the query found inside any stored spelling, title, keyword or author, diacritics and case ignored, grouped by kind, 25 a kind. It works without JavaScript; ticket 09 replaces it.
- `/proposals/` lists the four proposals by name, the built ones with one line and, for the map, its link; the other two say "Described, not built". The map's page lists the Concepts by topic and every connection with its reason, its Proposal label linking to `/proposals/`.
- A–Z entries carry their glossary anchors as ids; a merged entry with more than one gets an empty `span` per extra anchor. Letters jump by `#letter-a`.
- Long titles fit 320 px: `.title` wraps anywhere as a last resort and is set at 2.375rem below 21rem; long DOIs and Devanagari compounds wrap in entries.

Tests changed:

- The foundation specs use the slashed addresses (`routes.ts`, `reading.ts` and the specs that typed an address). `MISSING` is slashed too.
- `page-turn.spec.ts`: the Questionnaire page's "Questionnaires" crumb now leads to `/questionnaires/` (D15), so its test follows it there and still checks the turn back.
- `questionnaire.spec.ts`: with the preview flag on (local runs and CI), Start is a link to the flow, so "cannot start yet" became "says it is a preview, starts its flow, and asks no questions itself"; a new test covers the flow's page. The disabled Start shows only with the flag off: ticket 15's flags-off build is where that side can be checked (it builds and 404s the flagged routes here).
- The homepage-card test moved to `home.spec.ts`, beside a new test that the homepage leads on to the A–Z and the Questionnaires.
- New: `tests/unit/site.test.ts` (19 tests) and `tests/e2e/skeleton.spec.ts` (every registry route at 1440 px: 200, one `h1`, breadcrumbs, title, description, canonical, slashed internal links, unique ids, axe; plus every route with and without its slash, `/topics/`, unknown slugs, every anchor the content links to, the sitemap, robots.txt and the prose renderer).

Done-check, all green on the committed code (rebased on `76ed789`): `pnpm check` (593 unit tests); `E2E_PORT=3110 E2E_SCOPE=sample scripts/lane/heavy.sh pnpm check:e2e` (425 passed, 55 skipped by design); `E2E_SCOPE=full` once (454 passed, 113 skipped). With every flag off the build passes and the map, proposals and flow answer 404.

For the conventions doc (ticket 15):

- Give each page `generateMetadata` from `metadataFor(hrefFor(…))`, and `<Breadcrumbs path={hrefFor(…)} />`.
- Link a view's `href` with `as Route` and a comment: Next's route types know no trailing slash, and `hrefFor()` is typed but view fields are strings.
- Set running text through `Text` (prose), never raw: Devanagari gets its tag, citations their links.
- A `lang={undefined}` prop is sent to the browser as `"$undefined"`; spread it only when set on long lists.

**Left over: the Concept page's Lighthouse LCP now tips over 2.5 s in some runs.** Lighthouse isn't in this ticket's done-check, but CI's `pnpm lhci` can fail on it. Of four `pnpm lhci` runs on this branch, one failed (Concept loads 2.61, 1.82 and 2.62 s) and three passed, the last two on the final code (Concept medians 1.82 and 1.97 s; homepage 2.30 s, Questionnaire 2.11 and 2.22 s, TBT 115–162 ms, CLS ≤ 0.001, accessibility 1.0). The base never went past 2.48 s in 26 loads. Why, from Lantern's own simulation traces (`LANTERN_DEBUG=1 --save-assets`):

- When the HTML arrives, six requests can start at once (the font, three stylesheets and two scripts). Lantern gives each a sixth of slow 4G, about 5.2 kB per 150 ms round trip, so a connection's window is capped at 3 segments, 4,380 bytes.
- Chrome sends the first stylesheet on its pre-warmed connection and the 72 kB react-dom script on that same connection after it. A first stylesheet of up to 4,380 bytes (headers included) arrives in one round trip; a bigger one takes two, and react-dom, which these loads count towards LCP, starts 150 ms later: 2.46 s becomes 2.61 s.
- The base's first stylesheet was 4,222 bytes, 158 under the line. Turbopack's default CSS chunking merges nearly every CSS Module in the app into that one stylesheet, which every page loads; here it is 5,987 bytes (the plain pages' styles, and modules the new pages share). Emptying the plain pages' styles still left it over the line (more modules are now shared and merge in).
- So any CSS any ticket adds (ticket 04's navigation, 05's Concept features) will cross the line too; trimming can't fix it for long. Options, each a decision for ticket 15 or the developer: keep every render-blocking stylesheet under about 4.3 kB, which `experimental.cssChunking: 'graph'` didn't manage here (its global sheet grew to 4.5 kB); inline only the shared core of the CSS (`experimental.inlineCss` inlines everything and sent the Concept page's HTML to 49.5 kB, a third round trip); or run Lighthouse against an HTTP/2 server such as a Vercel preview, closer to what visitors get, where these requests don't queue on six connections.

Also left over:

- `SiteHeader.tsx` is exempt from the link rule until ticket 04's header, made with `hrefFor()`, replaces its three typed links: then drop its `ignores` line in `eslint.config.mjs`.
- `docs/agents/content-migration.md` (line 171) still speaks of "the legacy snapshot"; it is now `tests/unit/__snapshots__/content-foundation.test.ts.snap`.
- One-line type change outside my files: `ScriptChoice.tsx` names its term `SanskritName`, as the legacy `SanskritTerm` type is gone.
