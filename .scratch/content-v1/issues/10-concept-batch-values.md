# 10: Concept batch: values

Status: resolved
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

- [x] **Slugs (D02):** each slug is the page's own ASCII spelling of its headword ("Ahimsa", "Satya", "Asteya", "Brahmacharya"), recorded with the reason in Comments.
- [x] **Concepts,** built from the census ids, each with the primary topic `values` and with Yoga Sūtra 2.30 and 2.32 first:
  - Ahimsa: headword ahiṃsā, gloss "Non-Violence" from the page title; also Yoga Sūtra 2.35;
  - Satya: headword satya, gloss "Truthfulness"; also Yoga Sūtra 2.36 and Bhagavad Gītā 17.15;
  - Asteya: headword asteya, gloss "Non-Stealing";
  - Brahmacharya: headword brahmacarya, with no gloss in its title (flagged); also Bhagavad Gītā 6.17, 2.54–2.58 and 2.68.

  Each headword's IAST comes from the page's own transliteration of Yoga Sūtra 2.30, split out of its compound and listed, as vikṣepa's obstacle names were.
- [x] **Each Concept:**
  - its summary is sentences from the page;
  - verses in source order, with the census translation ids;
  - sections in order, with term blocks, tables with captions and verse blocks, and the roles "applications" and "comparison" where they apply (D05);
  - a topic-introduction block where the page had the yama–niyama section;
  - References in the page's order;
  - the standard's rules for DharmaWiki links, `#` links, images and interface text;
  - the review status "carried over, not reviewed".
- [x] **The values introduction,** stored once on the `values` topic:
  - the section, with Yama and Niyama as term blocks;
  - its own reference list: Tomar (2024), Srinivasan (2016) and Thapliyal et al. (2023), which it cites;
  - all four pages in its provenance.
- [x] **The four copies, compared** and recorded in the introduction's provenance:
  - Ahimsa's and Brahmacharya's copies are identical;
  - Satya's differs only in spacing, inside the quotes round ‘Yama’ and before one full stop;
  - Asteya's has four wording changes: "which lead to peace", "Niyamas are intrapersonal observations that lead to internal improvement and peace with oneself", "vision, and humility" and "which comprises".

  Store one copy word for word: by default Asteya's, the only copy whose grammar the site itself corrected. List every difference from the others, and flag the choice for the Research editor.
- [x] **Held back, described, never quoted:** on each page, the Overall Score Indicator with its High, Moderate and Low Score Wise Category Descriptions, and its "referred from" note.
- [x] **Coming-later Questionnaires,** one per Concept:
  - its slug is its Concept's;
  - `sourceTitle` is the page title as published ("Know Your Values: Ahimsa (Non-Violence) Profiling" and so on), and the title follows the spec's rule;
  - `concepts` names its own Concept;
  - `candidateSource: 'tomar-2024'` for all four (research ticket 11);
  - scoring pending, with its reason, and `heldBack` as above;
  - a purpose only from text that says what it measures, flagged for the Psychology expert;
  - no form.
