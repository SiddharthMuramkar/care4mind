# 04: Concept and Questionnaire interactions

Status: resolved
Blocked by: 01
Spec: [Front-end foundation: Press × Kolam](../spec.md)

**What to build:** the reading pages feel alive and stay calm to read.

- A turmeric thread across the top fills as you read a Concept or Questionnaire page.
- On a Concept page, a "Devanagari first" switch swaps which script leads the heading. The two spellings trade places through a view transition, and the knob moves on a spring.
- The References accordion's icon becomes a small kolam knot that turns when it opens.
- The 404 page draws a small kolam on load.
- With reduce motion on, the thread is gone, and the switch still works but swaps instantly.

## Acceptance criteria

- [x] **Reading-progress thread:**
  - on the Concept and Questionnaire pages, a scaleX on the root scroll timeline;
  - decorative, it never takes pointer events or covers content or the focus ring, and causes no layout shift;
  - absent under reduced motion and where scroll timelines aren't supported.
- [x] **Script switch:**
  - a toggle button named "Devanagari first" with `aria-pressed`;
  - pressing it, by click, Enter or Space, swaps which spelling leads the Concept heading, and focus stays on the switch;
  - both spellings stay inside the heading with their own `lang` tags (`sa-Latn` and `sa-Deva`), and the heading's text keeps the IAST term in both states;
  - the swap runs through a React view transition;
  - the knob moves with a Motion spring, through the existing lazy Motion provider (strict mode, `m` components), with no new dependency;
  - the swap is instant under reduced motion;
  - the target is at least 24×24 CSS px, in keeping with the site's 48 px targets;
  - it fits at 320 px.
- [x] **Title morph:** the card-to-title morph from the homepage still lands on the Concept heading.
- [x] **References icon:** the accordion trigger shows a decorative 1×1 kolam knot that turns, by transform, when open.
- [x] **404 kolam:** a small kolam draws on load, and the link home has the ink-spread if ticket 03 didn't add it.
- [x] **End-to-end tests:**
  - the switch's pressed state flips, with axe passing in both states;
  - Space toggles the switch, and focus stays on it;
  - both `lang` tags are present in both states;
  - axe passes with the accordion open;
  - the reading thread is present and hidden from assistive technology in Chromium;
  - under reduced motion nothing moves on load, on scroll or after toggling the switch;
  - Firefox renders the page without the thread and with finished drawings.
- [x] **Done-check:** every check in the spec's Testing Decisions passes.

## Comments

**Built, 2026-10-28:**

- **Script switch:** `ScriptChoice` (`src/components/ScriptChoice.tsx`) keeps which script leads for the page view. `TermSpellings` sets both spellings inside the Concept heading, each with its `lang` tag, the leading one at the heading's size and the other at half. `ScriptSwitch` is the "Devanagari first" toggle button (`aria-pressed`, 48 px tall). The switch answers at once; the heading follows from a deferred value, which re-renders in a transition, so the spellings trade places through a React view transition in 320 ms, passing side by side half-way. The knob is an `m.span` springing in 0.32 s with a little bounce, through the lazy Motion provider.
- **Reading thread:** `ReadingThread` is a 3 px turmeric line with an indigo edge, fixed across the top of the Concept and Questionnaire pages and scaled on the root scroll timeline, only under `no-preference` and where scroll timelines are supported. Presses pass through it, and focus scrolls controls into view below it.
- **References:** the plus/minus is now a 1×1 kolam knot that turns 45° by transform as the list opens.
- **404:** a small 3×2 kolam replaces the fleuron and draws on load. Ticket 03 had already put the ink-spread on "Go to the homepage".
- Decisions the spec left open:
  - The heading reads in the order it shows: with Devanagari first it reads "विक्षेप Vikṣepa". Both spellings and tags stay in either order, and the IAST is always in its text.
  - Both scripts share each line's height, so a swap leaves the heading the same height and nothing below it moves.
  - The switch's track is the logo's mark; its knob is a vermilion dot that springs from one loop to the other. It shows only for a term with a Devanagari form, beside "Also spelled".
  - A card's title now flies into the heading's IAST spelling rather than the whole two-line heading, and above both turning pages: since ticket 03 the arriving page had covered the second half of its flight.
  - The knot's dot also swells when the list is open. A 1×1 kolam is nearly round, so the turn alone barely shows the state.
  - The thread sits inside `<main>`. As a page's outermost element it made Next.js 16.4 treat every new page as scrolled past and scroll the Concept page to 48 px on arrival.
- Tests changed: the Concept heading checks now look for the IAST term in the heading (`toContainText`), since the heading holds both spellings. The logo's two redraw tests now listen for the redraw starting instead of polling for it while it runs: under the fuller suite the 700 ms redraw could end before the first poll (2 failures in 24 runs in parallel, none in 30 alone).
- Left over:
  - Motion runs the knob's spring as a browser animation, which Playwright's fake clock can't drive, so the tests replay the recorded animation instead of watching frames.
  - Without JavaScript the switch shows but does nothing, like "Also spelled"; the heading still shows both spellings.
  - A spelling that wrapped onto two lines in a narrow column would change the heading's height when swapped (after the press, so not counted as layout shift). No current term wraps.
