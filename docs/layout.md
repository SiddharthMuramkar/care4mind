# Layout

How a page changes with the width of the screen, and the rules a new layout has to keep. Folio, Plate, Medallion and Drawer are named in [GLOSSARY.md](../GLOSSARY.md).

## Widths

A layout may change at four widths, written in rem. At a 16px root those are the pixel widths the browser tests use.

| Width | Pixels | What changes |
| --- | --- | --- |
| 30rem | 480px | The narrowest tweaks: a Questionnaire's flow, At a glance, a Concept card. While Start here is on, it sits beside the wordmark from here until the sections join at 48rem. |
| 48rem | 768px | The phone ends. Section links enter the header and the Menu leaves. Footer lists stand open where the browser supports `::details-content`. A data table keeps its columns. The breadcrumb shows the whole trail. The A–Z drops the 44px snapping row; its letters are smaller, and the row still scrolls where they do not fit. A reading page's paper gains its frame. |
| 64rem | 1024px | Concepts and Library open panels, and Search is a labelled field. The hero splits, the Plate in a 480px column. A table that is too wide for the text column reaches across the paper. Homepage sections widen to 72rem. |
| 80rem | 1280px | Start here returns beside the wordmark, where the strip has room again. |

The header and the footer keep their content to 72rem (`src/components/SiteHeader/SiteHeader.module.css`, `src/components/SiteFooter/SiteFooter.module.css`). A reading page's column is `--measure-page` (52rem) in `src/styles/globals.css`.

`tests/unit/breakpoints.test.ts` reads every `@media` width feature under `src/`. Each one is `(width >= Nrem)` or `(width < Nrem)`, and `N` is one of 30, 48, 64, 80. Scripts that match the header use `TABLET` and `WIDE` in `src/components/nav/current.ts`: `(min-width: 48rem)` and `(min-width: 64rem)`.

Container queries sit outside that test. The header uses them only to fit the narrowest strips: under 24rem Log in shrinks, and under 22.5rem the Menu drops its glyph so Log in still fits (`SiteHeader.module.css`, `MenuButton.module.css`).

## Colour and type

The page is an indigo ground with cream ink. `html` sets `color-scheme: dark`, so the browser draws scrollbars and native controls dark. A paper surface carries `data-paper`, which sets `color-scheme: light` and swaps the focus ring and links to the paper's own (`--color-surface-focus`, `--color-surface-link`).

Colours are role tokens in `src/styles/globals.css` (`--color-ground`, `--color-ink`, `--color-surface`, and the rest). The `--press-*` primitives are written once, outside `@theme`, and components read the role tokens. Pairs of text and background are checked for WCAG AA in `src/styles/contrast.ts`.

Tailwind supplies those tokens and Preflight. Markup names no utility class except `sr-only`, and the skip link's `skip-link` (`tests/unit/class-names.test.ts`).

Reading text is `--font-text`. Headings use `--font-display`. Interface text (chips, breadcrumbs, labels, counts) uses `--font-ui`, and sets `--font-iast` so a transliteration inside it keeps the serif that has its diacritics. Devanagari (`:lang(sa-Deva)`, `:lang(hi-Deva)`) uses `--font-deva`.

Heading sizes are fluid clamps, so each level stays below the one above it at every width:

| Token | From | To |
| --- | --- | --- |
| `--text-display` | 2.25rem (36px) | 3.75rem (60px) |
| `--text-page-title` | 2rem (32px) | 3.25rem (52px) |
| `--text-section` | 1.5rem (24px) | 2.125rem (34px) |
| `--text-subsection` | 1.25rem (20px) | 1.5rem (24px) |
| `--text-reading` | 1.125rem (18px) | 1.25rem (20px) |

Nothing set in `rem` or `px` is smaller than `--text-small` (0.9375rem).

## Below 48rem

The header keeps Search, and Log in while the login route exists. The four sections (Concepts, Traditional texts, Library, Questionnaires) leave the strip. Questionnaires stays in the navigation at every width, last, even while its page says it is in preparation (`src/components/nav/site-nav.ts`).

Menu is the way into those sections. Until the Drawer's script has loaded, Menu is a link to the footer's `#site-nav`, so a press still lands on the full list. Once the script is in, Menu opens the Drawer: Home, Search, the numbered sections and the pages the footer lists, then the help line. It is modal. Escape, Close, or a swipe to the right puts it away (`src/components/nav/MenuButton.tsx`, `MenuDrawer.tsx`). The Drawer's code loads when the browser is idle, or when a pointer, focus or press reaches Menu.

A reading Folio (`variant="page"`) runs edge to edge, with no frame and no shadow. Its text keeps `--inset-phone` (1.25rem) off the screen's sides (`src/components/Folio/Folio.module.css`, `src/styles/reading.module.css`), and the breadcrumb uses the same inset (`src/components/Breadcrumbs/Breadcrumbs.module.css`).

