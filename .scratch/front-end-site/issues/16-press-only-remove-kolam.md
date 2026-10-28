# 16: Press only: remove Kolam

Status: ready-for-agent
Blocked by: none (tickets 01 and 03 are resolved)
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C2, §C3 · Decisions: D21 ([the replacements](../decisions.md#d21-press-replacements))

**What to build:** the site is Press only (D21). A visitor meets no kolam anywhere: each Kolam element the foundation built becomes its Press replacement, drawn in Press's own vocabulary of ink, rules and paper.

- The header and footer show the Press wordmark: "Care4Mind", with the 4 in a vermilion roundel.
- The homepage's hero is its folio on the faintly ruled indigo ground. The lotus Fleuron in the folio draws itself once as the page opens, and nothing drifts as the page scrolls.
- Between the homepage's sections, an OrnamentRule inks in from the centre as it scrolls into view. The Contents numerals are plain Devanagari numerals.
- The 404 page shows the Fleuron.
- On a Concept page, the References control shows a plus that folds into a minus as the list opens.
- The "Devanagari first" switch runs on a printer's-rule track, with a vermilion roundel for its knob.
- `/proposals/` no longer lists a "kolam of your reading path".

Every interaction that never used Kolam code stays as it is: ink spread, page turns, the card-to-title morph, underlines drawing in, press-in, the reading thread and the script swap.

Behind the pages, the kolam generator and component, their tests, the kolam colours and timings, and the conventions doc's Kolam section all go, so no Kolam trace is left in the code, the tests or the docs. The later replacements (the contents plate, cross-reference rules, the progress tally and the Concept map's printed plate) are built by tickets 05, 06, 10, 11 and 12 in their own pages; this ticket gives them the conventions to follow.

## Owns

- `src/components/Logo.tsx` and `Logo.module.css`, rewritten as the Press wordmark and still exported as `Logo`. The Press original is `git show 427c135:src/components/Wordmark.tsx` and its `.module.css`.
- `src/components/Fleuron.tsx` and `Fleuron.module.css`: the `draw` prop back, as in `git show 427c135:src/components/Fleuron.tsx`
- `src/app/page.tsx` and `page.module.css`: the hero, the section bands and the Contents numerals only. Ticket 11 owns both files after this merges.
- `src/app/not-found.tsx` and `not-found.module.css`
- `src/components/ReferenceList.tsx` and `ReferenceList.module.css`
- `src/components/ScriptChoice.tsx` and `ScriptChoice.module.css`, and `SwitchKnob.tsx` if it needs it
- `src/components/Folio.module.css`: its kolam colour lines
- `src/styles/globals.css`: the kolam blocks only, meaning the kolam colours and the two timings only the Kolam uses (`--duration-draw` and `--duration-redraw`). If a Press drawing needs a token, append it in a block commented with this ticket's number, as the conventions doc says.
- `src/lib/contrast.ts` and `tests/unit/contrast.test.ts`
- `src/app/proposals/page.tsx`: the "kolam of your reading path" entry only
- `docs/agents/frontend-conventions.md`: its "Kolam behaviours" section becomes "Press ornaments", and its other Kolam mentions go
- deleted: `src/lib/kolam.ts`, `src/components/Kolam.tsx`, `src/components/Kolam.module.css` and `tests/unit/kolam.test.ts`
- tests: `tests/e2e/home.spec.ts`, `logo.spec.ts`, `motion.spec.ts`, `smoke.spec.ts`, `pages.spec.ts` and `concept.spec.ts`, only for the tests named below; and `tests/e2e/drawings.ts` and `scrolling.ts`, for the helpers named below
- one-line call-site edits in `SiteHeader.tsx` and `SiteFooter.tsx`, such as `<Logo redraw />` becoming `<Logo />`
- not here: ticket 04's navigation panels, Drawer and toasts, which its lane draws with Kolam today. Ticket 04 replaces those after merging this ticket (its own criterion), so leave its files alone.

## Acceptance criteria

- [ ] **The Press wordmark (D21):**
  - The header and the footer show "Care4Mind" in Playfair, with the 4 set in a vermilion roundel, as in commit `427c135`. Nothing in it is drawn or animated.
  - The component keeps its export name `Logo`. Its `redraw` prop goes, and so does every caller's use of it.
  - The header's home link is still named "Care4Mind home", with the visible "Care4Mind" inside the name (WCAG 2.5.3). It is still a target at least 48 px tall and adds no stop of its own to the tab order.
- [ ] **The hero:**
  - The homepage hero is its folio on the faintly ruled indigo ground, with nothing drawn round the folio and nothing drifting as the page scrolls (no parallax).
  - The lotus Fleuron in the folio draws itself once on load, stroke by stroke, through `<Fleuron draw>`, and ends complete. Scrolling away and back draws nothing new.
  - The Fleuron is hidden from assistive technology.
  - The hero heading stays the largest contentful paint, and the verse is never hidden or faded in.
- [ ] **Section bands:** between Contents and Concepts, and between Concepts and Questionnaires, an OrnamentRule inks in from the centre as it scrolls into view. It is a scroll-driven animation, with no listener or observer. It shows finished where scroll timelines are missing, and is hidden from assistive technology.
- [ ] **Contents numerals:** each Contents entry keeps its Devanagari numeral (१ to ६) as plain text, with nothing drawn round it.
- [ ] **404:** the page shows the Fleuron, still and hidden from assistive technology, as in `git show 427c135:src/app/not-found.tsx`. It keeps its heading, its links and its 404 status.
- [ ] **References: a plus that folds into a minus:**
  - The References control shows a plus made of two vermilion rules, from `.icon` in `git show 427c135:src/components/ReferenceList.module.css`, keyed on `.root[open]`.
  - As the list opens, the upright rule folds flat by transform, leaving a minus; as it closes, the rule unfolds into the plus again.
  - The icon is hidden from assistive technology, and the control's name and state are unchanged.
  - Citations and find-in-page still open the list, and their tests still pass.
- [ ] **The script switch:**
  - The "Devanagari first" switch's track is a printer's rule, and its knob a vermilion roundel that moves from one end of the track to the other.
  - The track and the knob each reach 3:1 against the paper they sit on (WCAG 1.4.11), checked in the contrast test.
  - Its name, `aria-pressed`, target size, spring and script swap are unchanged, and Motion stays its one use on the site.
- [ ] **Proposals:** `/proposals/` no longer lists "A kolam of your reading path". Its other entries are unchanged.
- [ ] **Kolam gone:**
  - `src/lib/kolam.ts`, `src/components/Kolam.tsx`, `Kolam.module.css` and `tests/unit/kolam.test.ts` are deleted, and nothing imports them.
  - The kolam colour tokens, their four contrast pairs and the kolam-only timings are gone from `globals.css`, `Folio.module.css` and `contrast.ts`.
  - `git grep -il kolam -- src tests docs` prints nothing.
- [ ] **Conventions doc:** "Kolam behaviours" becomes "Press ornaments":
  - the Fleuron (`draw` for a page's one opening moment, once on load) and OrnamentRule (inking in from the centre on scroll);
  - rules and dotted leaders that ink in by transform or stroke offset;
  - each finished by default, animated only inside `@media (prefers-reduced-motion: no-preference)`, and placed high enough above the end of its page to finish inking in;
  - ornaments `aria-hidden`, with the link round one named instead;
  - the later replacements (the contents plate, cross-reference rules, the progress tally and the Concept map's printed plate), each with its owning ticket.

  The rule to reserve every drawing's box stays. The shared-parts list and the page-turn list name no Kolam parts ("contents-plate rows" instead of petals).
- [ ] **Kept:** ink spread, page turns, the card-to-title morph, underlines drawing in, press-in, the reading thread and the script swap keep working, and their tests pass unchanged.
- [ ] **Tests of Kolam-only behaviour are deleted:**
  - `tests/unit/kolam.test.ts`, the generator's unit tests;
  - the four kolam pairs in the contrast test (`kolam-line` and `kolam-dot` on the ground, `surface-kolam-line` and `surface-kolam-dot` on the surface);
  - from the "the opening kolam" group in `home.spec.ts`: "frames the opening folio and is hidden from assistive technology", "draws itself once on load, in about 1.6 s, and ends complete" and "drifts a little slower than the page as it scrolls";
  - in `logo.spec.ts`: "pointing at the logo redraws its mark, which ends complete" and "focusing the logo from the keyboard redraws its mark";
  - in `motion.spec.ts`: "the opening kolam scrolls with the page, with reduced motion" and "pointing at or focusing the logo starts no drawing, with reduced motion";
  - in `smoke.spec.ts`: "the opening kolam scrolls with the page where scroll timelines are missing";
  - in `pages.spec.ts`: "404 page › draws a small kolam on load, once, which ends complete and is silent";
  - the helpers these leave unused: `frameKolam` and `openingFolio` in `tests/e2e/drawings.ts`, and `travel` in `tests/e2e/scrolling.ts`, unless a rewritten test still uses one.
- [ ] **Tests of Press behaviour seen through a Kolam element are rewritten,** each asserting at least what it did:
  - in `home.spec.ts`, "never makes the verse wait" and "is never the largest contentful paint" leave the kolam group for one about the opening folio, asserting what they did;
  - the band test checks each OrnamentRule: hidden from assistive technology, its rules short before it reaches the screen, part-way in on the way up, and at full width once it is well up the screen, each growing out from the centre;
  - the Contents test checks each numeral (१ to ६) is visible plain text, with no drawing round it;
  - "nothing shifts" waits for the Fleuron to finish instead of the frame, from load to the foot of the page, and keeps its 0.01 limit;
  - in `logo.spec.ts`, the name test checks the wordmark on every page and the 404: the visible text "Care4Mind", the link named "Care4Mind home", and no drawing in it. The footer test checks the footer shows the same wordmark;
  - in `smoke.spec.ts`, "shows the kolam logo and finished drawings" checks the wordmark, finished drawings and full-width rules, in Firefox and in WebKit on CI;
  - in `motion.spec.ts`, the 404 test checks the Fleuron finished and still; "shows every drawing finished with reduced motion" also checks every OrnamentRule at full width, on load and after scrolling; and the switch test's message says the knob jumps from one end of the track to the other;
  - in `concept.spec.ts`, the References test checks the plus folding into a minus: two rules, hidden from assistive technology, a plus while closed, the upright rule turning flat by transform as the list opens, and the plus again once it closes.
- [ ] **Each new Press behaviour gets a test:**
  - the hero's Fleuron draws itself once on load and ends complete, and with reduced motion it is finished from the first paint, with nothing starting on it;
  - the 404 page shows the Fleuron, hidden from assistive technology;
  - the wordmark's 4 sits in a vermilion roundel, in the header and the footer;
  - the References plus becomes a minus at once with reduced motion, with nothing moving;
  - the contrast test checks the switch's track and knob against the paper at 3:1.
- [ ] **No other test is weakened.** Every test not named above passes unchanged.
- [ ] **Reduced motion:** everything is finished and still. The Fleuron is drawn, every rule is at full width, the plus becomes a minus at once, and the knob jumps.
- [ ] **Speed and layout:**
  - The hero heading stays the LCP element.
  - Nothing shifts: every drawing reserves its box.
  - No new dependency, and no new client component: the wordmark, the Fleuron and the rules stay server-rendered.
- [ ] **Accessibility:** axe with the `wcag22aa` tags finds no violation at 360, 768 and 1440 px on the homepage, the Vikṣepa page (with the References open too), the KarmaYoga intro and the 404 page.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI;
  - `LHCI_PORT=<port> CHROME_PATH=/usr/bin/google-chrome scripts/lane/heavy.sh pnpm lhci` runs once, over HTTP/2 (the default), as advice. Record each page's LCP, Total Blocking Time and CLS in Comments.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
