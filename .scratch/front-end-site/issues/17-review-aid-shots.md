# 17: Review aid: pnpm shots

Status: ready-for-agent
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

- [ ] **What it shoots:**
  - `pnpm shots` writes a JPEG (quality 70) of each sample route in `site.routes()` (the entries marked `sample`, one per kind) at 360×800 and 1440×900.
  - It reads the routes from the route registry, reusing `@/content` and the existing helpers, never a second list of routes.
  - Only the viewport by default; `--full` shoots whole pages.
  - Reduced motion is off by default; `--reduced` turns it on, and `--both` shoots each page both ways.
- [ ] **Files:**
  - Each lands in `.shots/<route-slug>-<width>[-reduced].jpg`: the path's parts joined by hyphens, `home` for `/` (`.shots/home-360.jpg`, `.shots/concepts-vikshepa-1440-reduced.jpg`).
  - `.shots/` is git-ignored.
  - The command prints each file it wrote, one per line, and nothing else on success.
- [ ] **Options:**
  - `--only` takes route paths or kinds, comma-separated (`--only /,concept`); an unknown path or kind stops it, naming what it takes.
  - `--widths` overrides the widths (`--widths 320,768`).
- [ ] **Its server:**
  - It uses `SHOTS_PORT` (default 3100).
  - If something already listens there, it shoots that server.
  - Otherwise it starts `pnpm start -p $SHOTS_PORT` and stops it afterwards, also when a shot fails.
  - With no build (`.next/` missing), it says so plainly, names `pnpm build`, and exits non-zero.
- [ ] **Ready before the shot:** each page waits for its fonts (`document.fonts.ready`) and for `html[data-hydrated]`, as `gotoReady()` does, before the screenshot.
- [ ] **No new dependency:** it uses Playwright, which the repo has.
- [ ] **Unit test:** the parts with no browser (the argument parsing, the `--only` filter over a registry, the file names) are tested in `tests/unit/shots.test.ts`.
- [ ] **Conventions doc:** a short "Screenshots" paragraph in `docs/agents/frontend-conventions.md` says what `pnpm shots` writes, its options, `SHOTS_PORT`, and to open only the files it printed.
- [ ] **Done-check:**
  - `pnpm check` passes;
  - `SHOTS_PORT=<port> pnpm shots --only /` writes `.shots/home-360.jpg` and `.shots/home-1440.jpg` and prints both paths.

## Comments

**2026-10-28, a note for the lane:** the registry is TypeScript behind the `@/content` alias, which plain Node can't import from a `.mjs` file. Playwright's loader resolves it already (`tests/e2e/routes.ts` imports `site` from `@/content`), so reach the registry through that loader or another tool the repo already has, not through a copied list of routes. Say in your summary how you did it.
