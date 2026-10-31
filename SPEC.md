# SPEC.md

These are the standing rules for changing this codebase. Read them before you refactor, add a module or a seam, add a content kind or a page, or review a diff. This isn't a spec in CLAUDE.md's sense, where a spec is an issue. Words live in `GLOSSARY.md`, decisions in `docs/adr/`, and work in GitHub Issues.

Part 1 is permanent. Parts 2 and 3 are a one-off audit and its handoff (2026-10-30, at commit `bfdbff0`). Once they're filed as issues, they leave this file and only a pointer to the spec issue stays.

## Part 1. Working here

### The code is the documentation

Every fact has one home. For most facts that home is the code: its names, types, tests and checks. This file holds only what the code can't say: where the seams are and why, the standards a reviewer applies, and which rules a machine checks. CLAUDE.md's rules stand as written. This file adds to them and repeats none of them.

### Modules and their seams

Each module is named by its capability, and outside code reaches it only through its entry. What guards each seam is in italics.

- **Content**, through `@/content`. Its namespaces are `concepts`, `topics`, `works`, `references`, `questionnaires`, `library`, `home` and `site`, plus `hrefFor()`, `displayName()`, `asciiSpellings()` and the view types. A page gets a view: plain, serialisable data shaped for that page. Behind the entry sit the record schema, the graph and the derivations. The graph resolves every link once and refuses a dangling id. The derivations are the route registry, breadcrumbs, the A–Z, search documents and the Concept map. _Lint: the content boundary, with its own test (content-boundary)._
- **Content source**, the seam under Content: `ContentSource.records(kind)`. Two adapters satisfy it, the generated registry of record files and the made-up sources the tests build, so the seam is real. A content back end becomes one more adapter, and nothing above it changes. _Tests: content-registry, content-interface, content-derive._
- **Records**: one file per record. Each is default-exported through its kind's `define…` helper from `@/content/schema`, and points at other records by id only. The registry that lists them is generated. _Types, the graph's dangling-id check, the content tests, and the registry check that opens `pnpm check`._
- **Addresses**: every internal link comes from `hrefFor()`. _Lint: `care4mind/href-from-hreffor`._
- **Pages**: App Router routes that read content only through `@/content`. `site.routes()` is the one list of public pages, and the sitemap, page metadata, the navigation and the link crawler read it. _Tests: content-derive, routes; browser: crawler._
- **Feature flags**: `features`, read once at build, on the server. A client component gets a flag as a prop. A feature that's built but not yet approved for launch is on in previews and off in production. _Tests: features. Review for the server-only reading._
- **Redirects**: one table, each entry served as a 301. _Tests: redirects (unit and browser)._
- **Questionnaire flow**: one reducer holds a person's answers, and nothing else does (no storage, cookies, address or request). No record stores scoring until the Psychology expert's rules arrive. _Types (`scoring.status` is `'pending'`), the content-integrity "held back" test, review._
- **Press**, the one design language. Colours, durations, easings and layers are tokens in the global stylesheet. Each component styles itself through its own CSS module, reading those tokens with `var()`. Tailwind supplies only the tokens and Preflight: the one global class markup uses from it is `sr-only`, and the site adds `skip-link` of its own. A colour chosen by content (a topic, a Questionnaire status) is mapped from a data attribute in the global stylesheet. _The contrast test checks the listed colour pairs; review checks the rest._

### Standards a reviewer applies

These are judgement calls, so review checks them against the diff, in the codebase-design skill's vocabulary: module, interface, depth, seam, adapter, leverage, locality.

- **Depth.** A module earns its place by the deletion test: delete it, and its complexity would reappear across its callers. A seam is real once two adapters fill it. Prefer deepening an existing module to adding a shallow one.
- **Tests cross the seam callers use.** They assert behaviour against expected values worked out independently, and hold for any amount of content: a correct new record needs no test edits.
- **The diff's scope is the ticket.** A decision that's still open (below) stays open in the code: the seam waits, and the decision fills it later.
- **A decision is cited by its reason**, in the comment, or by its ADR.

### What keeps each rule true

| Rule | Kept true by |
| --- | --- |
| Pages read content only through `@/content`; a client file imports it for types only | lint (content boundary) and its test |
| Internal links come from `hrefFor()` | lint (`care4mind/href-from-hreffor`) |
| Every link between records resolves | the graph, at build and in every content test |
| Sanskrit is NFC with ṃ; each name field holds one script, in characters the fonts cover | content-integrity test |
| The registry is generated, not edited | the registry check in `pnpm check` |
| No record stores scoring | types and the content-integrity test |
| Press colour pairs meet contrast | contrast test, for the pairs it lists. Colours mixed inside modules are unchecked (Part 2) |
| Icon and manifest colours equal their tokens | icons test |
| A `styles.x` lookup names a class its CSS module defines | nothing yet (Part 2) |
| IAST and Devanagari carry `lang` | components, for name fields and Devanagari runs. IAST inside running text is untagged (Part 2) |
| Carried-over text changes only to fix a listed error | `verify.mjs`, which runs only on a machine with the captures; nothing in CI (Part 2) |
| Comments state reasons, not ticket numbers or decision codes | nothing yet (Part 2) |
| Names use glossary terms; comments say why; Press only; depth; tests at the seam | review |

### Where a change goes

- **A record of an existing kind:** `pnpm content:new <kind> <id>` writes a template that compiles. Fill it in, then run `pnpm check`. Today that check fails on tests that pin record counts (Part 2).
- **A link field:** the record schema, the graph's link check, then the view that shows it.
- **A content kind:** the compiler finds only some of these places, so work through every step:
  1. The record schema: its type, its `define…` helper and its kind's folder.
  2. The graph: the link check and the reverse indexes. Nothing fails if you miss these (Part 2).
  3. The view types and views: Ref, Card and View, plus `hrefFor()`'s target.
  4. Its namespace on `@/content`.
  5. The derivations: routes, and search documents. Nothing fails if you miss search (Part 2).
  6. The pages, the navigation, Linked knowledge and the search page's headings.
  7. The tools behind `content:new` and `verify`.
  8. GLOSSARY.md.
