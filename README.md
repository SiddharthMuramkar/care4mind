# Care4Mind

The new Care4Mind.org: a portal for Indian psychology that links Concepts, traditional texts, References and Questionnaires. It replaces the current WordPress site. Why and how are in [docs/project-brief.md](docs/project-brief.md); decisions are in [docs/adr/](docs/adr/).

Built with Next.js 16 (App Router), React 19.3 and strict TypeScript ([ADR-0003](docs/adr/0003-nextjs-for-the-front-end.md)), styled with Tailwind CSS 4 tokens and CSS Modules, with Base UI for accessible parts and Motion for the few animations CSS can't do. It is hosted on Vercel.

## Run it

You need Node 22.12 or newer (CI and Vercel use Node 24, see `.nvmrc`) and pnpm, at the version pinned in `package.json`.

```bash
pnpm install
pnpm dev          # http://localhost:3000, reloads as you edit
pnpm build && pnpm start   # the production build
```

## Where things live

| Path | What |
| --- | --- |
| `src/app/` | Pages (one folder per URL) and the root layout |
| `src/components/` | Shared parts, each with its own `.module.css` |
| `src/content/` | **The content module.** Pages read content only through `@/content`. Today it reads typed files in this folder; when a content back end is chosen, these functions change and the pages don't. |
| `src/styles/globals.css` | Design tokens (`@theme`): colours, type, durations, easings. Every colour pair is checked for WCAG AA contrast by a unit test. |
| `src/fonts/` | Self-hosted font files and their licences (SIL OFL). Rebuild them with `scripts/fonts/subset.py`. |
| `src/config/site.ts` | Site settings, including `indexable`: the search-engine switch for launch. |
| `tests/unit/` | Vitest tests: Sanskrit normalisation, content integrity, contrast |
| `tests/e2e/` | Playwright tests: widths, accessibility (axe), noindex, reduced motion |

## Content rules

- Sanskrit is stored as NFC (one character per letter), with anusvara written ṃ, never ṁ. `normaliseSanskrit()` in `src/lib/sanskrit.ts` does both; a unit test fails if any content breaks the rule.
- IAST and Devanagari get their own `lang` tags (`sa-Latn`, `sa-Deva`). Use the `SanskritTerm` and `Shloka` components rather than writing the tags by hand.
- Every item carried over from the current site records where it came from and what was changed (`provenance` in its content file).

## Checks

| Command | What it checks |
| --- | --- |
| `pnpm lint` | ESLint: Next.js, React, accessibility (jsx-a11y) and TypeScript rules |
| `pnpm format:check` | Prettier formatting (`pnpm format` fixes it) |
| `pnpm typecheck` | TypeScript, strict |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright at 360, 768 and 1440 px, axe at WCAG 2.2 AA (including the `wcag22aa` rules), noindex on every page, reflow at 320 px, reduced motion, and a Firefox and WebKit smoke run. It builds nothing: run `pnpm build` first. |
| `pnpm lhci` | Lighthouse CI on a throttled mobile profile: LCP ≤ 2.5 s, CLS ≤ 0.1, Total Blocking Time ≤ 200 ms (standing in for INP) |

The first time, install the test browsers with `pnpm exec playwright install chromium firefox webkit`. WebKit needs Ubuntu's system libraries, so on other Linux systems run it in CI only.

GitHub Actions (`.github/workflows/ci.yml`) runs all of these on every pull request and on every push to `main`. Reports from Playwright and Lighthouse are attached to each run as artifacts.

To test a deployed preview instead of a local build, set `PLAYWRIGHT_BASE_URL` (and `VERCEL_AUTOMATION_BYPASS_SECRET` if the preview is protected).

Automated checks find only part of what matters. Before launch, also check by hand: keyboard-only use, a screen reader, zoom to 400%, every animation with "reduce motion" on, and a real low-end phone.

## Deploy

The repo is linked to a Vercel project:

- Every push to a branch, and every pull request, gets its own **preview deployment** at its own URL. Vercel comments the link on the pull request.
- A merge to `main` deploys **production**.
- Previews are protected: viewers need a Vercel login, or a **shareable link** made from the deployment's Share button.
- The project uses Node 24 and installs pnpm at the version in `package.json` (`ENABLE_EXPERIMENTAL_COREPACK=1`).

Until launch, every page tells search engines not to index it, with both a `robots` meta tag and an `X-Robots-Tag` header. Both come from `site.indexable` in `src/config/site.ts`. Flip it only as part of the launch cutover.

No custom domain is attached. care4mind.org and its DNS belong to the current site until launch.
