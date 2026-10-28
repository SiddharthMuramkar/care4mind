# 09: Search and the ⌘K palette

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §A4, §C2 · Decisions: D10

**What to build:** search that finds anything on the site by any spelling (FR-04, NFR-03).

- Pressing ⌘K (Ctrl+K on Windows and Linux), or choosing Search in the header, opens a command palette over the page.
  - Results appear as you type, grouped by kind, with a chip showing which spelling matched.
  - Devanagari works as well as IAST and plain ASCII, and typos are forgiven.
- `/search/?q=` shows the same results as a page, and works without JavaScript.
- The search index downloads only when someone is about to search.

## Owns

- `src/lib/search/**` (new): the engine
- `src/app/search/**`, the results page, and `src/app/search-index.json/**` (new), the index route
- `src/components/search/**`, including the SearchTrigger stub from ticket 04
- `src/content/derive/search-documents.ts`: adjust only if needed, keeping `@/content`'s interface and the content tests unchanged
- `tests/unit/search.test.ts` and `tests/e2e/search.spec.ts` (new)

## Acceptance criteria

- [ ] **Engine (design A4):**
  - It is pure TypeScript, with no new dependency and no network access.
  - `buildIndex(docs)` produces compact JSON, and `query(index, q)` returns `SearchHit`s (`{ id, kind, title, href, matched: { field, variant }, parent?, score }`), grouped by kind.
- [ ] **Corpus and weights:**
  - The index is built from `site.searchDocuments()`.
  - Fields are weighted: names (every spelling, Devanagari included) 10, title 8, keywords (gloss, topic, work names and locators such as "YS 1.30" and "Yoga Sutra 1.30") 4, people 4, and an excerpt of at most 300 characters 1.
- [ ] **Normalisation:**
  - NFC, lower case, Latin diacritics stripped.
  - The phonetic key: sh, ṣ and ś → s; ch → c; aa → a; ee and ii → i; oo and uu → u; ri → r; w → v; doubled letters collapsed; a final a or h dropped.
  - Devanagari: an anusvāra and a nasal plus virāma before a consonant are one form (पंच = पञ्च), and zero-width joiners are removed.
- [ ] **Matching order:** exact, then prefix, then phonetic, then fuzzy (one edit for 5–7 letters, two for 8 or more).
- [ ] **Test cases.** Unit tests on the real corpus pass every case:
  - vikshepa, viksepa, vikṣepa and विक्षेप each rank the Vikṣepa Concept first;
  - "Sanshay" finds the saṃśaya term inside Vikṣepa, with `parent` set to Vikṣepa;
  - panch klesha, pancha klesha and pañca kleśa each find Pañca kleśa;
  - "brahma vihara" and "brahmavihara" both find Brahmavihāra;
  - "YS 1.30" finds the passage;
  - "Tomar" finds the Reference and the Concepts citing it;
  - पंच matches पञ्च;
  - "vikshpa" finds Vikṣepa;
  - an empty query returns nothing.
- [ ] **Nothing held back is findable:** searches for "Score Wise Category", "High indicators" and "Scoring Continuum" return nothing.
- [ ] **Index route:**
  - `/search-index.json` is built once at build time.
  - It answers 200 without a redirect.
  - It is at most 45 kB gzipped, and its size is recorded in Comments.
- [ ] **Palette:**
  - It opens with ⌘K or Ctrl+K, never a single key (WCAG 2.1.4), and from the header's Search.
  - It is a Base UI Dialog holding an Autocomplete set to `open`, `inline`, `autoHighlight="always"` and `keepHighlight`, with `filter={null}`, plus a ScrollArea.
  - Results are grouped by kind under headings, with a "matched *variant*" chip when a spelling other than the title matched.
  - The arrow keys move through results, and Enter opens one with a forward page turn.
  - Devanagari typing and IME composition (typing through an input-method editor) work.
  - `Autocomplete.Status` announces the result count.
  - The empty state suggests real searches: vikshepa · विक्षेप · YS 1.30 · Tomar.
  - Escape closes it, and focus returns to whatever opened it.