- **A page:** a route that reads `@/content`. Its address is an `hrefFor()` target, and its entry in `site.routes()` puts it in the sitemap, breadcrumbs and crawler.
- **A topic:** its record, plus its colour token, its `[data-topic]` rule and its contrast pair. Nothing checks the last three yet (Part 2).
- **A colour, duration or easing:** a token in the global stylesheet. A colour pair that carries text joins the contrast list.
- **A feature awaiting the Project owner's approval:** a flag in `features`.
- **A moved address:** a row in the redirect table. Its destination is written as `hrefFor()` would make it, and it answers in one hop.

### The feedback loop

`pnpm check` is the one signal that a change is done. CI runs it on every PR, and `ship` waits for it before merging. Also run the browser tests you touched, against the build `pnpm check` made: `E2E_ONLY=<spec names> pnpm check:e2e`, where the names are file names in `tests/e2e` without `.spec.ts`.

The content registry is rewritten by `dev`, `build`, `typecheck`, `test` and `test:e2e`, but not by `vitest` run on its own. A running `next dev` sees a new record file only once the registry is rewritten: rerun the registry script, or restart.

### Decisions still open

The planning map, issue #6, lists them. Until each is decided, the code leaves its seam empty:

- the content back end, search, media storage and editor login (Architecture review)
- what search finds
- the Questionnaire record, its scoring sources and its results page
- content types, topics, links between content, traditional texts, and References, people and journals
- how Sanskrit terms are stored and displayed
- the site map and navigation, URLs and redirects, and findability

### Code that misleads

The code still holds these patterns, and new code doesn't copy them. Each line is deleted when its Part 2 item lands.

- Comments that cite ticket numbers, decision codes (D01–D21), design codes (such as B6) or spec names. The documents they point at were deleted in `bfdbff0`. State the reason instead.
- Scripts that send authors to `docs/agents/content-migration.md`, which no longer exists.
- `Flag.ticket` numbers on records. They come from a deleted local tracker and point at the wrong GitHub issues.
- "Lane" in configs and comments. It's the old name for the parallel builders `ship` runs.
- Tests that pin how many records exist.
- The "Devanagari first" stubs, which render nothing, though the proposals page calls the feature built.
- Settings that look load-bearing but do nothing here: the root layout's `title.template` (every page sets an absolute title) and `typedRoutes` (it can't check paths that end in a slash). The checks that do hold links true are the `hrefFor()` lint rule and the browser crawler.

### Changing this file

- A rule comes in together with what keeps it true: a check, or "review".
- A change that makes a line here untrue updates it in the same PR.
- A standard or a seam changes only by the developer's decision, so a builder that needs one stops with `needs-info`.
- A line that changes nobody's behaviour is deleted.

## Part 2. Cleanup backlog (audit of 2026-10-30, at `bfdbff0`)

A read-only swarm of agents produced this list. It audited five areas (the content module; content records and their tools; pages; components; shared code, config and styles) and researched what Matt Pocock and Anthropic advise for agent-built codebases. The tests and the agent harness weren't audited, and no skeptic has challenged these findings yet (Part 3).

Each item is shaped as one ticket, with the highest leverage first within each theme. The tags give impact, effort (S, M or L) and confidence:
- **checked**: re-verified by hand in this session.
- **audit**: one auditor's finding, with file and line evidence, not yet challenged.

Paths and line numbers are as of `bfdbff0`. The ids in brackets name each auditor's finding, and the full evidence for each is in the run's journal (Part 3).

### 0. Make `main` green first

- **0.1 A browser test fails on `main`.** CI on `bfdbff0` (run 41033085784) passed `pnpm check` but failed `pnpm check:e2e`: 1 failed, 1105 passed. The failing test is `[chromium-360] tests/e2e/questionnaire-flow.spec.ts:114`, "sets out each part with its instructions, statements and options in the source order". At line 137 it waits for part 4's heading and never finds it, and its retry failed too. `ship` merges only on green, so this ticket blocks every other one.
  **Change:** reproduce with `pnpm exec playwright test tests/e2e/questionnaire-flow.spec.ts:114 --project chromium-360`, using the diagnosing-bugs skill, then fix the flow or the test.
  **Done when:** CI on `main` is green.
  _High · S · checked (components-3)._

### A. Make the code say what the deleted docs said

`bfdbff0` deleted the docs the code leaned on:
- `docs/agents/`, five files, including the 175-line content migration standard
- `docs/client-brief.md` and `docs/current-site.md`
- `AGENTS.md`
- all of `.scratch/`: the content-v1, front-end-foundation and front-end-site specs, the decisions register, the design notes and the old local tracker

The code still points at them. This is exactly the drift Part 1 exists to prevent.

- **A1 The content tools send authors to a deleted standard.** `scripts/content/new.mjs` (lines 8 and 176), `verify.mjs:10` and `extract.mjs` (lines 9 and 33) point at `docs/agents/content-migration.md`. Every new record's template says to follow it. `report.mjs` (lines 6 and 17) writes into `.scratch/content-v1/`, which `.gitignore` doesn't cover.
  **Change:**
  - Move each still-true rule from `git show bfdbff0~1:docs/agents/content-migration.md` into the code it governs: the schema's doc comments, the `content:new` templates and each tool's usage text. A rule that a test enforces needs only the test's name.
  - Make the captures error say where the captures come from: the private `care4mind-captures` repo, cloned, with `$CARE4MIND_CAPTURES` set.
  - Point `report --write` at a gitignored path.

  **Done when:** no script or comment names a deleted path, and A5's check passes.
  _High · S · checked (content-authoring-1)._
