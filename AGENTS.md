CLAUDE.md is a symlink to this file. Edit AGENTS.md only.

Before creating or editing anything in `src/content/data/`, read `docs/agents/content-migration.md`, the content migration standard.

Before building or testing the front end, read `docs/agents/frontend-conventions.md`: motion, links, files, slots and the lane commands.

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
