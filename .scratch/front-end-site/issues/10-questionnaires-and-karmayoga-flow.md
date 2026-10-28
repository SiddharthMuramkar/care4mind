# 10: Questionnaires and the KarmaYoga flow

Status: ready-for-agent
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

- [ ] **Index (D16):**
  - The KarmaYoga Scale comes first, with its status in words: "Preview" while `questionnairePreview` is on, "Coming soon" while it's off.
  - The 17 coming-later Questionnaires (the 16 description pages and the Dosha Survey) are grouped by topic. Each card shows its anchor (`#dosha-survey` and the rest), its source title, the words "Coming later" and a link to its Concept.
  - Status is never shown by colour alone (WCAG 1.4.1).
  - The KarmaYoga card morphs into its page's title (`questionnaire-title-<slug>`).
- [ ] **Intro page (FR-05 order):**
  - Purpose and limitations come before Start on the page and in reading order.
  - A Preview badge.
  - The text "Your answers aren't scored yet".
  - The draft limitations marked as not yet reviewed by the Psychology expert.
  - The source citation.
  - Start is a link to the flow while the flag is on. While it's off, Start is the foundation's disabled "Coming soon" button.
- [ ] **Gate (C4):**
  - The flow's route exists only while `features.questionnairePreview` is on, or for a Questionnaire whose status is live.
  - A unit test covers the gate and the intro's Start in both states. Ticket 15's flags-off build checks the 404.
- [ ] **Parts:**
  - Four parts of 12, 6, 9 and 18 statements, in the order of the record's settings, each opening with its real instruction text.
  - Each statement is a native `fieldset` whose `legend` is the statement exactly as stored, with five native radio buttons styled as pills at least 44 px tall.
  - Options appear in the source's order. Items 34–42 list Strongly Agree first, as the source does.
- [ ] **No surprises:**
  - Choosing an answer never moves focus or changes the part (WCAG 3.2.2).
  - There are no single-key shortcuts (WCAG 2.1.4).
  - The arrow keys move within a statement's options, as native radio buttons do.
- [ ] **Steps and history:**
  - The step shows in the address as `?step=part-2`, added with pushState, so browser Back and Forward move between parts with every answer kept.
  - Answers never appear in the address.
  - Reloading with no answers in memory returns to the first part.
- [ ] **Progress:**
  - A decorative tally of 45 short rules in four groups of 12, 6, 9 and 18, one group per part, hidden from assistive technology (`aria-hidden`), inks in one rule per statement answered (D21). It is built in this ticket's folder, reserves its box so nothing shifts as it fills, and is finished and still under reduced motion and in print: each rule shows its state at once.
  - Beside it, the text "Part 2 of 4 · 14 of 45 answered" sits inside a Base UI Progress element with `aria-valuetext`, not in a live region.
- [ ] **Refusing incomplete parts (FR-05):**
  - Next on an unfinished part shows an error summary at the top and moves focus to it.
  - Each error links to its statement, which gets `aria-invalid` and a visible text message (WCAG 3.3.1).
  - Every answer already given stays selected, and the part doesn't change.
- [ ] **Back:** the flow's Back button and the browser's both return to the previous part with every answer kept.
- [ ] **Review:** every statement with its chosen answer, grouped by part. Each statement has a Change link that returns to its part and moves focus to it.
- [ ] **End screen:**
  - It is labelled "Placeholder" and says: "The KarmaYoga Scale's scoring rules are with the Psychology expert; your result appears here once they are confirmed."
  - It shows no numbers, percentages or bands.
  - It shows the "not a diagnosis" limitation, the visitor's answers and the source citation.
  - Retake asks for confirmation in a Base UI AlertDialog. Cancel keeps every answer; confirm clears them and returns to part 1.
  - Print uses a stylesheet that prints the placeholder and the answers.
  - It links to the related Concepts.
- [ ] **Scoring stub:**
  - `scoreQuestionnaire(form, answers)` returns `{ status: 'pending' }`.
  - Unit tests try all-first, all-last and mixed complete answer sets.
  - No answer key, points or bands exist anywhere in the code.
- [ ] **Nothing stored or sent (D16, OQ8):**
  - Answers live only in a reducer.
  - After finishing the flow, localStorage, sessionStorage, cookies and IndexedDB hold nothing the flow wrote.
  - During the flow, no request uses a method other than GET, no request goes to another origin, and no request's address carries an answer.
  - A `beforeunload` warning appears while at least one answer is given and the end screen isn't reached.
- [ ] **Without JavaScript:** the flow's page says it needs JavaScript, because answers may go neither into the address nor to a server, and links back to the intro.
- [ ] **Motion:**
  - Part changes use a view transition, instant under reduced motion.
  - There is no celebratory motion, and the end screen keeps still.
- [ ] **Speed:** choosing an answer is measured once at 4× CPU slowdown, kept under 200 ms, and recorded in Comments. Ticket 15 adds the standing check.
- [ ] **Breadcrumbs (D15):**
  - Home › Questionnaires;
  - Home › Questionnaires › KarmaYoga Scale;
  - Home › Questionnaires › KarmaYoga Scale › Take it.
- [ ] **Tests:** `questionnaire-flow.spec.ts` covers, at 360 and 1440 px:
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
- [ ] **For the developer:** Comments records the preview address of the flow, so the developer can react to it under planning ticket 12.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
