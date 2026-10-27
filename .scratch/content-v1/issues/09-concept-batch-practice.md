# 09: Concept batch: practice

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D02, D03, D05, D07, D08, D12

**What to build:** the four "practice" pages become Concepts, each with its coming-later Questionnaire, and the practice topic is complete.

- Five Steps of Perfection Profiling, Momentum of Spiritual Practice, Spiritual Practitioner Profiling and Brahma Vihara become Concepts, with their verses, sections, tables and References linked by the census ids.
- Each has a coming-later Questionnaire that lists what was held back. No score interpretation reaches any of them.

## Owns

- `src/content/data/concepts/`: the Concept files for `/fivestepsofperfectionprofiling/`, `/momentumofspiritualpractice/`, `/spiritualpractitionerprofiling/` and `/brahmavihara/`, named by their D02 slugs
- `src/content/data/questionnaires/`: a coming-later Questionnaire file for each, under its Concept's slug
- `tests/unit/content-practice.test.ts` (new)
- a Reference or passage file, only if the census lacks one; say so in Comments

## Acceptance criteria

- [ ] **Slugs (D02):** each slug is the page's own ASCII spelling of its headword, or the hyphenated English title for the three pages with no Sanskrit headword, recorded with the reason in Comments. Brahma Vihara's page writes its name more than one way; record which spelling decided the slug.
- [ ] **Concepts,** built from the census ids, each with the primary topic `practice`:
  - Five Steps of Perfection: the English title, flagged as having no Sanskrit headword; Yoga Sūtra 1.20; the five steps (the page's Shraddha, Virya, Smriti, Samadhi and Prajna: śraddhā, vīrya, smṛti, samādhi and prajñā) as term blocks;
  - Momentum of Spiritual Practice: the English title; Yoga Sūtra 1.21 and 1.22; saṃvega, from Yoga Sūtra 1.21, flagged for the Research editor as a possible Sanskrit headword;
  - Spiritual Practitioner: the English title, flagged as having no Sanskrit headword; the Sādhana Pañcakam verses, attributed as the page attributes them;
  - Brahma Vihara: headword brahmavihāra; Yoga Sūtra 1.33; the four components (the page's Maitra, Karuna, Mudita and Upeksha) as term blocks; its summative table.

  Where a page prints no IAST for a headword or term, its IAST is transliterated from the page's Devanagari, listed and flagged for the Research editor.
- [ ] **Each Concept:**
  - its summary is sentences from the page;
  - an English gloss only where the page gives one, otherwise none, flagged for the Research editor;
  - verses in source order, with the census translation ids;
  - sections in order, with term blocks, tables with captions and verse blocks, and the roles "applications" and "comparison" where they apply (D05);
  - References in the page's order;
  - the standard's rules for DharmaWiki links, `#` links, images and interface text;
  - the review status "carried over, not reviewed".
- [ ] **Held back, described, never quoted,** each with its "referred from" note:
  - Five Steps of Perfection: the Score indicator, with the High, Moderate and Low Score Wise Category Descriptions for each step;
  - Momentum of Spiritual Practice: the Overall Score indicator, with its High, Moderate and Low Score Wise Category Descriptions;
  - Spiritual Practitioner: the Overall Score indicator, with High, Moderate and Low indicators;
  - Brahma Vihara: the Score-Based Indicators, with High, Moderate and Low and the line about section-wise scores.
- [ ] **Coming-later Questionnaires,** one per Concept:
  - its slug is its Concept's;
  - `sourceTitle` is the page title as published, and the title follows the spec's rule (the name the page gives its questionnaire, such as "Spiritual Practitioner Profile", else the page title);
  - `concepts` names its own Concept;
  - `candidateSource: 'tomar-2024'` for all but Five Steps of Perfection, which has none and a Psychology-expert flag: no published source found (research ticket 11);
  - scoring pending, with its reason, and `heldBack` as above;
  - a purpose only from text that says what it measures, flagged for the Psychology expert;
  - no form.
- [ ] **Flags** for the right role: each verse whose work the page doesn't name ("Chapter 1, Sutra 20"), each transliterated IAST, each missing headword or gloss, and each source problem noticed but not fixed.
- [ ] **Ticket test** (`tests/unit/content-practice.test.ts`): the four Concepts have the primary topic `practice`; each has its Questionnaire with the expected candidate source; every verse and Reference resolves.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs` with `concept/<slug>` and `questionnaire/<slug>` for all four. No Playwright run: pages don't change.

## Comments
