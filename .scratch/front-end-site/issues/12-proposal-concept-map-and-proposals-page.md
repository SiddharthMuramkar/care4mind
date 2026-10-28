# 12: Proposal: Concept map and the proposals page

Status: resolved
Blocked by: 03, 04
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C5 · Decisions: D06, D20, D21

**What to build:** two pages for the Project owner to judge in the sign-off pack.

**The Concept map** at `/concepts/map/` shows the 19 Concepts round a circle, one sector per topic, as a printed plate.

- Hairline curves, inked once on load, join Concepts that share a verse, a work or a rarely cited Reference, each kind in its own line style.
- Pointing at or focusing a Concept lights its neighbours.
- Filters show one kind of connection at a time.
- A "Connections" list says everything the picture shows, in words. On a phone it is what you see first.

**The proposals page** at `/proposals/` lists what the design suggests beyond the brief:

- the two built proposals, the map and site-wide "Devanagari first";
- one idea described but not built, audio pronunciation. (The fourth idea of the first plan was dropped with D21, and ticket 16 removes its entry.)

Both pages are labelled Proposal, and both disappear when their flags are off.

## Owns

- `src/app/concepts/map/**` and `src/app/proposals/**`
- `src/components/map/**` (new)
- `src/components/proposals/**`, including ProposalNote from ticket 04
- `src/content/derive/graph-data.ts`: adjust only if needed, keeping `@/content`'s interface and the content tests unchanged
- `tests/e2e/concept-map.spec.ts` and `tests/e2e/proposals.spec.ts` (new)

## Acceptance criteria

- [x] **Gates (D20):**
  - `/concepts/map/` exists only while `conceptMap` is on, and `/proposals/` only while `conceptMap` or `devanagariFirst` is on.
  - When off, each returns 404 and drops out of the registry, the sitemap, the navigation, search and every link.
  - A unit test covers both conditions.
- [x] **Labelled:** both pages carry a ProposalNote near their heading, saying in words that this is a proposal awaiting the Project owner's decision.
- [x] **Layout at build time:**
  - The positions come from `site.graph()` and are computed during the build: a circle with one sector per topic.
  - The browser runs no layout code.
  - The map reserves its box, so nothing shifts as it loads.
- [x] **The printed plate (D21):**
  - The edges are hairline curves, one per connection, typed by line style: solid for a shared passage, dashed for a shared work, dotted for a rarely cited shared Reference. Tomar (2024) is excluded.
  - The types differ by line style, never by colour alone, and a legend names them (WCAG 1.4.1).
  - The curves ink in once on load, following the Press ornament conventions, and are finished and still under reduced motion and in print.
  - The line layer is hidden from assistive technology.
- [x] **Points:**
  - Each Concept is an HTML link laid over the SVG line layer, named with the Concept, and opens its page with a forward page turn.
  - The tab order follows the topics.
  - Hovering or focusing a point highlights its neighbours and their curves through `:has()` rules generated at build time, with no JavaScript.
- [x] **Filters:**
  - A Base UI ToggleGroup filters by connection type and by topic.
  - The state lives in the address's query string, and the visible connections are announced politely.
  - With JavaScript off, everything shows.
- [x] **Connections list:**
  - A list states every connection and its reason, for example "Vikṣepa and Pañca kleśa: both quote Yoga Sūtra 1.30", with both Concepts as links.
  - Below about 600 px it shows first, with the map one tap away. Above that, both are on the page.
- [x] **The proposals page:**
  - **Concept map:** built; with a link to it.
  - **Site-wide "Devanagari first":** built; with how to try it.
  - **Audio pronunciation:** described, not built.

  There is no fourth entry: the "reading path" idea was dropped with D21. Each entry says, in plain interface text, what it adds, what it costs in speed and upkeep, and how it is switched off.
- [x] **Breadcrumbs (D15):** Home › Concepts › Concept map, and Home › Proposals.
- [x] **Reflow:** both pages fit 320 px with no sideways scroll (WCAG 1.4.10). At narrow widths the map scales down or gives way to the list, and never scrolls sideways.
- [x] **Speed:** no client JavaScript beyond the filter chips. Record the page's first-load JavaScript and its SVG size in Comments.
- [x] **Tests:**
  - `concept-map.spec.ts` covers: neighbours lighting on focus (computed style), a point opening its Concept, filters by keyboard, the Connections list against `site.graph()`, the 360 px default, and axe.
  - `proposals.spec.ts` covers: the three entries and no others, links, and axe.
