# 01: Lane-safe test environment

Status: resolved
Blocked by: [foundation ticket 05](../../front-end-foundation/issues/05-performance-budgets.md) resolved, and [content-v1](../../content-v1/spec.md) merged into the integration branch `SiddharthMuramkar/frontend`
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §E1

**What to build:** several agents can test the site at the same time on one machine without tripping over each other.

- Each lane (a ticket built in its own git worktree) runs its own production server on its own port and never tests another lane's server by mistake.
- Heavy steps, Playwright and Lighthouse, queue behind one shared lock, so the machine is never overloaded.
- One command, `pnpm check`, runs every fast check; `pnpm check:e2e` runs the browser tests.
- Tests wait until React has attached its handlers before they click, so they don't fail at random under load.
- A conventions doc tells every later agent how motion, links, files and slots work on this site.

Nothing a visitor sees changes.

## Owns

- `playwright.config.ts`
- `lighthouserc.cjs`
- `package.json`: the `scripts` block only, with no dependency changes
- `scripts/lane/**` (new), including `scripts/lane/heavy.sh`
- `tests/e2e/fixtures.ts` (new): `gotoReady()` and the shared `test` export
- the hydration marker: one small client component in `src/components/` (for example `src/components/HydrationMarker.tsx`), and the one line in `src/app/layout.tsx` that mounts it
- the existing end-to-end specs, only to switch them to `gotoReady()`
- `.github/workflows/ci.yml`
- `README.md`: the Checks section
- `docs/agents/frontend-conventions.md` (new), and a one-line pointer to it in `AGENTS.md`
- `vitest.config.ts`: the global `testTimeout` only

## Acceptance criteria

- [x] **Ports from the environment:**
  - Playwright's server port comes from `E2E_PORT` (default 3100) and Lighthouse's from `LHCI_PORT` (default 3200).
  - `E2E_PORT=3110 pnpm check:e2e` and `LHCI_PORT=3210 pnpm lhci` start and test servers on those ports, and nothing on 3100 or 3200 is touched.
  - The lane ports, 3110, 3120 and 3130 for Playwright and 3210, 3220 and 3230 for Lighthouse, are listed in the README.
- [x] **No accidental reuse:**
  - A run starts its own server unless `E2E_REUSE=1`.
  - With `E2E_REUSE` unset and the port already taken, the run fails at once with a message naming the port. It never tests whatever happens to be listening there.
- [x] **Knobs:**
  - `E2E_WORKERS` sets the worker count (default 4).
  - `E2E_RETRIES` sets retries (default 0 locally, 1 in CI), and a retried test keeps its trace.
  - `E2E_SCOPE=sample|full` (default `full`) is read by one helper in the fixtures, so the specs that loop over routes can use it. Until ticket 02 switches those specs to the route registry, both scopes run the foundation's pages.
  - `E2E_ONLY` takes a comma-separated list of spec names, such as `concept,questionnaire`, and runs only those files.
  - Each knob is described in the README.
- [x] **Heavy-step lock:**
  - `scripts/lane/heavy.sh <command…>` runs the command under `flock /tmp/care4mind-heavy.lock`, prints a line while it waits for the lock, and passes the command's exit code through.
  - Two runs started together execute one after the other. Check this once by hand and note the result in Comments.
