# 11: Concept batch: self and temperament

Status: resolved
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

- [x] **Slugs (D02):** each slug is the page's own ASCII spelling of its headword (the Friend/Foe page writes "Atma Bandhu"), recorded with the reason in Comments.
- [x] **Concepts,** built from the census ids:
  - Friend/Foe: headword ātma-bandhu, with ātma-ripu as a term block; primary topic `self`; Bhagavad Gītā 6.5 and Dhammapada 160, which is Pali; the "Contrast with Western Psychology" table as a comparison; "Self Management Strategies Propounded by Bhagavat Gita" kept;
  - Karta: headword kartā; primary topic `temperament`, also `self`; Bhagavad Gītā 18.23–18.25, with the Sattvik, Rajasic and Tamasic Karta as term blocks holding their verses; the comparative table on karma and determinism;
  - Triguna: headword triguṇa; primary topic `temperament`; Bhagavad Gītā 14.5–14.9 and 14.11–14.13, and Suśruta Saṃhitā 4.35 as the page cites it; sattva, rajas and tamas as term blocks; "Guna Predominance", with its verses, and the Ayurveda and psychology sections kept.

  Where a page prints no IAST for a headword or term, its IAST is transliterated from the page's Devanagari, listed and flagged for the Research editor.
- [x] **Each Concept:**
  - its summary is sentences from the page;
  - an English gloss only where the page gives one, otherwise none, flagged for the Research editor;
  - verses in source order, with the census translation ids;
  - sections in order, with term blocks, tables with captions and verse blocks, and the roles "applications" and "comparison" where they apply (D05);
  - References in the page's order;
  - the standard's rules for DharmaWiki links, `#` links, images and interface text;
  - the review status "carried over, not reviewed".
- [x] **Held back, described, never quoted:**
  - Friend/Foe: the Scoring Continuum, and the High, Moderate and Low Indicators;
  - Karta: the whole "Karta Score-Based Indicators" section, including its "scored on a scale of 1 to 10" line and each type's traits and Low, Moderate and High lines;
  - Triguna: the High, Moderate and Low Characteristics table under "Triguna Profile Questionnaire", with its lead-in citing Murthy & Kumar (2007). The design notes place this text in "Guna Predominance"; in the saved copy that section holds Bhagavad Gītā 14.11–14.13 and is kept.
