# 06: Concepts A–Z, glossary and topic pages

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §B3, §C3 · Decisions: D03, D14, D15

**What to build:** two ways into the Concepts.

**The A–Z** at `/concepts/` is one alphabetical list of every Concept, every term explained inside a Concept and every glossary entry carried over from the current site.

- A rail of letters jumps through it, and highlights the letter you're on.
- Filter chips narrow it by topic, by text, or to Concept pages only, and the list glides into its new order.
- Glossary entries without a page of their own lead to DharmaWiki and say so.

**Each topic page** at `/topics/<slug>/` shows the topic's Concepts round a kolam rosette.

- A card lights its petal when you point at or focus it.
- Below come the verses the topic's Concepts quote, and, for the values topic, its shared yama–niyama introduction.

## Owns

- `src/app/concepts/page.tsx` and its CSS Module (not `concepts/[slug]/` or `concepts/map/`)
- `src/app/topics/**`
- `src/components/az/**` (new): the letter rail, filter chips and entries
- `src/components/topics/**` (new): topic cards and the Rosette, which ticket 11 reuses
- `src/content/derive/az-index.ts`: adjust only if needed, keeping `@/content`'s interface and the content tests unchanged
- `tests/e2e/concepts-index.spec.ts` and `tests/e2e/topics.spec.ts` (new)

## Acceptance criteria

- [ ] **One A–Z (D14):**
  - `/concepts/` lists every entry from `site.azIndex()`: every Concept, every term (linking to its anchor on its Concept page) and every glossary entry, de-duplicated and sorted.
  - Each entry shows its leading name (IAST, or the English title), its Devanagari where known, and its gloss.
  - Both scripts go through ScriptPair with their `lang` tags.
- [ ] **Glossary entries:**
  - An entry with a Concept page links there.
  - An entry with only a DharmaWiki article links to it, and says it leads to DharmaWiki in words, not only with an icon.
  - An entry with neither shows as text.
  - Every glossary entry has its anchor (`/concepts/#<slug>`), which the old `/anubandha-chatushtaya/` address redirects to.
- [ ] **Letter rail:**
  - A Base UI Toolbar of letter links (`Toolbar.Link`): one Tab stop, with the arrow keys moving between letters.
  - Letters with no entries are shown as plain text, not links.
  - The letter for the section in view is highlighted with CSS only, using the same technique as the Concept page's table of contents.
  - With JavaScript off, every letter is still an ordinary link.
- [ ] **Filter chips:**
  - A Base UI ToggleGroup with the five topics, the works, and "Concept pages / glossary".
  - Choosing chips filters the list and reorders it with a view transition. Only the first 40 items shown get view-transition names.
  - The new count is announced politely ("12 entries", WCAG 4.1.3).
  - The filter state lives in the address's query string, so a filtered view can be shared and browser Back undoes a filter.
  - With JavaScript off, the chips are hidden and the full list shows.
- [ ] **Speed on a long list:**
  - Entries use `content-visibility: auto` with an intrinsic size.
  - Loading the page causes no layout shift (CLS ≤ 0.1).
  - A chip press is measured once at 4× CPU slowdown, kept under 200 ms, and recorded in Comments; ticket 15 adds the standing check.
- [ ] **Previews:** Concept entries and glossary entries that have a Concept page use the LinkPreview slot, so they show previews once ticket 05 merges.
- [ ] **Topic cards morph:** each topic card on `/concepts/` morphs into its topic page's title (`topic-title-<slug>`) inside the forward page turn.
- [ ] **Topic pages (FR-01, D03):**
  - `/topics/<slug>/` lists every Concept whose primary topic it is, as cards, then the Concepts that list it as a secondary topic.
  - It shows computed facts: how many Concepts, how many verses they quote, and from which works.
  - It shows the verses its Concepts quote, each linking to its passage.
  - The values topic shows its shared yama–niyama introduction, stored once.
  - No other topic gets a written description (design B3).
- [ ] **The Rosette:**
  - It has one petal per Concept, and each petal is a real link with the Concept's name.
  - Hovering or focusing a card lights its petal through CSS `:has()`, with no JavaScript.
  - It draws on scroll, following the Kolam conventions; it is finished by default and still under reduced motion.
  - The drawing is hidden from assistive technology, and the links are not.
  - It is built to be reused: ticket 11 draws the homepage's topic rosette with it.
- [ ] **No JavaScript of their own:** topic pages add no client component, and the A–Z's only islands are the chips and the previews.
- [ ] **Breadcrumbs (D15):** Home › Concepts on the A–Z, and Home › Concepts › {topic} on topic pages.
- [ ] **Reflow:** both page types fit 320 px with no sideways scroll (WCAG 1.4.10), and the rosette scales down without hiding any link.
- [ ] **Tests:**
  - `concepts-index.spec.ts` covers: the rail by keyboard, a filter by mouse and by keyboard with the announced count, the address keeping the filter, JavaScript off, axe with a filter applied, and a glossary anchor reached from another page.
  - `topics.spec.ts` covers: petals lighting on card focus (computed style), petal links, the values introduction, and axe.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

**From content-v1, 2026-10-28:** Yama and Niyama are term blocks in the values topic's introduction, which `az-index.ts` doesn't read (it takes a Concept's own terms), and no glossary entry covers them. Include topic-introduction terms in the A–Z, linking to their anchor on the topic page. Counts on the merged content: 139 A–Z entries before this change.
