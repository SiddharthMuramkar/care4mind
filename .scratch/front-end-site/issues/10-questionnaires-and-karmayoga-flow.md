# 10: Questionnaires and the KarmaYoga flow

Status: resolved
Blocked by: 03, 04
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C3, §C4 · Decisions: D12, D16, D21 · Planning: builds what [planning ticket 12](../../rebuild/issues/12-questionnaire-flow-prototype.md) asked to prototype

**What to build:**

- `/questionnaires/` features the KarmaYoga Scale as a preview, and groups the 17 Questionnaires coming later by topic. Every status is written in words.
- The KarmaYoga intro sets out purpose and limitations before Start.
- Where the preview is switched on, Start opens the flow:
  - four parts, one per screen, each with its real instructions;
  - large answer buttons, and a tally of short rules that inks in as you answer;
  - a part you haven't finished is refused without losing anything, and the browser's Back button moves between parts;
  - a review step lets you change any answer;
  - the end screen says plainly that the scoring isn't confirmed yet. It shows no number and no band.
- Nothing you answer is stored or sent anywhere.

This is the build side of planning ticket 12. The developer reacts to it there.

## Owns

- `src/app/questionnaires/**`: the index, `[slug]/` and `[slug]/take/`
- `src/components/questionnaire/**` (new) and `src/components/QuestionnaireCard.*`
- `src/lib/questionnaire/**` (new): the flow's reducer and the scoring stub
- `tests/unit/questionnaire-flow.test.ts` (new)
- `tests/e2e/questionnaire.spec.ts`, and `tests/e2e/questionnaire-flow.spec.ts` (new)

## Acceptance criteria

- [x] **Index (D16):**
  - The KarmaYoga Scale comes first, with its status in words: "Preview" while `questionnairePreview` is on, "Coming soon" while it's off.
  - The 17 coming-later Questionnaires (the 16 description pages and the Dosha Survey) are grouped by topic. Each card shows its anchor (`#dosha-survey` and the rest), its source title, the words "Coming later" and a link to its Concept.
  - Status is never shown by colour alone (WCAG 1.4.1).
  - The KarmaYoga card morphs into its page's title (`questionnaire-title-<slug>`).
- [x] **Intro page (FR-05 order):**
  - Purpose and limitations come before Start on the page and in reading order.
  - A Preview badge.
  - The text "Your answers aren't scored yet".
  - The draft limitations marked as not yet reviewed by the Psychology expert.
  - The source citation.
  - Start is a link to the flow while the flag is on. While it's off, Start is the foundation's disabled "Coming soon" button.
- [x] **Gate (C4):**
  - The flow's route exists only while `features.questionnairePreview` is on, or for a Questionnaire whose status is live.
  - A unit test covers the gate and the intro's Start in both states. Ticket 15's flags-off build checks the 404.
- [x] **Parts:**
  - Four parts of 12, 6, 9 and 18 statements, in the order of the record's settings, each opening with its real instruction text.
  - Each statement is a native `fieldset` whose `legend` is the statement exactly as stored, with five native radio buttons styled as pills at least 44 px tall.
  - Options appear in the source's order. Items 34–42 list Strongly Agree first, as the source does.
- [x] **No surprises:**
  - Choosing an answer never moves focus or changes the part (WCAG 3.2.2).
  - There are no single-key shortcuts (WCAG 2.1.4).
  - The arrow keys move within a statement's options, as native radio buttons do.
- [x] **Steps and history:**
  - The step shows in the address as `?step=part-2`, added with pushState, so browser Back and Forward move between parts with every answer kept.
  - Answers never appear in the address.
  - Reloading with no answers in memory returns to the first part.
- [x] **Progress:**
  - A decorative tally of 45 short rules in four groups of 12, 6, 9 and 18, one group per part, hidden from assistive technology (`aria-hidden`), inks in one rule per statement answered (D21). It is built in this ticket's folder, reserves its box so nothing shifts as it fills, and is finished and still under reduced motion and in print: each rule shows its state at once.
  - Beside it, the text "Part 2 of 4 · 14 of 45 answered" sits inside a Base UI Progress element with `aria-valuetext`, not in a live region.
- [x] **Refusing incomplete parts (FR-05):**
  - Next on an unfinished part shows an error summary at the top and moves focus to it.
  - Each error links to its statement, which gets `aria-invalid` and a visible text message (WCAG 3.3.1).
  - Every answer already given stays selected, and the part doesn't change.