- **A2 267 comment lines cite codes that resolve nowhere.** They cite decision codes (D01–D21), design codes (B6, C5), ticket numbers, spec names and "settled rules". By a grep of comment lines: 98 in `src/content`, 81 in `tests`, 36 in `src/components`, 20 in `src/app` and 32 elsewhere. The register they cite survives only in `git show archive/frontend-press-only:.scratch/front-end-site/decisions.md`. Some ticket numbers now name the wrong GitHub issue: `gh issue view 12`, run from the proposals stylesheet's "ticket 12", opens "Traditional texts and passages". Agents copy the style of the file they open, so it spreads.
  **Change:**
  - Read the archived register first, so no reason is lost. Some codes carry decisions that main writes down nowhere else (D18: no media is carried over), so write those out where the code needs them before deleting the code.
  - Replace each code with the reason it stands for, in one line, or drop it where the reason is already written beside it. A decision that must stay citable becomes an ADR.
  - `src/styles/globals.css:50-52` tells agents to ask in a ticket's Comments for a missing token, a process that no longer exists. Part 1's "Where a change goes" now says how to add a token, so delete the comment.
  - Delete counts and plans from comments too: `src/components/toast/toast.ts:17-18` names a "Copy citation" that doesn't exist, and `src/components/map/ConceptMap.tsx:17` counts links.
  - Add one check: a unit test that scans comments in `.ts`, `.tsx`, `.mjs`, `.css` and `.yml` files. ESLint alone can't, because it doesn't read CSS or YAML.
  - Work expand–contract: the check first covers only the folders already cleaned, then one folder per PR, until it covers everything.
  - Two calls belong to the developer. First, whether requirement ids (FR-, NFR-) may stay: they resolve in the brief and earn their place in test titles. Say which in CLAUDE.md. Second, whether comments in record files may change at all, since CLAUDE.md limits edits there to listed errors.

  **Done when:** the check covers every source folder and passes.
  _High · M · checked (app-routes-2, components-4, content-module-8, content-authoring-9, lib-config-styles-4)._
- **A3 Every `Flag.ticket` points at the wrong issue.** 246 values in 155 record files are numbers from the deleted local tracker. GitHub numbers those topics differently: the old 17, "References, people and journals", is #13, while GitHub's #17 is the closed "Design direction". The schema describes the field as "The planning ticket that decides it" (`src/content/schema/common.ts:31-32`), and `report.mjs` prints it.
  **Change:**
  - Replace the integer with a typed `decidedBy` key, mapped to the planning issues in one table in the schema.
  - Remap mechanically: 1→7, 13→9, 14→10, 15→11, 16→12, 17→13, 19→15, 20→16, 26→22, 28→24. The old 11 is the finished research in `archive/research/published-scales`.
  - Change Flag once, together with F3. The developer decides whether this metadata fix needs a provenance edit.

  **Done when:** the type rejects any value missing from the table, and the flags report prints issue titles.
  _Medium · M · audit (content-authoring-4)._
- **A4 Docs point at files and sections that don't exist.**
  - `.github/workflows/ci.yml:2`, `playwright.config.ts:9` and `lighthouserc.cjs:14` cite a "Checks" section of README.md that doesn't exist.
  - `docs/project-brief.md` (lines 3, 80 and 107) and `docs/adr/0001-rebuild-instead-of-enhancing.md` (lines 7 and 11) point at `client-brief.md` and `current-site.md`, both deleted.
  - "Lane" appears in 12 comment lines across 8 files. It's the old name for a parallel builder.

  **Change:**
  - Link the deleted docs at their permalinks at `5051050`, as the planning map does.
  - Write the README section, or drop the citations.
  - Say "builder", as `ship` does. Then either have `ship` run browser tests through `scripts/lane/heavy.sh`, or delete the script.

  **Done when:** A5's check passes over these files.
  _Medium · S · checked._
- **A5 Add a pointer check.** Nothing fails when a doc or a comment names a path, a script or a section that doesn't exist, which is how A1 and A4 happened.
  **Change:** a unit test that reads CLAUDE.md, SPEC.md, README.md, `docs/` and source comments. It fails on any backticked repo path, `pnpm <script>` or `README.md, "Section"` reference that doesn't resolve. Prove it bites with a planted bad path.
  **Done when:** it runs inside `pnpm check`.
  _Medium · S · checked._
- **A6 Unfinished pages exist only as promises in comments.** Six comments say a front-end-site ticket "builds the shelf here": `src/app/texts/page.tsx:21`, `src/app/texts/[slug]/page.tsx:95`, `src/app/library/page.tsx:21`, `src/app/library/[slug]/page.tsx:64`, `src/app/library/references/page.tsx:22` and `src/app/search/page.tsx:52`. The finished work sits in `archive/lane-texts`, `archive/lane-library` and `archive/lane-search`, which branched before the Press reset. No GitHub issue tracks it, so `ship` will never build it.
  **Change:**
  - Open a spec issue, "Finish the plain pages", with one sub-issue per lane.
  - Each sub-issue names its tag, and says to port the work onto Press (`archive/press-original`) rather than merge it.
  - The last sub-issue deletes `src/app/listing.module.css`.
  - Then delete the comments.

  **Done when:** the issues exist and the comments are gone.
  _High · S · audit (app-routes-3)._
- **A7 "Devanagari first" is claimed as built but renders nothing.** `src/components/script/HeadScript.tsx` and `ScriptPreference.tsx` return null, and `ScriptPair.tsx` is a stub. Yet `src/components/proposals/proposals.ts` lists the site-wide proposal as `built: true`, the proposals page tells the Project owner to try it, and `tests/unit/proposals.test.ts` pins `built: true`. Separately, the per-page switch reorders the DOM, which breaks ScriptPair's promise that screen readers hear the same order either way.
  **Change:**
  - First, a `ready-for-human` decision on the reading-order contract, recorded as an ADR. Until then, the proposal stops claiming to be built.
  - Then make `script/` the one module that draws a term's two spellings (six places draw them today), and delete the unused `TermSpellings`.

  **Done when:** the proposals page and its test match what renders.
  _High · M · audit (components-2)._
