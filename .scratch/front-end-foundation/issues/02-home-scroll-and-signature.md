# 02: Homepage signature and scroll drawings

Status: resolved
Blocked by: 01
Spec: [Front-end foundation: Press × Kolam](../spec.md)

**What to build:** the homepage's signature moment and its scroll life:

- On load, a large kolam draws itself round the opening folio, once.
- The verse and heading are readable from the first paint.
- As you scroll, the kolam drifts a little slower than the page.
- Kolam bands draw themselves between the sections, and each Contents number gets a small kolam knot that draws as it comes into view.
- "Explore Concepts" and "Questionnaires" glide down to their sections.
- With reduce motion on, everything is simply there, finished and still.

## Acceptance criteria

- [x] **Signature kolam:**
  - a large kolam (a size that shares no factor) frames the opening folio and draws on load, once, in about 1.6 s;
  - it is decorative;
  - the heading, verse and translation are never hidden or faded in;
  - the kolam can't become the largest contentful element.
- [x] **Parallax:** the frame kolam drifts with a transform on a scroll timeline. It is off under reduced motion and where scroll timelines aren't supported.
- [x] **Section bands:** kolam bands between the homepage sections draw on scroll. They replace the ornament rules there or sit with them; choose whichever reads better.
- [x] **Contents knots:** each Contents numeral gets a 1×1 kolam knot that draws on scroll. The Devanagari numerals stay.
- [x] **Anchor scrolling:**
  - in-page links scroll smoothly under `no-preference` and jump instantly under reduce;
  - the target section's heading lands below the header, not under it.
- [x] **No overflow, no shift:** no horizontal overflow at 320, 360, 768 or 1440 px, and no layout shift from any kolam (each reserves its box).
- [x] **End-to-end tests:**
  - the frame kolam is present and hidden from assistive technology;
  - in Chromium, once its animation has finished, the drawing is complete;
  - under reduced motion every drawing is complete at once and nothing runs, on load or on scroll (the existing motion check);
  - in Firefox the page renders with finished drawings;
  - clicking "Explore Concepts" brings the Concepts section into view;
  - axe passes.
- [x] **Done-check:** every check in the spec's Testing Decisions passes.

## Comments

**Built, 2026-10-27:**

- The opening folio sits on a 9×7 kolam a fifth wider than itself, so the outer loops and dots frame its top and sides. The kolam draws once on load and is cut off at the folio's foot. On the root scroll timeline it moves at four fifths of the page's speed for the first screenful.
- Two 9×2 kolam bands replace the homepage's ornament rules and draw on scroll. Each Contents numeral sits inside a 1×1 knot that draws on scroll.
- In-page links glide (`scroll-behavior: smooth`, only under `no-preference`). `data-scroll-behavior="smooth"` on `<html>` makes Next.js 16 jump on page changes instead of gliding from the old position.
- The Kolam now keeps its dash only while it draws. With the old static `stroke-dasharray: 1`, Chromium left a visible gap where the frame's long line closes.
- Decisions the spec left open:
  - Bands replace the rules rather than sitting with them; `OrnamentRule` stays on the Concept page.
  - The knot loops round the numeral, which stands in for the knot's dot (`--color-kolam-dot: transparent`), instead of sitting beside it.
  - The hero fleuron no longer draws, so the kolam is the one signature; Fleuron's unused `draw` option is removed.
  - The parallax lives in the homepage CSS, not in Kolam: a root scroll timeline from 0 only suits a kolam at the top of a page.
  - From 40rem the hero's gutters widen so the frame's loops fit, and its line thins as it scales (about 2–4.5 px).
- Left over:
  - The header isn't sticky, so the anchor tests check the heading lands in full view and below wherever the header is.
  - WebKit runs in CI only. Its parallax needs length ranges on scroll timelines.