The breadcrumb is one line back to the page above: an arrow, then that page's name, cut with an ellipsis when the name is long. The crumbs above it, and the current page, are left off the line (`src/components/Breadcrumbs/Breadcrumbs.module.css`).

Footer columns fold shut inside `<details>`. The chevron at the end of the heading opens them, with or without JavaScript. From 48rem, where the browser supports `::details-content`, the lists stand open and the chevron is left off. An older browser keeps the chevron (`src/components/SiteFooter/SiteFooter.tsx`).

A data table shows each row as a card. The head row is visually hidden (`sr-only`) and still names the columns for a screen reader. Each `td`'s `data-label` is its column's name, and the stylesheet prints that name above the cell. There is no sideways scroll (`src/components/prose/Blocks.tsx`, `Prose.module.css`).

The A–Z is one row of letters, each 2.75rem (44px), that scrolls sideways and settles on a letter. A fade marks an end that has letters past it (`data-more`). With scripting off, the fade is left off so it cannot cover the last letter (`src/components/az/AzIndex.module.css`).

Back to top is a 44px button at the lower right, clear of the safe area. It appears once the reader is two screens down, returns to the top, and moves focus to the skip link (`src/components/BackToTop/BackToTop.tsx`).

## From 48rem

Section links stand in the header. Menu is hidden. Start here, while its route exists, leaves the strip until 80rem, because the sections take its room (`SiteHeader.module.css`). The homepage's first button still leads there.

Footer lists stand open where the browser supports `::details-content`. The breadcrumb shows the whole trail. A data table keeps its columns inside a frame that scrolls sideways when the columns do not fit. The first column stays in view. A shade at a cut edge shows that more of the table is off to that side. The frame can take keyboard focus so it can be scrolled from the keyboard. WCAG 1.4.10 allows this for two-dimensional tables.

## From 64rem

Concepts and Library open their panels. Search shows the word Search in a labelled field.

The homepage hero splits: the Plate in a 480px column on the left, the words on the right, the pair centred. Homepage sections widen to 72rem, the five topics in one row and the three featured cards in one row (`src/app/page.module.css`).

A table that is too wide for the text column reaches back across the contents beside it to the paper's full width (`--table-reach`, set by a page that has contents). A table that fits stays in the column. Where it still does not fit, the frame scrolls.

A Plate in the hero viewer is 480px wide from 64rem, 360px from 48rem, and on a phone `min(72vw, 300px)`. That string is `SIZES` in `src/components/art/PlateViewer.tsx`, and it is also what the browser is asked to fetch.

Opening a Plate, or a picture in the credits, shows it whole in a lightbox: a modal dialog on a paper leaf, caption underneath, focus kept inside until Escape, Close, or a press outside. The lightbox script loads when a visitor comes near a picture (`src/components/art/Lightbox.tsx`).

## Adding a layout change

- A new `@media` width test uses one of the four rem values, in range syntax. `tests/unit/breakpoints.test.ts` fails the check otherwise.
- Pressable controls in the header, the Menu and Back to top are at least 44px. A new one matches that.
- Motion is declared inside `prefers-reduced-motion: no-preference`. `src/styles/globals.css` also collapses every animation to 1ms when motion is reduced.
- A new colour is a role token. A paper surface is marked `data-paper`, so its links and focus ring follow the paper.
- A new global class needs a line in `tests/unit/class-names.test.ts`. The allowed names are `sr-only` and `skip-link`.
- `pnpm check` runs the breakpoint test with the rest of the unit tests. When the change is visible on a page, `pnpm check:e2e` covers the header, the Drawer, tables and the hero at these widths (`tests/e2e/nav.spec.ts`, `tests/e2e/concept.spec.ts`, `tests/e2e/art.spec.ts`).

## Where it lives

| Concern | File |
| --- | --- |
| Tokens, type scale, paper colour scheme, reduced motion | `src/styles/globals.css` |
| Allowed media-query widths | `tests/unit/breakpoints.test.ts` |
| Header, Start here, Search | `src/components/SiteHeader/` |
| Sections and panels | `src/components/nav/` |
| Phone menu | `src/components/nav/MenuButton.tsx`, `MenuDrawer.tsx` |
| Footer folds | `src/components/SiteFooter/` |
| Reading paper | `src/components/Folio/`, `src/components/ReadingPage/` |
| Tables | `src/components/prose/Blocks.tsx`, `Prose.module.css` |
| Breadcrumb | `src/components/Breadcrumbs/` |
| A–Z rail | `src/components/az/AzIndex.module.css` |
| Plates and the lightbox | `src/components/art/PlateViewer.tsx`, `Lightbox.tsx` |