- **A8 GLOSSARY.md lacks most of the words the code is built from.** It defines Concept, Reference and Questionnaire. It doesn't define:
  - topic
  - traditional text (`work` in code)
  - passage (also called "verse" and "shloka")
  - term and glossary entry
  - reading list (`resource-list` in code)
  - Library page and Proposal
  - a Questionnaire's parts: part, item (shown to visitors as a "statement"), option and status

  The planning map's "Terms to sharpen" list already names most of them.
  **Change:**
  - As each planning ticket settles a term, add it with the domain-modeling skill, along with its name in code.
  - Then one rename ticket gives each thing one name. For example, the A–Z's "text" group filters on `data-works`.

  _Medium · S · audit (components-9, content-module-9, lib-config-styles-15). The terms are the developer's call._

### B. Let content grow without editing tests

- **B1 Tests pin today's content.** `tests/unit/content-completeness.test.ts` pins 19 Concepts (line 78) and 18 Questionnaires (line 83), and `tests/unit/content-sweep.test.ts:211` pins 448 search documents. The per-topic test files restate each record: vikshepa is named in 31 test files. One correct new Reference breaks two counts. The quick fix, bumping the numbers, teaches agents that content tests are numbers to edit. It also means a Content editor can't add content without a developer, though FR-02 says they should.
  **Change:**
  - Move the migration's facts (the counts, the list of 19, the per-record restatements) into a fidelity suite that runs with `verify`, or archive them once the client signs off the migration.
  - Gather the rules that hold for any content into one rulebook: content-integrity, plus content-completeness's linkage rules.
  - Move the pins before deleting any. Until sign-off, they are what guards the migration.

  **Done when:** `pnpm content:new`, followed by a correct record, passes `pnpm check` with no test edits.
  _High · M · checked (content-authoring-3)._
- **B2 `pnpm check` fails first in every fresh worktree.** Its first step only checks the generated registry, which a fresh checkout doesn't have, and every `ship` builder starts from one. Typecheck, test and build each write the registry anyway. CLAUDE.md and `ci.yml` each carry a line that only works around this. Meanwhile `vitest` (in watch mode, or on one file) and a running `next dev` never regenerate it, so they can silently test stale content.
  **Change:**
  - Start `check` by writing the registry, and add a Vitest global setup that writes it too.
  - Keep `--check` where reading without writing is the point: in `verify` and the registry test.
  - Then delete the CLAUDE.md line and the CI step.

  **Done when:** `pnpm check` passes in a fresh worktree with no extra step.
  _Medium · S · checked (content-module-5, content-authoring-11)._
- **B3 There's no honest way to write a new record.** Provenance assumes every record was carried over. `content:new` pre-fills the capture date and "carried-over-not-reviewed", and the integrity test requires a source page.
  **Change:**
  - Add an optional `origin: 'written'` to Provenance. An absent origin means carried over, so no record file changes.
  - Branch the rules on it, and add `pnpm content:new <kind> <id> --written`.
  - Give Provenance its own view type, so internal flag notes can't reach a page.
  - Which fields a written record needs is a question for the planning ticket "Content types, topics and shared fields": raise it there before building.

  **Done when:** a written record passes every check without inventing a source.
  _Medium · M · audit (content-authoring-8)._
- **B4 Nothing gates "carried-over text changes only to fix a listed error".** `verify.mjs` checks the rule, but no script, CI job or `ship` step runs it. It also needs the captures, which aren't on this machine. A builder that rewords a sentence gets green CI and auto-merges.
  **Change:**
  - Add `content:verify` and `content:report` scripts.
  - Give verify a `--changed <ref>` option that checks only the records a branch touched.
  - Add a rule to `ship`: a PR that touches `src/content/data` passes verify, or its builder stops with `needs-info` when the captures are absent.
  - Clone the captures repo back onto this machine.

  **Done when:** no data PR can merge without a verify run.
  _High · S · checked (content-authoring-2)._

### C. Make the compiler the checklist for content kinds

- **C1 Adding a content kind touches about 22 files, and most give no signal when one is missed.** The graph's link check is a switch with no default (`src/content/graph.ts:160`). A new kind's ids are never checked and never reach "cited by" or "quoted in", and `tsc` says nothing. Search documents, the search page's headings and Linked knowledge are hand-written lists too.
  **Change:**
  - Declare each kind's outgoing links once, in a table typed `satisfies { [K in ContentKind]: … }`, and build the link check and the reverse indexes from it.
  - Do the same for each kind's page title and address, and for its search documents.
  - Until then, add `never` defaults to the per-kind switches.
  - Keep the error messages byte-identical, because tests pin them.

  **Done when:** adding a kind to the schema fails to compile until every table covers it. That makes about 14 files to touch instead of 22.
  _High · M · audit (content-module-1, content-module-2)._
- **C2 Write the content source's contract down.** Records reach pages in "the source's own order". The graph's memo keeps even a failed build for the life of the process, and only `tsc` checks a record's shape. That suits a back end that rebuilds the site on publish, but not on-demand updates or draft previews.
  **Change:**
  - Sort each kind by id when the graph is built. Today's output doesn't change.
  - Move the in-memory test source into the content source module as `memorySource()`, the seam's second adapter, and delete its three copies in tests.
  - Write the adapter's duties into the interface's doc comment: ids unique within a kind, records in the schema's shape, NFC text.
  - Leave caching and runtime validation to the back-end decision.

  _High · S · audit (content-module-3)._
- **C3 The content module re-walks records by hand.** The block tree is walked in nine places, and each Concept's facts are worked out in up to five. Views also scan for reverse links the graph doesn't index.
  **Change:** one record-walking module (blocks, quotes, terms, topics), with the graph indexing the reverse links the views now scan for.
  **Done when:** each walk exists once, and the interface tests pass unchanged.
  _Medium · S · audit (content-module-4)._
- **C4 `graph.ts` is four modules in one file**, and it imports upward from the views.
  **Change:** split it into links, citations, relations and build, behind the unchanged ContentGraph interface, and move the name helpers below it.
  _Medium · S · audit (content-module-6)._
