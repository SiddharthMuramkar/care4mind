# 04: Works and passages census

Status: resolved
Blocked by: 02
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D08

**What to build:** every verse the kept pages quote becomes one passage under its work, with the Devanagari, the transliteration and every translation the pages give, and a census maps each page's verses to passage and translation ids.

- A student can later open a work and see every verse the site quotes from it, each with "quoted in".
- A batch ticket looks up its page in the census and reuses the passage and translation ids for its Concept's verses.

## Owns

- `src/content/data/works/**` and `src/content/data/passages/**`, including the two works and two passages ticket 01 created. Their displayed text must not change.
- `.scratch/content-v1/census/passages.md` (new)
- `tests/unit/content-passages.test.ts` (new)

## Acceptance criteria

- [x] **Scope:** every verse quoted on the 16 description pages, whether at the top of the page or inside a section. Not passages: the homepage's opening line, and verses only mentioned in prose ("verse 9.27"). Atman, Jiva and Jagat quote none.
- [x] **Works:** one record per work, slugged by D02. At least Yoga Sūtra and Vedānta Sāra (from ticket 01), Bhagavad Gītā, Dhammapada, Sādhana Pañcakam and Suśruta Saṃhitā.
  - Each has its title in IAST, and in Devanagari where a page gives it, the ASCII spellings the pages use, an attribution where a page gives one, and its locator label.
  - Dhammapada's language is Pali (the Friend/Foe page quotes verse 160).
- [x] **One passage per verse:**
  - id `work/locator`, and `order` for sorting (Yoga Sūtra 1.2 before 1.20 before 2.3);
  - a verse quoted on several pages is one passage (Bhagavad Gītā 2.54–2.58 and 2.68 appear on both the Sthitaprajna and the Brahmacharya pages);
  - where pages print the same verse differently (spacing, ṁ, word breaks, as Know Your Mind does with Yoga Sūtra 1.30), one form is stored and the others are listed in provenance.
- [x] **Text as given:**
  - Devanagari lines as a page gives them, or an empty list with a Research-editor flag when no page does (Yoga Sūtra 1.2 appears only in IAST);
  - the transliteration with scheme `iast` only when it follows IAST, otherwise `informal`;
  - every text a page labels "Translation" stored as a translation, with an id unique within its passage, and its source where the page names one.

  Text labelled "Meaning" is not a translation: the batch ticket keeps it on the Concept's quote.
- [x] **Unnamed and relabelled works:** a verse whose page names no work ("Chapter 2, Sutra 30", "Chapter 17, Verse 15") gets the work its text identifies, listed in provenance and flagged for the Research editor. Vikṣepa's relabel stays flagged from ticket 01.
- [x] **No "quoted on":** passages don't store which Concepts quote them; the graph computes it.
- [x] **Census** (`.scratch/content-v1/census/passages.md`):
  - for each source page, keyed by its current address (never by a Concept slug), its verses in order, each with its passage id, the translation id the page uses, and whether the page adds a "Meaning";
  - then the works, each with its passages;
  - every id in the census exists, and every passage is in the census.
