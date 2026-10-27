# 08: Concept batch: mind

Status: resolved
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

- [x] **Slugs (D02):** each slug is the page's own ASCII spelling of its headword, recorded with the reason in Comments. Know Your Mind writes "chittabhumis", so its slug is `chittabhumi`; the Panch Klesha page's own spelling decides between `panch-klesha` and `pancha-klesha`.
- [x] **Concepts,** built from the census ids:
  - Upa-Vikshepa Profiling: headword upa-vikṣepa; Yoga Sūtra 1.31;
  - Panch Klesha – Vikaar Profiling: headword pañca kleśa; Yoga Sūtra 2.3, 2.5, 2.7 and 2.9; the five kleśas and the six vikāras as term blocks;
  - Know Your Mind: headword citta-bhūmi, its IAST transliterated from the page's "chittabhumis", listed and flagged; the Yoga Sūtra 1.2 and 1.30 excerpts, with the page's "Meaning" texts kept on the quotes; the five states of mind as term blocks; its two tables;
  - Sthitaprajna: headword sthitaprajña; Bhagavad Gītā 2.54–2.58 and 2.68.

  The primary topic of each is `mind`; Sthitaprajna's is also `self`.
- [x] **Each Concept:**
  - its summary is sentences from the page;
  - an English gloss only where the page gives one, otherwise none, flagged for the Research editor;
  - verses in source order, with the census translation ids;
  - sections in order, with term blocks, tables with captions and verse blocks, and the roles "applications" and "comparison" where they apply (D05);
  - References in the page's order;
  - the standard's rules for DharmaWiki links, `#` links, images and interface text;
  - the review status "carried over, not reviewed".
- [x] **Held back, described, never quoted,** each with its "referred from" note:
  - vikṣepa, Upa-Vikshepa and Sthitaprajna: the Overall Score indicator, with High, Moderate and Low indicators;
  - Panch Klesha: the Score indicator, with a High, Moderate and Low Score for each kleśa;
  - Know Your Mind: the Score-Based Indicators, with High, Moderate and Low for each state of mind.
- [x] **Coming-later Questionnaires,** one for each of the five Concepts:
  - its slug is its Concept's;
  - `sourceTitle` is the page title as published, and the title follows the spec's rule ("Know Your State of Mind Profile" for Know Your Mind);
  - `concepts` names its own Concept;
  - `candidateSource: 'tomar-2024'` for all but Sthitaprajna, which has none and a Psychology-expert flag: no published source found (research ticket 11);
  - scoring pending, with its reason, and `heldBack` as above;
  - a purpose only from text that says what it measures, flagged for the Psychology expert;
  - no form.
