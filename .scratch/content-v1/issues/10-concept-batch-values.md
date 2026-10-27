# 10: Concept batch: values

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D02, D03, D05, D07, D08, D12

**What to build:** the four "Know Your Values" pages become Concepts, each with its coming-later Questionnaire, and their shared introduction to yama and niyama is stored once, on the values topic.

- Ahimsa, Satya, Asteya and Brahmacharya become Concepts, with their verses, sections, tables and References linked by the census ids.
- The "Raja Yoga Foundations: Yama-Niyama" section, which all four pages repeat, becomes the values topic's introduction. Each Concept shows it where the page had it, and a correction is made in one place.
- No score interpretation reaches any of them.

## Owns

- `src/content/data/concepts/`: the Concept files for the four `/knowyourvalues…/` pages, named by their D02 slugs
- `src/content/data/questionnaires/`: a coming-later Questionnaire file for each, under its Concept's slug
- `src/content/data/topics/values.ts`, from ticket 01: its introduction only
- `tests/unit/content-values.test.ts` (new)
- a Reference or passage file, only if the census lacks one; say so in Comments

## Acceptance criteria

- [ ] **Slugs (D02):** each slug is the page's own ASCII spelling of its headword ("Ahimsa", "Satya", "Asteya", "Brahmacharya"), recorded with the reason in Comments.
- [ ] **Concepts,** built from the census ids, each with the primary topic `values` and with Yoga Sūtra 2.30 and 2.32 first:
  - Ahimsa: headword ahiṃsā, gloss "Non-Violence" from the page title; also Yoga Sūtra 2.35;
  - Satya: headword satya, gloss "Truthfulness"; also Yoga Sūtra 2.36 and Bhagavad Gītā 17.15;
  - Asteya: headword asteya, gloss "Non-Stealing";
  - Brahmacharya: headword brahmacarya, with no gloss in its title (flagged); also Bhagavad Gītā 6.17, 2.54–2.58 and 2.68.

  Each headword's IAST comes from the page's own transliteration of Yoga Sūtra 2.30, split out of its compound and listed, as vikṣepa's obstacle names were.
- [ ] **Each Concept:**
  - its summary is sentences from the page;
  - verses in source order, with the census translation ids;
  - sections in order, with term blocks, tables with captions and verse blocks, and the roles "applications" and "comparison" where they apply (D05);
  - a topic-introduction block where the page had the yama–niyama section;
  - References in the page's order;
  - the standard's rules for DharmaWiki links, `#` links, images and interface text;
  - the review status "carried over, not reviewed".
- [ ] **The values introduction,** stored once on the `values` topic:
  - the section, with Yama and Niyama as term blocks;
  - its own reference list: Tomar (2024), Srinivasan (2016) and Thapliyal et al. (2023), which it cites;
  - all four pages in its provenance.
- [ ] **The four copies, compared** and recorded in the introduction's provenance:
  - Ahimsa's and Brahmacharya's copies are identical;
  - Satya's differs only in spacing, inside the quotes round ‘Yama’ and before one full stop;
  - Asteya's has four wording changes: "which lead to peace", "Niyamas are intrapersonal observations that lead to internal improvement and peace with oneself", "vision, and humility" and "which comprises".

  Store one copy word for word: by default Asteya's, the only copy whose grammar the site itself corrected. List every difference from the others, and flag the choice for the Research editor.
- [ ] **Held back, described, never quoted:** on each page, the Overall Score Indicator with its High, Moderate and Low Score Wise Category Descriptions, and its "referred from" note.
- [ ] **Coming-later Questionnaires,** one per Concept:
  - its slug is its Concept's;
  - `sourceTitle` is the page title as published ("Know Your Values: Ahimsa (Non-Violence) Profiling" and so on), and the title follows the spec's rule;
  - `concepts` names its own Concept;
  - `candidateSource: 'tomar-2024'` for all four (research ticket 11);
  - scoring pending, with its reason, and `heldBack` as above;
  - a purpose only from text that says what it measures, flagged for the Psychology expert;
  - no form.
- [ ] **Flags** for the right role: each verse whose work the page doesn't name ("Chapter 2, Sutra 30", "Chapter 17, Verse 15"), each missing gloss, and each source problem noticed but not fixed.
- [ ] **Ticket test** (`tests/unit/content-values.test.ts`): the four Concepts have the primary topic `values`; each holds exactly one topic-introduction block, and the values topic has its introduction with three References; no Concept repeats the introduction's text; each has its Questionnaire, with the candidate source `tomar-2024`; every verse and Reference resolves.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs topic/values` with `concept/<slug>` and `questionnaire/<slug>` for all four. No Playwright run: pages don't change.

## Comments
