# 07: Library, Methods and homepage areas

Status: resolved
Blocked by: 03
Spec: [Content v1: the current site's content as typed records](../spec.md) · Decisions: D09, D11, D13, D18

**What to build:** the current site's scattered reading lists become three clean lists, the Methods page is kept, and every homepage area leads somewhere real.

- Text Books merges both Text Books pages, Indian Philosophy and Positive Psychology; Inspirational Books and Courses absorb their stray sections. A student gets one reading list with no duplicates and no dead links.
- Methods stays a page, with its two tables.
- Each homepage area points to its new home, or is flagged for the Project owner where it has none.

## Owns

- `src/content/data/resource-lists/**` (new): `textbooks`, `inspirational-books` and `courses`
- `src/content/data/pages/methods.ts` (new)
- `src/content/data/home/home.ts`, from ticket 01: the area targets only
- `tests/unit/content-library.test.ts` (new)
- a Reference file, only if the census lacks one a list needs; say so in Comments

## Acceptance criteria

- [x] **Text Books** (`textbooks`, titled "Text Books" as the pages are):
  - the books of `/text-books/` and `/text-books-2-2/`, merged without duplicates, including the five books only `/text-books-2-2/` lists;
  - grouped under the pages' own headings: the Indian and Western textbooks; "Indian Psychology & Philosophy Books", merged with `/indian-philosophy/`, with the group id `indian-psychology-and-philosophy`; and Positive Psychology from `/positive-psychology/`, with the group id `positive-psychology`, keeping both books' descriptions as annotations;
  - every item points to a Reference from the census.
- [x] **Inspirational Books** (`inspirational-books`): the page's books, with their descriptions as annotations, merged with the Text Books pages' inspirational section without duplicates.
- [x] **Courses** (`courses`, titled "Courses" as the page is):
  - the five institutes on `/institutes/`, and the IGNOU (UG and PG) and NIOS entries from the Text Books pages, each with provider, name, description and URL as given;
  - KIIT's link to ksrm.ac.in flagged for the Research editor;
  - link labels ("Course Details", "Department Website", "Learn More") treated as interface text.
- [x] **Methods** (`methods`): title, summary and sections from the page, with its two tables as table blocks.
- [x] **Dropped and listed:** the 24 cover images on `/text-books/` and the images on the other pages (D18). The empty pages (`/resources/`, `/webpages-and-av-material/`) make no records.
- [x] **Homepage areas:**
  - Concepts → the Concepts index; Techniques → Methods; Resources → the Library home; Tradition and Texts → Text Books, where `/text-books-2-2/` went; Research → Courses, where `/institutes/` went;
  - Applications gets no target, because it pointed at the dead questionnaire app;
  - Applications, Tradition and Texts (the Texts index may suit it better) and Research are flagged for the Project owner;
  - the legacy snapshot test still passes.
- [x] **Ticket test** (`tests/unit/content-library.test.ts`): the three lists and the Methods page exist; every list item resolves to a Reference or is a course; the two group ids exist; the homepage has six areas, five of them with targets.
- [x] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs resource-list page/methods home`. No Playwright run: pages don't change.

## Comments

- **Built (2026-10-28).** Three reading lists in `src/content/data/resource-lists/`: `textbooks` (20 books in 3 groups), `inspirational-books` (13 books, each annotated) and `courses` (8 courses in 2 groups); the page `methods` (5 sections; tables of 5 and 8 rows); and targets for five of the homepage's six areas. `tests/unit/content-library.test.ts` has 15 tests through `@/content` (`library`, `home`, `references`) and the content source. Each was red before its record existed, and a mutation run showed the Text Books and Inspirational Books checks fail when a book, an annotation or a group id is wrong. verify passes on all five records (`resource-list page home`, and the ticket's `resource-list page/methods home`); 274 unit tests pass. No Reference file added: the census had every book.
- **Counts.** The Library pages' 54 book entries are 33 books: 20 on Text Books (11 Indian and Western, 7 Indian Psychology & Philosophy, 2 Positive Psychology) and 13 on Inspirational Books, 8 of which /text-books/'s tab also lists. Courses: the 5 institutes, then IGNOU's UG and PG courses and NIOS's, each once. 36 images left out, each listed on the list it sat beside: 24 on /text-books/ (13 by the textbooks, 8 by the inspirational books, 3 by the courses), 7 on /indian-philosophy/, 5 on /institutes/. /resources/ and /webpages-and-av-material/ make no records; the report's page map shows them as dropped.
- **Slugs and ids.** The lists and the page take the slugs the ticket names. Group ids are their headings' words: `indian-and-western-textbooks` (the heading both Text Books pages use; the "Psychology Books" heading inside /text-books/'s tab is left out, listed), `indian-psychology-and-philosophy` and `positive-psychology` as the ticket names them, `inspirational-books` (that page has no heading, so its one group takes the title), and on Courses the pages' own headings, `top-universities-for-psychology` (/institutes/) and `psychology-courses` (the Text Books pages). Methods' sections are its headings' words; its tables are `approaches` and `therapy-types`, after their first columns, since the sections already use the tab titles.
- **Decisions the ticket left open:**
  - Order: the fuller page's. /text-books-2-2/'s eleven Indian and Western books include /text-books/'s six in the same order; Inspirational Books follows /inspirational-books/.
  - Courses: /text-books/'s IGNOU and NIOS headings are split at the dash into provider and name ("IGNOU", "B.A. in Psychology (UG)"), with its descriptions; /text-books-2-2/ names the same courses only by link labels, to the same addresses. Delhi University, BHU and KIIT name no course, so each name comes from its own description ("Department of Psychology", "MA Psychology", "Department of Psychology"), listed and flagged.
  - Methods: the summary is the page's first sentence; the h2 and its paragraph are the first section, and each tab a section headed by its title; each table's caption is the tab title above it (listed). The delivery formats' emoji are left out: the font rule covers provenance too, so the edit names them by code point and quotes the five resulting items whole.
  - Typos fixed and listed: "long-time students.]" and "This books places". Proper names ("Maharashi", "Arunchala") are flagged rather than fixed, as ticket 03 did with Khalil Gibran's.
  - Homepage: Concepts → `{ index: 'concepts' }`, Techniques → page `methods`, Resources → `{ index: 'library' }`, Tradition and Texts → `textbooks`, Research → `courses`. Besides the targets, `home.ts` gained one provenance edit listing the remap, and the three flags the ticket asks for. Its text is unchanged, and the legacy snapshot passes (the adapter keys its links by title).
- **Flags raised.** Project owner: Applications has no destination (ticket 19); Tradition and Texts may suit the Texts index better, and Research's text is about research rather than courses (ticket 20 each); some book descriptions read like publishers' blurbs and may need credit or permission (one note, on two lists). Research editor: KIIT's link to ksrm.ac.in; the three course names taken from descriptions; "Maharashi" and "Arunchala" in the Brunton annotations, and their "A search in Secret India" against the listed title "A search into secret India" (ticket 17 both); Methods' first tab, titled "Psychoanalysis / Psychodynamic Therapy", heads a table of five approaches.
- **Left over:** nothing in this ticket's scope. For ticket 12: the completeness check "5 topics, 3 reading lists, 1 page and the homepage" would pass now. The standard has no rule for emoji in source text; the way taken here (left out, named by code point, the result quoted whole) is above if ticket 12 writes one down.