- [x] **Back:** the flow's Back button and the browser's both return to the previous part with every answer kept.
- [x] **Review:** every statement with its chosen answer, grouped by part. Each statement has a Change link that returns to its part and moves focus to it.
- [x] **End screen:**
  - It is labelled "Placeholder" and says: "The KarmaYoga Scale's scoring rules are with the Psychology expert; your result appears here once they are confirmed."
  - It shows no numbers, percentages or bands.
  - It shows the "not a diagnosis" limitation, the visitor's answers and the source citation.
  - Retake asks for confirmation in a Base UI AlertDialog. Cancel keeps every answer; confirm clears them and returns to part 1.
  - Print uses a stylesheet that prints the placeholder and the answers.
  - It links to the related Concepts.
- [x] **Scoring stub:**
  - `scoreQuestionnaire(form, answers)` returns `{ status: 'pending' }`.
  - Unit tests try all-first, all-last and mixed complete answer sets.
  - No answer key, points or bands exist anywhere in the code.
- [x] **Nothing stored or sent (D16, OQ8):**
  - Answers live only in a reducer.
  - After finishing the flow, localStorage, sessionStorage, cookies and IndexedDB hold nothing the flow wrote.
  - During the flow, no request uses a method other than GET, no request goes to another origin, and no request's address carries an answer.
  - A `beforeunload` warning appears while at least one answer is given and the end screen isn't reached.
- [x] **Without JavaScript:** the flow's page says it needs JavaScript, because answers may go neither into the address nor to a server, and links back to the intro.
- [x] **Motion:**
  - Part changes use a view transition, instant under reduced motion.
  - There is no celebratory motion, and the end screen keeps still.
- [x] **Speed:** choosing an answer is measured once at 4× CPU slowdown, kept under 200 ms, and recorded in Comments. Ticket 15 adds the standing check.
- [x] **Breadcrumbs (D15):**
  - Home › Questionnaires;
  - Home › Questionnaires › KarmaYoga Scale;
  - Home › Questionnaires › KarmaYoga Scale › Take it.
- [x] **Tests:** `questionnaire-flow.spec.ts` covers, at 360 and 1440 px:
  - the whole flow by keyboard alone, from Start to the end screen;
  - refusal with focus on the summary, and answers kept;
  - browser Back and Forward;
  - reload;
  - review and Change;
  - Retake, both cancel and confirm;
  - the storage, address and request checks above;
  - the `beforeunload` warning;
  - axe on each part, the error state, the review and the end screen.

  `questionnaire.spec.ts` keeps the foundation's intro checks for the flag-on state.
- [x] **For the developer:** Comments records the preview address of the flow, so the developer can react to it under planning ticket 12.
- [x] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

### Build notes (lane/site-10, 2026-10-28)

**Preview address of the flow, for the developer (planning ticket 12):** `/questionnaires/karmayoga-scale/take/` on any Vercel preview of this branch, or `http://localhost:3000/questionnaires/karmayoga-scale/take/` after `pnpm build && pnpm start` (the preview flag is on locally and in previews, off in production). Start from `/questionnaires/karmayoga-scale/` to see the intro first.

**What is built**