- [ ] **Trigger:**
  - SearchTrigger stays a link to `/search/` without JavaScript.
  - With JavaScript it opens the palette, and shows the shortcut for the visitor's platform once the page is interactive.
  - It accepts an initial query, so ticket 11's homepage entry can open the palette pre-filled.
- [ ] **Loads on intent:**
  - The palette's code and the index load on intent (⌘K, or hover or focus on the trigger) or when the browser is idle, never before first paint.
  - They are not part of any page's first-load JavaScript.
- [ ] **Results page:**
  - `/search/?q=` renders results on the server with the same engine, grouped by kind and showing the matched spelling. It works with JavaScript off.
  - It shows suggestions for an empty query, and a no-results message with suggestions.
  - After a submit with JavaScript on, focus moves to the results heading.
  - A refine-as-you-type island updates the results and the address (replaceState) as you type.
- [ ] **One seam (D10):** the palette and the results page call search only through one function that returns `SearchHit`s, so a Postgres-backed search can replace the engine later.
- [ ] **Speed:** opening the palette and typing in it are measured once at 4× CPU slowdown, kept under 200 ms, and recorded in Comments. Ticket 15 adds the standing check.
- [ ] **Reduced motion:** the palette opens and closes without movement and still works.
- [ ] **Breadcrumbs:** Home › Search.
- [ ] **Tests:** `search.spec.ts` covers:
  - the shortcut on both platforms' keys;
  - keyboard-only search from typing to opening a result;
  - a Devanagari query;
  - the announced count;
  - focus returning on close;
  - `/search/?q=vikshepa` with JavaScript disabled;
  - axe with the palette open and on the results page.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

**From content-v1, 2026-10-28:** `search-documents.ts` takes a Concept's own terms only, so Yama and Niyama (term blocks in the values topic's introduction) can't be found. Include topic-introduction terms, pointing at their anchor on the topic page. The merged content gives 448 search documents, against design A4's estimate of about 330: check the index size budget against the real number.

### Build notes (lane/site-09, 2026-10-28)

**What is built**

