# SPEC.md

These are the standing rules for changing this codebase. Read them before you refactor, add a module or a seam, add a content kind or a page, or review a diff. This isn't a spec in CLAUDE.md's sense, where a spec is an issue. Words live in `GLOSSARY.md`, decisions in `docs/adr/`, and work in GitHub Issues. The cleanup backlog these rules came from is spec #26, and why this file is shaped as it is is ADR-0005.

## The code is the documentation

Every fact has one home. For most facts that home is the code: its names, types, tests and checks. This file holds only what the code can't say: where the seams are and why, the standards a reviewer applies, and which rules a machine checks. CLAUDE.md's rules stand as written. This file adds to them and repeats none of them.

## Modules and their seams

Each module is named by its capability, and outside code reaches it only through its entry. What guards each seam is in italics.

- **Content**, through `@/content`. Its namespaces are `concepts`, `topics`, `works`, `references`, `questionnaires`, `library`, `home` and `site`, plus `hrefFor()`, `displayName()`, `asciiSpellings()` and the view types. A page gets a view: plain, serialisable data shaped for that page. Behind the entry sit the record schema, the graph and the derivations. The graph resolves every link once and refuses a dangling id. The derivations are the route registry, breadcrumbs, the A–Z, search documents and the Concept map. _Lint: the content boundary, with its own test (content-boundary)._
- **Content source**, the seam under Content: `ContentSource.records(kind)`. Two adapters satisfy it, the generated registry of record files and the made-up sources the tests build, so the seam is real. A content back end becomes one more adapter, and nothing above it changes. _Tests: content-registry, content-interface, content-derive._
- **Records**: one file per record. Each is default-exported through its kind's `define…` helper from `@/content/schema`, and points at other records by id only. The registry that lists them is generated. _Types, the graph's dangling-id check, the content tests, and the registry that `pnpm check` and every test run write afresh._
- **Addresses**: every internal link comes from `hrefFor()`. _Lint: `care4mind/href-from-hreffor`._
- **Pages**: App Router routes that read content only through `@/content`. `site.routes()` is the one list of public pages, and `site.route(path)` and `site.params(pattern)` read it. A dynamic page's `generateStaticParams` is `site.params` of its pattern. The sitemap, page metadata, the navigation and the link crawler read the list. _Tests: content-derive, routes; browser: crawler._
- **Page metadata and share cards**: `metadataFor(path)` in `@/lib/metadata` gives every page its title, description, canonical address and Open Graph and Twitter text. Images never go in metadata: each page's route segment has an `opengraph-image.tsx` that calls `shareCard()` (`@/lib/share-card`), which reads the WOFF twins of the font subsets through `@/fonts/card-faces`. _Tests: site; browser: share-card._
- **Search**: the `Search` type in `@/lib/search/search`, a query in and hits grouped by kind out. Pages call `search()` from `@/lib/search/server`, which answers from the engine (`@/lib/search/engine`) over the site's search documents, so the Architecture review can put another engine behind it. _Tests: search (unit and browser)._
- **Feature flags**: `features`, read once at build, on the server. A client component gets a flag as a prop. A feature that's built but not yet approved for launch is on in previews and off in production. _Tests: features. Review for the server-only reading._
- **Redirects**: one table, each entry served as a 301. _Tests: redirects (unit and browser)._
- **Questionnaire flow**: one reducer holds a person's answers, and nothing else does (no storage, cookies, address or request). No record stores scoring until the Psychology expert's rules arrive. _Types (`scoring.status` is `'pending'`), the content-integrity "held back" test, review._
- **Press**, the one design language. Colours, durations, easings and layers are tokens in the global stylesheet. Each component styles itself through its own CSS module, reading those tokens with `var()`. Tailwind supplies only the tokens and Preflight: the one global class markup uses from it is `sr-only`, and the site adds `skip-link` of its own. A colour chosen by content (a topic, a Questionnaire status) is mapped from a data attribute in the global stylesheet. Every lotus breathes by CSS alone, moving transform and opacity; it is still under reduced motion and once the visitor pauses it. _Browser: lotus, motion._ _The contrast test checks the listed colour pairs; review checks the rest._
- **The agent guard**: `.claude/hooks/guard.mjs`, which Claude Code runs before every Bash, Edit and Write call in this repo, subagents included (`.claude/settings.json`). One pure `decide()` reads the command the way the shell would and answers deny, ask or nothing. _Tests: guard._
- **The ruleset as code**: `.github/rulesets/main.json`, compared with GitHub by `pnpm ruleset:check` and applied by `pnpm ruleset:apply --commit <sha>`. _Tests: ruleset._

