# Care4Mind

The new care4mind.org: a portal for Indian psychology that links Concepts, traditional texts, References and Questionnaires. It replaces the current WordPress site.

- Why and what: [docs/project-brief.md](docs/project-brief.md). Decisions: [docs/adr/](docs/adr/).
- Work in progress lives in [GitHub Issues](https://github.com/SiddharthMuramkar/care4mind/issues). Coding agents follow [CLAUDE.md](CLAUDE.md).

## Run it

Node 26 and the pnpm version pinned in `package.json`. CI and Vercel run Node 26, and pnpm fetches it for the project's scripts even where the system Node is older.

```bash
pnpm install
pnpm dev                            # http://localhost:3000
pnpm check                          # lint, types, unit tests and the production build
```

`main` deploys production on Vercel; branch previews are off (`vercel.json`). Every page tells search engines not to index it until launch.

Login's real accounts and settings are set up once, by a person, with [scripts/setup-login.sh](scripts/setup-login.sh).

## Checks

`pnpm check` is the one signal that a change is done: it writes the content registry, then runs lint, format, types, the unit tests and the production build. CI runs `pnpm audit` and `pnpm check` as one check named `ci`, on pull requests and pushes to `main`. Browser tests and Lighthouse run locally only. Vercel holds production until `ci` passes on `main`. Run locally, `pnpm lint` and `pnpm format:check` cache their results in `node_modules/.cache/`, so a repeat run skips unchanged files.

`pnpm check:e2e` runs the browser tests against the build `pnpm check` made. While the login switch is on (it is, by default, in a local build) they log in against local stand-ins they start themselves: an in-memory Postgres, a Brevo that keeps every email, and Cloudflare's test keys, so nothing reaches a real account. Port `E2E_PORT + 1` and `+ 2` must be free as well. `E2E_PORT` picks the port (default 3100), `E2E_WORKERS` limits the workers (default 4), `E2E_RETRIES` the retries, and `E2E_REUSE=1` tests a server already on the port. `E2E_ONLY=concept,questionnaire` runs only those spec files.
