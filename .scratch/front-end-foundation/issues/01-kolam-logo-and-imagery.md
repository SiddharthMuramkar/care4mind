# 01: Kolam logo and imagery

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: [Front-end foundation: Press × Kolam](../spec.md)

**What to build:** the site's identity becomes the kolam. Every page's header shows the kolam mark (one line looped round two dots) beside a lowercase italic "care4mind". The mark redraws itself when the logo is hovered or focused, and the footer carries the same wordmark. Behind this sit the two pieces every later ticket draws with:

- the **kolam generator**, a pure, tested function that turns a dot-grid size into one unbroken kolam line;
- the **Kolam component**, which renders any kolam as decorative SVG in one of four behaviours: draw on load, draw on scroll, redraw on hover, or still.

The prototype is the Kolam style tile in commit `d99c935`: its generator, its parts and its CSS. Restore from it. Don't re-invent it.

## Acceptance criteria

- [ ] **Generator output:** for sizes that share no factor, the kolam generator returns one closed loop, m×n dot centres, and a width and height of 2m×2n units.
- [ ] **Generator errors:** it throws for sizes that share a factor and for anything that isn't a positive whole number.
- [ ] **Generator tests:** unit tests cover the curve count you'd expect for several sizes (at least 1×1, 2×1, 3×2 and 5×3) and every error case.
- [ ] **Kolam component:**
  - renders decorative SVG: hidden from assistive technology, nothing focusable;
  - reserves its box from the drawing's width and height, so it can't shift layout;
  - takes one of the four behaviours.
- [ ] **Finished by default:**
  - the finished drawing is the default rendering;
  - draw on load, draw on scroll and redraw on hover apply only under `prefers-reduced-motion: no-preference`;
  - draw on scroll applies only where scroll timelines are supported.
- [ ] **Colour tokens:**
  - two new semantic colour tokens, kolam line and kolam dot: cream line with turmeric dots on the indigo ground, indigo line with vermilion dots inside the paper folio;
  - the contrast unit test checks each against its ground at 3:1.
- [ ] **Header logo:**
  - the home link shows the kolam mark and "care4mind" in Playfair Text Italic, lowercase;
  - the link's accessible name stays "Care4Mind home" (WCAG 2.5.3, label in name);
  - the mark redraws on hover and on keyboard focus;
  - the target stays at least 48 px tall.
- [ ] **Footer:** it shows the same mark and wordmark, still, with no redraw.
- [ ] **Old wordmark gone:** the Press "4" roundel wordmark and its styles are removed.
- [ ] **Fits at every width:** no horizontal overflow at 320, 360, 768 or 1440 px.
- [ ] **End-to-end tests:**
  - the logo's accessible name is unchanged on every page;
  - hovering or focusing the logo starts a drawing animation on the mark in Chromium, and none under reduced motion.
- [ ] **Done-check:** every check in the spec's Testing Decisions passes.

## Comments
