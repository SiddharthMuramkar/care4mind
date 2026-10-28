# 13: Proposal: site-wide Devanagari first

Status: ready-for-agent
Blocked by: 05, 06
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C5 · Decisions: D07, D20

**What to build:** a reader who prefers Devanagari chooses it once, and every page then puts Devanagari before IAST.

- The choice is a toggle in the header.
- The foundation's switch on the Concept page now sets the same preference.
- The choice is remembered across pages and visits, and applied before the page first paints, so nothing flashes or jumps.
- Screen readers hear the same words in the same order either way.

It is labelled Proposal and exists only while its flag is on. With the flag off, the foundation's per-page switch works as before.

## Owns

- `src/components/script/**`: ScriptPreference, HeadScript and ScriptPair, from ticket 04
- `src/components/SanskritTerm.*` and the foundation's script switch component. Its Press styling, the printer's-rule track and the vermilion roundel knob, is ticket 16's (D21), already merged: keep it, and keep its contrast pairs.
- in ticket 05's Concept page and ticket 06's A–Z, only the lines that render the script switch or a pair of scripts (both tickets have merged, and no running lane owns these files)
- `tests/e2e/script-preference.spec.ts` (new)

## Acceptance criteria

- [ ] **Gate (D20):**
  - Everything here applies only while `features.devanagariFirst` is on.
  - With it off, the header shows no toggle, the head script is absent, and the Concept page's switch keeps the foundation's page-view-only behaviour.
  - A unit test covers both states.
- [ ] **Header toggle:**
  - ScriptPreference is a toggle button named "Devanagari first" with `aria-pressed`, in the header and in the Drawer.
  - Its target is at least 44 × 44 CSS px.
  - It works with Enter and Space, and keeps focus after a press.
  - A ProposalNote sits beside it in the Drawer, and `/proposals/` describes it.
- [ ] **Before first paint:**
  - HeadScript is an inline script of about 200 bytes in the document head. It reads the stored choice from localStorage and sets `html[data-script]` before first paint.
  - Loading a page with the choice stored causes no flash and no layout shift: CLS from it is 0, measured.
  - If storage is blocked (reading it throws) or JavaScript is off, IAST comes first and nothing breaks.
- [ ] **Everywhere, in CSS:**
  - ScriptPair orders the two spellings from `html[data-script]` with CSS alone, on every page that shows both: Concept headings and term blocks, cards, A–Z entries, topic pages, texts, verses and the homepage.
  - The DOM order never changes, so the accessible name and the heading's text keep IAST first in both states.
  - Both spellings keep their `lang` tags.
- [ ] **One preference:**
  - The foundation's switch on the Concept page sets the same stored choice, and the header toggle and the page switch always agree.
  - Flipping either updates every pair on the page at once, through a view transition that is instant under reduced motion.
- [ ] **Remembered:** the choice survives navigation and reloads. It is the only thing this feature stores, and it holds no personal data.
- [ ] **Speed:** pressing the toggle is measured once at 4× CPU slowdown, kept under 200 ms, and recorded in Comments. Ticket 15 adds the standing check.
- [ ] **Gaps reported:** any page where a pair of scripts doesn't follow the preference, because it doesn't use ScriptPair, is listed in Comments for its owning ticket. Don't edit files you don't own.
- [ ] **Tests:** `script-preference.spec.ts` covers:
  - choosing Devanagari first, then visiting a Concept, the A–Z, a topic, a work and the homepage, and reloading: Devanagari leads everywhere;
  - no layout shift on load, measured through the Layout Instability API;
  - the toggle and the Concept switch agreeing;
  - storage blocked;
  - axe in both states;
  - both `lang` tags present.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the lane's end-to-end run passes: `E2E_SCOPE=sample E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI.

  The merger runs `E2E_SCOPE=full` after merging.

## Comments