- **Engine** (`src/lib/search/engine.ts`, `normalise.ts`): `buildIndex(docs)` packs each document as one row (id, kind, title, href, parent, names, keywords, people, and only the excerpt's own words: those no other field has, three letters or more, common words left out). `query(index, q)` returns `SearchHit`s grouped by kind, the group holding the best hit first. It unpacks the index once per index (a WeakMap; `warmIndex()` does it as the index arrives).
  - Each word of the query must match some field: exact, then prefix, then phonetic key, then a typo (one edit in 5–7 letters, two from 8, on the letters or on the sound). Excerpts match only exactly or by a prefix of three letters or more, so typos never reach running text.
  - A query run together also matches a name written in several words, and the other way ("brahma vihara" = brahmavihāra).
  - A value the query covers whole outranks one it is part of (vikṣepa above upa-vikṣepa). Ties go concept, term, topic, glossary, work, passage, questionnaire, reference, library item, page.
  - `matched` is the value that matched the most words of the query, then the best scoring: "YS 1.30" shows the locator, not the title.
- **The seam (D10)** (`src/lib/search/search.ts`): `type Search = (q) => Promise<SearchHit[]>`. The results page calls `search` from `@/lib/search/server` (the index built from `site.searchDocuments()` once per server); the palette and the page's island call `search` from `@/lib/search/client` (the index from `/search-index.json`). A content back end replaces those two answers, nothing else.
- **Index route** (`src/app/search-index.json/route.ts`, `force-static`): 448 documents, 118,941 bytes, **32,803 bytes gzipped** (`gzip -9`; 32,956 at `-6`). It answers 200 without a redirect (a dot in the last part keeps it off the trailing-slash rule). Unit and e2e tests hold it to 45 kB.
- **Palette** (`Palette.tsx`, lazily loaded): a Base UI Dialog holding an Autocomplete (`open`, `inline`, `autoHighlight="always"`, `keepHighlight`, `filter={null}`) and a ScrollArea, set as a catalogue card: the field over a double rule (indigo while it has focus, vermilion beneath, inking in from the centre as it opens), kinds filed under small-caps headings with dotted leaders and counts, the chosen row marked with a turmeric highlighter stroke and an indigo diamond (the highlighter sweeps in under `no-preference`). Each result is a real link (`role="option"`), with "in *parent*" and a chip naming how it was found: "matched *Sanshay*" (names, keywords), "by *Tomar*" (an author), "cites *Tomar*" (a Concept citing them), "mentions *doubt*" (its text). The chip shows only when the title doesn't already show that spelling, diacritics aside.
  - Five results a kind, 24 in all; the foot has the count, the keys (only with a fine pointer, from 30rem) and All results.
  - Empty, or nothing found: the suggestions vikshepa · विक्षेप · YS 1.30 · Tomar, as slips that fill the field. `Autocomplete.Status` alone announces ("12 results for “Tomar”", "No results for …"); the suggestions are not in `Autocomplete.Empty`, which is a live region of its own and would announce twice.
- **Trigger** (`SearchTrigger.tsx`, props kept; `SearchLink.tsx`): a link to `/search/` (`?q=` for `initialQuery`) that, once interactive, opens the palette with `initialQuery` in its field, and gains `aria-haspopup="dialog"`. Modified presses (new tab) are left to the browser. The header's copy carries `aria-keyshortcuts` and shows ⌘K or Ctrl K from 72rem. It mounts `PaletteHost`, which listens for ⌘K/Ctrl+K on every page (never a single key; on a keyboard without Latin letters, the K key).
- **Results page** (`src/app/search/page.tsx`, `RefineSearch.tsx`, `SearchResults.tsx`): rendered on the server with the same engine, Home › Search, works without JavaScript. Twelve results a kind, the rest behind a native `<details>`. Empty query: "Search by any spelling" and the suggestions as links; nothing found: a message and the suggestions. With JavaScript, results and the address (`replaceState`) follow the typing, from the index loaded as the field takes focus; a submit moves focus to the results' heading; a polite status announces the count.
- **Corpus** (`search-documents.ts`): the values topic's document now has the terms its introduction sets out (yama, यम, niyama, नियम) as keywords. See the decision below.

**Decisions the spec left open**

- **Loading on intent only, not when idle.** Loading the palette and the index when the browser was idle (after `load`) raised Lighthouse's TBT medians to 189 ms (`/`), 200 ms (Concept, failing the 200 ms assertion) and 98 ms, against 72–80, 154–190 and 81–91 ms with nothing loaded. So they load on ⌘K, or a pointer or focus on any Search trigger; ⌘K before they arrive opens the palette when they do, with whatever was typed meanwhile in its field.
- **Opening is a transition** (`startTransition`), so the press paints at once and the card follows; closing is immediate.
- **Choosing a result on another page**: the card fades as the page turns and closes once the address changes (or after 2 s). Closing in the same click that followed the link lost the page's turn about one time in five at 360 px. The palette also prefetches the highlighted result (`router.prefetch`), because Next.js 16.4 drops a navigation's transition types when it has to wait for its page (the same issue the page-turn tests meet with `prefetched()`). A place on the current page (`#samsaya` on its Concept) closes at once.
- **Focus on close**: back to what opened it; ⌘K pressed with nothing focused returns focus nowhere; from the Menu's Drawer the palette opens once the Drawer has gone (its own `finalFocus` would otherwise take focus from the field) and Escape returns to Menu.
- **The trigger stays a link** (not `role="button"` as Menu does), so `nav.spec.ts` still finds it by `getByRole('link', { name: 'Search' })`; the shortcut is generated content with an empty alternative (`content: attr(data-shortcut) / ''`), so the link's name and text stay "Search". The box is a fixed 4.25em from first paint, so the header doesn't move as it fills. The header's Search has no `data-ink`: its `::before` is the shortcut.
- **Yama and niyama** are keywords of the values topic's document rather than term documents of their own: `content-sweep.test.ts` pins 46 terms and 448 documents, and my Owns line keeps the content tests unchanged. Now that ticket 06 lists those terms at their anchors on the topic page, content-v1 (or ticket 15) could add term documents (kind `term`, parent the topic, `hrefFor({ kind: 'topic', id, anchor })`) and update that count.

**Measured**

- **Palette speed at 4× CPU** (Event Timing; then the time until it is seen), Chromium 360 and 1440, `/` and `/concepts/vikshepa/`, one worker:
  - ⌘K is answered in 15–24 ms. The card is seen 415–561 ms after a cold ⌘K (code and index fetched by the press), 306–334 ms after a pointer has passed over Search, and 108–153 ms on opening again.
  - Each keystroke is answered in 40–88 ms; the first letter's results are seen in 242–288 ms, "vik"'s in 136–211 ms. Escape is answered in 72–96 ms.
  - So every press stays under 200 ms; the first card and the first letter's list take longer to appear. Ticket 15's standing check should measure both.
- **Lighthouse** (`pnpm lhci`, HTTP/2, LHCI_PORT=3210, median of 3): `/` LCP 2.03 s, TBT 130 ms; `/concepts/vikshepa/` 1.96 s, 151 ms; `/questionnaires/karmayoga-scale/` 2.02 s, 100 ms; CLS ≤ 0.0013; accessibility 1.0; assertions pass.
- **Bytes**: every page gains about 1.5 kB of gzipped first-load JS (the link, the host and its store; estimated) and a few hundred bytes of CSS. The palette's chunk (20.7 kB gzipped) and its stylesheet (2.2 kB) load on intent only.

**Tests**

- New: `tests/unit/search.test.ts` (35 cases on the real corpus: every case in the criteria, held-back phrases, precision, prefix-as-you-type, the yama/niyama keywords, the index's size), `tests/e2e/search.spec.ts` (20 tests: both shortcuts and no single key, the header's Search and its shortcut on Linux and Mac, its width before and after, keyboard-only search to a forward page turn, a term and a locator, Devanagari typed and composed through an input method, the announced count, suggestions, focus return from the header, from a focused link and from the Drawer, reduced motion, axe empty and with results, loading on intent only; the results page refining, focus and axe; Home › Search; without JavaScript the results and the form; the index route).
- Changed: `tests/e2e/nav.spec.ts` "every header link opens its page" leaves Search out (and skips below 72rem, where Search is the header's one link): with JavaScript it now opens the palette; its link to `/search/` is still checked without JavaScript.

**For the conventions doc (ticket 15)**

- Load a heavy island on intent, not when idle: idle loading counts in Lighthouse's TBT.
- Open a heavy island in `startTransition`, so the press paints at once; measure both the press (Event Timing) and when the result is seen.
- Never close a dialog in the same click that follows a typed link: close once the address changes. And prefetch a link before it is followed (`router.prefetch` on highlight or intent): Next.js 16.4 drops the turn of a navigation that waits for its page.
- Visual-only text on a link (a shortcut hint) goes in generated content with an empty alternative, `content: attr(x) / ''`, so the link's name doesn't change.
- Environment trap: a `\uXXXX` escape written into a file by the agent's tools can land as the raw character (a zero-width joiner, a combining mark). Check regexes with `od -c` and restore escapes.

**Left over**

- `initialQuery` opens the palette pre-filled, but no page passes one yet: ticket 11's homepage entry should add the e2e check (the palette opens holding its query).
- The lane was cut before ticket 06 merged; nothing either touches overlaps, and the merger folds both in.