## Standards a reviewer applies

These are judgement calls, so review checks them against the diff, in the codebase-design skill's vocabulary: module, interface, depth, seam, adapter, leverage, locality.

- **Depth.** A module earns its place by the deletion test: delete it, and its complexity would reappear across its callers. A seam is real once two adapters fill it. Prefer deepening an existing module to adding a shallow one.
- **Tests cross the seam callers use.** They assert behaviour against expected values worked out independently, and hold for any amount of content: a correct new record needs no test edits.
- **The diff's scope is the ticket.** A decision that's still open (below) stays open in the code: the seam waits, and the decision fills it later.
- **A decision is cited by its reason**, in the comment, or by its ADR.

## What keeps each rule true

| Rule | Kept true by |
| --- | --- |
| Pages read content only through `@/content`; a client file imports it for types only | lint (content boundary) and its test |
| A dynamic page's params are the registry entries of its pattern | routes test |
| The graph imports neither the views nor the derivations above it | lint (content boundary) and its test |
| Internal links come from `hrefFor()` | lint (`care4mind/href-from-hreffor`) |
| Every link between records resolves | the graph, at build and in every content test |
| Sanskrit is NFC with ṃ; each name field holds one script, in characters the fonts cover | content-integrity test |
| The registry is generated, not edited | git ignores it, `pnpm check` and every test run write it afresh, and the guard refuses edits under `src/content/generated/` |
| No record stores scoring | types and the content-integrity test |
| Press colour pairs meet contrast, each primitive colour is written once, and colour tokens alias or mix the primitives | contrast test, for the pairs it lists, resolving `var()` and `color-mix()`. A mix that carries text is a token, so it can be listed; review keeps modules from mixing their own |
| `--color-surface-rule` is a rule, never text | contrast test |
| Icon and manifest colours equal their tokens | icons test |
| Lotus motion is CSS only, transform and opacity, still under reduced motion and when paused | lotus and motion specs |
| A `styles.x` lookup names a class its CSS module defines | nothing yet (#67) |
| IAST and Devanagari carry `lang` | components, for name fields, the verse-copied toast and Devanagari runs. IAST inside running text is untagged (#76) |
| Carried-over text changes only to fix a listed error | `verify.mjs`, which runs only on a machine with the captures; nothing in CI (#48) |
| Comments state reasons, not ticket numbers or decision codes | nothing yet (#38) |
| A backticked repo path, a `pnpm` script or a section of a doc named in a doc or a comment exists | pointers test |
| Agents never merge a PR, turn on auto-merge, push to `main` or delete a branch | the guard and its test (guard). It reads commands, not intent: a script it can't read makes it ask, and review covers the rest |
| `main` changes only through a squashed PR whose required check passed on an up-to-date branch | the ruleset on GitHub, whose file the ruleset test checks; `pnpm ruleset:check` compares the two |
| Nobody commits to `main` or pushes to it, the developer included | the git hooks in `.githooks/`, installed by `prepare` (githooks test). `--no-verify` skips them, and the guard refuses that to agents |
| `ship` opens PRs, has a reviewer agent review each and its builder answer the review, then stops; its agents run light | ship test |
| Each "Code that misleads" line names an open ticket | review |
| Names use glossary terms; comments say why; Press only; depth; tests at the seam | review |

## Where a change goes

- **A record of an existing kind:** `pnpm content:new <kind> <id>` writes a template that compiles. Fill it in, then run `pnpm check`. Today that check fails on tests that pin record counts (#45).
- **A link field:** the record schema, the graph's link check, then the view that shows it.
- **A content kind:** the compiler finds only some of these places, so work through every step:
  1. The record schema: its type, its `define…` helper and its kind's folder.
  2. The graph: the link check and the reverse indexes. Nothing fails if you miss these (#49).
  3. The view types and views: Ref, Card and View, plus `hrefFor()`'s target.
  4. Its namespace on `@/content`.
  5. The derivations: routes, and search documents. Nothing fails if you miss search (#49).
  6. The pages, the navigation, Linked knowledge and the search page's headings.
  7. The tools behind `content:new` and `verify`.
  8. GLOSSARY.md.
- **A page:** a route that reads `@/content`. Its address is an `hrefFor()` target, and its entry in `site.routes()` puts it in the sitemap, breadcrumbs and crawler.
- **A topic:** its record, plus its colour token, its `[data-topic]` rule and its contrast pair. Nothing checks the last three yet (#81).
- **A colour, duration or easing:** a token in the global stylesheet. A new colour value is a `--press-*` primitive, and the `--color-*` token that names its role aliases or mixes it. A colour pair that carries text, mixed ones included, joins the contrast list.
- **A feature awaiting the Project owner's approval:** a flag in `features`.
- **A moved address:** a row in the redirect table. Its destination is written as `hrefFor()` would make it, and it answers in one hop.
- **Something agents may or may not do:** a rule in the guard's `decide()` with a row in its test, and a line in CLAUDE.md's Delivery section when it changes what agents are told.
- **A required check or a ruleset rule:** `.github/rulesets/main.json`, applied with `pnpm ruleset:apply --commit <sha>` once the check has completed on that commit, so a misspelt name can't lock `main`.

## The feedback loop

`pnpm check` is the one local signal that a change is done. CI runs it on every PR and every push to `main`, then the browser tests in parallel shards and Lighthouse on the build it made. The job named `ci`, which `.github/rulesets/main.json` requires, waits for all of them, and GitHub won't merge a PR until it passes on a branch that's up to date with `main`. Also run the browser tests you touched, against the build `pnpm check` made: `E2E_ONLY=<spec names> pnpm check:e2e`, where the names are file names in `tests/e2e` without `.spec.ts`.

An agent's PR is done when it's open, green and every review thread is answered. In `ship`, a reviewer agent posts that review and the PR's builder answers it. `ship` stops there, and the developer reviews, merges and deletes the branch.

The content registry is rewritten by `dev`, `build`, `typecheck`, `test`, `test:e2e`, `check` and every Vitest run. A running `next dev` sees a new record file only once the registry is rewritten: rerun the registry script, or restart.

## Decisions still open

The planning map, issue #6, lists them. Until each is decided, the code leaves its seam empty:

- the content back end, search, media storage and editor login (Architecture review)
- what search finds, beyond the fields, ranking, grouping and construct rule settled on #14
- the Questionnaire record, its scoring sources and its results page
- content types, topics, links between content, traditional texts, and References, people and journals (the related set is settled on #10; the construct link's structure isn't)
- how Sanskrit names are stored (their display is settled on #11)
- URLs and redirects, findability, and the rest of the site map (the navigation proposed on #16 awaits the Project owner)

## Code that misleads

The code still holds these patterns, and new code doesn't copy them. Each line names the ticket that removes the pattern, and the PR that closes that ticket deletes the line.

- Comments that cite ticket numbers, decision codes (D01–D21), design codes (such as B6) or spec names. The documents they point at were deleted in `bfdbff0`. State the reason instead (#38).
- Tests that pin how many records exist (#45).
- The "Devanagari first" stubs, which render nothing, though the proposals page calls the feature built (#43).
- Settings that look load-bearing but do nothing here: the root layout's `title.template`, since every page sets an absolute title (#64), and `typedRoutes`, which can't check paths that end in a slash (#55). The checks that do hold links true are the `hrefFor()` lint rule and the browser crawler.

## Changing this file

- A rule comes in together with what keeps it true: a check, or "review".
- A change that makes a line here untrue updates it in the same PR.
- A standard or a seam changes only by the developer's decision, so a builder that needs one stops with `needs-info`.
- A line that changes nobody's behaviour is deleted.
