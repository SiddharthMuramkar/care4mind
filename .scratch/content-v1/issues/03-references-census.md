# 03: References census

Status: resolved
Blocked by: 02
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D09, D13

**What to build:** every Reference the kept pages cite or list exists once, as a record with its fields split out, and a census maps each page to its ids.

- A researcher can trust that Tomar (2024) is one entry wherever it is cited, with every way the pages wrote it kept.
- A batch ticket looks up its page in the census and reuses the ids instead of creating duplicates.
- The Library's books are References too (D09), ready for ticket 07's lists.

## Owns

- `src/content/data/references/**`, including the eleven References ticket 01 created. Fields and citation forms may be added to those, but what the foundation pages show for them must not change.
- `.scratch/content-v1/census/references.md` (new)
- `tests/unit/content-references.test.ts` (new)

## Acceptance criteria

- [x] **Scope:**
  - the reference lists of the 16 description pages, including "Online Resources" lines such as Triguna's;
  - the books listed on `/text-books/`, `/text-books-2-2/`, `/indian-philosophy/`, `/positive-psychology/` and `/inspirational-books/`, including the Text Books pages' inspirational section.

  Course entries are not References (ticket 07 keeps them as courses). Atman, Jiva and Jagat have no reference lists.
- [x] **Once each:** one record per published work. The same work cited on several pages is one record whose `asCited` keeps each distinct written form. At least:
  - Tomar (2024), cited on all 16 description pages, is one record, `tomar-2024`, holding every form the pages use (five or more);
  - Srinivasan (2016) and Thapliyal et al. (2023), cited on the four values pages, are one record each;
  - Shlokam.org entries are one record per distinct page they cite (title and date), not one record for the site.
- [x] **Ids** follow the spec's rule (settled rule 15). Ticket 01's eleven ids are reused, never duplicated.
- [x] **Fields from the pages only.** Type, authors, year, title, container, publisher, volume, issue, pages, edition, DOI and URL are taken as the pages give them, and nothing is looked up.
  - Where the pages give no DOI or URL, `noStableLink` says so ("none given on the current site; not looked up"), and a Research-editor flag asks for one.
  - A paper or book missing its authors, publication or year carries a Research-editor flag naming each missing field (FR-03). Sharma & Pareek, with no year, and the two Positive Psychology books are known cases.
- [x] **Links:**
  - the five `#` links on `/text-books/` and the five on `/indian-philosophy/` are dropped and flagged for the Research editor;
  - amazon.in and amazon.com links are kept as a book's URL only when the page gives no other link, and flagged for the Project owner;
  - "Read more", "View book" and similar labels are interface text.
- [x] **Rights:** `tomar-2024` carries a Project-owner flag. It is a commercial handbook and the candidate source for 14 Questionnaires (research ticket 11); its questions can't be reproduced without permission; and its author's relation to the Client is unknown.
- [x] **Census** (`.scratch/content-v1/census/references.md`):
  - for each source page, keyed by its current address (never by a Concept slug), its reference list in the page's order mapped to ids, and its listed books mapped to ids;
  - then one table of every id, with its forms as cited and the pages citing it, including `navare-pandey-2022` (from research, not a page);
  - every id in the census exists as a record, and every record is in the census.
