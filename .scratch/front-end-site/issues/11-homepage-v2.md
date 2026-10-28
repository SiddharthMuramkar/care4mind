# 11: Homepage v2

Status: ready-for-agent
Blocked by: 06, 08, 09, 10, 12
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §B4, §C3 · Decisions: D11, D20, D21

**What to build:** the homepage becomes the way into the whole site. The opening folio on its ruled indigo hero stays, with the lotus Fleuron drawn once (ticket 16). Below it:

- a search box with sample spellings (vikshepa · विक्षेप · viksepa) that opens the palette already filled in;
- the Topics contents plate: the five topics set like a book's contents, with Devanagari numerals and dotted leaders, each row a link;
- one verse from each traditional text;
- the KarmaYoga card and a shelf of Questionnaires coming later;
- a row of book spines leading to the Library;
- a still picture of the Concept map, labelled Proposal;
- the homepage's own area texts, now linking to their new pages.

Reuse the Library spines from ticket 08 and the Concept map teaser parts from ticket 12 (both block this ticket); don't build home-only copies.

## Owns

- `src/app/page.tsx` and `src/app/page.module.css` (from ticket 16)
- `src/components/home/**` (new)
- `tests/e2e/home.spec.ts` (from ticket 03), and the foundation's homepage specs

## Acceptance criteria

- [ ] **The hero stays:**
  - The opening folio, verse, the Fleuron drawn once on load, the section rules and the calls to action keep working, and their tests still pass. Nothing drifts as the page scrolls (D21).
  - The hero heading stays the LCP element; check it in a Lighthouse report.
- [ ] **Search entry:**
  - The sample spellings vikshepa · विक्षेप · viksepa are links to `/search/?q=…`.
  - With JavaScript, choosing one opens the palette pre-filled with it, through SearchTrigger's initial query.
  - The box beside them submits to `/search/` without JavaScript.
- [ ] **Topics contents plate (D21):**
  - Built with ticket 06's contents plate: one row per topic, with a Devanagari numeral, the topic's name and a dotted leader, each row a real link to its topic page, named with the topic.
  - Pointing at or focusing a row lights it through `:has()`, and its leader inks in. It is finished and still under reduced motion and in print.
  - The numerals and leaders are hidden from assistive technology.
- [ ] **Verse strip:** one verse from each work, the first the site quotes in the work's order, each with a chip linking to its passage on the work's page. Both scripts go through ScriptPair.
- [ ] **Questionnaires:** the KarmaYoga card and the coming-later shelf, built from ticket 10's cards, with status in words.
- [ ] **Library spines:**
  - A row of typographic spines, from the Library's real lists, leading to `/library/`. No images (D18).
  - If ticket 08 has merged, reuse its spine. Otherwise build a home-only one in this ticket's folder.
- [ ] **Map teaser (Proposal):**
  - While `conceptMap` is on, a still picture of the Concept map, drawn from `site.graph()` with no interaction and no JavaScript, carries a ProposalNote and links to `/concepts/map/`.
  - While the flag is off, it is absent.
  - If ticket 12 has merged, reuse its static drawing.
- [ ] **Areas (D11):** the homepage's own area texts link to their remapped pages through `hrefFor()`, and the placeholder cards are gone.
- [ ] **Card morphs:** topic and Questionnaire cards morph into their pages' titles inside the forward page turn.
- [ ] **Speed (NFR-02):**
  - Nothing new above the fold delays the hero's text.
  - Everything below the fold that inks in follows the Press ornament conventions: finished by default, with its box reserved.
  - Lighthouse on `/` (mobile, three runs) keeps LCP ≤ 2.5 s, CLS ≤ 0.1 and Total Blocking Time ≤ 200 ms. Record the results in Comments.
- [ ] **Reflow and widths:** the page fits 320, 360, 768 and 1440 px with no sideways scroll.
- [ ] **Tests:** `home.spec.ts` covers:
  - each section's links;
  - the sample spellings opening the palette pre-filled, and as plain links with JavaScript off;
  - the plate's rows by keyboard, each lighting as it takes focus;
  - the map teaser absent when its flag is off (a unit test of the condition);
  - axe.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
