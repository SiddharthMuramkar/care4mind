# 17: Review aid: pnpm shots

Status: resolved
Blocked by: none
Spec: [Front-end site: every public page](../spec.md) · Design: [design.md](../design.md) §F

**What to build:** one command that screenshots a page of each kind, so every later lane, the review and the finish can look at the site the same way.

- `pnpm shots` photographs the route registry's sample routes, one per kind, at phone and desktop width.
- It starts the built site on its own port if nothing is running there, and stops it afterwards.
- It prints the files it wrote, so an agent can open exactly those.

This ticket carves the `pnpm shots` criterion out of ticket 15, which now waits for it.

## Owns

- `scripts/shots.mjs` (new)
- its unit test, `tests/unit/shots.test.ts` (new)
- `package.json`: the `shots` script
- `.gitignore`: a `.shots/` line
- `docs/agents/frontend-conventions.md`: a short "Screenshots" paragraph

## Acceptance criteria

- [x] **What it shoots:**
  - `pnpm shots` writes a JPEG (quality 70) of each sample route in `site.routes()` (the entries marked `sample`, one per kind) at 360×800 and 1440×900.
  - It reads the routes from the route registry, reusing `@/content` and the existing helpers, never a second list of routes.
  - Only the viewport by default; `--full` shoots whole pages.
  - Reduced motion is off by default; `--reduced` turns it on, and `--both` shoots each page both ways.
- [x] **Files:**
  - Each lands in `.shots/<route-slug>-<width>[-reduced].jpg`: the path's parts joined by hyphens, `home` for `/` (`.shots/home-360.jpg`, `.shots/concepts-vikshepa-1440-reduced.jpg`).
  - `.shots/` is git-ignored.
  - The command prints each file it wrote, one per line, and nothing else on success.
- [x] **Options:**
  - `--only` takes route paths or kinds, comma-separated (`--only /,concept`); an unknown path or kind stops it, naming what it takes.
  - `--widths` overrides the widths (`--widths 320,768`).
- [x] **Its server:**
  - It uses `SHOTS_PORT` (default 3100).
  - If something already listens there, it shoots that server.
  - Otherwise it starts `pnpm start -p $SHOTS_PORT` and stops it afterwards, also when a shot fails.
  - With no build (`.next/` missing), it says so plainly, names `pnpm build`, and exits non-zero.
- [x] **Ready before the shot:** each page waits for its fonts (`document.fonts.ready`) and for `html[data-hydrated]`, as `gotoReady()` does, before the screenshot.
- [x] **No new dependency:** it uses Playwright, which the repo has.
- [x] **Unit test:** the parts with no browser (the argument parsing, the `--only` filter over a registry, the file names) are tested in `tests/unit/shots.test.ts`.
- [x] **Conventions doc:** a short "Screenshots" paragraph in `docs/agents/frontend-conventions.md` says what `pnpm shots` writes, its options, `SHOTS_PORT`, and to open only the files it printed.
- [x] **Done-check:**
  - `pnpm check` passes;
  - `SHOTS_PORT=<port> pnpm shots --only /` writes `.shots/home-360.jpg` and `.shots/home-1440.jpg` and prints both paths.

## Comments

**2026-10-28, a note for the lane:** the registry is TypeScript behind the `@/content` alias, which plain Node can't import from a `.mjs` file. Playwright's loader resolves it already (`tests/e2e/routes.ts` imports `site` from `@/content`), so reach the registry through that loader or another tool the repo already has, not through a copied list of routes. Say in your summary how you did it.

**2026-10-28, the lane (built):**

- **What it is:** `scripts/shots.mjs` (`pnpm shots`), its pure part (`parseArgs`, `planShots`) tested in `tests/unit/shots.test.ts` (10 tests: the default plan, `--only` paths and kinds, de-duplication, unknown paths/kinds/options, `--widths`, `--reduced`/`--both`, `--full`, and over the real registry one shot per kind and a distinct file for every route). `package.json` gains `shots`; `.gitignore` gains `/.shots/`; the conventions doc gains a "Screenshots" section.
- **How it reaches the registry:** through Vite, which the repo has for Vitest. `runnerImport()` loads a two-line virtual module (`import { site } from '<repo>/src/content/index.ts'; export default await site.routes()`) with `resolve.tsconfigPaths`, so `@/content` resolves from `tsconfig.json` like everywhere else. The routes have to be read inside that import: the content source loads its records lazily and Vite's runner closes when the import ends. No port, no files written; about 2–4 s.
- **Decisions the ticket left open:**
  - It prints absolute paths (an agent's file viewer wants them); pnpm's own `$ node scripts/shots.mjs` line goes to stderr, so stdout is only the files.
  - Ready before the shot: `html[data-hydrated]` (15 s), then network idle (≤ 5 s, so the faces LateFonts adds after first paint have arrived: `document.fonts.ready` alone misses them, as they join `document.fonts` only once loaded), then `document.fonts.ready`, then the opening animations on the document timeline finish (≤ 5 s). Scroll-driven drawings stay where the scroll has them, as a reader sees them.
  - Heights for `--widths`: under 768 px 800 tall, under 1024 px 1024, else 900, matching the e2e projects (360×800, 768×1024, 1440×900).
  - `--only` accepts a path with or without its trailing slash; a kind gives its sample route; a path may be any route, not only a sample. An unknown item names every kind in this build's registry and says a switched-off feature has no routes.
  - A fresh browser context per shot, four at once, printed in plan order. The default 32 shots take about 9 s, `--only /` about 6 s, including starting and stopping `next start`.
  - On a failed shot it starts no more, prints the files it did write, names the failure on stderr, stops its server and exits 1; a 404 asks whether the build had this run's `FEATURE_*` variables. Bad options exit 2 with the usage. Ctrl-C stops its server too (it runs in its own process group).
  - "No build" is `.next/BUILD_ID` missing (a dev run leaves `.next/` without one), checked only when it must start a server, before the registry loads.
- **Checked by hand:** `SHOTS_PORT=3120 pnpm shots --only /` wrote and printed `.shots/home-360.jpg` and `.shots/home-1440.jpg` and freed the port; with a server already on 3120 it shot that and left it running; a forced write failure stopped its server and exited 1; `--full` wrote a 360×40152 page; with no build it named `pnpm build` and exited 1.
- **For ticket 15:** `pnpm shots` isn't routed through `scripts/lane/heavy.sh` in the conventions paragraph (it is light: one Chromium, four pages); fold that in if you'd rather it queued.

**2026-10-28, the check:**

- **Checked against the code and by hand on port 3120:** `--only /` wrote and printed `.shots/home-360.jpg` and `.shots/home-1440.jpg` (absolute paths, nothing else on stdout: pnpm's own `$ node scripts/shots.mjs` line goes to stderr) and left the port free; with a server already on the port it shot that and left it running; a failed shot (`.shots` made a file) stopped its server and exited 1; with no `.next/BUILD_ID` it named `pnpm build` and exited 1. The shots of `/` and `/concepts/ahimsa/` show the pages hydrated, in their late fonts, with the Fleuron drawn. `pnpm check` and the sample e2e run pass.
- **Fixed:** a Ctrl-C while `next start` was still starting could leave that server running: the signal handlers went in only once it answered (in a try it died writing to the closed pipe, which is luck, not design). `startServer()` now only spawns it, the handlers go in at once and `ready()` waits; an interrupted run now exits 130 with the port free.
- **Polished:** an unknown `--only` item now reads "“x” is no route path or kind here.", not "“x” is neither."
- **For ticket 15:** nothing beyond the lane's note above; the "Screenshots" section is in the conventions doc. No tests changed.