- [x] **Flags** for the right role: each verse whose work the page doesn't name ("Chapter 2, Sutra 30", "Chapter 17, Verse 15"), each missing gloss, and each source problem noticed but not fixed.
- [x] **Ticket test** (`tests/unit/content-values.test.ts`): the four Concepts have the primary topic `values`; each holds exactly one topic-introduction block, and the values topic has its introduction with three References; no Concept repeats the introduction's text; each has its Questionnaire, with the candidate source `tomar-2024`; every verse and Reference resolves.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs topic/values` with `concept/<slug>` and `questionnaire/<slug>` for all four. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** The values topic's introduction (`src/content/data/topics/values.ts`, its `intro` only); the Concepts `ahimsa`, `satya`, `asteya` and `brahmacharya`; a coming-later Questionnaire for each under the same slug; and `tests/unit/content-values.test.ts` (41 tests, at the seams the other content tests use: the content source and `@/content`). A mutation run broke one record at a time, and each break failed its test. verify passes all nine records, and `verify.mjs concept questionnaire topic` passes 15 (the other four topics are structure only). 316 unit tests pass; the 10 completeness checks stay off for ticket 12.
- **Slugs (D02):** `ahimsa`, `satya`, `asteya` and `brahmacharya`: each page's own ASCII spelling of its headword, as its title and text write it ("Ahimsa", "Satya", "Asteya", "Brahmacharya"), lowercased. Each Questionnaire takes its Concept's slug (settled rule 13).
- **Counts.** 4 Concepts, 4 Questionnaires, 1 introduction (one section, the term blocks Yama and Niyama, 5 paragraphs, 3 References). Verses at the top: Ahimsa 3, Satya 4, Asteya 2, Brahmacharya 9 (18 quotes of 12 passages), with the census's passage and translation ids and each page's own Meaning. Reference lists of 13, 16, 9 and 20 ids (42 distinct), in the census's order. 3 comparison tables (Asteya's page has none). One held-back item per Questionnaire.
- **Decisions the spec left open:**
  - Headwords: IAST and Devanagari split out of the pages' Yoga Sūtra 2.30 compound in their dictionary form (ahiṃsā अहिंसा, satya सत्य, asteya अस्तेय, brahmacarya ब्रह्मचर्य), listed and flagged; ASCII the pages' spellings; English names the titles' glosses. Brahmacharya's title has none, so it has no English name; its flag quotes the two glosses its text gives in passing.
  - The introduction stores the Asteya page's copy, with that page's paragraphs (Ahimsa and Brahmacharya run the Niyama text into one). One typo common to all four copies is fixed and listed ("Yanas" → "Yamas"), so the copy is word for word apart from that. Yama and Niyama are term blocks: IAST the pages' spelling, Devanagari (यम, नियम) split out of Yoga Sūtra 2.30 and 2.32 (flagged). The two DharmaWiki links on the Ahimsa and Brahmacharya copies are dropped and listed there. Its References follow the pages' lists: Srinivasan (2016), Thapliyal et al. (2023), Tomar (2024).
  - The comparison is in the introduction's edits: Asteya's four wording changes, each as a replacement; the paragraphing and links. In extract's outline Satya's copy reads word for word as Ahimsa's. The tools collapse whitespace and drop invisible marks, so its spacing differences are recorded as the ticket describes them, not re-checked.
  - Placement: every values page prints the shared section first, after its verses. Each Concept's first section has the introduction's own id and heading (`raja-yoga-foundations-yama-niyama`) and holds only the topic-intro block, so the Concept's table of contents keeps its real entry and the anchor matches the introduction's. The paragraphs and terms live only on the topic; the test checks that no Concept repeats them.
  - Each "… Profiling" definition heading starts a section, not a term block: it names the Concept itself, and a term block would list it twice in the A–Z. Satya's and Asteya's h3 sub-sections become sections in the page's order; headings are kept as written. Summaries are the first sentence of each page's own definition, after its opening saying.
  - Questionnaire titles are the page titles: each "… Profiling" sub-heading heads the Concept's definition, not a description of the questionnaire. No purpose: outside the held-back section no page says what its questionnaire measures. Each candidate-source edit names the title research ticket 11 found it under. The scoring reason is ticket 08's wording.
  - Typos fixed and listed: "Vasaya Maharaj" → "Vyasa Maharaj" (Ahimsa), "restaurant" → "restraint" in Brahmacharya's Vyasa saying (with the stray space after its opening quote), Asteya's ‘Asteya” closing quote, and a full stop before "(Zahedi, 2011)" (Satya). An edit can't hold a lone ” inside its curly quotes, so the Asteya edit writes it as a straight ", which verify reads as the same mark.
- **Flags raised:** 15, all for the Research editor. Four headwords split out of a compound, Brahmacharya's missing gloss, and Yama and Niyama's Devanagari and missing glosses (ticket 15); the unnamed work of every values verse, one note per page (ticket 16); "(Jain & Prakrit Bharati academy, JaiPur, 2016)", on no reference list, and "(Reznik et al., 2019b)", where the list has one Reznik et al. (2019) with no letter (ticket 17); the choice of the Asteya copy; sentence fragments left as written in the shared section and in Brahmacharya's text. No Psychology-expert or Project-owner flags: the Questionnaires carry no purpose or form, and Tomar (2024)'s rights flag is on its record (ticket 03).
- **Census:** every Reference, passage and translation id existed; no file was added, and nothing needs folding in.
- **For ticket 12 and front-end-site ticket 05:**
  - A values Concept's first section and the introduction's section share an id and heading, and the Concept view gives both (the section, then the introduction's section inside its topic-intro block). Draw the introduction's section in that section's place, so the heading shows once and the anchor is unique.
  - Yama and Niyama are term blocks in the topic introduction, which the A–Z and search derivations don't read (they take a Concept's own terms), and the glossary has no entry for either, so neither is findable there yet.
  - Ahimsa's "(“EPRA International Journal of Multidisciplinary Research (IJMR),” 2019b)" isn't read as a citation (its parentheses nest), so it won't link to `epra-2019`.
- **Left over:** nothing else in this ticket's scope.