- [x] **Ticket test** (`tests/unit/content-passages.test.ts`): every passage id is its work and locator; sorting by `order` puts each work's passages in reading order; Dhammapada is Pali; translation ids are unique within each passage.
- [x] **Legacy unchanged:** the legacy snapshot test still passes.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs work passage`. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** 6 works and 43 passages: ticket 01's 2 works and 2 passages, whose displayed text is unchanged (they gain sources, Yoga Sūtra's attribution and flags), plus 4 new works and 41 new passages. By work: Yoga Sūtra 15, Vedānta Sāra 1, Bhagavad Gītā 20, Dhammapada 1, Sādhana Pañcakam 5, Suśruta Saṃhitā 1. The census (`.scratch/content-v1/census/passages.md`) maps the 16 pages' 56 verse quotes to passage and translation ids, then lists the works. `tests/unit/content-passages.test.ts` has 27 tests, and a mutation run showed each one fails when its rule breaks. verify on `work passage`: 49 passed, none unchecked.
- **Slugs (D02):** each work's slug is its ASCII title as the pages write it, hyphenated, as ticket 01 did: `bhagavad-gita`; `dhammapada`; `sadhana-panchakam` (the heading's "Sadhana Panchakam"); and `sushruta-samhita` (the Triguna page's "Sushruta Samhita"). Locators are the pages' numbers with dots ("2-54" becomes `2.54`). The Sādhana Pañcakam's verses are `1` to `5`, and the Dhammapada's is `160`.
- **Decisions the spec left open:**
  - Translation ids name the page the stored translation came from (ticket 01's convention). A translation several pages print identically is stored once, under the first of those pages in the spec's page order. So Yoga Sūtra 2.30 and 2.32 use the Ahimsa page's id on all four values pages, and Bhagavad Gītā 2.54 to 2.68 use `sthitaprajna`.
  - Where pages print a verse differently, the stored form is the one set out line for line, as its Devanagari is. Yoga Sūtra 1.30 keeps the Vikshepa page's form; Know Your Mind's one-line form, with ṁ, is listed. Bhagavad Gītā 2.54 takes the Brahmacharya page's three-line transliteration and the Sthitaprajna page's translation; the other page's forms are listed.
  - An English line printed under a verse with no label is stored as the translation and flagged: Karta's three verses and Triguna's 14.6 to 14.13. Labels decide only between "Translation" and "Meaning".
  - Five verses have no translation. Four have only a "Meaning" line: Yoga Sūtra 1.2, Bhagavad Gītā 6.5 and 14.5, and Dhammapada 160. Suśruta Saṃhitā 4.35 has no English at all. Know Your Mind's quote of 1.30 also names none: its line is a Meaning.
  - These are not passages: verses only named in prose, words of a verse quoted inside a sentence (Know Your Mind's "Deśa-bandhaḥ cittasya dhāraṇā"), and Momentum of Spiritual Practice's English quotation labelled "Vedanta Saara 1.30". That quotation has no verse text and no "Translation" label; a flag on the Vedānta Sāra work asks the Research editor to confirm. The census lists all of these under their pages.
  - Bhagavad Gītā's Devanagari title comes from the Concepts page's card, "Bhagavad Gita (भगवद्गीता)". The attributions are written as the pages write them: Yoga Sūtra's "Patanjali" and Sādhana Pañcakam's "Adi Sankaracharya". No page attributes the other works. The Dhammapada's roman-letter Pali uses IAST letters, so its scheme is `iast`.
  - Text changes, each listed in its record: verse numbers dropped, before translations and after verses; Suśruta's ṁ written ṃ, and its Latin comma left out of the Devanagari; Sādhana Pañcakam 2's double avagraha, which the page prints as a closing quotation mark, written as two apostrophes; the quotation marks around four of Triguna's translations dropped.
  - The test doesn't read the census file. A batch ticket may add a passage the census lacks, and it can't edit the census. A scratch check confirmed that every census id exists and that every passage is in the census.
- **Flags raised, all for the Research editor (planning ticket 16).** 27 verses whose heading names no work; these collapse into 9 notes in the flags pack. 10 unlabelled translations, 4 Meaning-only verses, 2 with no Devanagari (Yoga Sūtra 1.2, Dhammapada 160) and 1 with no transliteration (Yoga Sūtra 1.33). For Suśruta Saṃhitā 4.35: its missing translation, and a locator that doesn't name its section (sthāna). The IAST titles of the three new works that needed one, the unnamed source of each work's translations, and the "Vedanta Saara 1.30" quotation. Yoga Sūtra 1.30's relabel flag stays, now naming the Vikshepa page.
- **Left over:** nothing in this ticket's scope. Once the batch tickets quote these passages, ticket 12 switches on "every passage is quoted" and "every work has a passage".
