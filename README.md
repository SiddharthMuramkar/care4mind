# Care4Mind

The new care4mind.org: a portal for Indian psychology that links Concepts, traditional texts, References and Questionnaires. It replaces the current WordPress site.

- Why and what: [docs/project-brief.md](docs/project-brief.md). Decisions: [docs/adr/](docs/adr/). Words: [GLOSSARY.md](GLOSSARY.md).
- Work in progress lives in [GitHub Issues](https://github.com/SiddharthMuramkar/care4mind/issues). Coding agents follow [CLAUDE.md](CLAUDE.md).

## Run it

Node 22.12 or newer (CI and Vercel use 24) and the pnpm version pinned in `package.json`.

```bash
pnpm install
node scripts/content/registry.mjs   # once, in a fresh checkout
pnpm dev                            # http://localhost:3000
pnpm check                          # lint, types, unit tests and the production build
```

Every branch gets a Vercel preview, and `main` deploys production. Every page tells search engines not to index it until launch.
