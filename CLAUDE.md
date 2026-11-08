# Care4Mind

The new care4mind.org, a portal for Indian psychology. Requirements: `docs/project-brief.md`.

- `pnpm check` says a change is done.
- `main` only takes pull requests, and production builds from it.
- Text in `src/content/data/` came from the old site. Change it only to fix a listed error, and run `pnpm content:verify --changed origin/main` before opening the PR, and put its result in the PR description. CI can't run this. The saved copy it reads never goes in this repo.
- Commit as `Siddharth Muramkar <334065514+SiddharthMuramkar@users.noreply.github.com>`. GitHub refuses a private email.

## Agent skills

### Issue tracker

GitHub Issues in `SiddharthMuramkar/care4mind`, via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: a root GLOSSARY.md, created when first needed, + `docs/adr/`. See `docs/agents/domain.md`.
