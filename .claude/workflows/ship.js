export const meta = {
  name: 'ship',
  description:
    "Build a spec's tickets: one PR per ticket into main, merged once CI is green and every review thread is resolved",
  whenToUse:
    "After /to-tickets has published a spec's tickets as sub-issues of its spec issue. Args: { spec: <issue number>, builders?: 2, dryRun?: false }",
  phases: [
    {
      title: 'Start',
      detail: 'mark the starting point; stop at once if this session cannot write',
    },
    { title: 'Build', detail: 'one builder per ready ticket, each in its own worktree' },
    { title: 'Finish', detail: 'review the whole spec, fix in one PR, remove merged worktrees' },
  ],
}

const REPO = 'SiddharthMuramkar/care4mind'
const spec = Number(args?.spec)
if (!Number.isInteger(spec) || spec < 1) throw new Error('Pass args: { spec: <spec issue number> }')
const builders = Number(args?.builders ?? 2)
const startTag = `ship/spec-${spec}`

const TICKET = {
  type: 'object',
  properties: { number: { type: 'integer' }, title: { type: 'string' } },
  required: ['number', 'title'],
}
const FRONTIER = {
  type: 'object',
  properties: {
    ready: { type: 'array', items: TICKET },
    forDeveloper: { type: 'array', items: TICKET },
    open: { type: 'integer' },
  },
  required: ['ready', 'forDeveloper', 'open'],
}
const OUTCOME = {
  type: 'object',
  properties: { merged: { type: 'boolean' }, pr: { type: 'integer' }, note: { type: 'string' } },
  required: ['merged', 'note'],
}
const STARTED = {
  type: 'object',
  properties: { ok: { type: 'boolean' }, note: { type: 'string' } },
  required: ['ok', 'note'],
}

const frontier = (skip) =>
  agent(
    `Read-only: change nothing. Report the frontier of spec issue #${spec} in ${REPO}, using gh.
- Its tickets are its sub-issues: gh api repos/${REPO}/issues/${spec}/sub_issues --paginate
- A ticket is unblocked when every issue in gh api repos/${REPO}/issues/<number>/dependencies/blocked_by is closed.
- ready: open, unblocked tickets labelled ready-for-agent and not needs-info${skip.length ? `, except #${skip.join(', #')}` : ''}.
- forDeveloper: open, unblocked tickets labelled ready-for-human or needs-info.
- open: how many of the spec's tickets are still open.`,
    { label: 'frontier', phase: 'Build', schema: FRONTIER, effort: 'low' },
  )

const build = (ticket, slot) =>
  agent(
    `You are a builder in ${REPO}. Ship ticket #${ticket.number} ("${ticket.title}") of spec #${spec}: one PR into main, merged.
You are in a worktree of your own. Your browser-test port is ${3110 + 10 * slot} (E2E_PORT); no other builder uses it.

1. git fetch origin. If an open PR already says it closes #${ticket.number}, check it out (gh pr checkout) and carry on where it stopped. Otherwise branch from origin/main as ticket-${ticket.number}-<two or three words>.
2. Read the ticket (gh issue view ${ticket.number} --comments) and the spec (gh issue view ${spec}). Follow CLAUDE.md.
3. pnpm install --frozen-lockfile. Build the ticket test-first with the tdd skill. Look library APIs up with context7 and the web with Firecrawl instead of guessing.
4. pnpm check must pass, and so must the browser tests you added or touched. Commit in plain English and push.
5. gh pr create --base main: the title is the ticket's title; the body starts "Closes #${ticket.number}", then says what changed and how you checked it. Then gh pr merge --auto --squash. If the repo doesn't allow auto-merge yet, merge it yourself (gh pr merge --squash) once steps 6 and 7 are done.
6. gh pr checks --watch. On a red check, read gh run view <run id> --log-failed, fix, push, and watch again. If main moves under you, merge origin/main in, check again, push.
7. Claude's review: read every review comment (gh api repos/${REPO}/pulls/<pr>/comments, and the PR's reviews). Fix each, or reply with the reason you won't, then resolve its thread (GraphQL resolveReviewThread). After a push the checks must go green again.
8. You are done when the PR is merged and #${ticket.number} is closed. If only the developer can unblock you, comment on the ticket saying exactly what you need, add the needs-info label, and stop.
Never push to main, force-push, skip hooks, weaken or skip a check, or change files the ticket doesn't need.
Return merged, the PR number and a one-line note.`,
    { label: `#${ticket.number}`, phase: 'Build', isolation: 'worktree', schema: OUTCOME },
  )

const numbers = (tickets) => tickets.map((t) => `#${t.number}`).join(', ') || 'none'

if (args?.dryRun === true) {
  const plan = await frontier([])
  log(`Ready: ${numbers(plan.ready)} · for you: ${numbers(plan.forDeveloper)} · open: ${plan.open}`)
  return plan
}

phase('Start')
const started = await agent(
  `Check this session can write, then mark where spec #${spec} starts. Run git fetch origin --tags. If the tag ${startTag} exists, report ok. Otherwise create it at origin/main (git tag ${startTag} origin/main) and push it (git push origin ${startTag}). If any write is refused, for example because the session is in plan mode, report ok false with the reason.`,
  { label: 'start', phase: 'Start', schema: STARTED, effort: 'low' },
)
if (!started?.ok) throw new Error(`Cannot start: ${started?.note ?? 'no answer'}`)

phase('Build')
const running = new Map()
const freeSlots = Array.from({ length: builders }, (_, slot) => slot)
const shipped = []
const stopped = []
let latest = await frontier([])

while (true) {
  for (const ticket of latest.ready) {
    if (!freeSlots.length) break
    const slot = freeSlots.shift()
    log(`#${ticket.number} ${ticket.title}: building`)
    running.set(
      ticket.number,
      build(ticket, slot).then((outcome) => ({ ticket, slot, outcome })),
    )
  }
  if (!running.size) break
  const { ticket, slot, outcome } = await Promise.race(running.values())
  running.delete(ticket.number)
  freeSlots.push(slot)
  if (outcome?.merged) {
    shipped.push(ticket.number)
    log(`#${ticket.number} merged in PR #${outcome.pr}`)
  } else {
    stopped.push(ticket.number)
    log(`#${ticket.number} stopped: ${outcome?.note ?? 'the builder ended without an answer'}`)
  }
  latest = await frontier([...running.keys(), ...stopped])
}

if (latest.forDeveloper.length) log(`Waiting on you: ${numbers(latest.forDeveloper)}`)
if (stopped.length) log(`Stopped: #${stopped.join(', #')}`)
if (latest.open > 0)
  return { shipped, stopped, waitingOnYou: latest.forDeveloper, open: latest.open }

phase('Finish')
const review = await agent(
  `Every ticket of spec #${spec} in ${REPO} is closed. Run git fetch origin --tags, then review everything built for it with the code-review skill: the fixed point is ${startTag}, the code is origin/main, and the spec is issue #${spec}. Fix every finding worth fixing in one PR into main, by the builders' rules: branch from origin/main, a body that starts "Part of #${spec}", checks green, every review thread resolved, squash-merged. Last, remove every worktree whose branch has merged (git worktree list, git worktree remove, git branch -d), then git worktree prune. Return merged, the PR number if there is one, and a one-line note on what the review found.`,
  { label: 'final review', phase: 'Finish', isolation: 'worktree', schema: OUTCOME },
)
return { shipped, stopped, review }
