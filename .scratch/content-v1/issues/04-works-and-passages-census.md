# 04: Works and passages census

Status: ready-for-agent
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

- [ ] **Scope:** every verse quoted on the 16 description pages, whether at the top of the page or inside a section. Not passages: the homepage's opening line, and verses only mentioned in prose ("verse 9.27"). Atman, Jiva and Jagat quote none.
- [ ] **Works:** one record per work, slugged by D02. At least Yoga Sūtra and Vedānta Sāra (from ticket 01), Bhagavad Gītā, Dhammapada, Sādhana Pañcakam and Suśruta Saṃhitā.
  - Each has its title in IAST, and in Devanagari where a page gives it, the ASCII spellings the pages use, an attribution where a page gives one, and its locator label.
  - Dhammapada's language is Pali (the Friend/Foe page quotes verse 160).
- [ ] **One passage per verse:**
  - id `work/locator`, and `order` for sorting (Yoga Sūtra 1.2 before 1.20 before 2.3);
  - a verse quoted on several pages is one passage (Bhagavad Gītā 2.54–2.58 and 2.68 appear on both the Sthitaprajna and the Brahmacharya pages);
  - where pages print the same verse differently (spacing, ṁ, word breaks, as Know Your Mind does with Yoga Sūtra 1.30), one form is stored and the others are listed in provenance.
- [ ] **Text as given:**
  - Devanagari lines as a page gives them, or an empty list with a Research-editor flag when no page does (Yoga Sūtra 1.2 appears only in IAST);
  - the transliteration with scheme `iast` only when it follows IAST, otherwise `informal`;
  - every text a page labels "Translation" stored as a translation, with an id unique within its passage, and its source where the page names one.

  Text labelled "Meaning" is not a translation: the batch ticket keeps it on the Concept's quote.
- [ ] **Unnamed and relabelled works:** a verse whose page names no work ("Chapter 2, Sutra 30", "Chapter 17, Verse 15") gets the work its text identifies, listed in provenance and flagged for the Research editor. Vikṣepa's relabel stays flagged from ticket 01.
- [ ] **No "quoted on":** passages don't store which Concepts quote them; the graph computes it.
- [ ] **Census** (`.scratch/content-v1/census/passages.md`):
  - for each source page, keyed by its current address (never by a Concept slug), its verses in order, each with its passage id, the translation id the page uses, and whether the page adds a "Meaning";
  - then the works, each with its passages;
  - every id in the census exists, and every passage is in the census.
- [ ] **Ticket test** (`tests/unit/content-passages.test.ts`): every passage id is its work and locator; sorting by `order` puts each work's passages in reading order; Dhammapada is Pali; translation ids are unique within each passage.
- [ ] **Legacy unchanged:** the legacy snapshot test still passes.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs work passage`. No Playwright run: pages don't change.

## Comments
