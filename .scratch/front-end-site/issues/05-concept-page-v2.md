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

### Build notes (lane/site-05, 2026-10-28)

**What is built**

- **Heading (D07):** `concept/TitleSpellings.tsx` sets the capitalised IAST and the Devanagari beneath it through ScriptPair, each with its `lang`; the gloss stays in small capitals; English-titled Concepts lead with their title. The foundation's "Devanagari first" switch still reorders what is read and seen: switched, the heading draws its own two spans in the other order, and both spellings are named (`concept-title-<slug>` and `concept-title-<slug>-devanagari`) so they fly as a shared pair. One-line change outside my files: `DevanagariFirst` is exported from `ScriptChoice.tsx` (ticket 13's).
- **Blocks:** every kind renders as before. A term keeps its heading one level below its section, its id, and gains a visible pilcrow link to its anchor ("Link to Vyādhi"). Applications and comparison sections carry a small-caps label above the heading; the heading's name reads "Comparison: …" (the lozenge is CSS with empty alt text). Verses quoted mid-section are verse cards.
- **Contents** (`concept/Contents.tsx`): a `nav` named "Contents" with its own h2, listing the sections (with their terms from 64rem), then Linked knowledge and References, with Devanagari numerals. From 64rem it sits beside the text, sticky, scrolling on its own if long; below that it sits after the opening verses, above the sections, unstuck. The section in view gets a vermilion lozenge and ink: `scroll-target-group: auto` + `:target-current` where supported; else a `timeline-scope` on the body and each section's `view-timeline-name` (a one-line band 30% down the screen); else nothing. No JavaScript, no listener, no observer.
- **Linked knowledge** (`concept/LinkedKnowledge.tsx`): Related Concepts with their reasons (D06), Texts it quotes (each work, then its passages to `/texts/<work>/#<locator>`), On this page (applications and comparison sections), References (each by label to its entry) and the Questionnaire card(s). Empty groups are left out. Each group head and row is joined to its count or note by a dotted leader, the cross-reference rule: faint dots with vermilion dots over them, inked from the centre by `animation-timeline: view()` only under `no-preference` with support, finished everywhere else and in print, `aria-hidden`.
- **Citations:** `graph.ts`'s reader now reads every balanced pair of parentheses (outer before nested) and a comma inside a closing quote, so Ahimsa's EPRA citation resolves to `epra-2019`; unit test `tests/unit/content-citations.test.ts` (new). `Text` reads the same way. The accordion's island (`concept/OpenReferences.tsx`, mounted by `ReferenceList`) opens the list on any `#ref-…` link, by mouse or Enter, and once the browser has jumped puts focus on the entry (`tabIndex=-1`); it opens the list for printing too. Without JavaScript the native `details` still opens at the entry.
- **Previews** (`preview/**`): `LinkPreview` keeps its props. Each link sits in an inline span; at a mouse's or keyboard's first move (never touch) the card's code is fetched, and once a pointer or keyboard focus reaches a previewed link, every span becomes a detached `PreviewCard.Trigger` (`createHandle<PreviewPayload>()`, typed payload) of the one root in the layout. Opens after 450 ms on hover or visible focus, closes after 200 ms, can be hovered, Escape closes it, it sits beside (never over) the link, and its data comes with the page. Used here for related Concepts, previous/next, citations (Reference title) and passage links (first Devanagari line and translation). A page without LinkPreview never loads it.
- **Verse cards** (`prose/VerseCard.tsx`, `prose/CopyVerse.tsx`): the verse, its source as a chip leading to the passage, and "Copy verse" (Devanagari, transliteration, translation with its source, locator, as plain text), confirmed by `toast()` ("Verse copied", the locator). Keyboard works; focus stays put.
- **Tables:** the focusable region named by its caption stays; the first column is sticky; scroll shadows are CSS backgrounds (`local` paper over `scroll` shades); printed, the table wraps instead.
- **Previous and next** (`concept/TopicPager.tsx`): `nav` "Concepts in <topic>"; next turns forward, previous back; none on the first/last.
- **Print:** header, footer, contents, buttons, pager, ornaments and folio corners drop; References print open (`::details-content` plus `beforeprint`); each external link is followed by its address; leaders print finished; tables wrap; verses and tables avoid breaks.

