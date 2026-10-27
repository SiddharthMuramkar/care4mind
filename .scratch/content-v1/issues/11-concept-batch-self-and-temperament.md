# 11: Concept batch: self and temperament

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D02, D03, D05, D07, D08, D12

**What to build:** the last three description pages become Concepts, each with its coming-later Questionnaire, and the self and temperament topics are complete.

- Are you a Friend/Foe of Yourself?, Karta and Triguna become Concepts, with their verses, sections, tables and References linked by the census ids.
- Each has a coming-later Questionnaire that lists what was held back. Triguna loses its leftover test shortcode, and no score interpretation reaches any of them.

## Owns

- `src/content/data/concepts/`: the Concept files for `/frienorfoeofself/`, `/karta-2/` and `/triguna/`, named by their D02 slugs
- `src/content/data/questionnaires/`: a coming-later Questionnaire file for each, under its Concept's slug
- `tests/unit/content-self-temperament.test.ts` (new)
- a Reference or passage file, only if the census lacks one; say so in Comments

## Acceptance criteria

- [ ] **Slugs (D02):** each slug is the page's own ASCII spelling of its headword (the Friend/Foe page writes "Atma Bandhu"), recorded with the reason in Comments.
- [ ] **Concepts,** built from the census ids:
  - Friend/Foe: headword ātma-bandhu, with ātma-ripu as a term block; primary topic `self`; Bhagavad Gītā 6.5 and Dhammapada 160, which is Pali; the "Contrast with Western Psychology" table as a comparison; "Self Management Strategies Propounded by Bhagavat Gita" kept;
  - Karta: headword kartā; primary topic `temperament`, also `self`; Bhagavad Gītā 18.23–18.25, with the Sattvik, Rajasic and Tamasic Karta as term blocks holding their verses; the comparative table on karma and determinism;
  - Triguna: headword triguṇa; primary topic `temperament`; Bhagavad Gītā 14.5–14.9 and 14.11–14.13, and Suśruta Saṃhitā 4.35 as the page cites it; sattva, rajas and tamas as term blocks; "Guna Predominance", with its verses, and the Ayurveda and psychology sections kept.

  Where a page prints no IAST for a headword or term, its IAST is transliterated from the page's Devanagari, listed and flagged for the Research editor.
- [ ] **Each Concept:**
  - its summary is sentences from the page;
  - an English gloss only where the page gives one, otherwise none, flagged for the Research editor;
  - verses in source order, with the census translation ids;
  - sections in order, with term blocks, tables with captions and verse blocks, and the roles "applications" and "comparison" where they apply (D05);
  - References in the page's order;
  - the standard's rules for DharmaWiki links, `#` links, images and interface text;
  - the review status "carried over, not reviewed".
- [ ] **Held back, described, never quoted:**
  - Friend/Foe: the Scoring Continuum, and the High, Moderate and Low Indicators;
  - Karta: the whole "Karta Score-Based Indicators" section, including its "scored on a scale of 1 to 10" line and each type's traits and Low, Moderate and High lines;
  - Triguna: the High, Moderate and Low Characteristics table under "Triguna Profile Questionnaire", with its lead-in citing Murthy & Kumar (2007). The design notes place this text in "Guna Predominance"; in the saved copy that section holds Bhagavad Gītā 14.11–14.13 and is kept.
- [ ] **Triguna's leftovers:** the `[my_php_code name="Mind"]` shortcode and the test message it produced are dropped and listed.
- [ ] **Coming-later Questionnaires,** one per Concept:
  - its slug is its Concept's;
  - `sourceTitle` is the page title as published, and the title follows the spec's rule ("Triguna Profile Questionnaire" for Triguna);
  - `concepts` names its own Concept;
  - `candidateSource: 'tomar-2024'` for all three (research ticket 11);
  - scoring pending, with its reason, and `heldBack` as above;
  - a purpose only from text that says what it measures (Triguna's "A Triguna Profile Questionnaire is a tool to estimate…"), flagged for the Psychology expert;
  - no form.
- [ ] **The Dosha Survey's link** to triguṇa waits for ticket 12; this ticket doesn't touch the Dosha Survey's file.
- [ ] **Flags** for the right role: each verse whose work the page doesn't name or abbreviates ("Sush Samh 4.35"), each transliterated IAST, each missing gloss, and each source problem noticed but not fixed.
- [ ] **Ticket test** (`tests/unit/content-self-temperament.test.ts`): Friend/Foe's primary topic is `self`; Karta's is `temperament`, also `self`; Triguna's is `temperament`; no string holds "my_php_code" or the test message; each has its Questionnaire, with the candidate source `tomar-2024`; every verse and Reference resolves, and Dhammapada 160 is tagged Pali.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs` with `concept/<slug>` and `questionnaire/<slug>` for all three. No Playwright run: pages don't change.

## Comments
