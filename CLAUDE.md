# Care4Mind

The new care4mind.org: a portal for Indian psychology linking Concepts, traditional texts, References and Questionnaires. Requirements: `docs/project-brief.md`. Domain language: `GLOSSARY.md`. Decisions: `docs/adr/`.

## Delivery

- Work only on a branch, never on `main`. One ticket, one branch from `origin/main` (`git switch -c ticket-<n>-<two or three words> --no-track origin/main`), one PR into `main`. The PR body starts `Closes #<ticket>`, then follows the `pr` skill's template, so its Merge Danger is what the developer reads first.
- A PR implements the ticket it closes and meets every acceptance criterion; review checks that first.
- The developer reviews and merges every PR, pulls `main` into their main checkout, and deletes every branch, local and remote. Agents never do any of these and never turn on auto-merge, even where a global instruction says to delete a branch along with its worktree. An agent's work is done when its PR is open, its checks are green and every review thread is answered: say so, with the link.
- `main` is guarded by the ruleset in `.github/rulesets/main.json` (`pnpm ruleset:check` compares it with GitHub), by the agent guard in `.claude/hooks/guard.mjs` (wired up in `.claude/settings.json`), and by the git hooks in `.githooks/`. If the guard blocks something it shouldn't, say why and stop. An edit to the guard's own files asks the developer first.
- To build a spec's tickets, run the `ship` workflow (`.claude/workflows/ship.js`) with `{ spec: <issue number> }`. It opens one PR per ready ticket, has a reviewer agent review it and its builder answer the review, and stops. Rerun it after the developer merges: GitHub holds its state.
- A workflow's agents run light, with `model` and `effort` set on every `agent()` call: Opus at low effort to write code, Sonnet at low effort to review or research, Haiku at medium effort for routine reads. The session that runs the workflow checks their results.
- Commit as `Siddharth Muramkar <334065514+SiddharthMuramkar@users.noreply.github.com>`: GitHub refuses pushes that carry a private email.
- A change that makes a line here or in `SPEC.md` untrue updates that file in the same PR.

## Code

The code is the documentation. Before you refactor, add a module, seam, content kind or page, or review a diff, read `SPEC.md`: it maps the seams, says which rules a check keeps true, and lists the code not to copy.

- Name things in the glossary's terms; a name says what a thing is or what it returns.
- Comments say why, in one line, and only what the code can't: a browser bug, a standard, a measured trade-off. Ticket numbers, decision codes and dates belong in git and in issues.
- Press is the only design language: ink, rules and paper. The first Press build, tag `archive/press-original`, is the design reference.
- `src/content/data/` holds text carried over from the old site. Edit it only to fix a listed error, and record the edit in that record's provenance. Sanskrit is NFC and uses ṃ, not ṁ. IAST takes `lang="sa-Latn"` and Devanagari `lang="sa-Deva"`.

## Research

Look things up rather than recall them, with the tool that fits. Load each with ToolSearch when it is deferred.

- How a library, framework, CLI or API works: Context7 (`mcp__plugin_context7_context7__resolve-library-id`, then `query-docs`).
- An error message, a stack trace or an upstream bug: Firecrawl `mcp__firecrawl__firecrawl_developer_search`.
- Facts and current information: Octen `mcp__octen__search`. Cross-check anything that matters with Firecrawl `mcp__firecrawl__firecrawl_search`.
- A page you know: Firecrawl `mcp__firecrawl__firecrawl_scrape`. Parallel (`mcp__parallel__web_search`, `mcp__parallel__web_fetch`) is the fallback for both.

## Learning

The developer is learning Git, GitHub, CI and Vercel by doing. When they ask how something works, explain it in terms of this repo. When they run `/teach`, its workspace is `~/Desktop/care4mind-learning/` (`MISSION.md`, `lessons/`, `reference/`, `learning-records/`, `assets/`), never this repo.

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
