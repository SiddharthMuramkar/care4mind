# 01: Lane-safe test environment

Status: ready-for-agent
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

## Acceptance criteria

- [ ] **Ports from the environment:**
  - Playwright's server port comes from `E2E_PORT` (default 3100) and Lighthouse's from `LHCI_PORT` (default 3200).
  - `E2E_PORT=3110 pnpm check:e2e` and `LHCI_PORT=3210 pnpm lhci` start and test servers on those ports, and nothing on 3100 or 3200 is touched.
  - The lane ports, 3110, 3120 and 3130 for Playwright and 3210, 3220 and 3230 for Lighthouse, are listed in the README.
- [ ] **No accidental reuse:**
  - A run starts its own server unless `E2E_REUSE=1`.
  - With `E2E_REUSE` unset and the port already taken, the run fails at once with a message naming the port. It never tests whatever happens to be listening there.
- [ ] **Knobs:**
  - `E2E_WORKERS` sets the worker count (default 4).
  - `E2E_RETRIES` sets retries (default 0 locally, 1 in CI), and a retried test keeps its trace.
  - `E2E_SCOPE=sample|full` (default `full`) is read by one helper in the fixtures, so the specs that loop over routes can use it. Until ticket 02 switches those specs to the route registry, both scopes run the foundation's pages.
  - `E2E_ONLY` takes a comma-separated list of spec names, such as `concept,questionnaire`, and runs only those files.
  - Each knob is described in the README.
- [ ] **Heavy-step lock:**
  - `scripts/lane/heavy.sh <command…>` runs the command under `flock /tmp/care4mind-heavy.lock`, prints a line while it waits for the lock, and passes the command's exit code through.
  - Two runs started together execute one after the other. Check this once by hand and note the result in Comments.
- [ ] **One fast check:**
  - `pnpm check` runs, in order and stopping at the first failure: the content registry check (content-v1's `--check` mode), lint, format check, typecheck, unit tests and the production build.
  - `pnpm check:e2e` runs the Playwright suite against that build and builds nothing itself.
- [ ] **Hydration marker:**
  - Once React has hydrated, `<html>` carries `data-hydrated`. It is absent from the server-rendered HTML, and with JavaScript off the pages are unchanged.
  - `gotoReady(page, path)` navigates and waits for the marker.
  - Every existing spec that clicks, types or presses keys navigates with `gotoReady()`.
  - Specs that run with JavaScript disabled don't wait for the marker.
- [ ] **CI:**
  - The workflow runs `pnpm check`, then `pnpm check:e2e` with `E2E_SCOPE=full`, including WebKit on Ubuntu, then Lighthouse.
  - The Playwright and Lighthouse reports are still uploaded as artifacts.
- [ ] **Conventions doc:** `docs/agents/frontend-conventions.md` is written for agents (short, imperative, one rule per line, each with its reason) and records:
  - **page turns:** forward for links that go deeper or onward, back for breadcrumbs and "previous", untyped for header, footer and menu links, all set through `Link`'s `transitionTypes`;
  - **ink:** `data-ink` opts a control into the ink spread, and one delegated listener handles it;
  - **Kolam behaviours:** still, draw on load, draw on scroll and redraw on hover; the finished drawing is the default, and animation sits only inside `prefers-reduced-motion: no-preference`;
  - **what's banned:** scroll and resize listeners, observers and new uses of Motion; only transform, opacity, clip-path and SVG stroke offsets animate;
  - **colours:** only as tokens in `globals.css`, which ticket 04 owns;
  - **links and content:** `hrefFor()` for every internal link; `@/content` only, with types only in client components;
  - **files:** ownership by ticket, and asking in Comments for anything a lane doesn't own;
  - **shared pieces:** the slots ticket 04 adds, the feature flags, and the view-transition names (`concept-title-<slug>`, `topic-title-<slug>`, `work-title-<slug>`, `questionnaire-title-<slug>`);
  - **lane commands:** ports, the lock, `E2E_SCOPE` and the done-check.
- [ ] **Pointer:** `AGENTS.md` gets a one-line pointer to the conventions doc.
- [ ] **No test weakened:** every existing test still runs and still asserts what it did.
- [ ] **Done-check:** the current full command list from the foundation tickets passes:
  - `node scripts/content/registry.mjs --check` (or whichever script name content-v1 gave the registry check), `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` and `pnpm build`;
  - `pnpm test:e2e` with the projects chromium-360, chromium-768, chromium-1440, reflow-320, reduced-motion and firefox-360 (WebKit runs in CI only);
  - `CHROME_PATH=/usr/bin/google-chrome pnpm lhci`.

  Then the new commands give the same results: `pnpm check`, `E2E_PORT=3110 scripts/lane/heavy.sh pnpm check:e2e` and `LHCI_PORT=3210 CHROME_PATH=/usr/bin/google-chrome scripts/lane/heavy.sh pnpm lhci`.

## Comments