- [x] **Ticket test** (`tests/unit/content-references.test.ts`): `tomar-2024` holds at least five distinct forms; no two References share type, title and year; every Reference id follows the id rule. References no record cites yet are expected until the batches land; the completeness checks wait for ticket 12.
- [x] **Legacy unchanged:** the legacy snapshot test still passes.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs reference`. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** 188 Reference records: ticket 01's eleven, two of them extended (`tomar-2024` with its four other forms, the other 15 pages, its 1st edition and two flags; `shlokam-2025` with Sthitaprajna, Brahma Vihara and Triguna), and 177 new. The census, `.scratch/content-v1/census/references.md`, maps each of the 21 source pages by its address to ids in the page's order, then lists every id with its forms and pages; a check confirmed every census id is a record and every record is in the census. `tests/unit/content-references.test.ts` (13 tests) reads the real records through the public interface, `references.list()`, and tests its guards on made-up References first. The records were written by a throwaway script (kept outside the repo) from the extract tool's outlines, never from the captures directly, and reviewed one by one. Verify passes on all 187 page-sourced records; `navare-pandey-2022` is listed as unchecked.
- **Counts.** The 16 description pages have 188 reference lines (Triguna's "Online Resources" line counted once, holding three links), giving 155 References. The five Library pages list 54 books, 33 distinct, 32 of them new (`rao-paranjpe-2016` is also on Karta's list). Plus `navare-pandey-2022` from research. Tomar (2024): 16 pages, 5 forms. Srinivasan (2016), Thapliyal et al. (2023) and the Shlokam pages for Yoga Sūtra 2.30 and 2.32: one record each, cited by all four values pages. Types: 104 journal articles, 39 books, 37 web pages, 4 dictionary entries, 3 other, 1 chapter. 79 have a DOI, 93 a URL, 16 neither (`noStableLink`).
- **Decisions the spec left open:**
  - Ids (rule 15): the surname as the page writes it, the part before the comma or the last word of a name written in full (`mandal-pal-2023`, `krishnappa-2020`, `saraswati-2014`). Two exceptions: `prabhu-bhat-2013` follows the page's own "(Prabhu & Bhat, 2013)"; `murthy-kiran-kumar-2007` drops the initial in "K Murthy". With no author: the site or organisation (`dharmawiki`, `esushruta` from the e-book's address, `ias-express-2023`), or for two authorless books a title name (`yoga-sutras-patanjali`, `tamil-siddhas`). A word only tells same-year works apart (`mascaro-1994-gita`, `shlokam-2024-gita-2-54`). `sudrajat-2017` names one author, since the second is a university.
  - One record per work, by its link. The Shlokam home page, cited with two dates and as "Shlokam.org", is `shlokam-2025`, keeping July 2. Its Yogasutra index, cited under two titles, is `shlokam-2020-yogasutra`. Know Your Mind's 2020a and 2020b lines are one paper, `krishnappa-2020`. All three are flagged.
  - Years keep the letter a page adds to tell its entries apart, as ticket 01 kept `n.d.-b`, so in-text citations such as "(Shlokam.org, 2020a)" and "(Yogapedia, 2023b)" resolve. `krishnappa-2020` has `2020`, the year its in-text citations use.
  - Types follow the line's form: chapter for Sudrajat's proceedings paper; dictionary entry for the APA entries and Anderson's Oxford encyclopedia entry; other for the two journals cited as a whole and IGNOU's course unit.
  - A doi.org link becomes the DOI, listed as Schleim's is. Skandhan's is the journal's DOI, so it is kept as a URL and flagged.
  - Seven titles written wholly in capitals are put in sentence case and listed, as ticket 01 did; mixed-case titles stay as written (the style is planning ticket 17's).
  - Clear typos are fixed and listed: "Triguņa", "bhũmike", "Children S", "Gandhi′s", "Ogunbadejo2".
  - Books on both Text Books and Inspirational Books take their fields from the fuller Inspirational Books line.
  - Tomar gets no volume: "(1st ed., Vol. 1)" on two pages would change the `publication` line the foundation's pages show, so only the edition is added, and the volume is flagged.
- **Flags raised:** 66 for the Research editor and 11 for the Project owner, all in the records' provenance.
  - Research editor: 16 missing links (5 of them the `#` "More Info" books), each missing author, year, journal or publisher, the titles taken from APA addresses, the duplicate and merged Shlokam and Krishnappa entries, ISSNs given as pages, garbled volumes (Chakraborty, Skandhan), journals cited as a whole (EPRA, Praxis), Yogapedia cited as a site, Singh's link to a journal home page, Das & Rai's cut title, Kaundinya's title run into the journal, Gangasagre's title and authors, Khalil Gibran's name, "The Upanisads" spelling, Sudrajat's second author, "postCOvid", and Samant's year (only in the in-text "(Samant, 2023)").
  - Project owner: Tomar's rights (ticket 28), and 10 books whose only link is to Amazon.
- **For other tickets:**
  - Batch tickets: the census notes, page by page, the in-text citations that resolve to no id on that page's list, such as "Krishnappa el al.", "(Bhattacharjee, 2024)" against a 2016 entry, and "(Inbadas, 2017)", which isn't listed. Friend/Foe's "(Tomar, 20204)" isn't even read as a citation. Know Your Mind lists `krishnappa-2020` twice.
  - Ticket 07: the census maps every listed book under its page's headings.
  - Ticket 01's integrity rule against WordPress paths also catches a third-party link: Sarkar (2019)'s only link is a PDF under another site's WordPress uploads path, so it is left out and flagged. The rule could be narrowed to care4mind.org (`content-integrity.test.ts` is ticket 01's).
- **Left over:** nothing in this ticket's scope. "Every Reference is cited" stays off until ticket 12.
