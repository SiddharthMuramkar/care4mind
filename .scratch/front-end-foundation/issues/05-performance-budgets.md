# 05: Performance budgets

Status: ready-for-agent
Blocked by: 02, 03, 04
Spec: [Front-end foundation: Press × Kolam](../spec.md)

**What to build:** proof that all the new motion still leaves the site fast on a cheap phone. Lighthouse CI must pass on the homepage, the Concept page and the Questionnaire page, and the font loading is tuned until it does. Interaction latency is checked directly, because Lighthouse can't measure INP.

## Acceptance criteria

- [ ] **Lighthouse budgets:**
  - Lighthouse CI runs three times on `/`, `/concepts/vikshepa` and `/questionnaires/karmayoga-scale` on the mobile profile;
  - LCP ≤ 2.5 s, CLS ≤ 0.1, Total Blocking Time ≤ 200 ms and accessibility ≥ 0.95 all pass as errors;
  - the performance score stays a warning at 0.9.
- [ ] **Font fallback plan,** if LCP misses:
  - apply the spec's plan one step at a time, measuring again after each;
  - first preload only Playfair Text Regular and Display Medium;
  - then give Tiro the "optional" font-display strategy;
  - record which steps were needed and why.
- [ ] **Interaction latency:** a Chromium-only end-to-end check measures, with the Event Timing API at 4× CPU slowdown, how long it takes:
  - for a homepage call to action to respond;
  - for the script switch to respond;
  - and asserts each is under 200 ms.
- [ ] **Measurements** in this ticket's Comments:
  - for each page: median LCP, CLS, Total Blocking Time and performance score;
  - the font bytes each page downloads;
  - first-load JavaScript per route;
  - which animations each page runs.
- [ ] **No regressions:** every end-to-end suite stays green.
- [ ] **Done-check:** every check in the spec's Testing Decisions passes, plus `CHROME_PATH=/usr/bin/google-chrome pnpm lhci`.

## Comments
