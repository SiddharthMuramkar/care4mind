# Care4Mind

The new care4mind.org: a portal for Indian psychology that links Concepts, traditional texts, References and Questionnaires. It replaces the current WordPress site.

- Why and what: [docs/project-brief.md](docs/project-brief.md). Decisions: [docs/adr/](docs/adr/). Words: [GLOSSARY.md](GLOSSARY.md).
- Work in progress lives in [GitHub Issues](https://github.com/SiddharthMuramkar/care4mind/issues). Coding agents follow [CLAUDE.md](CLAUDE.md).

## Run it

Node 22.15 or newer (CI and Vercel use 24) and the pnpm version pinned in `package.json`.

```bash
pnpm install
pnpm dev                            # http://localhost:3000
pnpm check                          # lint, types, unit tests and the production build
```

Every branch gets a Vercel preview, and `main` deploys production. Every page tells search engines not to index it until launch.

## Checks

`pnpm check` is the one signal that a change is done: it writes the content registry, then runs lint, format, types, the unit tests and the production build. CI runs it on every pull request and every push to main, then tests that build: Chromium in shards, the latency tests in a job of their own with one worker, Firefox and WebKit in another, and Lighthouse. Each job uploads what it found, named by run attempt, and one check named `ci` passes only when they all did; main's ruleset (`.github/rulesets/main.json`) requires it. A newer push to a pull request cancels its older run, but every commit on main gets its own. Run locally, `pnpm lint` and `pnpm format:check` cache their results in `node_modules/.cache/`, so a repeat run skips unchanged files.

`pnpm check:e2e` runs the browser tests. Each builder on one machine takes its own port, so set `E2E_PORT` (default 3100); `E2E_WORKERS` limits the workers (default 4), `E2E_RETRIES` the retries, and `E2E_REUSE=1` tests a server already on the port. `E2E_ONLY=concept,questionnaire` runs only those spec files. Heavy steps queue through `scripts/lane/heavy.sh`.
