# 09: Concept batch: practice

Status: resolved
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

- [x] **Slugs (D02):** each slug is the page's own ASCII spelling of its headword, or the hyphenated English title for the three pages with no Sanskrit headword, recorded with the reason in Comments. Brahma Vihara's page writes its name more than one way; record which spelling decided the slug.
- [x] **Concepts,** built from the census ids, each with the primary topic `practice`:
  - Five Steps of Perfection: the English title, flagged as having no Sanskrit headword; Yoga Sūtra 1.20; the five steps (the page's Shraddha, Virya, Smriti, Samadhi and Prajna: śraddhā, vīrya, smṛti, samādhi and prajñā) as term blocks;
  - Momentum of Spiritual Practice: the English title; Yoga Sūtra 1.21 and 1.22; saṃvega, from Yoga Sūtra 1.21, flagged for the Research editor as a possible Sanskrit headword;
  - Spiritual Practitioner: the English title, flagged as having no Sanskrit headword; the Sādhana Pañcakam verses, attributed as the page attributes them;
  - Brahma Vihara: headword brahmavihāra; Yoga Sūtra 1.33; the four components (the page's Maitra, Karuna, Mudita and Upeksha) as term blocks; its summative table.

  Where a page prints no IAST for a headword or term, its IAST is transliterated from the page's Devanagari, listed and flagged for the Research editor.
- [x] **Each Concept:**
  - its summary is sentences from the page;
  - an English gloss only where the page gives one, otherwise none, flagged for the Research editor;
  - verses in source order, with the census translation ids;
  - sections in order, with term blocks, tables with captions and verse blocks, and the roles "applications" and "comparison" where they apply (D05);
  - References in the page's order;
  - the standard's rules for DharmaWiki links, `#` links, images and interface text;
  - the review status "carried over, not reviewed".
- [x] **Held back, described, never quoted,** each with its "referred from" note:
  - Five Steps of Perfection: the Score indicator, with the High, Moderate and Low Score Wise Category Descriptions for each step;
  - Momentum of Spiritual Practice: the Overall Score indicator, with its High, Moderate and Low Score Wise Category Descriptions;
  - Spiritual Practitioner: the Overall Score indicator, with High, Moderate and Low indicators;
  - Brahma Vihara: the Score-Based Indicators, with High, Moderate and Low and the line about section-wise scores.
- [x] **Coming-later Questionnaires,** one per Concept:
  - its slug is its Concept's;
  - `sourceTitle` is the page title as published, and the title follows the spec's rule (the name the page gives its questionnaire, such as "Spiritual Practitioner Profile", else the page title);
  - `concepts` names its own Concept;
  - `candidateSource: 'tomar-2024'` for all but Five Steps of Perfection, which has none and a Psychology-expert flag: no published source found (research ticket 11);
  - scoring pending, with its reason, and `heldBack` as above;
  - a purpose only from text that says what it measures, flagged for the Psychology expert;
  - no form.
- [x] **Flags** for the right role: each verse whose work the page doesn't name ("Chapter 1, Sutra 20"), each transliterated IAST, each missing headword or gloss, and each source problem noticed but not fixed.
- [x] **Ticket test** (`tests/unit/content-practice.test.ts`): the four Concepts have the primary topic `practice`; each has its Questionnaire with the expected candidate source; every verse and Reference resolves.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs` with `concept/<slug>` and `questionnaire/<slug>` for all four. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** Four Concepts in the practice topic, `five-steps-of-perfection`, `momentum-of-spiritual-practice`, `spiritual-practitioner` and `brahma-vihara`, each with a coming-later Questionnaire under the same slug, and `tests/unit/content-practice.test.ts` (58 tests, through the content source and `@/content`). The practice topic now holds exactly these four. verify on the eight records: all passed; on `concept questionnaire`: 13 passed. Every verse and Reference came from the census: no Reference or passage file was added.
- **Slugs (D02).**
  - `five-steps-of-perfection`, `momentum-of-spiritual-practice`, `spiritual-practitioner`: no Sanskrit headword on these pages, so each is its hyphenated English title. That title is the page title without "Profiling", the word for the page's questionnaire rather than the idea, as the spec's table and this ticket name them. Momentum's page title has no such word.
  - `brahma-vihara`: decided by "Brahma Vihara", the spelling of the page's title, every heading and its running text, hyphenated as two words (as the Panch Klesha page's own spelling decides its slug). The other spellings appear only in cited titles or held-back text: "BrahmaVihara" (Chatterjee's title, the score section), "Brahmavihara" (Mandal's title, and the page's address), "Brahma-Vihar" and "Brahmaviharas". So the slug differs from the spec's illustrative `brahmavihara`. Its ASCII spellings are "Brahma Vihara" and "Brahmavihara"; its IAST, "brahmavihāra", is the design notes' form (no IAST or Devanagari on the page; flagged).
- **Counts.** 4 Concepts and 4 Questionnaires. 9 verses, all at the tops of their pages, each with its census translation id and the page's Meaning: Yoga Sūtra 1.20, 1.21, 1.22 and 1.33, Sādhana Pañcakam 1–5. 49 reference-list entries (15, 13, 12, 9), 46 distinct References. 9 term blocks (the five steps, the four components). 3 tables: two comparison tables and Brahma Vihara's summative table. 9 held-back items: each page's score section, each "referred from" note, and Brahma Vihara's line on section-wise scores.
- **Decisions the spec left open:**
  - Summaries: the opening sentences of the definition sections for Spiritual Practitioner and Brahma Vihara, and the second and third for Five Steps (its first defines perfectionism). Momentum's definition section opens with a quotation, so its summary is the last sentence of the page's Meaning of Yoga Sūtra 1.22.
  - Term blocks: each step's and component's IAST and Devanagari are split out of the compound in the page's own verse (1.20, 1.33), in dictionary forms, listed and flagged. ASCII spellings are the page's headings and text ("Maitra" kept beside "Maitri", as vikṣepa keeps "Steyan"). Glosses: the steps' from their headings ("Shraddha/Unconditional Faith"); the components', whose headings give none, from the summative table's "Synonymous Term" column.
  - English names: the three English-titled Concepts take their titles. Brahma Vihara has none: the page gives no gloss, only "these four 'sublime states'" for its components (flagged).
  - Tables keep the page's own captions where it gives them (a paragraph above Five Steps' table, a sub-heading above Momentum's). The summative table has none, so it takes the heading above it, which is also its section's heading. Row heads that name a step or component are its term.
  - Headings stay as the page writes them, "Indian vs Western concept" included (the foundation reworded vikṣepa's; these aren't). Five Steps' sub-heading "(Faith, Strength, Memory, Absorption, Clarity)" is the first paragraph of its section. The verse headings are left out and listed: the verses show their work and number.
  - Fixes, each listed: typos ("Sharaddha", "ad ever living", "Spirituality Practitioner" in a heading, and eight in Brahma Vihara), and a stray file name, "paste.txt", that ended two cells of Momentum's table (also flagged).
  - Questionnaire titles: "Spiritual Practitioner Profile" and "Brahma Vihara Profile", the names the pages give their questionnaires in their held-back score sections; the other two pages use only their titles. No page says what its questionnaire measures outside its score section, so no record has a `purpose` (flagged). Candidate source `tomar-2024` for three, listed as the Published scales research's match; none for Five Steps of Perfection.
  - The Concepts' unnamed-work flags repeat the passages' notes word for word, so the flags pack shows each once with both records.
- **Flags raised:** 19 for the Research editor on the Concepts: three missing headwords (saṃvega offered for Momentum), Brahma Vihara's IAST and missing gloss, the split-out IAST of the steps and components, the verses headed "Chapter 1, Sutra 20" and "Chapter 1, Sutra 21,22", four unresolved citations ("(Inbadas, 2017)", "(Gilbert & Choden, 2013)", "(Mishra & Kumar, 2020)", "(Bhattacharjee, 2024)"), two References only held-back notes cite (wisdomlib.org 2025b, Fopka-Kowalczyk et al. 2022), the "Clarity"/"Wisdom" mismatch, the stray "paste.txt", and wording left as found ("Let him order to understand", "Sā Khya", "Psychometric, such as", "according the", "midness", "icha", "non dualism"). On the Questionnaires: 6 for the Psychology expert (no published source for Five Steps of Perfection; no purpose, one note for all four; Spiritual Practitioner's "such profiling" sentence) and 1 for the Research editor ("Samhita, 2024", cited in Five Steps' held-back note, isn't on its reference list).
- **For ticket 12:** passage `yoga-sutra/1.33` (ticket 04's file) doesn't list the inline DharmaWiki link on "Chitta" in its translation; the Brahma Vihara Concept's edits mention it. The census needs nothing else from this ticket: its ids, translations and unresolved citations matched the pages.
- **For the merger:** a trial merge with the integration tip (tickets 06, 07 and 08; in a throwaway worktree, never committed) has no conflicts and passes typecheck, the unit tests (395) and verify on `concept questionnaire` (23 records). Under heavy machine load (load average about 25 on 8 CPUs), whole-content tests of tickets 01 and 13 can exceed Vitest's 5-second timeout, as ticket 08 noted: the integration tip alone failed one that way here, and each passes alone in about 3 s. This ticket's test reads the content once, in a `beforeAll` with a 60-second timeout. A global `testTimeout` in `vitest.config.ts` (ticket 01's file) would cover the others.
- **Left over:** nothing in this ticket's scope.
