# 01: Kolam logo and imagery

Status: resolved
Blocked by: None (can start immediately)
Spec: [Front-end foundation: Press × Kolam](../spec.md)

**What to build:** the site's identity becomes the kolam. Every page's header shows the kolam mark (one line looped round two dots) beside a lowercase italic "care4mind". The mark redraws itself when the logo is hovered or focused, and the footer carries the same wordmark. Behind this sit the two pieces every later ticket draws with:

- the **kolam generator**, a pure, tested function that turns a dot-grid size into one unbroken kolam line;
- the **Kolam component**, which renders any kolam as decorative SVG in one of four behaviours: draw on load, draw on scroll, redraw on hover, or still.

The prototype is the Kolam style tile in commit `d99c935`: its generator, its parts and its CSS. Restore from it. Don't re-invent it.

## Acceptance criteria

- [x] **Generator output:** for sizes that share no factor, the kolam generator returns one closed loop, m×n dot centres, and a width and height of 2m×2n units.
- [x] **Generator errors:** it throws for sizes that share a factor and for anything that isn't a positive whole number.
- [x] **Generator tests:** unit tests cover the curve count you'd expect for several sizes (at least 1×1, 2×1, 3×2 and 5×3) and every error case.
- [x] **Kolam component:**
  - renders decorative SVG: hidden from assistive technology, nothing focusable;
  - reserves its box from the drawing's width and height, so it can't shift layout;
  - takes one of the four behaviours.
- [x] **Finished by default:**
  - the finished drawing is the default rendering;
  - draw on load, draw on scroll and redraw on hover apply only under `prefers-reduced-motion: no-preference`;
  - draw on scroll applies only where scroll timelines are supported.
- [x] **Colour tokens:**
  - two new semantic colour tokens, kolam line and kolam dot: cream line with turmeric dots on the indigo ground, indigo line with vermilion dots inside the paper folio;
  - the contrast unit test checks each against its ground at 3:1.
- [x] **Header logo:**
  - the home link shows the kolam mark and "care4mind" in Playfair Text Italic, lowercase;
  - the link's accessible name stays "Care4Mind home" (WCAG 2.5.3, label in name);
  - the mark redraws on hover and on keyboard focus;
  - the target stays at least 48 px tall.
- [x] **Footer:** it shows the same mark and wordmark, still, with no redraw.
- [x] **Old wordmark gone:** the Press "4" roundel wordmark and its styles are removed.
- [x] **Fits at every width:** no horizontal overflow at 320, 360, 768 or 1440 px.
- [x] **End-to-end tests:**
  - the logo's accessible name is unchanged on every page;
  - hovering or focusing the logo starts a drawing animation on the mark in Chromium, and none under reduced motion.
- [x] **Done-check:** every check in the spec's Testing Decisions passes.

## Comments

**Built, 2026-10-27:**

- `kolam(columns, rows, unit = 24)` in `src/lib/kolam.ts` is the tile's generator from `d99c935`. It now throws a RangeError for sizes that share a factor, sizes that aren't positive whole numbers, and a unit that isn't a positive length.
- `Kolam` (`src/components/Kolam.tsx`) is a server component: `columns`, `rows`, an optional `behaviour` (`still` by default, `draw-on-load`, `draw-on-scroll` or `redraw-on-hover`) and `className`. `Logo` replaces the roundel `Wordmark`: it redraws in the header and stays still in the footer.
- Decisions the spec left open:
  - Four colour tokens, not two. The contrast test reads hex values only, so the paper pair is `--color-surface-kolam-line` and `--color-surface-kolam-dot`, and the Folio swaps them in the way it swaps focus and link.
  - `--duration-draw` is 1600 ms and `--duration-redraw` is 700 ms.
  - `--kolam-line-width` lets a parent thicken the line: 3 by default, 5 in the logo.
  - Dots have a radius of 4, a sixth of the dot spacing. At 3 they read as specks in the logo.
  - Draw on scroll uses a named view timeline on the svg, because a path has no box of its own to track. It keeps the tile's range, `entry 10% cover 60%`.
- Left over:
  - No page uses draw on load or draw on scroll yet; tickets 02 and 04 add them. I checked both once on temporary pages, since removed: Chromium draws, and reduced motion and Firefox show the finished kolam.
  - Draw on scroll finishes 60% of the way through the viewport. A kolam less than about half a screen from the end of a page would stay partly drawn, so ticket 02 should keep bands clear of the page end or end the range sooner.
  - WebKit can't launch on the dev machine (missing host libraries), so its smoke check runs in CI only, as the spec says.
