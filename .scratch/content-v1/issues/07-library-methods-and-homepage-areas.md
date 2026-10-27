# 07: Library, Methods and homepage areas

Status: ready-for-agent
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

- [ ] **Text Books** (`textbooks`, titled "Text Books" as the pages are):
  - the books of `/text-books/` and `/text-books-2-2/`, merged without duplicates, including the five books only `/text-books-2-2/` lists;
  - grouped under the pages' own headings: the Indian and Western textbooks; "Indian Psychology & Philosophy Books", merged with `/indian-philosophy/`, with the group id `indian-psychology-and-philosophy`; and Positive Psychology from `/positive-psychology/`, with the group id `positive-psychology`, keeping both books' descriptions as annotations;
  - every item points to a Reference from the census.
- [ ] **Inspirational Books** (`inspirational-books`): the page's books, with their descriptions as annotations, merged with the Text Books pages' inspirational section without duplicates.
- [ ] **Courses** (`courses`, titled "Courses" as the page is):
  - the five institutes on `/institutes/`, and the IGNOU (UG and PG) and NIOS entries from the Text Books pages, each with provider, name, description and URL as given;
  - KIIT's link to ksrm.ac.in flagged for the Research editor;
  - link labels ("Course Details", "Department Website", "Learn More") treated as interface text.
- [ ] **Methods** (`methods`): title, summary and sections from the page, with its two tables as table blocks.
- [ ] **Dropped and listed:** the 24 cover images on `/text-books/` and the images on the other pages (D18). The empty pages (`/resources/`, `/webpages-and-av-material/`) make no records.
- [ ] **Homepage areas:**
  - Concepts → the Concepts index; Techniques → Methods; Resources → the Library home; Tradition and Texts → Text Books, where `/text-books-2-2/` went; Research → Courses, where `/institutes/` went;
  - Applications gets no target, because it pointed at the dead questionnaire app;
  - Applications, Tradition and Texts (the Texts index may suit it better) and Research are flagged for the Project owner;
  - the legacy snapshot test still passes.
- [ ] **Ticket test** (`tests/unit/content-library.test.ts`): the three lists and the Methods page exist; every list item resolves to a Reference or is a course; the two group ids exist; the homepage has six areas, five of them with targets.
- [ ] **Done-check:** `pnpm format && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`, then, with `CARE4MIND_CAPTURES` set, `node scripts/content/verify.mjs resource-list page/methods home`. No Playwright run: pages don't change.

## Comments