- [x] **One fast check:**
  - `pnpm check` runs, in order and stopping at the first failure: the content registry check (content-v1's `--check` mode), lint, format check, typecheck, unit tests and the production build.
  - `pnpm check:e2e` runs the Playwright suite against that build and builds nothing itself.
- [x] **Hydration marker:**
  - Once React has hydrated, `<html>` carries `data-hydrated`. It is absent from the server-rendered HTML, and with JavaScript off the pages are unchanged.
  - `gotoReady(page, path)` navigates and waits for the marker.
  - Every existing spec that clicks, types or presses keys navigates with `gotoReady()`.
  - Specs that run with JavaScript disabled don't wait for the marker.
- [x] **CI:**
  - The workflow runs `pnpm check`, then `pnpm check:e2e` with `E2E_SCOPE=full`, including WebKit on Ubuntu, then Lighthouse.
  - The Playwright and Lighthouse reports are still uploaded as artifacts.
- [x] **Conventions doc:** `docs/agents/frontend-conventions.md` is written for agents (short, imperative, one rule per line, each with its reason) and records:
  - **page turns:** forward for links that go deeper or onward, back for breadcrumbs and "previous", untyped for header, footer and menu links, all set through `Link`'s `transitionTypes`;
  - **ink:** `data-ink` opts a control into the ink spread, and one delegated listener handles it;
  - **Kolam behaviours:** still, draw on load, draw on scroll and redraw on hover; the finished drawing is the default, and animation sits only inside `prefers-reduced-motion: no-preference`;
  - **what's banned:** scroll and resize listeners, observers and new uses of Motion; only transform, opacity, clip-path and SVG stroke offsets animate;
  - **colours:** only as tokens in `globals.css`, which ticket 04 owns;
  - **links and content:** `hrefFor()` for every internal link; `@/content` only, with types only in client components;
  - **files:** ownership by ticket, and asking in Comments for anything a lane doesn't own;
  - **shared pieces:** the slots ticket 04 adds, the feature flags, and the view-transition names (`concept-title-<slug>`, `topic-title-<slug>`, `work-title-<slug>`, `questionnaire-title-<slug>`);
  - **lane commands:** ports, the lock, `E2E_SCOPE` and the done-check.
- [x] **Pointer:** `AGENTS.md` gets a one-line pointer to the conventions doc.
- [x] **Unit tests under load:** `vitest.config.ts` sets a global `testTimeout` of 30 s, so the whole-content tests don't pass Vitest's 5-second default while three lanes build at once.
- [x] **No test weakened:** every existing test still runs and still asserts what it did.
- [x] **Done-check:** the current full command list from the foundation tickets passes:
  - `node scripts/content/registry.mjs --check` (or whichever script name content-v1 gave the registry check), `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` and `pnpm build`;
  - `pnpm test:e2e` with the projects chromium-360, chromium-768, chromium-1440, reflow-320, reduced-motion and firefox-360 (WebKit runs in CI only);
  - `CHROME_PATH=/usr/bin/google-chrome pnpm lhci`.

  Then the new commands give the same results: `pnpm check`, `E2E_PORT=3110 scripts/lane/heavy.sh pnpm check:e2e` and `LHCI_PORT=3210 CHROME_PATH=/usr/bin/google-chrome scripts/lane/heavy.sh pnpm lhci`.

## Comments

**From content-v1, 2026-10-28:** with three lanes running, whole-content unit tests (the views' JSON round trip, the routes of the real content, the first questionnaire-form test) passed Vitest's 5-second limit at a load average of 17–28. Each passed alone. The global `testTimeout` above is the fix content ticket 12 suggested.

**Built, 2026-10-28:**

- `playwright.config.ts` reads `E2E_PORT`, `E2E_REUSE`, `E2E_WORKERS`, `E2E_RETRIES`, `E2E_SCOPE` and `E2E_ONLY`, and `lighthouserc.cjs` reads `LHCI_PORT`. A value a knob can't use (port `abc`, `E2E_SCOPE=smaple`, an unknown spec name) stops the run before it starts, saying what the knob takes.
- Playwright checks its server by port, so anything listening counts: a Next server or a bare TCP listener on 3110 stopped a run within a second ("http://localhost:3110 is already used"), and `E2E_REUSE=1` tested the server there instead.
- Lighthouse had the same hole, worse: lhci matches its ready pattern ignoring case, and "Ready" matched "address already in use" in Next's error, so with its port taken it audited whatever answered there (shown with lhci's own helper). Collect now stops at once on a taken port, naming it, and the pattern is `\bReady in\b`.
- `scripts/lane/heavy.sh` runs a command under `flock /tmp/care4mind-heavy.lock`, names the holder while it waits, and passes the exit status through. The command's processes don't inherit the lock, so a server left running can't hold up the queue.
- Checked by hand: started together at 09:35:02, `pnpm check:e2e` on 3110 took the lock and `pnpm lhci` on 3210 printed "waiting for /tmp/care4mind-heavy.lock, held by: pnpm check:e2e (pid …, since 09:35:02)", then started at 09:37:23, as the first ended. Both passed.
- `HydrationMarker` sets `data-hydrated` on `<html>` in an effect, and `gotoReady()` waits for it. The server's HTML never has it, and with JavaScript off nothing changes: 16 full-page screenshots (four pages, 360 and 1440 px, JavaScript on and off) are byte-identical with and without it. It adds 34 bytes of gzipped JavaScript to an existing file and about 35 bytes of HTML a page.
- Every spec takes `test` and `expect` from `fixtures.ts`; specs that press anything open pages with `gotoReady()`, and the JavaScript-off block keeps `page.goto`. Outside the spec files, `openOnSlowPhone` in `tests/e2e/latency.ts` uses it too.
- CI is one job: write the registry (`pnpm check` only checks it), `pnpm check`, `pnpm check:e2e` with `E2E_SCOPE=full` and WebKit, then `pnpm lhci` on the same build (even after a failed browser test). Both reports are uploaded.

Decisions the spec left open:

- `E2E_WORKERS` also takes a share of the cores; CI sets `50%`, what it ran with before on GitHub's smaller runner.
- The WebKit project exists only when `CI` is set, so local runs need no `--project` flags.
- Traces use `retain-on-failure-and-retries`: a throwaway test that failed once and passed on retry kept both traces.
- `fixtures.ts` offers `e2eScope()` and `inScope(entries)`. No spec loops through them yet, so both scopes run the foundation's pages until ticket 02 uses `inScope(site.routes())`.
- The marker is a plain effect: React hydrates the whole page in its first pass here (the pages' Suspense boundaries are empty or hold the lazy knob), and React 19 hydrates and replays a click that lands on a part not yet hydrated.

Done-check, all green on the committed code:

- `node scripts/content/registry.mjs --check`, lint, format check, typecheck, `pnpm test` (574 passed) and `pnpm build`; `pnpm test:e2e` on 3100 with the six local projects: 395 passed, 7 skipped by design; `pnpm lhci` on 3200: median LCP 2.31 / 2.45 / 2.18 s, TBT 131–147 ms, CLS ≤ 0.001, accessibility 1.0.
- `pnpm check` in 49 s; `pnpm check:e2e` on 3110: the same 395 and 7, in 2.3 min; `pnpm lhci` on 3210: median LCP 2.16 / 2.16 / 2.30 s, TBT 118–156 ms.
- With request-counting servers on 3100 and 3200, runs on 3110 and 3210 passed and sent them nothing.

For the conventions doc (ticket 15):

- Never delete the lock file to unstick the queue: a new file lets two runs overlap. The waiting line names the holder.
- A ready pattern for lhci must match a whole word: lhci ignores case, and error text can contain the word.

Left over:

- This workflow hasn't run on GitHub yet (lanes don't push). One job takes longer than the three parallel ones did, but builds once and tests that build the way lanes do.
- A fresh worktree's first `pnpm check` stops at the registry check until `node scripts/content/registry.mjs` has run once; the README and the conventions doc say so.
