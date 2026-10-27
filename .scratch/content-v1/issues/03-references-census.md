# 03: References census

Status: ready-for-agent
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

- [ ] **Scope:**
  - the reference lists of the 16 description pages, including "Online Resources" lines such as Triguna's;
  - the books listed on `/text-books/`, `/text-books-2-2/`, `/indian-philosophy/`, `/positive-psychology/` and `/inspirational-books/`, including the Text Books pages' inspirational section.

  Course entries are not References (ticket 07 keeps them as courses). Atman, Jiva and Jagat have no reference lists.
- [ ] **Once each:** one record per published work. The same work cited on several pages is one record whose `asCited` keeps each distinct written form. At least:
  - Tomar (2024), cited on all 16 description pages, is one record, `tomar-2024`, holding every form the pages use (five or more);
  - Srinivasan (2016) and Thapliyal et al. (2023), cited on the four values pages, are one record each;
  - Shlokam.org entries are one record per distinct page they cite (title and date), not one record for the site.
- [ ] **Ids** follow the spec's rule (settled rule 15). Ticket 01's eleven ids are reused, never duplicated.
- [ ] **Fields from the pages only.** Type, authors, year, title, container, publisher, volume, issue, pages, edition, DOI and URL are taken as the pages give them, and nothing is looked up.
  - Where the pages give no DOI or URL, `noStableLink` says so ("none given on the current site; not looked up"), and a Research-editor flag asks for one.
  - A paper or book missing its authors, publication or year carries a Research-editor flag naming each missing field (FR-03). Sharma & Pareek, with no year, and the two Positive Psychology books are known cases.
- [ ] **Links:**
  - the five `#` links on `/text-books/` and the five on `/indian-philosophy/` are dropped and flagged for the Research editor;
  - amazon.in and amazon.com links are kept as a book's URL only when the page gives no other link, and flagged for the Project owner;
  - "Read more", "View book" and similar labels are interface text.
- [ ] **Rights:** `tomar-2024` carries a Project-owner flag. It is a commercial handbook and the candidate source for 14 Questionnaires (research ticket 11); its questions can't be reproduced without permission; and its author's relation to the Client is unknown.
- [ ] **Census** (`.scratch/content-v1/census/references.md`):
  - for each source page, keyed by its current address (never by a Concept slug), its reference list in the page's order mapped to ids, and its listed books mapped to ids;
  - then one table of every id, with its forms as cited and the pages citing it, including `navare-pandey-2022` (from research, not a page);
  - every id in the census exists as a record, and every record is in the census.
- [ ] **Ticket test** (`tests/unit/content-references.test.ts`): `tomar-2024` holds at least five distinct forms; no two References share type, title and year; every Reference id follows the id rule. References no record cites yet are expected until the batches land; the completeness checks wait for ticket 12.
- [ ] **Legacy unchanged:** the legacy snapshot test still passes.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs reference`. No Playwright run: pages don't change.

## Comments
