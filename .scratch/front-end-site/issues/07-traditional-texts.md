# 07: Traditional texts

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C3 · Decisions: D08, D15

**What to build:** the traditional texts get a home.

- `/texts/` shows each work the site quotes as a card, and a card's title flies into the work's page as you open it.
- Each work's page is set like a manuscript. It shows every verse the site quotes, in the work's own order:
  - the locator;
  - the Devanagari;
  - the transliteration;
  - each translation, with where it came from;
  - chips linking to the Concepts that quote the verse.
- A rail of verse numbers stays in view.
- Every verse has its own address, such as `/texts/yoga-sutra/#1-30`.

The pages need no JavaScript of their own.

## Owns

- `src/app/texts/**`
- `src/components/texts/**` (new)
- `tests/e2e/texts.spec.ts` (new)

## Acceptance criteria

- [ ] **Index:**
  - `/texts/` lists every work from `works.list()` as a card: its title in capitalised IAST with the Devanagari and the English name, the attribution where one is recorded, and how many of its verses the site quotes.
  - Each card morphs into its work page's title (`work-title-<slug>`) inside the forward page turn.
- [ ] **Manuscript view (D08).** `/texts/<slug>/` shows every passage of the work that the site quotes, in the work's order. Each passage shows:
  - its locator, also in Devanagari digits;
  - its Devanagari lines;
  - its transliteration lines, labelled "IAST" or "as the source wrote it" when the scheme is informal;
  - every translation, each attributed to its source, or to the page that quoted it when the source isn't known;
  - "quoted in" chips linking to each Concept that quotes it.
- [ ] **Language tags:** Devanagari carries `lang="sa-Deva"` and transliteration `lang="sa-Latn"` (WCAG 3.1.2), and paired forms go through ScriptPair.
- [ ] **Deep links:**
  - Each passage's anchor comes from its locator (`1.30` gives `#1-30`), exactly as `hrefFor()` builds it.
  - The passage you land on is marked visibly (`:target`), and its locator isn't hidden under the sticky header.
- [ ] **Locator rail:**
  - On wide screens, a sticky rail inside a named `nav` lists the locators as links.
  - On narrow screens it becomes a compact list above the text that doesn't stick.
- [ ] **Commentaries stay out (D08):** the page shows only the quoted passages and their translations.
- [ ] **No JavaScript of its own:** neither page adds a client component, and both work fully with JavaScript off.
- [ ] **Reflow:**
  - Long Devanagari and IAST lines wrap at 320 px with no sideways scroll (WCAG 1.4.10).
  - Conjuncts and vowel signs are never clipped.
  - Devanagari keeps the base line height, so nothing jumps when the web font arrives.
- [ ] **Breadcrumbs (D15):** Home › Texts on the index, and Home › Texts › {work} on a work.
- [ ] **Tests:** `texts.spec.ts` covers:
  - every passage anchor that a Concept's verse chip links to exists (the sample Concept, or all of them in `full` scope);
  - a "quoted in" chip leads to a Concept page that shows that verse;
  - the pages with JavaScript disabled;
  - a 320 px screenshot of the longest verse, attached to the report;
  - axe on the index and on a work.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
