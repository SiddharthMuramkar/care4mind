# Environment lessons

Each entry is dated, with what was true at that point.

- **2026-10-27, pnpm 12.15.0:** `minimumReleaseAge` refuses packages that are too new. typescript-eslint was pinned to 8.72.0 because 8.72.1 was refused. Build-script approvals live in `pnpm-workspace.yaml` under `allowBuilds`.
- **2026-10-27, version pins:** ESLint is held at 9.39.5 (eslint-plugin-react doesn't support 10), and TypeScript at 6.0.3 (typescript-eslint needs < 6.1).
- **2026-10-27, `pkill -f`:** it kills the agent's own shell (exit 144). Free a port with `fuser -k <port>/tcp` instead.
- **2026-10-27, WebKit:** Playwright WebKit can't run on Fedora. It runs only in CI, on Ubuntu.
- **2026-10-27, plan mode:** plan mode in the main session also blocks running workflow subagents from editing. Run `wf_aa7e4283-991` stopped at ticket 01 with nothing committed. Never enter plan mode while a workflow is building.
- **2026-10-27, Tailwind 4:** it emits only the `@theme` variables some source uses. The contrast unit test reads hex values only, from blocks that declare `--color-ground`.
- **2026-10-27, Vercel:** the claude.ai Vercel connector is on a personal Hobby account and can't see team `acme-ef4b`. Use the CLI, `npx --yes vercel@65.4.0 … --scope acme-ef4b`; `vercel curl` needs a linked folder (the scratchpad's `vercel-link`).
- **2026-10-27, GitHub:** the GitHub MCP server fails to connect, so use the `gh` CLI. Pushing workflow files needed `gh auth refresh -s workflow`.
- **2026-10-27, captures:** the saved site copies are in `/home/fedora/care4mind-captures` (`CARE4MIND_CAPTURES`), moved from the session scratchpad so a reboot can't lose them. They were stripped of the answer key, bands, passwords and user fields, and are never committed.
- **2026-10-27, machine:** 8 CPUs and 15 GB of RAM. At most 3 heavy lanes, with Playwright and Lighthouse serialised under `flock /tmp/care4mind-heavy.lock`.