- [x] **Triguna's leftovers:** the `[my_php_code name="Mind"]` shortcode and the test message it produced are dropped and listed.
- [x] **Coming-later Questionnaires,** one per Concept:
  - its slug is its Concept's;
  - `sourceTitle` is the page title as published, and the title follows the spec's rule ("Triguna Profile Questionnaire" for Triguna);
  - `concepts` names its own Concept;
  - `candidateSource: 'tomar-2024'` for all three (research ticket 11);
  - scoring pending, with its reason, and `heldBack` as above;
  - a purpose only from text that says what it measures (Triguna's "A Triguna Profile Questionnaire is a tool to estimate…"), flagged for the Psychology expert;
  - no form.
- [x] **The Dosha Survey's link** to triguṇa waits for ticket 12; this ticket doesn't touch the Dosha Survey's file.
- [x] **Flags** for the right role: each verse whose work the page doesn't name or abbreviates ("Sush Samh 4.35"), each transliterated IAST, each missing gloss, and each source problem noticed but not fixed.
- [x] **Ticket test** (`tests/unit/content-self-temperament.test.ts`): Friend/Foe's primary topic is `self`; Karta's is `temperament`, also `self`; Triguna's is `temperament`; no string holds "my_php_code" or the test message; each has its Questionnaire, with the candidate source `tomar-2024`; every verse and Reference resolves, and Dhammapada 160 is tagged Pali.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs` with `concept/<slug>` and `questionnaire/<slug>` for all three. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** Three Concepts, `atma-bandhu` (self), `karta` (temperament, also self) and `triguna` (temperament), each with a coming-later Questionnaire under the same slug, and `tests/unit/content-self-temperament.test.ts` (40 tests, at two seams: `@/content` for what a page receives, the content source for what a record stores). The temperament topic now holds kartā and triguṇa; self holds ātma-bandhu, with kartā as a secondary Concept. A mutation run (ten breaks to the records, each restored) showed every one caught. 377 unit tests pass, 10 completeness checks still wait for ticket 12. verify on the six records: 6 passed; on `concept questionnaire`: 21 passed, none unchecked. Every Reference, passage and translation id came from the census: no Reference or passage file added.
- **Slugs (D02).** `atma-bandhu`: the page's own spelling of its headword, "Atma Bandhu" (its heading "Disruptions in Atma Bandhu & Aatmaripu"), hyphenated as its two words; the address `frienorfoeofself` is a misspelled English phrase, not the headword. `karta`: the page's "Karta" (title and headings), without the address's stray "-2". `triguna`: the title's "Triguna" (the text's plural is "Trigunas").
- **Counts.** Sections 5, 4 and 5; term blocks 1, 3 and 3; tables 1, 1 and 0 (Triguna's one table is held back); verses 2 (at the top), 3 (inside term blocks) and 9 (inside sections); References 9, 9 and 12, in the pages' order. Held-back items 2, 2 and 1.
- **Decisions the spec left open:**
  - Forms: the IAST "ātma-bandhu" and "ātma-ripu" (as the ticket names them) is written from the page's "Atma Bandhu" and "Aatmaripu"; the page's only IAST for them is in its held-back section. "kartā" is written from "Karta", which no verse holds. The three types are "sāttvika kartā", "rājasa kartā" and "tāmasa kartā", each adjective from the verse set under it ("sāttvikam", "rājasam", "tāmasam"). "triguṇa" takes "guṇa" from 14.5's "guṇāḥ". No Devanagari is stored for any of these, since the pages print none; sattva, rajas and tamas take theirs split out of Triguna's verses. All listed and flagged (ticket 15).
  - English names only from the page's own gloss: kartā is "doer" ("‘karta’ or doer"); ātma-bandhu, ātma-ripu, triguṇa and the three types of doer have none (flagged: the nearest phrases are named in the flags, and the Karta types are glossed only in held-back headings). The guṇas' glosses are what Triguna's first paragraph says each "represents": purity, passion or hyperactivity, passivity and inertia.
  - Friend/Foe: the h4 above the table is its caption, and the table stays in "Contrast with Western Psychology" (comparison). "Disruptions in Atma Bandhu & Aatmaripu" is a section of its own, also a comparison, holding ātma-ripu as a term block around its paragraph. "Self Management Strategies Propounded by Bhagavat Gita" is kept, with no role, as other pages' solution sections have none.
  - Karta: as the ticket says, "Bhagavad Gita – Types of Karta" is a section whose three term blocks hold 18.23–18.25, so the Concept has no verses above its sections. The first heading, "Karta Profile Introduction", heads no text: it gives the Questionnaire its title, "Karta Profile".
  - Triguna: the h3s "Sattva Guna", "Rajas Guna" and "Tamas Guna" are the term blocks (sattva, rajas, tamas). The h2s "Sattva", "Rajas" and "Tamas" head one verse each and nothing else, and their anchors would repeat the terms', so they are dropped as verse headings (listed): 14.6–14.8 follow 14.5 in "Bhagavad Gita – Gunatraya Vibhaga (Chapter 14)". "Triguna Profile Questionnaire" belongs to the Questionnaire (its title, its purpose, its held-back table), so 14.9 follows 14.8 there. "Psychology Perspectives" takes the comparison role. The text after "Tamas Guna" that speaks of all three guṇas follows the term blocks (listed).
  - Questionnaires: titles by the spec's rule: "Are you a Friend/Foe of Yourself?", "Karta Profile" and "Triguna Profile Questionnaire"; `sourceTitle` is each page title. Candidate source `tomar-2024` for all three (research ticket 11 found them in Tomar's contents as 2.2, 1.2 and 1.1). Triguna's purpose is the page's "A Triguna Profile Questionnaire is a tool to estimate…" sentence with "high and low" left out, since the held-back guard refuses "low characteristics" (listed as a replacement and flagged). Friend/Foe and Karta say nothing about what their questionnaires measure outside the score sections: no purpose, flagged with ticket 09's note word for word so the pack collapses it.
  - Held back, described and never quoted: Friend/Foe's continuum line and its three indicator texts; Karta's whole score section (its scale line, and each type's description, traits and Low, Moderate and High lines); Triguna's table of characteristics with its lead-in citing Murthy & Kumar (2007). The `where` of Triguna's item notes that the design notes place it in "Guna Predominance", which on the saved page holds 14.11–14.13 and is kept.
  - Typos fixed and listed: "(Tomar, 20204)" → "(Tomar, 2024)", "Krishnappa el al." → "Krishnappa et al.", "self-discipline.The". The shortcode and its test message are listed by description, so no record holds the shortcode's text.
- **Flags raised:** 17 for the Research editor, 3 for the Psychology expert, 1 for the Project owner. Research editor: the transliterated and split-out forms and the missing glosses (ticket 15); Friend/Foe's caption, copied word for word from Know Your Mind, describing states of mind over a table about the self, citing Krishnappa et al. (2020) and Prabhu & Bhat (2013), neither on its list; "(Paranjape, 2010)" against Paranjpe; "(Hegde & Nayak, 2024)" against 2025; "(Swaroop et al., 2017)" against 2016 (ticket 17); "anantta"; Karta's verses headed "Types of Karta" though they and their English lines speak of types of action (ticket 16); Karta's garbled "kata" and "gnats", "Gyata" beside "Jnata", "Vishistha advaita or non dualistic" and "Sankhya Nyasa"; and, copied word for word from the passages so the pack collapses them, Triguna's unnamed-work note (8 records) and "Sush Samh 4.35" (2 records). Psychology expert: Triguna's purpose; no purpose for Friend/Foe and Karta (ticket 26). Project owner: Karta's held-back section also holds paragraphs describing each type of doer that interpret no score; decide whether they belong on the Concept (ticket 19).
- **For ticket 12:** set the Dosha Survey's `concepts` to `triguna`. The census places some verses where the Concepts don't: Karta's three (census "top"; here inside their term blocks, as this ticket asks), Triguna's 14.6–14.8 (census sections "Sattva", "Rajas" and "Tamas"; here the chapter 14 section, those headings dropped) and 14.9 (census "Triguna Profile Questionnaire"; here after 14.8). The census needs nothing else: its ids, translations and unresolved citations matched the pages. Under machine load (load average 25 to 28) the first full test run had three 5-second timeouts in tickets 01 and 13's tests before any change; a re-run passed. This ticket's test warms the content graph in `beforeAll`.
- **For the merger:** a trial merge with the integration tip, which now holds tickets 09 and 10 (uncommitted and aborted), has no conflicts: tsc, the 476 unit tests and verify on all 37 Concepts and Questionnaires (19 and 18, the full set) pass, and the Psychology-expert note on a missing purpose collapses with ticket 09's into one line of the flags pack.
- **Left over:** nothing in this ticket's scope.
