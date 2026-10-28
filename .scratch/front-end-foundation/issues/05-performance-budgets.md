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
- [x] **Font fallback plan,** if LCP misses:
  - apply the spec's plan one step at a time, measuring again after each;
  - first preload only Playfair Text Regular and Display Medium;
  - then give Tiro the "optional" font-display strategy;
  - record which steps were needed and why.
- [x] **Interaction latency:** a Chromium-only end-to-end check measures, with the Event Timing API at 4× CPU slowdown, how long it takes:
  - for a homepage call to action to respond;
  - for the script switch to respond;
  - and asserts each is under 200 ms.
- [x] **Measurements** in this ticket's Comments:
  - for each page: median LCP, CLS, Total Blocking Time and performance score;
  - the font bytes each page downloads;
  - first-load JavaScript per route;
  - which animations each page runs.
- [x] **No regressions:** every end-to-end suite stays green.
- [ ] **Done-check:** every check in the spec's Testing Decisions passes, plus `CHROME_PATH=/usr/bin/google-chrome pnpm lhci`.

## Comments

**Built, 2026-10-28. Not resolved: `pnpm lhci` still fails on LCP on all three pages (see Left over).** Everything else in the done-check passes: format, lint, typecheck, 69 unit tests, the build and 344 Playwright tests (4 skipped by design).

- **Font plan, both steps applied and both needed.** LCP after each step, medians of three Lighthouse runs per page with `pnpm lhci`'s settings (differences under about 0.3 s are noise on this machine):

  | | Homepage | Concept | Questionnaire |
  | --- | --- | --- | --- |
  | Before: all four Playfair cuts preloaded | 4.25 s | 4.99 s | 4.14 s |
  | Step 1: preload only Text Regular and Display Medium | 4.10 s | 4.56 s | 3.19 s |
  | Step 2: Tiro `font-display: optional` too | 3.93 s | 4.22 s | 3.49 s |

  Both stay: the italic, semibold and Tiro no longer compete with the page's own files on a slow connection, and Tiro never swaps in late. next/font preloads all of a call's files or none, so Playfair Text's italic and semibold now sit in a call of their own, named into the same family.
- **Motion only where it's used:** its provider moved from the root layout into the script switch, so pages without the switch load no Motion. The homepage's and Questionnaire's JavaScript fell from 174 to 141 kB.
- **Interaction latency:** `tests/e2e/latency.spec.ts` times a press on "Explore Concepts" and both presses of the "Devanagari first" switch with the Event Timing API, on a CPU slowed four times. On its own a press takes 16–72 ms. Run alongside other tests, a visit can take 200–320 ms: the four workers each slow their own Chrome and fight over the CPU. So each visit's slowest press counts, and the quickest of up to three fresh visits must be under 200 ms. A 300 ms click handler still fails every visit (336–432 ms).
- **Fonts spec:** `tests/e2e/fonts.spec.ts` checks that each page preloads only its running-text and heading fonts, and that italic and semibold text gets its own faces. It fails if the separate call is lost, which would otherwise go unnoticed.
- Decisions the spec left open:
  - The latency check runs at phone width only (chromium-360). The 4× CPU stands for a phone, and it keeps throttled browsers out of the other widths' runs.
  - No existing test changed.

**Measurements**, from the final `pnpm lhci` (medians of three runs, mobile profile, machine load average 11–21):

