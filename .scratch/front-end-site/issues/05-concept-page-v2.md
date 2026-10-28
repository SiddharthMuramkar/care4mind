# 05: Concept page v2

Status: ready-for-agent
Blocked by: 03, 04
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C2, §C3 · Decisions: D05, D06, D07, D21

**What to build:** the Concept page becomes the heart of linked knowledge (FR-01). A reader of any of the 19 Concepts gets:

- a table of contents that stays in view and highlights the section they're reading;
- a "Linked knowledge" panel gathering everything the Concept connects to, each one click away, joined by cross-reference rules, dotted leaders that ink in as they scroll;
- citations that jump to their Reference and open the list;
- previews of linked Concepts, citations and verses on hover or focus;
- verse cards they can copy;
- wide tables they can read on a phone;
- previous and next links through the topic;
- a clean printout.

Everything the foundation built stays. The site-wide link previews switch on here, for every page that already uses the LinkPreview slot.

## Owns

- `src/app/concepts/[slug]/**`
- `src/components/concept/**` (new)
- `src/components/prose/**` (from ticket 03)
- `src/components/preview/**` (the LinkPreview stubs from ticket 04)
- `src/components/SpellingsPopover.*` and `src/components/ReferenceList.*`
- `tests/e2e/concept.spec.ts`, and any new `tests/e2e/concept-page-*.spec.ts` (not `concept-map.spec.ts`, which ticket 12 owns)
- `src/content/graph.ts`: the in-text citation reader only, keeping `@/content`'s interface and the content tests unchanged

## Acceptance criteria

- [ ] **The foundation stays:** the card-to-title morph, the reading thread, the "Devanagari first" switch, the "Also spelled" popover, the References accordion with its plus that folds into a minus (from ticket 16), ink and page turn all still work, and their tests still pass.
- [ ] **Heading (D07):**
  - The capitalised IAST term leads, with the Devanagari beneath and the English gloss in small capitals.
  - Concepts with an English title lead with it (five-steps-of-perfection, momentum-of-spiritual-practice, spiritual-practitioner).
  - Both spellings go through ScriptPair with their `lang` tags (WCAG 3.1.2).
- [ ] **Every block, finished:**
  - Paragraphs, lists, term blocks, tables, verses quoted mid-section and the shared topic introduction all render.
  - Each term block has its own heading, one level below its section, and an anchor at its id, with a visible link to that anchor.
  - Sections marked "applications" and "comparison" are labelled as such. Comparison sections never call two ideas equivalent (D05).
- [ ] **Table of contents:**
  - It lists the sections, inside a `nav` landmark with a name, and its links work without JavaScript.
  - At wide widths it sits beside the text and stays in view; on narrow screens it sits above the text and doesn't stick.
  - The section in view is highlighted with CSS only: `scroll-target-group` and `:target-current` where supported, otherwise a `timeline-scope` scroll-driven animation, otherwise no highlight.
  - No scroll listener or observer is used.
- [ ] **Linked knowledge (FR-01).** One panel lists, each as a link:
  - related Concepts, each with its factual reason (D06), such as "Both quote Yoga Sūtra 2.30";
  - the works and passages the Concept quotes, linking to `/texts/<work>/#<locator>`;
  - its applications and comparison sections, as in-page links;
  - its References, linking to the list;
  - its Questionnaire card.

  Empty groups are left out, never shown empty. Cross-reference rules join the groups (D21): dotted leaders that ink in on scroll, finished and still in print and under reduced motion. They are decorative and hidden from assistive technology.
- [ ] **One-click test (FR-01).** An end-to-end test reads each Concept's view (the sample in `sample` scope, all 19 in `full`) and checks that every related Concept, work, application, comparison, Reference and Questionnaire it lists is a link on the page, and that each link's target returns 200 and holds its anchor.
- [ ] **Citations:**
  - Each in-text citation links to `#ref-<id>`.
  - Following one, by mouse or keyboard, opens the References accordion if it's closed, brings the entry into view and moves focus to it.
  - With JavaScript off, the link still reaches the entry, for example by keeping the panel `hidden="until-found"` or open.
- [ ] **Previews.** The LinkPreview slot now opens one Base UI PreviewCard per page, through detached triggers made with `createHandle` and a typed payload, for Concept links, glossary entries that have a Concept page, citations and verse links:
  - it opens on hover and on keyboard focus after a short delay, and shows nothing on touch;
  - it never covers the focused element (WCAG 2.4.11), closes with Escape and can be hovered (WCAG 1.4.13);
  - it holds only supplementary text, since everything in it is reachable by following the link;
  - it needs no network request;
  - pages that used LinkPreview before this merge get previews without any change of their own.
- [ ] **Verse cards:**
  - Each verse shows a chip naming its work and locator, linking to the passage on the work's page.
  - "Copy verse" copies the Devanagari, the transliteration, the translation and the locator as plain text, and confirms with a polite toast.
  - It works by keyboard.
- [ ] **Tables:**
  - Each table scrolls sideways inside its own focusable region, named by its caption.
  - The first column stays in view.
  - Scroll shadows, in CSS only, show that there is more.
  - The page itself never scrolls sideways at 320 px (WCAG 1.4.10).
- [ ] **Previous and next:**
  - Links to the Concepts before and after this one in its primary topic: "next" turns the page forward and "previous" turns it back.
  - There is no "previous" on the first Concept and no "next" on the last.
- [ ] **Print:**
  - The printout drops the header, footer, table of contents, buttons and decoration. The panel's cross-reference rules print finished and still.
  - It prints the References open, and the address after each external link.
  - Verses and tables stay legible.
- [ ] **Islands stay small:**
  - The page stays a server component.
  - Only the copy button, the previews and the accordion are client islands; the table of contents needs none.
  - No new dependency is added.
  - First-load JavaScript for the page is recorded in Comments.
- [ ] **Reduced motion:** the cross-reference rules are inked in and still, nothing morphs or turns, and every feature still works.
- [ ] **Tests:** `concept.spec.ts` covers these criteria at 360 and 1440 px, including:
  - axe with a preview open, with the accordion open, and with a toast showing;
  - a keyboard-only path from a citation to its entry;
  - the print stylesheet, through `emulateMedia({ media: 'print' })`.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments

**From content-v1, 2026-10-28:**
- **Values Concepts (ahimsa, satya, asteya, brahmacharya):** each one's first section and the values topic's introduction share an id and a heading, and the view gives both: the section, then the introduction's section inside its topic-intro block. Draw the introduction's section in that section's place, so the heading shows once and the anchor stays unique.
- **Ahimsa's EPRA citation:** `graph.ts` reads only innermost parentheses, so “(“EPRA International Journal of Multidisciplinary Research (IJMR),” 2019b)” isn't read as a citation and doesn't link to `epra-2019`. Fix the reader (owned above) with a unit test for nested parentheses.
- The KarmaYoga form has no form-level description field; its quiz description line stays out and is flagged for the Psychology expert.
