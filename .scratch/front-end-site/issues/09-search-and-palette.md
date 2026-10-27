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
