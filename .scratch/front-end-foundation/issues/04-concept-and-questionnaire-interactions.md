# 04: Concept and Questionnaire interactions

Status: ready-for-agent
Blocked by: 01
Spec: [Front-end foundation: Press × Kolam](../spec.md)

**What to build:** the reading pages feel alive and stay calm to read.

- A turmeric thread across the top fills as you read a Concept or Questionnaire page.
- On a Concept page, a "Devanagari first" switch swaps which script leads the heading. The two spellings trade places through a view transition, and the knob moves on a spring.
- The References accordion's icon becomes a small kolam knot that turns when it opens.
- The 404 page draws a small kolam on load.
- With reduce motion on, the thread is gone, and the switch still works but swaps instantly.

## Acceptance criteria

- [ ] **Reading-progress thread:**
  - on the Concept and Questionnaire pages, a scaleX on the root scroll timeline;
  - decorative, it never takes pointer events or covers content or the focus ring, and causes no layout shift;
  - absent under reduced motion and where scroll timelines aren't supported.
- [ ] **Script switch:**
  - a toggle button named "Devanagari first" with `aria-pressed`;
  - pressing it, by click, Enter or Space, swaps which spelling leads the Concept heading, and focus stays on the switch;
  - both spellings stay inside the heading with their own `lang` tags (`sa-Latn` and `sa-Deva`), and the heading's text keeps the IAST term in both states;
  - the swap runs through a React view transition;
  - the knob moves with a Motion spring, through the existing lazy Motion provider (strict mode, `m` components), with no new dependency;
  - the swap is instant under reduced motion;
  - the target is at least 24×24 CSS px, in keeping with the site's 48 px targets;
  - it fits at 320 px.
- [ ] **Title morph:** the card-to-title morph from the homepage still lands on the Concept heading.
- [ ] **References icon:** the accordion trigger shows a decorative 1×1 kolam knot that turns, by transform, when open.
- [ ] **404 kolam:** a small kolam draws on load, and the link home has the ink-spread if ticket 03 didn't add it.
- [ ] **End-to-end tests:**
  - the switch's pressed state flips, with axe passing in both states;
  - Space toggles the switch, and focus stays on it;
  - both `lang` tags are present in both states;
  - axe passes with the accordion open;
  - the reading thread is present and hidden from assistive technology in Chromium;
  - under reduced motion nothing moves on load, on scroll or after toggling the switch;
  - Firefox renders the page without the thread and with finished drawings.
- [ ] **Done-check:** every check in the spec's Testing Decisions passes.

## Comments