- **C5 Views stop one step short of what pages render.**
  - The Concept page fetches every card just to show previous and next.
  - Both Questionnaire pages filter `concepts.list()` for related Concepts.
  - The topic page regroups its verses by work.

  **Change:**
  - Give each page what it renders: cards for previous and next and for a Questionnaire's Concepts, and a topic's verses grouped by work.
  - Drop `asciiSpellings` and `displayName` from the interface, since nothing outside the module calls them.

  _Medium · S · audit (content-module-7)._
- **C6 Route entries drop the record they show.** Page metadata therefore parses slugs back out of paths, and every call rebuilds the route list. The six dynamic routes use four different shapes of `generateStaticParams` and `generateMetadata`.
  **Change:**
  - Keep the record on each route entry, and add `site.route(path)` and `site.params(pattern)`.
  - Memoise routes and search documents per graph.
  - Every dynamic route then reads `generateStaticParams = () => site.params(PATTERN)`.
  - Add a test that each pattern's params equal the registry's entries.

  _Medium · M · audit (content-module-10, app-routes-5)._
- **C7 View addresses are typed `string`**, so 12 call sites cast them to `Route`.
  **Change:**
  - Type them as `Route` once, inside the content module.
  - Split the A–Z entry's `href` into `href` and `url`, since one of them holds an external address.
  - Leave `typedRoutes` on, with a one-line comment naming the upstream bug that makes it ignore trailing slashes.

  _Low · S · audit (content-module-12, app-routes-10)._
- **C8 The content boundary has gaps.**
  - The rule misses dynamic `import()` of internals.
  - It doesn't cover tests: 11 test files reach into the graph or views.
  - Its fixtures name exports that no longer exist.
  - The client-file guard keys on the `'use client'` directive, so a browser-only helper without it could import content values.

  **Change:**
  - Add dynamic-import selectors, with a boundary-test case for each.
  - Give tests one sanctioned testing entry, and rename the fixtures.
  - Extend the client rule to `@/config/features`. A client bundle can't see `VERCEL_ENV`, so there it would switch every flag on.
  - `server-only` on the content entry needs an alias in both test runners first.

  _Low · S · audit (content-module-11, components-14, lib-config-styles-6)._
