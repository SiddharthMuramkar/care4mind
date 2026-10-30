# Care4Mind

The new care4mind.org: a portal for Indian psychology linking Concepts, traditional texts, References and Questionnaires. Requirements: `docs/project-brief.md`. Domain language: `GLOSSARY.md`. Decisions: `docs/adr/`.

## Delivery

- One ticket, one PR into `main`. The PR body starts `Closes #<ticket>`. It squash-merges once CI is green and every review thread is resolved.
- A PR implements the ticket it closes and meets every acceptance criterion; review checks that first.
- To build a spec's tickets, run the `ship` workflow (`.claude/workflows/ship.js`) with `{ spec: <issue number> }`. GitHub holds its state, so a rerun resumes.
- Commit as `Siddharth Muramkar <334065514+SiddharthMuramkar@users.noreply.github.com>`: GitHub refuses pushes that carry a private email.
- A change that makes a line here untrue updates this file in the same PR.

## Code

The code is the documentation.

- Name things in the glossary's terms; a name says what a thing is or what it returns.
- Comments say why, in one line, and only what the code can't: a browser bug, a standard, a measured trade-off. Ticket numbers, decision codes and dates belong in git and in issues.
- Press is the only design language: ink, rules and paper. The first Press build, tag `archive/press-original`, is the design reference.
- `src/content/data/` holds text carried over from the old site. Edit it only to fix a listed error, and record the edit in that record's provenance. Sanskrit is NFC and uses ṃ, not ṁ. IAST takes `lang="sa-Latn"` and Devanagari `lang="sa-Deva"`.

## Research

Look things up rather than recall them: `mcp__context7__query-docs` for library APIs, and `mcp__firecrawl__firecrawl_search` and `mcp__firecrawl__firecrawl_scrape` for the web. Load them with ToolSearch when they are deferred.

## Where things live

- Old work is in `archive/*` tags (`git tag -n -l 'archive/*'`). `archive/frontend-press-only` is the last full build, and `archive/lane-search` holds the search engine.
- Saved copies of the old site are in the private repo `SiddharthMuramkar/care4mind-captures`, apart from this repo.
- Vercel deploys through its Git link: a preview for every branch, and production from `main`. Every page is noindex until launch (`site.indexable`).

## Agent skills

### Issue tracker

GitHub Issues on `SiddharthMuramkar/care4mind`, through `gh`. A spec is an issue, and its tickets are sub-issues with GitHub's own blocked-by links: `gh issue create --parent <spec> --blocked-by <n,n> --label ready-for-agent`. A ticket is ready when every blocker is closed. Questions for the client carry the label `planning`, under the pinned "Rebuild planning map" issue.

### Triage labels

`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human` and `wontfix`. A checkpoint for the developer is a `ready-for-human` ticket.

### Domain docs

Single context: `GLOSSARY.md` and `docs/adr/` at the root.
