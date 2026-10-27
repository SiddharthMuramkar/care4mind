# 02: Homepage signature and scroll drawings

Status: ready-for-agent
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

- [ ] **Signature kolam:**
  - a large kolam (a size that shares no factor) frames the opening folio and draws on load, once, in about 1.6 s;
  - it is decorative;
  - the heading, verse and translation are never hidden or faded in;
  - the kolam can't become the largest contentful element.
- [ ] **Parallax:** the frame kolam drifts with a transform on a scroll timeline. It is off under reduced motion and where scroll timelines aren't supported.
- [ ] **Section bands:** kolam bands between the homepage sections draw on scroll. They replace the ornament rules there or sit with them; choose whichever reads better.
- [ ] **Contents knots:** each Contents numeral gets a 1×1 kolam knot that draws on scroll. The Devanagari numerals stay.
- [ ] **Anchor scrolling:**
  - in-page links scroll smoothly under `no-preference` and jump instantly under reduce;
  - the target section's heading lands below the header, not under it.
- [ ] **No overflow, no shift:** no horizontal overflow at 320, 360, 768 or 1440 px, and no layout shift from any kolam (each reserves its box).
- [ ] **End-to-end tests:**
  - the frame kolam is present and hidden from assistive technology;
  - in Chromium, once its animation has finished, the drawing is complete;
  - under reduced motion every drawing is complete at once and nothing runs, on load or on scroll (the existing motion check);
  - in Firefox the page renders with finished drawings;
  - clicking "Explore Concepts" brings the Concepts section into view;
  - axe passes.
- [ ] **Done-check:** every check in the spec's Testing Decisions passes.

## Comments
