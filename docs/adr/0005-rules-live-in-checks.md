---
status: accepted
---

# Rules live in checks, and the docs keep only what the code can't say

Every fact about the code has one home, and for most facts that home is the code: its names, types, tests and checks. `CLAUDE.md` holds the few rules every agent needs from the start. `SPEC.md` holds what the code can't say: where the seams are and why, the standards a reviewer applies, and which check keeps each rule true. A rule with no exceptions becomes a check, a hook or a ruleset rather than a sentence, because a check can fail and a sentence can't.

`SPEC.md` was written this way on 2026-10-30, after an audit of `bfdbff0` found code still pointing at docs that commit had deleted. On 2026-10-31 the developer took the same approach to delivery. They review, merge and delete every branch themselves, and since agents act through the developer's own GitHub login, a guard hook, git hooks and a ruleset keep that true. A sentence in a doc doesn't. The audit's backlog moved out of `SPEC.md` into spec #26 at the same time.

The sources:

- Matt Pocock, ["Delete (most of) your docs"](https://www.youtube.com/shorts/Fj8DKMbdIzU) (2026-07-16). Docs that restate the code drift from it, and "if there are two sources of truth and they conflict, then AI won't know which one is the real one". Keep ADRs, a glossary and a thin layer for finding your way, and put the burden on the code's shape.
- Matt Pocock, ["A complete guide to AGENTS.md"](https://www.aihero.dev/a-complete-guide-to-agents-md) and ["Never run claude /init"](https://www.aihero.dev/never-run-claude-init). Describe capabilities, not file structure, and include only what is both undiscoverable and globally relevant.
- Matt Pocock, [skills changelog v1.3](https://www.aihero.dev/skills-changelog-v13-implement-spec-pr-retro-and-glossary-md): "A check can fail. A sentence in a Markdown file cannot."
- Anthropic, [Claude Code best practices](https://code.claude.com/docs/en/best-practices). Write down only what Claude can't find by reading the repo, and make a rule that has no exceptions a hook or a check.

## Considered options

- **Keep the standards and the backlog together in `SPEC.md`.** That's one file to read, but it grew past 600 lines, most of them a backlog the issues already hold, and every agent read all of it before every change.
- **A folder of docs per topic**, as `docs/agents/` was until `bfdbff0`. It drifted from the code it described, which is what the audit found.
- **Rules as sentences only**, trusting agents to follow `CLAUDE.md`. Agents act as the developer's account, so a sentence is the only thing between an agent and a merge. A hook can refuse.

## Consequences

- A rule enters `SPEC.md` together with what keeps it true: a check, or "review".
- Work lives in GitHub Issues. The audit's backlog is spec #26. Its tickets tagged "audit" stand on one auditor's evidence, and #156 challenges them.
- Two habits keep the docs short:
  - After a `ship` run that went sideways, `/retro` on that session turns each mechanical lesson into a check, and its sentence leaves the docs.
  - When a spec closes, `/improve-codebase-architecture` proposes deepening work, which goes through `/to-spec`. A rejected idea with a lasting reason becomes an ADR.
- ADR-0004 stays reserved for the Architecture review, as ADR-0003 says.
