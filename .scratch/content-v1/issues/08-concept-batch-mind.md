# 08: Concept batch: mind

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D02, D03, D05, D07, D08, D12

**What to build:** the four remaining "mind" pages become Concepts, each with its coming-later Questionnaire, and vikṣepa gets its Questionnaire too.

- Upa-Vikshepa Profiling, Panch Klesha – Vikaar Profiling, Know Your Mind and Sthitaprajna become Concepts, with their verses, sections, tables and References linked by the census ids.
- Each of the five mind Concepts, vikṣepa included, has a coming-later Questionnaire that lists what was held back. No score interpretation reaches any of them.
- With vikṣepa from ticket 01, the mind topic is complete.

## Owns

- `src/content/data/concepts/`: the Concept files for `/upavikshepaprofiling/`, `/panchkleshavikaarprofiling/`, `/knowyourmind/` and `/sthitaprajna/`, named by their D02 slugs
- `src/content/data/questionnaires/`: a coming-later Questionnaire file for each of those four, under its Concept's slug, and `vikshepa.ts`
- `src/content/data/concepts/vikshepa.ts`, from ticket 01: its `questionnaire` field only
- `tests/unit/content-mind.test.ts` (new)
- a Reference or passage file, only if the census lacks one; say so in Comments

## Acceptance criteria

- [ ] **Slugs (D02):** each slug is the page's own ASCII spelling of its headword, recorded with the reason in Comments. Know Your Mind writes "chittabhumis", so its slug is `chittabhumi`; the Panch Klesha page's own spelling decides between `panch-klesha` and `pancha-klesha`.
- [ ] **Concepts,** built from the census ids:
  - Upa-Vikshepa Profiling: headword upa-vikṣepa; Yoga Sūtra 1.31;
  - Panch Klesha – Vikaar Profiling: headword pañca kleśa; Yoga Sūtra 2.3, 2.5, 2.7 and 2.9; the five kleśas and the six vikāras as term blocks;
  - Know Your Mind: headword citta-bhūmi, its IAST transliterated from the page's "chittabhumis", listed and flagged; the Yoga Sūtra 1.2 and 1.30 excerpts, with the page's "Meaning" texts kept on the quotes; the five states of mind as term blocks; its two tables;
  - Sthitaprajna: headword sthitaprajña; Bhagavad Gītā 2.54–2.58 and 2.68.

  The primary topic of each is `mind`; Sthitaprajna's is also `self`.
- [ ] **Each Concept:**
  - its summary is sentences from the page;
  - an English gloss only where the page gives one, otherwise none, flagged for the Research editor;
  - verses in source order, with the census translation ids;
  - sections in order, with term blocks, tables with captions and verse blocks, and the roles "applications" and "comparison" where they apply (D05);
  - References in the page's order;
  - the standard's rules for DharmaWiki links, `#` links, images and interface text;
  - the review status "carried over, not reviewed".
- [ ] **Held back, described, never quoted,** each with its "referred from" note:
  - vikṣepa, Upa-Vikshepa and Sthitaprajna: the Overall Score indicator, with High, Moderate and Low indicators;
  - Panch Klesha: the Score indicator, with a High, Moderate and Low Score for each kleśa;
  - Know Your Mind: the Score-Based Indicators, with High, Moderate and Low for each state of mind.
- [ ] **Coming-later Questionnaires,** one for each of the five Concepts:
  - its slug is its Concept's;
  - `sourceTitle` is the page title as published, and the title follows the spec's rule ("Know Your State of Mind Profile" for Know Your Mind);
  - `concepts` names its own Concept;
  - `candidateSource: 'tomar-2024'` for all but Sthitaprajna, which has none and a Psychology-expert flag: no published source found (research ticket 11);
  - scoring pending, with its reason, and `heldBack` as above;
  - a purpose only from text that says what it measures, flagged for the Psychology expert;
  - no form.
- [ ] **Vikṣepa** links to its Questionnaire. Nothing else in its file changes, and the legacy snapshot test still passes.
- [ ] **Flags** for the right role: each verse whose work the page doesn't name ("Panch Klesha: Chapter 2, Sutra 3"), each transliterated IAST, each missing gloss, and each source problem noticed but not fixed.
- [ ] **Ticket test** (`tests/unit/content-mind.test.ts`): the five mind Concepts have the primary topic `mind`, and Sthitaprajna also `self`; each has its Questionnaire with the expected candidate source; every verse and Reference resolves.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs` with `concept/<slug>` for the four new Concepts and `questionnaire/<slug>` for all five Questionnaires. No Playwright run: pages don't change.

## Comments