- **C9 Two "graphs" and two "pages".** ContentGraph (the records) sits beside ConceptGraph (the Concept map's data), and "page" names both the Library page kind and any page at all.
  **Change:**
  - Call the map's data `conceptMap`.
  - Rename `PageRoute`, for example to `RecordRoute`.
  - Gather every `…Ref` builder in one file.

  _Medium · S · audit (content-module-9)._

### D. One page shell, and one place that decides which pages exist

- **D1 Fourteen pages hand-build the same shell.** `<main id="main">` appears in 16 files and Breadcrumbs in 14. Each page pairs its `aria-labelledby` and its title id by hand, and the skip link's target is tested on one page only. Page width is set four ways, and one of them wins only by CSS import order.
  **Change:**
  - Build one shell module, a reading page with its title page, with widths as named variants.
  - Render it from each `page.tsx`, never from a layout: page turns need the wrapper inside the page.
  - Add a per-route check for `main#main`.
  - Migrate page by page, checking with `pnpm shots` and the browser tests.

  **Done when:** every page below the homepage uses the shell.
  _High · M · audit (app-routes-1)._
- **D2 The registry decides which pages exist, and flagged pages decide again.** The Concept map and proposals pages call `notFound()` on their own flag checks, and some links ask the flag rather than the registry. CI never builds the production flag set, with every flag off, so a stale link to a switched-off page would first show up live.
  **Change:**
  - The shell resolves its path against `site.routes()`.
  - Links to optional pages ask the registry, as the navigation already does.
  - Add a CI job that builds with every `FEATURE_*` variable set to 0, then runs the crawler and the pages spec.

  _Medium · S · audit (app-routes-4, lib-config-styles-6)._
- **D3 The Questionnaire intro and take pages duplicate five fragments**, and the status badge is drawn four ways.
  **Change:** add `Limitations` and `RelatedConcepts` to the questionnaire module. G1 builds `StatusBadge`.
  _Medium · S · audit (app-routes-7)._
- **D4 Shared route stylesheets tie unrelated pages together.** `src/app/listing.module.css` serves ten routes for six purposes and holds dead classes, and components import `src/app/cta.module.css`.
  **Change:**
  - Move each style beside the markup that uses it, and delete the dead classes now.
  - The shared Press styles (reading page, listings, call to action) move to `src/styles`, or become components.
  - Add a lint pattern that stops `src/components` importing `@/app/*`.

  _Medium · M · audit (app-routes-8, lib-config-styles-14)._
- **D5 The topic page is 261 lines.** It holds a view's grouping, a Sanskrit rule with no unit test, and two components whose numbering must match a third file's.
  **Change:**
  - The view groups verses by work.
  - `ConceptSpread` and `VerseIndex` take over the markup.
  - The speaker-line rule gets unit tests.

  _Medium · M · audit (app-routes-6)._
- **D6 Search's matcher lives inside its page.**
  **Change:**
  - Add `archive/lane-search`'s `Search` interface now, with today's substring matcher as its first adapter.
  - Unit-test the grouping, the cap of 25 and the diacritic folding.
  - Put `lang` on search documents instead of guessing it from letters.
  - The engine itself waits for "What search finds" and the Architecture review.

  _Medium · S · audit (app-routes-9)._
- **D7 Small things that mislead.**
  - The root layout's `title.template` never applies, because every page sets an absolute title.
  - `site` names both the site settings and the content derivations, and two files alias around the clash.
  - Count words, list joins and title-morph names are retyped across files, and some copies disagree ("1 entries").

  **Change:**
  - Delete the template.
  - Rename the settings export to `siteConfig`.
  - Write one `count(n, one, many)`, one list join and one morph-name helper.

  _Low · S · audit (app-routes-10, app-routes-11, app-routes-12)._

### E. Components: one folder per module, one copy of each island

- **E1 The components folder has no structure rule.** This blocks the rest of E. 23 modules sit at the root, and only 3 of the 12 folders have an `index.ts`. Prose's `Text` is imported three different ways, and the questionnaire components import a stylesheet from `src/app`.
  **Change:**
  - Adopt one rule: every component lives in a folder named for its module, and that folder's `index.ts` is its interface.
  - Nothing imports another folder's internals or `@/app/*`.
  - Enforce it with `no-restricted-imports`, the way the content boundary is enforced.
  - Do all the moves in one ticket (about 90 import sites), because moves conflict with parallel builders.

  **Done when:** the lint rule passes with no exceptions.
  _Medium · M · audit (components-6)._
- **E2 The A–Z and Concept map filters are one island written twice.** Both copies hold the same address store, the same lazy swap to Base UI (which keeps a press in progress), the same focus hand-off and the same chip CSS. They already differ: one calls `focus({ preventScroll: true })`, the other a plain `focus()`. The A–Z's codec has no unit test.
  **Change:**
  - Build a `filters` module and an `island` module, each with the A–Z and the map as its two adapters.
  - Write the codec's tests first.

  _High · M · audit (components-1)._
- **E3 Four class names point at CSS classes that don't exist:** `styles.index` in `src/components/SiteFooter.tsx:28`, `styles.heading` in `src/components/concept/Contents.tsx:52`, `styles.legendGroup` in `src/components/map/ConceptMap.tsx:151` and `styles.contents` in `src/components/nav/MenuDrawer.tsx:70`. Each element silently loses its styling, and `pnpm check` passed with all four. Next types a CSS module as `{ [key: string]: string }`, so no check can catch this today. Four rules are also never used: `.badge` in the reading stylesheet, and `.letters`, `.lettered` and `.letter` in the listing stylesheet.
  **Change:**
  - Add a unit test, in the way the contrast test already reads CSS, that matches every `styles.x` against its module, and every class a module defines against a use.
  - Then fix the four lookups and delete the four rules.

  _Medium · S · checked (components-5, lib-config-styles-3)._
- **E4 Page-motion names are typed out in nine files.** A title morph works only when two files spell the same `concept-title-${slug}` name.
  **Change:** make `PageTurn` the page-motion module, with a `Turn` type and a `TitleMorph` that owns the name format.
  _Medium · S · audit (components-7)._
- **E5 The A–Z's interface leaks into its page.** The page builds the A–Z's ids, untyped chip values and numbering itself.
  **Change:** a pure `azModel()` plus one server `ConceptsAz`, both unit-tested.
  _Medium · M · audit (components-8)._
- **E6 Rules are repeated at their call sites:**
  - the "gloss only under a Sanskrit headword" rule (four copies)
  - section-role labels (three)
  - count helpers (five)
  - Devanagari numerals. Three of them lack `lang="sa-Deva"`, against CLAUDE.md's rule: `src/components/concept/Contents.tsx:49`, `src/components/topics/TopicCard.tsx:19` and `src/components/topics/ContentsPlate.tsx:81`.

  **Change:** give each rule one home, including a Press `Numeral` that always sets `lang`.
  _Low · S · audit (components-10)._
- **E7 Smaller tidy-ups:**
  - Split `src/components/questionnaire/Flow.module.css` (657 lines) among its three components, and use the global `sr-only`. Keep `Flow.tsx` whole.
  - Have the navigation data hand out finished words, so the footer stops depending on section order.
  - Give the map one home for its data-attribute contract.
  - Build preview payloads in one place.

  _Low · S · audit (components-11, components-12, components-13, components-15)._

### F. The content tools

- **F1 `extract.mjs`, a finished one-off scraper, also hosts the shared CLI runner and the captures reader.**
  **Change:**
  - Split it into `cli`, `records` and `captures`, plus the extract command on its own.
  - Tag and delete the extract command once "Keep, merge or drop each current page" closes without keeping a dropped page.

  _Medium · M · audit (content-authoring-5)._
- **F2 The tools re-declare schema facts:** the kind folders, `idOf`, the slug rule (four copies), the link fields `verify` skips by name, and Sanskrit normalisation.
  **Change:** export them from the schema, which `verify` can already import, then delete the copies and the test that keeps them in step.
  _Medium · M · audit (content-authoring-6)._
- **F3 Flag notes double as test waivers.** The References tests excuse a missing author or year whenever any Research-editor note on the record matches a word.
  **Change:**
  - Add structured `missing` and `citation` keys to Flag, and have the tests read those.
  - Change Flag once, together with A3.

  _Medium · M · audit (content-authoring-7)._
- **F4 The tools get no type checking.** `package.json` also allows Node 22.12, which the tools can't run on: they need 22.15.
  **Change:** raise `engines`, and type-check `scripts/` with `// @ts-check` and `checkJs`.
  _Low · M · audit (content-authoring-12)._
- **F5 Two items wait for a decision:**
  - IAST in running text can't carry `lang`, because the record format has no way to mark it. Decide under "Sanskrit terms: storage and display". Until then, CLAUDE.md's `lang` rule covers only name fields and Devanagari runs.
  - A passage stores its identity four ways. Simplify it with the back end's content model.

  _Low · audit (content-authoring-13, content-authoring-14)._

### G. Shared code, configuration and styles

- **G1 The Questionnaire status rule lives in two modules, and each gets its flags from a different place.** `shownStatus` in `src/lib/questionnaire/gate.ts` defaults to the `features` singleton. `canTake` in the content views gets its flags injected. Pages pair the two halves by hand in four places, and a test that injects flags into the content module can't make `gate.ts` agree with it.
  **Change:**
  - Move the rule into the content module. Each view gets the status a visitor sees, beside `status`, and a `takeHref` that exists only when the Questionnaire can be taken.
  - One `StatusBadge` replaces the four badge sites. This is D3's badge too.
  - Delete `gate.ts`, and test the rule through the content module alone.

  _High · M · audit (lib-config-styles-1)._
- **G2 The redirect table can't express the rest of FR-07.** It covers the 43 sitemap addresses and the feed. But its type has no `has` field for `?p=` shortlinks, its test's pattern rejects file paths such as media, and each per-page feed would need a hand-copied row to stay one hop. The URL inventory FR-07 cites was deleted with `docs/current-site.md`.
  **Change:**
  - Add `has` to the type.
  - Declare each old page once and derive its variants.
  - Check the old site's URL inventory into the repo, without usernames, and test that every address in it lands on a route in one hop.

  Where old media addresses should go is a decision for "URLs and redirects".
  _High · M · audit (lib-config-styles-2)._
- **G3 Colour tokens restate raw values, and colours mixed in modules escape the contrast test.** 57 colour tokens cover only 26 values (`#151a3d` is written 8 times), because the contrast test reads hex literals only. Modules restate the paper ink as `rgb(29 26 46 / α)` 7 times and use two off-palette shadow colours. Their 50 `color-mix()` colours are never checked: the A–Z's blank letter computes to 2.43:1.
  **Change:**
  - Write a primitive palette once, and make the semantic tokens `var()` aliases of it.
  - Teach the contrast test to resolve `var()`.
  - Add the mixed colours that carry text to the contrast pairs.

  _Medium · M · audit (lib-config-styles-5)._
- **G4 Each paper surface re-points its focus and link colours by hand.** Five modules do it. A paper popup that forgets keeps the page's turmeric focus ring, which is 1.18:1 on paper, and no check notices.
  **Change:**
  - One `[data-paper]` rule in the global stylesheet, set on each paper surface.
  - One browser check that a focused link on each surface draws its ring in the surface's focus colour.

  _Medium · S · audit (lib-config-styles-9)._
- **G5 Topic hues are keyed by slugs that the stylesheet and the contrast list repeat by hand.** A sixth topic record would get no `--topic` colour, and the footer and the map would paint nothing.
  **Change:** a unit test that every topic record has its colour token, its `[data-topic]` rule and a contrast pair. Do the same for Questionnaire statuses and `[data-status]`.
  _Medium · S · audit (lib-config-styles-10)._
- **G6 Tailwind only compiles tokens here, but the stylesheet's header tells agents to write utilities.** Markup uses one Tailwind utility, `sr-only`, four times, and three modules hand-write their own copy of it. About 20 tokens sit in `@theme` without a utility namespace. Tailwind's default palette still compiles, despite Press being the only design language.
  **Change:**
  - Keep Tailwind for tokens and Preflight, as ADR-0003 chose, and rewrite the header to say so.
  - Use `sr-only` in place of the three copies.
  - Add a test that literal class names come from an allowlist (`sr-only` and `skip-link`).
  - Consider resetting the default colours with `--color-*: initial`.

  _Medium · S · audit (lib-config-styles-11)._
- **G7 Type, spacing and breakpoints have no tokens.** There are 179 font-size declarations with 43 values, 532 spacing declarations with 174 values, and 35 media queries over 14 widths. The complement of 40rem is written three ways, so at exactly 40rem the A–Z applies two layouts at once.
  **Change:**
  - Start with a type scale (`--text-*`), adopted as tickets touch each module.
  - Name only the structural measures that recur.
  - Fix a set of breakpoints, write their complements with range syntax, and add a test that fails on any other width.

  _Medium · L · audit (lib-config-styles-12)._
- **G8 `src/lib` is a grab-bag of four roles.** `flow.ts`'s only callers are the questionnaire components. `score.ts` has no production caller, since the end step hard-codes its placeholder. `contrast.ts` is used only by its test.
  **Change:**
  - Define `src/lib` as pure helpers with no domain knowledge, used by two or more areas: `cx`, `text`, `sanskrit`.
  - Move `flow.ts` beside the questionnaire components.
  - Delete `score.ts` until FR-05's scoring rules exist.
  - Move `contrast.ts` beside the tokens.

  **Done when:** Part 1 states the rule.
  _Medium · S · audit (lib-config-styles-8)._
- **G9 `metadataFor` depends on the content module but sits outside its seam.** It imports the content singletons, so no test can run it with other content or flags. It parses slugs back out of paths, and it normalises paths differently from the breadcrumb trail: `metadataFor('/concepts/vikshepa')` gives a 404 where `site.trail` answers.
  **Change:**
  - Add `site.describe(path)` beside `site.trail`, built from the route entries (see C6), and test it through `createContent`.
  - Keep `src/lib/metadata.ts` as the thin Next adapter.

  _Medium · M · audit (lib-config-styles-7)._
- **G10 Flag handling around the seam.** Six modules read the `features` singleton rather than the injected flags (D2 covers the page gates, C8 the client rule). The flag tests are written twice, and 8 test files hand-write full flag objects.
  **Change:** one test helper builds flags from `readFeatures()`, and the duplicate tests go.
  _Low · S · audit (lib-config-styles-6)._
- **G11 Dead tokens and exports.**
  - The search palette's tokens and their contrast pairs belong to `archive/lane-search`, not `main`.
  - `--layer-thread` is restated as `z-index: 10`.
  - `ColourToken` and `statusOf` have no users.

  **Change:** delete them. The search ticket brings the palette back.
  _Low · S · audit (lib-config-styles-13)._

### H. The agent harness

- **H1 `ship`'s reviewers don't read SPEC.md.** The code-review skill always reads `CODING_STANDARDS.md` or `CONTRIBUTING.md`, but finds any other standards file only by searching.
  **Change:**
  - Name CLAUDE.md and SPEC.md as the standards in `ship`'s two review prompts: builder step 7 and the Finish review.
  - Have those prompts ask whether the diff makes any line in either file untrue.
  - Or rename this file `CODING_STANDARDS.md`.

  _Medium · S · research agent._

## Part 3. Handoff

Read this first when you pick the work up. Delete Parts 2 and 3 once the work is filed as issues (step 6).

### State on 2026-10-30

- `SPEC.md` is new and uncommitted, on `main`. Nothing else in the repo changed, and no branch, issue or PR exists for it.
- `main` is red (item 0.1).
- The swarm ran as workflow run `wf_16002144-dfa`, launched from a Claude Code session, and was stopped early on purpose.
  - Finished: the five area audits and the research.
  - Not run: the tests and agent-harness audits, the skeptic pass that tries to refute each finding, and the critic that looks for gaps.

  Part 2's **checked** items were re-verified by hand. The rest stand on one auditor's evidence.
- The raw results stay on this machine, outside the repo:
  - The journal holds every finding with its full evidence, each area's strengths and conventions, and the research with its sources, one JSON line per finished agent: `~/.claude/projects/-home-fedora-Documents-care4mind/360a1bdd-203c-4610-b629-5570ccd24534/subagents/workflows/wf_16002144-dfa/journal.jsonl`
  - The workflow script: `~/.claude/projects/-home-fedora-Documents-care4mind/360a1bdd-203c-4610-b629-5570ccd24534/workflows/scripts/care4mind-codebase-audit-wf_16002144-dfa.js`

### Next steps

1. **Finish the audit.** This is worth doing before you make tickets.
   - In a new session, copy the script to `.claude/workflows/audit.js`, beside `ship.js`, if you want it as a named, reusable workflow.
   - Cut its areas to `tests` and `harness`, and run it with the Workflow tool.
   - Then run one skeptic per Part 2 theme against the current `main`, told to refute each item. Drop or correct whatever doesn't survive.

   Resuming the stopped run only works inside the session that started it, so this is a fresh run.
2. **Make the calls that are yours.** Each one becomes a `ready-for-human` ticket, or a comment on its planning issue:
   - the reading-order contract for "Devanagari first", as an ADR (A7)
   - whether comments in record files may change, and whether the Flag remap needs provenance edits (A2, A3)
   - whether FR- and NFR- ids stay in comments and test titles (A2)
   - the glossary's missing terms, as their planning tickets settle them (A8)
   - which fields a newly written record needs, on "Content types, topics and shared fields" (B3)
   - where old media addresses should land, on "URLs and redirects" (G2)
   - this file's name: keep `SPEC.md`, or rename it `CODING_STANDARDS.md` so the code-review skill always reads it (H1)
3. **Publish the work.**
   - Run `/to-spec` to write one spec issue, such as "Clean up the codebase for spec-driven work", that points at Part 2.
   - Run `/to-tickets` to make each Part 2 item a sub-issue, with `gh issue create --parent <spec> --blocked-by <n,n> --label ready-for-agent`. The calls from step 2 get `ready-for-human` instead.
   - Write tickets in modules and symbols, not paths, so they survive the moves they ask for.
   - A6 opens a spec of its own.

   The blocking edges:
   - 0.1 comes first, then a ticket called "Add SPEC.md" (step 4). Every other ticket waits on both, because builders branch from `main` and must find this file there.
   - Moves come early, because they conflict with parallel builders: E1 blocks the rest of E and D4, C4 blocks C1 and C3, and F1 blocks F2.
   - Each check lands with its first cleanup: A2 one folder at a time, A5 with A1 and A4, E3 with its fixes.
   - A3 and F3 change Flag together, and G1 builds D3's badge.
   - B1's deletions wait for the client to sign off the migration. Its moves can start now.
   - Waiting on decisions: A7's build half, B3, F5, G2, and C2's caching and validation (the Architecture review).
   - The last ticket points CLAUDE.md at this file and removes Parts 2 and 3 (step 6).
4. **Commit this file** as the "Add SPEC.md" ticket's PR:
   - `git switch -c spec-md`.
   - Commit as `Siddharth Muramkar <334065514+SiddharthMuramkar@users.noreply.github.com>`.
   - Open a PR whose body starts `Closes #<ticket>`.

   It merges once CI is green, which needs 0.1's fix first.
5. **Build.** `ship` with `{ spec: <n>, dryRun: true }` shows the frontier; then run it with `{ spec: <n> }`. It leaves `ready-for-human` tickets to you and lists them.
6. **The last ticket.** Add this line to CLAUDE.md's Code section, and widen its same-PR rule to cover SPEC.md:

   > Before you refactor, add a module, seam, content kind or page, or review a diff, read `SPEC.md`: it maps the seams, says which rules a check keeps true, and lists the code not to copy.

   Then replace Parts 2 and 3 here with one line pointing at the spec issue, and delete every "Code that misleads" line whose item has landed.
7. **Keep this file short.**
   - After a `ship` run that went sideways, run `/retro` on that session by hand. Each mechanical lesson becomes a check, and its sentence leaves this file.
   - Every few days, or whenever a spec closes, run `/improve-codebase-architecture`. Chosen candidates go through `/to-spec`, and rejected ones with a lasting reason become ADRs.
   - Two Claude Code hooks would enforce the zero-exception rules inside a session: block edits under `src/content/generated/`, and run `pnpm lint` and `pnpm typecheck` when a session stops.

### Why this file is shaped this way

- Matt Pocock, "Delete (most of) your docs" (YouTube Short, 2026-07-16). Docs that restate the code drift away from it, and "if there are two sources of truth and they conflict, then AI won't know which one is the real one". Keep ADRs, a glossary and a thin layer for navigating, and put the burden on the code's shape. <https://www.youtube.com/shorts/Fj8DKMbdIzU>
- Matt Pocock, "A complete guide to AGENTS.md" and "Never run claude /init". Describe capabilities, not file structure, and include only what is both undiscoverable and globally relevant. <https://www.aihero.dev/a-complete-guide-to-agents-md>, <https://www.aihero.dev/never-run-claude-init>
- Matt Pocock, skills changelog v1.3: "A check can fail. A sentence in a Markdown file cannot." <https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md>
- Anthropic, Claude Code best practices. Write down only what Claude can't find by reading the repo, and make a rule that has no exceptions a hook or a check. <https://code.claude.com/docs/en/best-practices>
- Both use "spec" for one piece of work, which is why the top of this file says it isn't one.