- **The flow's state** (`src/lib/questionnaire/flow.ts`): one reducer, `flowReducer(state, action)` over `startFlow(form)`, with `answer`, `next`, `back`, `go` (browser Back/Forward and Change: to the step asked for, or the first part with a statement left) and `retake`. `progressOf`/`progressText` give "Part 2 of 4 · 14 of 45 answered" ("Review · 45 of 45 answered" on the review); `addressOf`/`stepFromAddress` read and write `?step=…` and nothing else; `unsaved(state)` drives the leave warning. Answers are stored by statement id as the option's label.
- **Scoring stub** (`src/lib/questionnaire/score.ts`): `scoreQuestionnaire(form, answers)` is `{ status: 'pending' }` for every complete set and `{ status: 'incomplete' }` otherwise. No key, points or bands anywhere.
- **Gate** (`src/lib/questionnaire/gate.ts`): `startOf(questionnaire, form)` (Start's link, or disabled where the content module offers no form) and `statusWords`/`shownStatus` (a preview is "Coming soon" with its flag off). The route gate itself stays the content module's `canTake` through `questionnaires.form()`; the unit test drives it through `createContent` with the flag on, off, and with the record's status set to live.
- **The flow** (`src/components/questionnaire/`): a client island, server-rendered at part 1. `Flow.tsx` holds the reducer, history, focus and leave warning; `Statement.tsx` is one memoised fieldset (`role="radiogroup"`, legend exactly the statement, five native radios as pills ≥ 48 px, rubricated number in the margin, `aria-invalid` plus a visible message when refused); `FlowProgress.tsx` is Base UI Progress (`getAriaValueText`, a visually hidden label, the words in `Progress.Value`) around the tally; `RetakeDialog.tsx` is the Base UI AlertDialog, loaded with `React.lazy` and preloaded when the end screen mounts.
- **Steps and focus:** every step change is a `pushState` of `?step=…`; Back, Next, Change and Retake push, browser Back/Forward pop and the flow follows (`popstate`), replacing the address if it names a step not open yet. On arrival with a later step in the address (a reload), it replaces it with `?step=part-1`. A new step jumps to its heading at once and focuses it; a refusal focuses the summary; Change and summary links focus the statement's chosen (or first) option.
- **The tally:** 45 two-pixel rules in groups sized 12fr 6fr 9fr 18fr, each inking in from its centre (`scaleY`) as its statement is answered, a vermilion mark under the part on screen. `aria-hidden`; transitions only under `no-preference`; the box never changes. The strip sticks under the header while a part scrolls (`top: var(--sticky-top)`), and the page's `scroll-padding-top` grows by its height while it is there, so focused options are never under it.
- **Review and end screen:** answers are set like a book's contents (statement, dotted leader, answer in small caps), by part, as `dl` rows; the review's leaders ink in from the centre once, under `no-preference`. The end screen is a still plate captioned "Placeholder" with a still Fleuron, then the limitations ("What this is not", with the draft note), the answers, Print and Retake, the source citation and related Concepts. These last are rendered on the server and handed to the island as nodes. `@media print` drops the progress, the controls and the Change links.
- **Without JavaScript:** a `<noscript>` note says why the flow needs it and links back to the intro; `@media (scripting: none)` hides the flow.
- **Intro:** the title is the morph target (`questionnaire-title-karmayoga-scale`); the badge is the status in words on its status colour (`data-status`); under Start, "Your answers aren’t scored yet." (Start's description) with the reason and the privacy promise.
- **Index:** the KarmaYoga card first; then "Coming later" after an OrnamentRule, one group per topic (its name linking to the topic, a count beside it), each Questionnaire a catalogue slip with its anchor as `id`, its source title, "Coming later" in words on its status colour and its Concept link. A slip reached by its anchor (`:target`, as the old addresses redirect) is ringed in vermilion with a corner diamond. The card's title morphs into the intro's heading.

**Decisions the spec left open**

- Part changes use the site's page turn (`turn-forward` on Next, `turn-back` on Back and Change, React `ViewTransition` keyed by step); browser Back/Forward, Finish and Retake swap at once, so the end screen never moves in.
- The flow's own Back pushes a history entry, like a link, rather than calling `history.back()`: browser Back after it returns to the part you came from.
- On part 1 the flow's Back is a link to the intro ("Back to its purpose and limits").
- The leave warning is on while answers are given and the end screen is not on screen (going back from the end screen to the review turns it on again).
- The interface text uses the typographic apostrophe ("aren’t", "Scale’s"), as the rest of the site does; tests accept either.
- The end screen shows all four drafted limitations, not only the "not a diagnosis" one: they are short and belong together.
- Statement numbers (1–45, across parts) are decorative (`aria-hidden`): the legend stays exactly the stored statement.

**Measured**

- Choosing an answer at 4× CPU slowdown (`openOnSlowPhone`, 360 px, Event Timing, six answers): 80, 72, 64, 64, 56 and 56 ms, under the 200 ms budget.
- `pnpm lhci` (HTTP/2, LHCI_PORT=3210), median of 3: `/` LCP 2.03 s, TBT 158 ms; `/concepts/vikshepa/` 2.02 s, 165 ms; `/questionnaires/karmayoga-scale/` 2.02 s, 79 ms; CLS ≤ 0.001, accessibility 1.0. (Three lanes shared the machine; ticket 04 measured 1.88–1.95 s.)
- CSS: the flow's own styles are in a chunk only the flow page loads. The index, intro and flow page modules add about 1 kB gzip to the shared stylesheet (Turbopack merges server pages' CSS Modules).

**Tests**

- New: `tests/unit/questionnaire-flow.test.ts` (22 tests: the reducer, the address, the scoring stub, the gate and Start in both flag states and for a live record); `tests/e2e/questionnaire-flow.spec.ts` (16 tests per width: keyboard alone from Start to the end screen, parts and options in source order with pills ≥ 44 px, progress words and tally, refusal and focus, Back and browser Back/Forward, reload, review and Change, the end screen, print, Retake cancel and confirm, storage/address/requests, the leave warning, axe on every part, the error state, the review and the end screen, the page turn and the still end screen, reduced motion, and no JavaScript).
- Changed: `tests/e2e/questionnaire.spec.ts`. The flow page now asks the questions, so "the flow names its Questionnaire and leads back… (no inputs)" is gone (its no-JavaScript side is in the flow spec). The intro test also checks "Your answers aren’t scored yet" as Start's description. New: the index (KarmaYoga first as a preview; 17 slips by topic with anchors, titles, status and Concept links; the anchor lands in view), the card-to-title morph, and the three breadcrumb trails.
- Run here: lint and typecheck on the ticket's files; the unit file (22 passed); the two specs at 360 and 1440 px (all passed); the sample e2e suite on the final build (584 passed, 112 skipped by design).

**Notes for the conventions doc (ticket 15)**

- A step flow that reflects its step in the address: `window.history.pushState(null, '', '?step=…')` (Next keeps its router state) and a `popstate` listener through `useEffectEvent`; never `useSearchParams` on a static page (it would client-render the island).
- A server page can hand a client island server-rendered nodes as props (here the end screen's limitations, citation and related Concepts), keeping `@/content` out of the client.
- A radio group's legend inside a CSS grid fieldset: float it (`float: inline-start; width: 100%`) so it lays out as the first row; a rendered legend sits outside the padding box and absolutely placed marginalia miss it.

**Left over:** nothing in this ticket. With the flag off, the intro's disabled "Coming soon" Start and the index's "Coming soon" badge are covered by the unit test; ticket 15's flags-off build checks the 404 of the flow.

### Check notes (lane/site-10, 2026-10-28)

Checked every criterion against the code and tests: all met. Fixed and polished on top of the build:

- **Index title:** "Questionnaires" broke mid-word at 360 px ("Questionnaire / s", already so in the foundation). It is now set to fit a phone's folio (`clamp(2.25rem, 10.5vw, 5.75rem)`) and is as large as the other indexes' titles where there is room.
- **Leaders on the review and end screen:** beside a wrapped statement the dotted leader was a short stub after a wide gap. Each now runs from the statement's last word to its answer, like a contents line. New test: "sets each answer like a contents line" (360, 768, 1440 px; none drawn under 480 px, where the answer sits under its statement).
- **Print:** the end screen printed Source and Related Concepts over the last answers, past the folio's foot, and a blank fifth sheet (Chrome fragments `break-inside: avoid` grid items badly). In print the end screen is now block flow, keeping only rows and headings together: four sheets, nothing overlapping. A printed part keeps its progress words and tally (`print-color-adjust: exact`), and its chosen answers stay legible (the indigo fill isn't printed, so the label takes the ink colour).
- **Controls on a phone:** Back and Next, Print and Retake stand one under another at full width below 30rem. The Retake dialog's two choices stand as a column at every width: they wrapped unevenly even at 1440 px.
- **Colours:** the new folio-style shadows used raw `rgb(29 26 46 / …)` (copied from Folio and ConceptCard). They are now `color-mix()` of `--color-surface-ink`, and the dialog's drop shadow is `--color-backdrop`. No new tokens.
- The end screen's kicker reads "Every part answered" rather than hard-coding "four".

**Decision:** the review's leaders ink out from the statement towards the answer, not from their centres: a clipped leader's centre lies off its visible part.

**Measured (final build):** sample e2e 590 passed, 112 skipped by design. `pnpm lhci` (HTTP/2, LHCI_PORT=3210), median of 3: `/` LCP 2.02 s, TBT 83 ms, CLS 0.000; `/concepts/vikshepa/` 1.96 s, 150 ms, 0.001; `/questionnaires/karmayoga-scale/` 2.02 s, 138 ms, 0.001; accessibility 1.0 on each. Other lanes' builds shared the CPU.

**Tests changed:** `tests/e2e/questionnaire-flow.spec.ts` gains the leader test. No existing test changed.

**Notes for the conventions doc (ticket 15)**

- A dotted leader after text that wraps: an `inline-block` leader, `width: 100%` with `margin-inline: 0.5em calc(-100% - 0.5em)`, in a cell with `overflow: clip`. It starts after the last word and never wraps to a line alone. A flex leader beside a wrapped text box leaves a gap.
- In print, don't put `break-inside: avoid` on grid items that may cross a page: switch the grid to block flow in `@media print`, or Chrome prints later items over earlier ones.
- Check print with Playwright's `page.pdf()` turned into images (`pdftoppm`): `emulateMedia({ media: 'print' })` doesn't break pages.

**Left over:** nothing in this ticket. The site has no shared print stylesheet yet: only the header and footer hide themselves in print, so the other reading pages print with the browser’s defaults.
