# 15: Performance, accessibility and review aids

Status: ready-for-agent
Blocked by: 02, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §C2, §F

**What to build:** proof that the finished site is still fast and accessible on a cheap phone, plus the aids the developer needs to review it.

- Lighthouse checks eight representative pages.
- Interaction checks time the five busiest controls at phone speed.
- Script-size budgets stop the JavaScript from creeping up.
- A build with every flag off proves production hides what it should.
- `pnpm shots` screenshots every page type.
- A manual-checks doc lists what only a person can check.

## Owns

- `lighthouserc.cjs`
- `tests/e2e/performance.spec.ts` (new), which takes over the foundation's interaction-latency check
- `scripts/shots.mjs` and `scripts/size-budget.mjs` (new), and their `package.json` scripts (`shots`, `size`)
- `playwright.config.ts`: a project for the flags-off build, if needed
- `.github/workflows/ci.yml`: the budget step and the flags-off job
- `.gitignore`: the screenshots folder
- `docs/manual-checks.md` (new)
- `README.md`: the Checks section
- `docs/agents/frontend-conventions.md`: folding in the notes the lanes left in their Comments

## Acceptance criteria

- [ ] **Lighthouse on eight routes (NFR-02).** Lighthouse CI runs three times each, on the mobile profile, on:
  - `/`, `/concepts/` and `/concepts/vikshepa/`;
  - `/topics/mind/` and `/texts/yoga-sutra/`;
  - `/library/references/`;
  - `/questionnaires/karmayoga-scale/take/` and `/concepts/map/`.

  LCP ≤ 2.5 s, CLS ≤ 0.1, Total Blocking Time ≤ 200 ms and accessibility ≥ 0.95 are errors, and performance ≥ 0.9 stays a warning. Use the real work and topic slugs content-v1 shipped.
- [ ] **Interaction checks (NFR-02).** A Chromium-only spec slows the CPU 4× and times each interaction with the Event Timing API, failing above 200 ms:
  - opening the palette with ⌘K or Ctrl+K, and typing a query;
  - pressing a filter chip on `/concepts/`;
  - choosing an answer in the flow;
  - pressing the "Devanagari first" toggle, or the Concept page's switch when the proposal is off;
  - opening the Drawer at 360 px.

  The foundation's homepage call-to-action check stays.
- [ ] **Script-size budgets:**
  - `pnpm size` reports each route's first-load JavaScript, gzipped, and fails when one grows more than 10% over the budget recorded in this ticket. The budgets are set from this ticket's measurements.
  - The search index stays at most 45 kB gzipped.
  - The palette, the Drawer and the flow are absent from the first-load JavaScript of pages that don't need them.
  - CI runs the check.
- [ ] **Flags-off build:**
  - A CI job builds with every feature flag off, as production would, and checks that:
    - `/questionnaires/karmayoga-scale/take/`, `/concepts/map/` and `/proposals/` return 404;
    - none of them appears in any link, the sitemap, the navigation or search results;
    - the KarmaYoga intro shows "Coming soon" with Start disabled;
    - no page shows a ProposalNote or the script toggle.
  - It runs locally under the heavy-step lock too.
- [ ] **`pnpm shots`:**
  - Writes JPEG screenshots of each sample route in the registry (one per kind) at 360 and 1440 px, with reduced motion off and on, into a git-ignored folder.
  - Files are named route, width and motion, and the command prints the folder.
  - Runs under the heavy-step lock.
- [ ] **Manual checks doc:** `docs/manual-checks.md` lists what automated checks can't prove. Each check has its steps and a place to record who checked it, when, and the result:
  - keyboard only, through every page type and the whole flow;
  - NVDA with Firefox, and VoiceOver with Safari, on the palette, the letter rails, the navigation panels, the Drawer, previews, the flow and the map;
  - zoom to 400% and text spacing (WCAG 1.4.12);
  - every animation with "reduce motion" on;
  - a real low-end Android phone on a slow connection;
  - printing a Concept page and the flow's end screen;
  - JavaScript turned off;
  - Devanagari rendering in Safari and Firefox.
- [ ] **Measurements in Comments:**
  - per Lighthouse route: median LCP, CLS, Total Blocking Time and performance score;
  - each route's first-load JavaScript;
  - each interaction's timing;
  - the index size.
- [ ] **Conventions folded in:** notes the lanes left in their Comments are folded into the conventions doc, and the README's Checks section lists `pnpm size`, `pnpm shots` and the flags-off job.
- [ ] **No regressions:** every existing test stays green.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - the full end-to-end run passes: `E2E_SCOPE=full E2E_PORT=<lane port> scripts/lane/heavy.sh pnpm check:e2e`, covering Chromium at 360, 768 and 1440 px, reflow at 320 px, reduced motion and Firefox, with WebKit in CI;
  - `LHCI_PORT=<lane LHCI port> CHROME_PATH=/usr/bin/google-chrome scripts/lane/heavy.sh pnpm lhci` passes;
  - so do `pnpm size` and the flags-off check.

## Comments