- [x] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

**From content-v1, 2026-10-28:** the map has 19 nodes and 85 edges, none through Tomar (2024). Shared works make 62 of the 85, because the Yoga Sūtra and the Bhagavad Gītā join most Concepts. Lead with shared passages and rarely cited References, and show shared-work edges only on demand, or the map turns into a hairball.

**Built, 2026-10-28 (lane/site-12):**

- **Layout at build time** (`src/components/map/layout.ts`, a pure module, unit-tested in `tests/unit/concept-map.test.ts`): `layoutMap(site.graph(), topics)` puts the 19 Concepts on one circle (radius 300 in a 1000-unit square), clockwise from the top in the graph's order, so the tab order follows the topics. The topics split between the circle's right half (Self, Mind) and left half (Practice, Values, Guṇa), and each half spaces its Concepts evenly *down the page*: their names are set across, so even vertical spacing keeps neighbouring names apart, and the poles stay clear. Each topic is a sector: an arc in its hue with its Devanagari numeral inside the circle. The plate is cropped to the circle (1000 × 648), so it sits above the fold at 1440 × 900.
- **One curve per pair and kind:** the graph's 85 facts make **74 connections** (8 shared verse, 4 rarely cited Reference, 62 shared text). A pair with several facts of one kind (Sthitaprajña and Brahmacarya share six Gītā verses) is one curve and one row, listing every reason. Curves are quadratic, bowed towards the centre by kind (shared verse 0.22, Reference 0.46, text 0.10), so two kinds on one pair (3 pairs) take apart curves. Tomar (2024) never appears: `site.graph()` already leaves it out; `graph-data.ts` is unchanged.
- **The printed plate** (`ConceptMap.tsx`, server-rendered): three SVG layers, `aria-hidden`, one per kind, the weakest lowest: solid hairline (shared verse), round dots (rarely cited Reference), finer dashes in the muted ink (shared text), all `vector-effect: non-scaling-stroke`. A legend names each style in words, and the topics with their numerals and hues (1.4.1). Motion, only under `no-preference`: the topic arcs ink from their middles (stroke offset, the Fleuron's `draw`), then each layer inks *out from the plate's centre* (a `clip-path` circle, strongest kind first), so every curve inks from its middle to its two Concepts, as Press rules do; the marks set down round the circle. Finished and still by default, under reduced motion and in print. The box is reserved (`aspect-ratio`), CLS 0.
- **Points:** each Concept is a Next `Link` laid over the layers (`data-p`), named by the Concept, with its topic-hued lozenge on the circle and its name set outward; it turns the page forward and its name carries `concept-title-<slug>`, so it flies into the Concept's heading. Grouped in a `ul` per topic named by the topic.
- **Lighting, CSS only:** the page renders one `<style>` of rules made at build time (`litRules`): pointing at or focusing a Concept gives its neighbours (`data-near`) and its curves and list rows (`data-ends`) `--lit: 1` (vermilion, thicker), everything else dims; pointing at or focusing a row of the list lights its curve and its two Concepts on the plate (useful at 1440, where the list runs beside the sticky plate). 93 rules, 12.8 kB raw, 1.1 kB gzip.
- **Filters** (`MapFilters.tsx`, the page's only client island, like the A–Z's): "Lines" takes one kind at a time (a single-mode ToggleGroup; pressing it again shows every kind) and "Topics" any number (a connection shows if either Concept is in a chosen topic; Concepts outside them turn to the muted ink, their marks hollow). State in the address (`?kind=reference&topic=mind`), Back restores, "Clear filters". Plain toggle buttons first; Base UI's two ToggleGroups (`MapKeyboard.tsx`) load when idle or on a pointer or focus, with the A–Z's press hold and focus hand-off. A filter only sets attributes (curves `data-off`, rows and empty kinds `hidden`, points `data-faint`, and each point's `data-near` rewritten to the neighbours it still has, so lighting follows the filter). The count is a polite live region ("Showing 4 of 74 connections"). Without JavaScript the filters are hidden (`scripting: none`) and everything shows.
- **Connections list:** every connection by kind (shared verse, rarely cited Reference, shared text: strongest first), "A and B" as two links and every reason under them. Below 600 px it comes first: the plate is `display: none` until `#plate` is the target, reached by "See the map" (one tap, no JavaScript); "Back to the list" (`#connections`) puts it away. At 600–1023 px plate then list; from 64rem the plate is sticky on the left, the filters and the list beside it. On a small plate (container below 30rem) each name keeps to one line, cut with an ellipsis where it must (only the long English Practice names), so neighbours never overlap; the list beside has full-size links to the same pages (the 2.5.8 equivalent).
- **The proposals page:** three numbered entries (Devanagari numerals), each with an editor's stamp ("Built" in vermilion, "Described, not built" in ink) and a form of three terms: what it adds; what it costs, in speed and in upkeep; how it is switched off (its `FEATURE_*=0` setting set as code). The Concept map's entry shows the plate in miniature (`PlatePicture`, still, `aria-hidden`) and "Open the Concept map" (forward turn, ink); Devanagari first says how to try it (the header's "Devanagari first", or the switch on a Concept page, then the A–Z link). The text lives in `src/components/proposals/proposals.ts` (`proposalsFor(flags)`, unit-tested in `tests/unit/proposals.test.ts`): an entry shows only while its flag is on; audio pronunciation always; no fourth entry.
- **ProposalNote:** a sentence beside the label near each heading ("Awaiting the Project owner’s decision"; "Each awaits the Project owner’s decision"), centred when it wraps; new optional `here` prop sets the label as text on `/proposals/` itself. The header and footer uses (label only) are unchanged.
- **Gates:** `/concepts/map/` 404s without `conceptMap`, `/proposals/` without either flag (pages call `notFound()`; the registry, sitemap and nav already follow `site.routes()`, covered by `content-derive.test.ts` and `content-interface.test.ts`). Checked by hand with `FEATURE_CONCEPT_MAP=0`: the map 404s, the sitemap and homepage lose it, `/proposals/` lists Devanagari first and audio only.

Decisions the spec left open:

- A *connection* is a pair joined by one kind: 74 curves and rows for 85 facts. The facts line says "19 Concepts · 74 connections".
- Every kind shows by default, as without JavaScript, so nothing changes when the island hydrates; the shared-text curves are the finest and in the muted ink, so the 62 read as engraved hatching under the 12 strong ones, and "Lines" picks one kind out (content-v1's hairball note).
- The topic filter keeps a connection if *either* Concept is in a chosen topic (secondary topics count, as on the A–Z).
- The names are set across, so the circle is filled on its two sides and the poles stay empty; a radial (rotated) set was the alternative, harder to read.
- `PlatePicture` is exported for ticket 11's still homepage teaser (spec: "a still picture of the Concept map, labelled Proposal").

Measured (built lane, flags on):

- **First-load JS:** `/concepts/map/` 143.8 kB compressed against 141.1 kB on `/topics/mind/`: the island adds **2.7 kB**. Base UI's ToggleGroup parts load at idle (1.6 kB more chunk; the rest is shared with the shell's lazy parts).
- **SVG:** the plate's four SVGs are 14.9 kB raw, **2.1 kB gzip**; lighting rules 12.8 kB raw, 1.1 kB gzip. HTML 241 kB raw (two-thirds RSC payload), **23.1 kB gzip** (Concept page about 21 kB).
- **Lighthouse** (`lhci collect --url` on this lane, HTTP/2, LHCI_PORT=3230, 3 runs, a busy machine at load 4–9): `/concepts/map/` LCP median **1.97 s** (1.52–1.98), TBT 170–200 ms (median 174), CLS 0, accessibility 1.0; `/concepts/vikshepa/` in the same runs LCP 2.02 s, TBT median 154 ms (ticket 04 measured ~30 ms on a quiet machine), so the map costs about 20 ms of TBT more than the Concept page. `/proposals/`: LCP median 2.02 s, TBT ~160 ms (same busy machine), CLS 0, a11y 1.0. Ticket 15 should judge TBT on a quiet machine; if the map's ever tips over, the list's 148 `Link`s are the first place to look (they already skip prefetch: the points prefetch the same 19 pages).

Tests:

- New unit: `tests/unit/concept-map.test.ts` (11: circle, order, sectors, one curve per pair and kind with every reason, curve ends and bow, neighbours, topics; the filter's address, `shows`, `stands`, the announcement) and `tests/unit/proposals.test.ts` (3: the three entries, each flag off, every entry's four answers). Neither file is in the Owns list; they are this ticket's seams (map layout, proposal list).
- New e2e: `concept-map.spec.ts` (11: label and breadcrumbs; the list against `site.graph()`; the plate's points, layers and legend; neighbours lighting on focus by computed colour; a point's forward turn and title flight; filters by keyboard with the polite count, address, Back and Clear; an address with a topic; the 360 px default and "See the map"; JavaScript off; no layout shift; sideways scroll and axe) and `proposals.spec.ts` (4: the three entries and no others with status and terms; label and breadcrumbs; links and the forward turn; axe). Green at 360, 768 and 1440 px; the sample run of `pages`, `reflow`, `motion`, `smoke`, `crawler`, `nav`, `concept-map` and `proposals` passes (220 passed). No existing test changed.

For the conventions doc (ticket 15):

- Chrome doesn't run a CSS animation on an SVG that is off screen: the plate's ink waits until it is scrolled to. An element screenshot taken right after scrolling catches it undrawn; wait for the animation first.
- A computed colour made with `color-mix()` comes back as `color(srgb r g b)`, not `rgb()`: tests comparing colours with tokens should parse both (`channels()` in `concept-map.spec.ts`).
- React's RSC payload refers to a shared props object (such as `turnForward`) by a long path string (`"$6:props:children:…"`) at every later use; on a page with 170 Links that is ~17 kB raw (it gzips well).
- `:target` can show a part on a phone without JavaScript ("See the map"); a filter's `pushState` must keep the fragment (`location.hash`) or the part hides again.

Left over: nothing in this ticket. Notes for others: ticket 11 can use `PlatePicture` for its teaser; ticket 13's header toggle is what the proposals page's "Try it" names ("Devanagari first", in the header and the Menu).

**Checked, 2026-10-29 (lane/site-12, check pass):** every criterion checked against the code and tests, not the build report. Fixed and polished:

- **Long names on the plate:** at 1440 px "Spiritual Practitioner" and "Momentum of Spiritual Practice" each wrapped into two lines and stacked with no gap, reading as one four-line name. `layoutMap` now copyfits each name against the room beside the circle (letters × 0.48 em at the names' 2.2cqi size, less the mark) and gives a name in more lines room from its neighbours in proportion; one-line names stay evenly spaced (the right half is unchanged). New unit test: "gives a name too long for one line beside the circle more room from its neighbours". The CSS name size carries a comment tying it to `layout.ts`.
- **Proposals, "How it is switched off":** the answer's `dd` is a grid, so the `FEATURE_*=0` code took a row of its own and split the sentence in three. It is one paragraph now. New e2e test: "sets each setting as code inside its sentence, not on a line of its own" (the comma after the setting sits on the setting's line).
- **Guardrail:** the map's chips transitioned `background-color` and `color`; now only `transform`, as the A–Z's.
- **Wrapped small-caps labels** (the proposals form's terms, the list's kind headings) set at 1.3 with `text-wrap: balance`, so a second line no longer floats a body line below; the form's label column is 10rem, so "What it adds" fits on one line.

No existing test weakened; the two new tests are added to this ticket's own files. JS unchanged (the fixes are CSS and build-time layout). Checks on the final state: `pnpm check` (707 unit tests, build) and `E2E_PORT=3130 E2E_SCOPE=sample` e2e (701 passed, 118 skipped by design).

For the conventions doc (ticket 15): a `dd` or other container set to `display: grid` turns each run of text and each inline element into its own row; wrap mixed text and inline code in a `p`. Small-caps labels that may wrap need their own line height (about 1.3) and `text-wrap: balance`, or they inherit the body's 1.7.
