# SPEC.md

These are the standing rules for changing this codebase. Read them before you refactor, add a module or a seam, add a content kind or a page, or review a diff. This isn't a spec in CLAUDE.md's sense, where a spec is an issue. Words live in `GLOSSARY.md`, decisions in `docs/adr/`, and work in GitHub Issues. The cleanup backlog these rules came from is spec #26, and why this file is shaped as it is is ADR-0005.

## The code is the documentation

Every fact has one home. For most facts that home is the code: its names, types, tests and checks. This file holds only what the code can't say: where the seams are and why, the standards a reviewer applies, and which rules a machine checks. CLAUDE.md's rules stand as written. This file adds to them and repeats none of them.

## Modules and their seams

Each module is named by its capability, and outside code reaches it only through its entry. What guards each seam is in italics.

- **Content**, through `@/content`. Its namespaces are `concepts`, `topics`, `works`, `references`, `questionnaires`, `library`, `home` and `site`, plus `hrefFor()`, the view types and `RELATION_STRENGTH`, the kinds of relation strongest first. A page gets a view: plain, serialisable data shaped for that page. Behind the entry sit the record schema, the graph and the derivations. The graph resolves every link once and refuses a dangling id. One walk in the graph reads every record's block tree (blocks, quotes, terms, topic introductions, anchors, running text), and the graph indexes the reverse links — quoted in, cited by, Concepts in a topic or quoting a work, a work's passages, the Questionnaires listing a Concept — so a view never scans records for them. The derivations are the route registry, breadcrumbs, page descriptions, the A–Z, search documents and the Concept map. Tests reach the internals only through `@/content/testing`, the one sanctioned testing entry. The entry is marked `server-only`, so a client module reaching its values fails the build, directive or not. _Lint: the content boundary, with its own test (content-boundary)._
- **Content source**, the seam under Content: `ContentSource.records(kind)`. Two adapters satisfy it, the generated registry of record files (`localSource`) and the made-up records tests hold in memory (`memorySource()`), so the seam is real. The interface's doc comment lists an adapter's duties; the graph sorts each kind by id. A content back end becomes one more adapter, and nothing above it changes. _Tests: content-registry, content-interface, content-derive._
- **Records**: one file per record. Each is default-exported through its kind's `define…` helper from `@/content/schema`, and points at other records by id only. The registry that lists them is generated. _Types, the graph's dangling-id check, the content tests, and the registry that `pnpm check` and every test run write afresh._
- **Addresses**: every internal link comes from `hrefFor()`, typed as Next's `Route` there once; a view's `href` is a `Route`, and its `url`, where it has one, leaves the site. _Lint: `care4mind/href-from-hreffor`._
- **Pages**: App Router routes that read content only through `@/content`. `site.routes()` is the one list of public pages, and `site.route(path)` and `site.params(pattern)` read it. A dynamic page's `generateStaticParams` is `site.params` of its pattern. The sitemap, page metadata, the breadcrumb trail, the navigation, the links to optional pages and the link crawler read the list. A page never asks a flag whether it exists: its breadcrumb trail answers 404 for a path the registry doesn't list. _Tests: content-derive, routes, page-shell; browser: crawler._
- **Reading page**: `ReadingPage` is the shell every page below the homepage renders from its own `page.tsx`, never from a layout, because a page turn needs the wrapper inside the page. It owns `main#main` (the skip link's target), the breadcrumb trail, the paper folio and its title page, pairing the folio's `aria-labelledby` with the title's id, and the page widths as named variants. The homepage and the error pages keep their own main. _Tests: page-shell; browser: pages._
- **Page motion**, through `@/components/PageTurn`: `PageTurn` wraps a page so a link carrying a `Turn` (`turnForward` deeper in, `turnBack` up the trail) turns it, and `TitleMorph` is the one place a flying title's shared name is spelled, from its kind and slug, so a card and its page's heading can never name different flights. A page whose title flies in says so as a kind and a slug (a `ReadingPage`'s `titleMorph`), never as a spelled name. _Tests: page-motion; browser: page-turn, motion._
- **Page metadata and share cards**: `site.describe(path)` in Content gives a page its name and description from the route entries; `metadataFor(path)` in `@/lib/metadata` is the thin Next adapter that shapes one as a title, description, canonical address and Open Graph and Twitter text, and answers not found where `describe` has none. Images never go in metadata: each page's route segment has an `opengraph-image.tsx` that calls `shareCard()` (`@/lib/share-card`), which reads the WOFF twins of the font subsets through `@/fonts/card-faces`. _Tests: content-derive, site; browser: share-card._
- **Search**: the `Search` type in `@/lib/search/search`, a query in and hits ranked best first out (a whole name or title match first, then score); a hit matched only in an excerpt counts only when it scores more than one excerpt word can (the excerpt weight), so a lone word in an excerpt never makes a result on its own; `resultGroups` there groups them for the page, five to a group until one is expanded. Pages call `search()` from `@/lib/search/server`, which answers from the engine (`@/lib/search/engine`) over the site's search documents, so the Architecture review can put another engine behind it. _Tests: search (unit and browser)._
- **Feature flags**: `features`, read once at build, on the server. A client component gets a flag as a prop. A feature that's built but not yet approved for launch is on in previews and off in production. The built proposals are the Concept map, Start here (`/start/`, linked from the header and the Menu) and What's on your mind? (six chips under the homepage hero, each leading to a Concept; it has no route of its own, and its section goes with its flag); with a flag off, its route leaves `site.routes()`, so its links go too. _Tests: features; browser: the crawler and pages specs on a build with every flag off, as production has. Lint (content boundary) and the `server-only` marker keep the reading server-only._
- **Redirects**: one table, each entry served as a 301. Each old page is declared once there and its feed variant is derived from that declaration; the old addresses themselves are the checked-in inventory in `src/config/old-site-urls.ts`. _Tests: redirects (unit and browser)._
- **Questionnaire flow**: one reducer holds a person's answers, and nothing else does (no storage, cookies, address or request). No record stores scoring until the Psychology expert's rules arrive. _Types (`scoring.status` is `'pending'`), the content-integrity "held back" test, review._
- **Script pair**: `script/ScriptPair` is the one drawer of a name's IAST and Devanagari set together, IAST first; a verse set as blocks goes through it with `as="div"`. A Concept card, a preview slip, a shloka, a contents-plate row, the hero and numerals keep their own markup: their layout differs, or they are not a name pair. _Browser: concept._
- **Press**, the one design language. Colours, durations, easings, layers, a type scale (`--text-*`) and the recurring measures (`--measure-*`) are tokens in the global stylesheet; a module adopts a type step when it next changes and its size equals one. Each component styles itself through its own CSS module, reading those tokens with `var()`. Tailwind supplies only the tokens and Preflight: the one global class markup uses from it is `sr-only`, and the site adds `skip-link` of its own. A colour chosen by content (a topic, a Questionnaire status) is mapped from a data attribute in the global stylesheet. Interface labels — menu items, buttons, chips, metadata and footer headings — are sentence case, with no small capitals; each section keeps small capitals for one small label at most, such as a page's kicker, a contents running head, a section's role or the hero motto's translation. A link in running text takes its surface's one style, never italic: underlined gold on the indigo ground, underlined vermilion on paper, both reached through the `link` token, which `data-paper` remaps on paper; navigation and chips keep their drawn line or slip, and a call to action its button. There is one primary button (the `Cta` primary), the same everywhere and at most one to a screen; a card's action is a text link in its surface's style, not a second primary. Where order matters — contents lists, steps, a topic's place — a Western numeral stands beside the Devanagari one, and the Devanagari numerals stay decoration. A `TopicChip` names a topic in ink on the paper, with a dot drawn in the topic's hue from its `data-topic`; topic hues are drawings only, never text, so a topic is never told by colour alone. The printer's double frame, with its diamond corners, marks only the hero, verse cards and featured cards; a reading page's folio (`Folio`'s `page` variant) is a paper panel with a single thin rule, and below 40rem it carries no frame, its text running to the page's 16px margins. Only the hero lotus moves on its own: it draws in and breathes once, by CSS alone, moving transform and opacity, and ends within 5 s of load, so there is no pause control. Every lotus leans toward the pointer and blooms when pressed, and nothing moves under reduced motion. _Browser: lotus, motion._ _The class-name test keeps markup to those two global classes; the Tailwind output test keeps the compiled utilities to `sr-only`; the contrast test checks the listed colour pairs; review checks the rest._
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
| Pages read content only through `@/content`, dynamically too; a client file imports it and `@/config/features` for types only; tests reach internals only through `@/content/testing` | lint (content boundary) and its test; the entries' `server-only` marker at build |
| A component lives in a folder, and that folder's index is its interface | lint (`no-restricted-imports`) and its test |
| A dynamic page's params are the registry entries of its pattern | routes test |
| Every page below the homepage renders the ReadingPage, and every route has exactly one `main#main` | page-shell test; browser: pages |
| The graph imports neither the views nor the derivations above it | lint (content boundary) and its test |
| Internal links come from `hrefFor()` | lint (`care4mind/href-from-hreffor`) |
| Every link between records resolves | the graph, at build and in every content test |
| A new kind's links, pages and search documents are declared before anything compiles | types: the tables typed as one entry per kind in the graph's links, the route registry and the search documents, and the `never` defaults on the per-kind switches (`idOf`, `hrefFor`, `recordRef`, `targetHref`) |
| Sanskrit is NFC with ṃ; each name field holds one script, in characters the fonts cover | content-integrity test |
| The registry is generated, not edited | git ignores it, and `pnpm check` and every test run write it afresh |
| No record stores scoring | types and the content-integrity test |
| Every Questionnaire a visitor can't take reads "In preparation" (its status is unchanged), and the header and phone menu list Questionnaires only while one can be taken in the build (`questionnaires.anyTakeable()`); the footer always lists it, under the home record's drafted label while none can be taken | questionnaire-flow test (status words, the takeable rule); browser: questionnaire, nav |
| Press colour pairs meet contrast, each primitive colour is written once, and colour tokens alias or mix the primitives | contrast test, for the pairs it lists, resolving `var()` and `color-mix()`. A mix that carries text is a token, so it can be listed; review keeps modules from mixing their own |
| Layouts change only at the fixed breakpoints (21, 22.5, 24, 30, 34, 37.5, 40, 46, 48, 52, 60, 64 and 72rem), each written in range syntax as `(width >= n)` or its complement `(width < n)`, so no width gets two layouts | breakpoints test, over every CSS file in `src` |
| `--color-surface-rule` is a rule, never text | contrast test |
| Pages pass axe at WCAG 2.2 AA and its structural best-practice rules; text whose contrast axe can't settle passes only for a reviewed reason and when its own colours form a listed pair at 4.5:1 — a table frame's scroll shadow over such a pair only where the shaded colours reach 4.5:1 themselves or the shade's tile covers a sliver of the glyphs at the frame's edge | `expectNoAxeViolations` in `tests/e2e/axe.ts`, run by the page specs; the axe spec checks the helper itself |
| Icon and manifest colours equal their tokens | icons test |
| Lotus motion is CSS only, transform and opacity: only the hero moves on its own, once, ending within 5 s of load; every lotus answers the pointer; nothing moves under reduced motion; no pause control | lotus and motion specs |
| Every Concept card and result — the shared card, the A–Z, Related Concepts, search results and a Concept's preview slip — shows its topic chip and the reading time its page shows, counted once on the card view | content-interface test; browser: topics, concepts-index, concept, search |
| Wherever a Concept is named away from its own page, its Sanskrit name leads and its gloss follows at reading size: plain text joins them with `·` (`conceptName` in the content module), and markup keeps them apart so only the IAST carries `lang`. Its own H1 keeps the Sanskrit name, its gloss the subtitle. One exception: the Concept map's plate labels keep the Sanskrit name alone, because `src/components/map/layout.ts` copyfits each label into the room its point has on the circle and a gloss would overflow onto its neighbours; the connections list beside the plate names every Concept in full | content-interface test (the naming function's three cases), content-derive and site tests; browser: pages, search, concepts-index, concept-map |
| A `styles.x` lookup names a class its CSS module defines, and markup reads every class a module defines | CSS module classes test |
| A focused link on a paper surface, marked `data-paper`, rings in paper's focus colour | paper spec |
| Until launch every page says noindex: the robots and googlebot meta from the root layout, and the X-Robots-Tag header (`siteConfig.indexable` is the switch) | keep-list test; browser: pages. The global error page's own meta: error-pages test |
| The skip link is the first thing in the body and leads to `main#main` | keep-list test; browser: pages. The global error page's own skip link: error-pages test |
| Keyboard focus draws a 3 px solid outline in the gold focus colour | keep-list test; browser: pages, paper |
| A Library link to another site says so in words ("another site", the arrow decoration) | keep-list test, over every Reference read elsewhere; browser: library |
| IAST and Devanagari carry `lang` | script-pair test for name fields, numeral test for Devanagari numerals (`Numeral` always sets it), keep-list test for Devanagari runs in running text and the document's own `lang`; components, for the verse-copied toast and the rest. IAST inside running text is untagged (#76) |
| The migration's records, counts and derived pages stay as carried over, until the client signs it off | the fidelity suite in `tests/fidelity`, which `verify.mjs` runs after checking every record (or `pnpm content:fidelity` alone); not in `pnpm check`, so new content needs no test edit |
| Carried-over text changes only to fix a listed error | `pnpm content:verify` against the captures (`--changed <ref>` scopes it to a branch's records and needs no captures when none changed); ship's builders must pass it on a data PR and record its summary, its reviewer flags a missing run, its land step merges none without one, and a builder stops `needs-info` when the captures are absent (ship test). CI has no captures, so no CI job runs it |
| Comments and test titles state reasons, not ticket numbers or decision codes | comment-codes test, over every tracked `.ts`, `.tsx`, `.mjs`, `.cjs`, `.js`, `.css` and `.yml` file |
| A backticked repo path, a `pnpm` script or a section of a doc named in a doc or a comment exists | pointers test |
| An agent squash-merges only a PR whose `ci` passed on an up-to-date branch, with a review posted and every thread answered; nobody uses auto-merge or `--admin` | the ruleset (squash, up-to-date, threads resolved, `ci`, no bypass) and the ship test, which lets only its land step merge, after review |
| `main` changes only through a squashed PR whose required check passed on an up-to-date branch | the ruleset on GitHub, whose file the ruleset test checks; `pnpm ruleset:check` compares the two |
| Nobody commits to `main` or pushes to it, the developer included | the ruleset: `main` takes a pull request only, never a direct push |
| `ship` opens PRs, has a reviewer agent review each and its builder answer the review, then squash-merges each and builds what was waiting; its agents run light | ship test |
| Each "Code that misleads" line names an open ticket | review |
| Names use glossary terms; comments say why; Press only; depth; tests at the seam | review |

## Where a change goes

- **A record of an existing kind:** `pnpm content:new <kind> <id>` writes a template that compiles; with `--written` it writes one for a record written for the new site, whose provenance names its author and day instead of a source page, and which `verify.mjs` doesn't check against the saved pages. Fill it in, then run `pnpm check`: no test needs an edit. `pnpm content:fidelity`, and so `verify.mjs`, will then fail, since it pins what the migration carried over; update it only for a change to that migration.
- **A link field:** the record schema, the graph's link check, then the view that shows it.
- **A content kind:** the compiler finds only some of these places, so work through every step:
  1. The record schema: its type, its `define…` helper and its kind's folder.
  2. The graph: its entry in the links table (its check, the References it cites, the passages it quotes, its anchors); the reverse indexes are built from it. The compiler refuses until the entry is there, and a kind that links nowhere says so in its entry.
  3. The view types and views: Ref, Card and View, plus `hrefFor()`'s target.
  4. Its namespace on `@/content`.
  5. The derivations: its entries in the pages table (its route's title and address, or no page of its own) and the search-documents table (its documents, or none). The compiler refuses until each entry is there.
  6. The pages, the navigation, Linked knowledge and search's result headings.
  7. The tools behind `content:new` and `verify`.
  8. GLOSSARY.md.
- **A page:** a route that reads `@/content`. Its address is an `hrefFor()` target, and its entry in `site.routes()` puts it in the sitemap, breadcrumbs and crawler.
- **A topic:** its record, plus its colour token, its `[data-topic]` rule and its contrast pair; the token keys test checks the last three, and the same for a Questionnaire status.
- **A helper:** `src/lib` holds pure helpers with no domain knowledge that two or more areas use (`cx`, `text`, `sanskrit`), beside the metadata, share-card and search modules above. Code with one home lives beside it: the Questionnaire flow reducer with the Questionnaire components, the contrast arithmetic with the tokens in `src/styles`.
- **A colour, duration or easing:** a token in the global stylesheet. A new colour value is a `--press-*` primitive, and the `--color-*` token that names its role aliases or mixes it. A colour pair that carries text, mixed ones included, joins the contrast list.
- **A feature awaiting the Project owner's approval:** a flag in `features`.
- **A moved address:** a row in the redirect table. Its destination is written as `hrefFor()` would make it, and it answers in one hop.
- **Something agents may or may not do:** a line in CLAUDE.md's Delivery section, the ship workflow's prompts with a row in its test, and the ruleset when GitHub can hold it.
- **A required check or a ruleset rule:** `.github/rulesets/main.json`, applied with `pnpm ruleset:apply --commit <sha>` once the check has completed on that commit, so a misspelt name can't lock `main`.

## The feedback loop

`pnpm check` is the one local signal that a change is done. CI runs it on every PR and every push to `main`, then the browser tests in parallel shards and Lighthouse on the build it made. Beside them, one job builds with every `FEATURE_*` variable at `0`, as production has, and runs the crawler and the pages spec on that build. The job named `ci`, which `.github/rulesets/main.json` requires, waits for all of them, and GitHub won't merge a PR until it passes on a branch that's up to date with `main`. Also run the browser tests you touched, against the build `pnpm check` made: `E2E_ONLY=<spec names> pnpm check:e2e`, where the names are file names in `tests/e2e` without `.spec.ts`.

An agent's PR is done when it's merged: green, reviewed, every review thread answered, then squash-merged. In `ship`, a reviewer agent posts that review, the PR's builder answers it, and ship's land step merges it; GitHub deletes the branch.

The content registry is rewritten by `dev`, `build`, `typecheck`, `test`, `test:e2e`, `check` and every Vitest run. A running `next dev` sees a new record file only once the registry is rewritten: rerun the registry script, or restart.

The tools under `scripts/` are plain JavaScript checked by `tsc -p scripts` in `typecheck`: every one starts `// @ts-check`, and `tests/unit/scripts-typecheck.test.ts` keeps that true.

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

## Changing this file

- A rule comes in together with what keeps it true: a check, or "review".
- A change that makes a line here untrue updates it in the same PR.
- A standard or a seam changes only by the developer's decision, so a builder that needs one stops with `needs-info`.
- A line that changes nobody's behaviour is deleted.