| Page | LCP | CLS | TBT | Performance | Fonts downloaded | JavaScript (gzip) |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 4.30 s | 0 | 196 ms | 0.80 | 384 kB: Display Medium 66, Text Regular 66, Italic 76, SemiBold 66, Tiro 110 | 141 kB in 6 files (465 kB raw) |
| `/concepts/vikshepa` | 4.70 s | 0 | 206 ms | 0.76 | 384 kB, the same five | 219 kB in 10 files (678 kB raw), with Base UI, the switch and Motion |
| `/questionnaires/karmayoga-scale` | 3.62 s | 0 | 159 ms | 0.87 | 274 kB, the four Playfair cuts (no Devanagari, so no Tiro) | 141 kB in 6 files (465 kB raw) |
| 404 (Lighthouse won't audit it) | | | | | 274 kB | 139 kB, plus 58 kB prefetched for its "Read about Vikṣepa" link |

Accessibility is 1.0 on all three. A second `pnpm lhci` on the committed code, run straight after the Playwright suite, gave LCP 4.08 / 4.24 / 3.50 s, TBT 163 / 258 / 118 ms, CLS 0 and performance 0.81 / 0.77 / 0.89.

Animations, all only under `prefers-reduced-motion: no-preference` (none under reduce; Firefox gets no scroll-driven ones):

- Every page: the logo redraws on hover and focus (stroke offset, 0.7 s); link underlines draw (transform, or background size in running text); page-turns between pages (transform and opacity, 320 ms), with the card title's morph.
- Homepage: the opening kolam draws once on load (1.6 s) and drifts on the root scroll timeline (transform); two bands and six Contents knots draw on scroll; ink spreads on both calls to action (clip-path and opacity, 400 ms); cards deboss when pressed; in-page links glide.
- Concept page: the reading thread (scaleX on the root scroll timeline); the ornament rule draws in on scroll (scaleX); the script switch's spellings trade places (view transition, 320 ms) and its knob springs (Motion); the References knot turns and its dot swells, and the list fades; the "Also spelled" popover fades and scales.
- Questionnaire page: the reading thread.
- 404: a small kolam draws once on load; ink spreads on "Go to the homepage".
- Lighthouse lists only the kolam line draws as non-composited (SVG stroke offsets, which the spec allows).

**Left over: LCP misses on every page, and TBT on the Concept page is borderline.**

- Why: Lighthouse simulates LCP on slow 4G from every file that finished before the first paint of an unthrottled load. On this machine that paint comes 200–260 ms in, because the first style and layout spend about 100 ms matching fonts. By then every font the page uses has arrived, so each 100 kB of font adds about 0.5 s of LCP. Neither step changes those bytes, only when the same files are fetched. Text Regular has to be there at first paint: without its preload it swaps in late and shifts the Questionnaire's folio (CLS 0.20).
- The motion isn't the cause. With no web fonts at all (and all the motion), LCP medians are 2.07 / 1.94 / 2.06 s. With only the two preloaded cuts downloaded, they're 3.05 / 3.22 / 2.68 s.
- Options, each a decision beyond this ticket:
  1. Smaller Playfair files: drop the OpenType features the CSS never uses (keeping kerning, ligatures, mark positioning and small caps) and narrow Latin Extended Additional to the transliteration letters. Each cut goes from 66–76 kB to 43–49 kB. Measured: LCP 3.20 / 4.10 / 3.16 s, so not enough alone, and it reopens ticket 07's coverage choice.
  2. Load the italic, semibold and Tiro after the first paint with a small script. They'd leave the simulated LCP, but first visits would see them swap in; the two preloaded cuts alone still measure about 2.7–3.2 s.
  3. Fewer cuts at first paint, a design decision.
  4. Revisit the lab budget itself. Lighthouse assumes every font that arrived before the first paint held it up, which a swap font doesn't: the text paints in the fallback first. Field LCP after launch would show what visitors get, but it can't gate a pull request.
- TBT on the Concept page sits around the 200 ms line here: 194–208 ms in one run, 182–293 ms in the next, under heavier load. Its long task is the app starting up: compiling and running React, Next.js and the page's client code (55–65 ms, simulated at four times). Less JavaScript at start-up is the only lever; the other two pages stay at 104–234 ms.
- `.lighthouseci/` holds the reports locally (git-ignored).

**Second pass, 2026-10-28. Still not resolved: the Concept page passes `pnpm lhci` in only some runs (see Left over).** Format, lint, typecheck, 69 unit tests, the build and the Playwright suite (368 passed, 7 skipped by design) pass on the final code. `pnpm lhci` on it passed 3 runs in 9. Every failure was the Concept page: its LCP in five runs (2.63–2.80 s) and its TBT in two (282 and 355 ms), one run failing both. The homepage and Questionnaire passed in all nine. This section replaces the first pass's font notes and measurements.

- **Fonts, a step past the spec's two:** only Text Regular is preloaded. Display Medium, the italic, the semibold and Tiro are added by a small inline script (`LateFonts`) once the first text is painted, so Lighthouse no longer counts them towards LCP. Until then headings are set in Text Regular, italic and semibold text in Regular slanted or thickened, and Devanagari in a system font. Swapping them in moves nothing measurable (at most 0.0015 layout shift at 320–1440 px), and the existing "nothing shifts" checks still pass. The italic and semibold join together, at one relayout. Only pages with Devanagari fetch Tiro.
- **Smaller Playfair cuts:** `scripts/fonts/subset.py` keeps the OpenType features browsers apply by default, plus small caps in the text cuts; figure styles, swashes and stylistic sets go. Regular 66 → 49 kB, Italic 76 → 55, SemiBold 66 → 50, Display Medium 66 → 36. Coverage is unchanged, and sample text with ligatures, kerning, IAST marks and small caps renders pixel for pixel as before.
- **Motion:** the switch's knob is a lazy component (`SwitchKnob`), so Motion is out of the Concept page's first scripts (219 → 182 kB). Its features still follow in a script of their own: together they ran as one 26 ms task.
- Decisions the spec left open:
  - Display Medium leaves the preload too, though the spec's step 1 kept it: with it, the homepage's and Questionnaire's slow runs were over 2.5 s. The fonts spec now checks the single preload, that no other font is asked for before the first paint, and that headings, italic, semibold and Devanagari then get their own faces (two of its checks now wait for faces that arrive later).
  - Tiro swaps in once loaded instead of using `font-display: optional` (step 2). Loaded after the first paint, it can no longer hold up the text, and `optional` would leave most first visits in the system font.
  - Base UI's popover and accordion stay in the first scripts. Loaded after start-up, a press that lands before their script arrives does nothing; a test caught it.

**Measurements**, from the last 5 `pnpm lhci` runs of the final code, 15 loads per page (mobile profile, load average 10–23):

| Page | LCP, median (range) | CLS | TBT, median (range) | Performance | Fonts: before first paint / in all | JavaScript (gzip) |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 2.33 s (1.68–2.40) | 0 | 144 ms (89–192) | 0.97 (0.96–0.99) | 50 / 302 kB | 139 kB in 6 files (465 kB raw) |
| `/concepts/vikshepa` | 2.64 s (1.85–2.85) | 0.001 | 186 ms (126–355) | 0.94 (0.90–0.97) | 50 / 302 kB | 182 kB in 8 files (588 kB raw) |
| `/questionnaires/karmayoga-scale` | 2.20 s (1.51–2.36) | 0.001 | 143 ms (113–245) | 0.98 (0.94–0.99) | 50 / 192 kB (no Devanagari, so no Tiro) | 139 kB in 6 files (465 kB raw) |

Font sizes are as transferred: Text Regular 50 kB, Italic 56, SemiBold 50, Display Medium 37, Tiro 110. Accessibility is 1.0 on all three. The animations are as listed in the first pass; the knob still springs.

**Left over: the Concept page's LCP is 1.85–2.35 s in 6 of the 15 loads and 2.5–2.85 s in the other 9, and its TBT sits near the line.**

- Why the LCP splits: on a local load every script has downloaded before the first paint, and Lighthouse counts one towards LCP when it also began running before that paint reached the screen. The app's start-up script begins within a few milliseconds of that moment, either side. When it is before, its bytes and its 50 ms of start-up count, about 0.5 s more. The Concept page is the heaviest (20 kB of HTML, 182 kB of script), so that tips it over 2.5 s; the homepage and Questionnaire stay under it either way (at most 2.40 s).
- TBT: the Concept page's start-up (React and Next.js starting and hydrating a long page) is one task of 160–260 ms in Lighthouse's model, which alone adds 110–210 ms of TBT. With the page's own tasks after the first paint, which grow under heavier load, 6 of the 15 loads went over 200 ms, and twice that was the load lhci judges by.
- The machine makes both worse and less steady: eight stuck `ssh-add` processes, started on 25–27 October, each keep one of its eight cores fully busy, so the browser's work runs about twice as slow.
- Options, each a decision beyond this ticket:
  1. Stop the stuck `ssh-add` processes and run the done-check again.
  2. Load Base UI's popover and accordion after start-up (Concept scripts 182 → about 142 kB). Lighthouse's own model puts the slow runs at about 2.5 s then, still not a sure pass, and an early press would be lost.
  3. Revisit the lab budget for long pages.