**Decisions the spec left open**

- The opening verses stand across the page under the title, like an epigraph (side by side from 64rem), so the contents column starts with the sections; on a phone the contents come after the verses.
- The Linked knowledge panel replaces the old "Related Questionnaires" section; References are listed by label rather than as one "see the list" link, so each is one click from its entry.
- Previous/next carry no morph names: either one would pair the old title with the new page's pager link.
- Preview links are wrapped, not cloned: an element a server component hands to a client one can arrive as an unresolved lazy node, and cloning it throws "Element type is invalid".
- Triggers are swapped in only while no button is held and no view transition runs, and the card refuses to open during a page turn or within 1 s of a press: React skips a running view transition when another commit lands in it (seen as `AbortError: skipTransition()` on page turns).
- `content-visibility: auto` on prose sections (with 0.5rem of room for focus rings). Not on the panel: there it made Lighthouse's axe fail colour contrast and target size (0.93).

**Islands and weight**

- Client islands added: `CopyVerse`, `LinkPreview` (+ `LinkPreviewRoot`, and `PreviewCard` loaded lazily), `OpenReferences`, `TitleSpellings` (the foundation's switch, now through ScriptPair). The contents need none.
- **First-load JS** for `/concepts/[slug]`: 139.9 kB gzip (465.9 kB raw), against 138.8 kB for `/`; the page's own chunk is 1.9 kB gzip. Base UI's preview card is never in first load. Concept HTML: 29.7 kB gzip (was about 21 kB), still two round trips.
- **Lighthouse** (`pnpm lhci`, HTTP/2, LHCI_PORT=3220), median of 3: Concept LCP 2.17 s, TBT 189 ms, a11y 1.0; `/` 2.03 s, 153 ms; Questionnaire 2.02 s, 133 ms. The machine was busy (the homepage's TBT was 28 ms in ticket 04's run, 94–167 here), but the Concept page's TBT margin is thin: its style and layout run about 0.5 s against 0.3 s for `/`. Ticket 15 should re-measure on a quiet machine; the leaders' 40 view timelines and the panel's size are the places to trim.

**Tests**

- New: `tests/e2e/concept-page-links.spec.ts` (the FR-01 one-click test, sample or all 19 Concepts) and 24 tests in `concept.spec.ts` (heading, blocks, contents, linked knowledge, citations by keyboard, mouse and without JavaScript, previews incl. touch and no data requests, verse cards with clipboard and toast, tables, previous/next turns, print, reduced motion; axe with a preview open, the accordion open and a toast showing).
- Changed, where this ticket changes what they check: `underlines.spec.ts` (the Concept page's running-text example is now the work link "Yoga Sūtra" in Linked knowledge: the Questionnaire is a card); `reading-thread.spec.ts` (25 Tabs each way instead of 15: the contents and verse cards add stops).
- Done here: lint, format, typecheck, 673 unit tests, build; `E2E_SCOPE=sample` on every project.

**For the conventions doc (ticket 15)**

- Turbopack's CSS parser rejects `:target-current`: put such rules in a `<style href precedence>` element in the component.
- Never `cloneElement` a `children` a server component passed in; wrap it.
- A React commit during a running view transition skips it: popups and lazy swaps must wait (`document.activeViewTransition`).
- Decorative generated content keeps out of accessible names with alt text: `content: '◆' / ''`.
- `content-visibility: auto` needs a little padding for focus rings, and breaks axe's measurements on content it skips.

**Left over:** nothing in this ticket. The A–Z (ticket 06) can pass glossary entries with a Concept page to `LinkPreview` with `kind: 'glossary'`.
