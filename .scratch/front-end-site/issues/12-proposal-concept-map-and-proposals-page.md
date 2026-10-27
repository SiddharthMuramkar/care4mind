# 12: Proposal: Concept map and the proposals page

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C5 · Decisions: D06, D20

**What to build:** two pages for the Project owner to judge in the sign-off pack.

**The Concept map** at `/concepts/map/` shows the 19 Concepts round a rosette, one sector per topic.

- Curved kolam threads join Concepts that share a verse, a work or a rarely cited Reference.
- Pointing at or focusing a Concept lights its neighbours.
- Filters show one kind of connection at a time.
- A "Connections" list says everything the picture shows, in words. On a phone it is what you see first.

**The proposals page** at `/proposals/` lists what the design suggests beyond the brief:

- the two built proposals, the map and site-wide "Devanagari first";
- two ideas described but not built, audio pronunciation and a "kolam of your reading path".

Both pages are labelled Proposal, and both disappear when their flags are off.

## Owns

- `src/app/concepts/map/**` and `src/app/proposals/**`
- `src/components/map/**` (new)
- `src/components/proposals/**`, including ProposalNote from ticket 04
- `src/content/derive/graph-data.ts`: adjust only if needed, keeping `@/content`'s interface and the content tests unchanged
- `tests/e2e/concept-map.spec.ts` and `tests/e2e/proposals.spec.ts` (new)

## Acceptance criteria

- [ ] **Gates (D20):**
  - `/concepts/map/` exists only while `conceptMap` is on, and `/proposals/` only while `conceptMap` or `devanagariFirst` is on.
  - When off, each returns 404 and drops out of the registry, the sitemap, the navigation, search and every link.
  - A unit test covers both conditions.
- [ ] **Labelled:** both pages carry a ProposalNote near their heading, saying in words that this is a proposal awaiting the Project owner's decision.
- [ ] **Layout at build time:**
  - The positions come from `site.graph()` and are computed during the build: a rosette with one sector per topic.
  - The browser runs no layout code.
  - The map reserves its box, so nothing shifts as it loads.
- [ ] **Threads:**
  - The edges are curved kolam threads, one per connection, typed as shared passage, shared work or rarely cited shared Reference. Tomar (2024) is excluded.
  - The types differ by line style as well as colour, and a legend names them (WCAG 1.4.1).
  - Threads draw on scroll, following the Kolam conventions, and are still under reduced motion.
  - The thread layer is hidden from assistive technology.
- [ ] **Points:**
  - Each Concept is an HTML link laid over the SVG thread layer, named with the Concept, and opens its page with a forward page turn.
  - The tab order follows the topics.
  - Hovering or focusing a point highlights its neighbours and their threads through `:has()` rules generated at build time, with no JavaScript.
- [ ] **Filters:**
  - A Base UI ToggleGroup filters by connection type and by topic.
  - The state lives in the address's query string, and the visible connections are announced politely.
  - With JavaScript off, everything shows.
- [ ] **Connections list:**
  - A list states every connection and its reason, for example "Vikṣepa and Pañca kleśa: both quote Yoga Sūtra 1.30", with both Concepts as links.
  - Below about 600 px it shows first, with the map one tap away. Above that, both are on the page.
- [ ] **The proposals page:**
  - **Concept map:** built; with a link to it.
  - **Site-wide "Devanagari first":** built; with how to try it.
  - **Audio pronunciation:** described, not built.
  - **"Kolam of your reading path":** described, not built.

  Each entry says, in plain interface text, what it adds, what it costs in speed and upkeep, and how it is switched off.
- [ ] **Breadcrumbs (D15):** Home › Concepts › Concept map, and Home › Proposals.
- [ ] **Reflow:** both pages fit 320 px with no sideways scroll (WCAG 1.4.10). At narrow widths the map scales down or gives way to the list, and never scrolls sideways.
- [ ] **Speed:** no client JavaScript beyond the filter chips. Record the page's first-load JavaScript and its SVG size in Comments.
- [ ] **Tests:**
  - `concept-map.spec.ts` covers: neighbours lighting on focus (computed style), a point opening its Concept, filters by keyboard, the Connections list against `site.graph()`, the 360 px default, and axe.
  - `proposals.spec.ts` covers: the four entries, links, and axe.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