- [x] **Vikṣepa** links to its Questionnaire. Nothing else in its file changes, and the legacy snapshot test still passes.
- [x] **Flags** for the right role: each verse whose work the page doesn't name ("Panch Klesha: Chapter 2, Sutra 3"), each transliterated IAST, each missing gloss, and each source problem noticed but not fixed.
- [x] **Ticket test** (`tests/unit/content-mind.test.ts`): the five mind Concepts have the primary topic `mind`, and Sthitaprajna also `self`; each has its Questionnaire with the expected candidate source; every verse and Reference resolves.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs` with `concept/<slug>` for the four new Concepts and `questionnaire/<slug>` for all five Questionnaires. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** Four Concepts (`upa-vikshepa`, `panch-klesha`, `chittabhumi`, `sthitaprajna`), five coming-later Questionnaires under their Concepts' slugs (those four and `vikshepa`), vikṣepa's `questionnaire` field (its only change; the legacy snapshot passes), and `tests/unit/content-mind.test.ts` (47 tests, through `@/content` and the content source). The mind topic now holds its five Concepts. No Reference or passage file was added: every id was in the census. verify on `concept questionnaire`: 14 passed, none unchecked.
- **Slugs (D02):** `upa-vikshepa`, the page's "Upa-Vikshepa" (its title); `panch-klesha`, since the page writes "Panch Klesha" in its title and six headings and "Pancha Klesha" only over three verses; `chittabhumi`, the singular of the page's only form, "chittabhumis" (as the ticket says); `sthitaprajna`, the page's "Sthitaprajna".
- **Counts:** sections 2, 4, 4 and 6; term blocks 5, 11 (five kleśas, six vikāras), 5 and 0; tables 3, 2, 2 and 1; verses 1, 4, 2 and 6; References 11, 13, 7 and 11 (upa-vikṣepa, pañca kleśa, citta-bhūmi, sthitaprajña).
- **Decisions the spec left open:**
  - English names only where the page glosses the headword: "fivefold miseries" ("five kleshas (fivefold miseries)"), "state of mind" ("states of mind, known as chittabhumis", in the singular like the headword) and "person of steady wisdom" ("The Sthitaprajna (person of steady wisdom)"). Upa-vikṣepa has none (flagged). A term's gloss is its sub-heading's own parenthetical, so upa-vikṣepa's five terms have none either (the flag names the pairings its text and table make).
  - Forms the pages don't print are listed and flagged (ticket 15): upa-vikṣepa, pañca kleśa, citta-bhūmi and mātsarya transliterated; aṅgamejayatva, śvāsa, praśvāsa, sthitaprajña and the Devanagari of upa-vikṣepa's terms, the kleśas and sthitaprajña split out of the verses' compounds and inflected words. No Devanagari is stored for pañca kleśa, citta-bhūmi, upa-vikṣepa, the six vikāras or the five states: the pages print none.
  - A heading set just above a table is its caption (listed); Know Your Mind's two such headings are h3s, so they also head their sections. Non-term sub-headings start sections ("States of Mind according to Patanjali Yoga Sutras", "Similarities", "Differences"); Sthitaprajna's Similarities and Differences take the comparison role with "Indian vs Western concept". Text after a page's last term sub-heading that speaks of the whole (Upa-Vikshepa's breathing tables and closing paragraph, Panch Klesha's paragraph on stress) stays in the section after the term blocks (listed).
  - Rows of a table whose every row head is one of the Concept's own terms (Panch Klesha's two tables, Know Your Mind's correlates) are headed by the term, as vikṣepa's are; other tables keep the page's text, including Upa-Vikshepa's comparison, whose "Śvāsā and Praśvāsā" row names two terms.
  - Headings are kept as written, "Indian vs Western concept" and "What is the definition of Panch Klesha – Vikaar Profiling?" included; vikṣepa's re-homed "Indian and Western concepts" (ticket 01) is the only reworded one.
  - `external` keeps each Concept's own DharmaWiki article where its page links it from the headword: Chitta Bhumis (the article its glossary card also links) and Kleshas. Upa-Vikshepa and Sthitaprajna link none of their own.
  - Summaries are the definition section's first sentences that say what the Concept is. Know Your Mind's list names `krishnappa-2020` twice (2020a, 2020b); the Concept lists it once (listed).
  - Typos fixed: "Patanjalii", "Krishnappa el al." (so its citations resolve). Panch Klesha's bare reference numbers "1-3" and "3" are dropped (listed, flagged).
  - Questionnaires: titles are the page titles, except Know Your Mind's "Know Your State of Mind Profile", its first heading; `sourceTitle` is the page title. One `heldBack` item per score section, naming its sub-headings and the source its "referred from" note gives (Know Your Mind's section has no such note, which it says). No page says what its questionnaire measures, so none has a purpose.
- **Flags raised:** 22 for the Research editor, 1 for the Psychology expert. Research editor: the four headwords' forms and the split-out sub-term forms (ticket 15); upa-vikṣepa's missing gloss; the unnamed-work verses on Upa-Vikshepa and Panch Klesha, worded as on their passages so the pack collapses them (ticket 16); unresolved or unlisted citations: "(Sharma et al., 2024)", "(Sharma, 1977)" against Sharma (1997), "(Samant, 2023)" against an undated Samant, "(Surti et al.)" for two authors, Vyas et al., Prabhavananda, Vivekananda, Gayathri and Chauhan (ticket 17); Panch Klesha's Shlokam Yoga Sūtra 1.31 reference and its Praxis paragraph; wording left as is: "five sub-distractions" naming four, "fundamental affiliations", the two orders of the five states, and Sthitaprajna's verbless moksha paragraph. Psychology expert: no published source for Sthitaprajna's questionnaire (ticket 28).
- **Left over:** for ticket 12, the Chitta Bhumis glossary entry's late link to `chittabhumi`. For the merger: a trial merge with the integration tip (tickets 06 and 07, uncommitted and aborted) has no conflicts and passes typecheck, the unit tests and verify. Under heavy machine load (load average 13 to 22 on 8 CPUs), tests that read the whole content can hit Vitest's 5-second timeout in a full run: two of ticket 13's in this lane's baseline, before any change, and ticket 07's Text Books test once in the trial merge. Each passes alone in under 2 s, and a re-run passed in full. Not this ticket's files.
