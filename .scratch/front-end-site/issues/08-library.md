# 08: Library

Status: ready-for-agent
Blocked by: 03, 04, 06
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §B4, §C3 · Decisions: D09, D13, D18

**What to build:** the Library gathers every source and reading list on the site.

- `/library/` shows its five sections as a shelf: References, Textbooks, Inspirational books, Courses and Methods.
- **References** lists every source once, in one citation style (FR-03).
  - Filters narrow it by type and topic, and a letter rail jumps through the authors.
  - Each entry shows the Concepts that cite it and has "Copy citation".
- **Textbooks and Inspirational books** stand as a shelf of book spines set in type, each with its note.
- **Courses** become cards.
- **Methods** keeps its tables.

No images are carried over.

Reuse the A–Z letter rail and the filter chips that ticket 06 builds (that is why 06 blocks this ticket); don't make a second copy.

## Owns

- `src/app/library/**`
- `src/components/library/**` (new)
- `tests/e2e/library.spec.ts` (new)

## Acceptance criteria

- [ ] **Library home (D13):** `/library/` shows References, Textbooks, Inspirational books, Courses and Methods as a typographic shelf. Each links to its page with a count computed from content, and there are no images (D18).
- [ ] **References (FR-03, D09):**
  - `/library/references/` lists every Reference once, in the current site's APA-like style, through the shared Citation part, so the style matches the Concept pages.
  - Each entry links its DOI or stable URL where one exists, or shows the stated reason none exists.
  - Each entry carries the anchor that `hrefFor()` builds for it.
- [ ] **Cited in:** each Reference shows "cited in" chips linking to every Concept that cites it.
- [ ] **Copy citation:** a button copies the formatted citation as plain text and confirms with a polite toast. It works by keyboard.
- [ ] **Filters:**
  - A Base UI ToggleGroup filters by type (journal article, book, chapter and so on) and by topic, where a Reference's topics are those of the Concepts that cite it.
  - The list reorders with a view transition, with names only on the first 40 items shown.
  - The new count is announced politely (WCAG 4.1.3).
  - The filter state lives in the address's query string.
  - With JavaScript off, the full list shows.
- [ ] **Author A–Z:**
  - A Base UI Toolbar of letter links jumps to the first author under each letter: one Tab stop, with arrow keys between letters.
  - Letters with no authors are plain text.
  - If ticket 06's letter rail and filter chips have already merged when this lane starts, reuse them. Otherwise build them here, and note the duplicate in Comments.
- [ ] **Long list:** entries use `content-visibility: auto` with an intrinsic size, with no layout shift on load.
- [ ] **Books (D13, D18):**
  - Textbooks and Inspirational books show each book as a typographic spine, title and author set in type, beside or above its annotation.
  - On narrow screens they become a list.
  - The sections keep the anchors the redirects use, such as `#indian-psychology-and-philosophy` and `#positive-psychology`.
  - Links to shops and other sites say in words that they leave the site.
- [ ] **Courses:** each course is a card with its provider, name and description, and a link where one exists.
- [ ] **Methods:** the Methods page renders its sections and tables. Wide tables scroll inside their own named, focusable region.
- [ ] **Previews:** "cited in" chips use the LinkPreview slot.
- [ ] **Breadcrumbs (D15):** Home › Library on the Library home, and Home › Library › {page} below it.
- [ ] **Reflow:** every Library page fits 320 px with no sideways scroll (WCAG 1.4.10).
- [ ] **Tests:** `library.spec.ts` covers:
  - a citation link from a Concept page landing on its References anchor;
  - "Copy citation" and its toast, with axe while the toast shows;
  - filters by mouse and keyboard, with the announced count;
  - the author rail by keyboard;
  - every Library page with JavaScript off.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
