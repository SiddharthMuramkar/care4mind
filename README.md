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

Two commands run everything. Every ticket finishes with them, and so does CI.

| Command | What it runs |
| --- | --- |
| `pnpm check` | The fast checks, in order, stopping at the first failure: the content registry check (`node scripts/content/registry.mjs --check`), lint, format check, typecheck, unit tests and the production build. |
| `pnpm check:e2e` | The browser tests, against the build `pnpm check` made. It builds nothing itself. |

Each check also runs on its own:

| Command | What it checks |
| --- | --- |
| `pnpm lint` | ESLint: Next.js, React, accessibility (jsx-a11y) and TypeScript rules |
| `pnpm format:check` | Prettier formatting (`pnpm format` fixes it) |
| `pnpm typecheck` | TypeScript, strict |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright at 360, 768 and 1440 px, axe at WCAG 2.2 AA (including the `wcag22aa` rules), noindex on every page, reflow at 320 px, reduced motion, and a Firefox smoke run (WebKit too, in CI). It builds nothing: run `pnpm build` first. |
| `pnpm lhci` | Lighthouse CI on a throttled mobile profile, with the build served over HTTP/2 and TLS as Vercel serves it: LCP ≤ 2.5 s, CLS ≤ 0.1, Total Blocking Time ≤ 200 ms (standing in for INP) |

The registry the content module reads is generated, never committed. `pnpm dev`, `build`, `typecheck`, `test` and `test:e2e` write it first; `pnpm check` only checks it, so in a fresh checkout run `node scripts/content/registry.mjs` once.

The first time, install the test browsers with `pnpm exec playwright install chromium firefox webkit`. WebKit needs Ubuntu's system libraries, so the suite runs it in CI only.

### Testing side by side

Several agents can test at once on one machine, each in its own git worktree, called a lane. Each run starts its own production server on its own port and never tests another lane's.

| Port | Playwright (`E2E_PORT`) | Lighthouse (`LHCI_PORT`) |
| --- | --- | --- |
| Main worktree (the default) | 3100 | 3200 |
| Lanes | 3110, 3120 and 3130 | 3210, 3220 and 3230 |

A Lighthouse run also takes the port after its own (3201, 3211, …), for `next start` behind its HTTP/2 server.

Playwright and Lighthouse are heavy, so they take turns: run them through `scripts/lane/heavy.sh`, which queues them behind one lock (`flock` on `/tmp/care4mind-heavy.lock`). A run that has to wait says so, and the command's exit status comes back unchanged.

```bash
E2E_PORT=3110 scripts/lane/heavy.sh pnpm check:e2e
LHCI_PORT=3210 scripts/lane/heavy.sh pnpm lhci
```

`pnpm check:e2e` and `pnpm test:e2e` read these settings, and stop before starting if one can't be used:

| Variable | Default | What it does |
| --- | --- | --- |
| `E2E_PORT` | `3100` | The port of the server the run starts and tests. |
| `E2E_REUSE` | off | `1` tests a server already on the port instead of starting one. Otherwise a taken port stops the run at once ("http://localhost:3110 is already used"). |
| `E2E_WORKERS` | `4` | How many tests run at once: a number, or a share of the CPU cores such as `50%`. |
| `E2E_RETRIES` | `0`, and `1` in CI | How often a failed test is tried again. A failed run keeps its trace, and so does each retry. |
| `E2E_SCOPE` | `full` | `full` tests every route; `sample` tests one route of each kind. Every spec runs either way; specs that loop over routes choose them with `inScope()` from `tests/e2e/fixtures.ts`. |
| `E2E_ONLY` | all specs | Spec names, comma-separated: `E2E_ONLY=concept,questionnaire` runs only `tests/e2e/concept.spec.ts` and `questionnaire.spec.ts`. |
| `LHCI_PORT` | `3200` | The port of the server `pnpm lhci` starts; `next start` takes the one after it. A taken port stops it at once, naming the port. |
| `LHCI_HTTP` | `2` | `2` serves the build over HTTP/2 with TLS, as Vercel does; `1.1` serves it from `next start` alone, plain HTTP/1.1 on `LHCI_PORT`, to compare. |

Why HTTP/2: Lighthouse doesn't slow the page down as it loads. It loads it at full speed, then works out how long the same files would take on slow 4G (its "simulated throttling", called Lantern), and it models HTTP/1.1 and HTTP/2 differently. Over plain HTTP/1.1, which is all `next start` speaks, it opens six connections that each pay their own handshake and share the bandwidth, and React's 72 kB script waits for the first stylesheet's connection. So whether that stylesheet fit in one round trip (about 4.3 kB) moved the Concept page's LCP by 150 ms, and any CSS a ticket added could tip it over 2.5 s. Visitors get HTTP/2 over TLS from Vercel, which Lantern models as one connection carrying every file in turn at the whole bandwidth, after one more round trip for the TLS handshake. `pnpm lhci` measures that: `scripts/lhci/h2-server.mjs` answers over HTTP/2 with a certificate made at start-up, and passes each request to `next start` unchanged. Size still counts: every 30 kB or so more that a page loads before its largest paint costs one more 150 ms round trip. Only the cliff at the first stylesheet's 4.3 kB is gone.

GitHub Actions (`.github/workflows/ci.yml`) runs `pnpm check`, then `pnpm check:e2e` with `E2E_SCOPE=full`, WebKit included, then `pnpm lhci` on the same build, on every pull request and every push to `main`. Reports from Playwright and Lighthouse are attached to each run as artifacts.

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
