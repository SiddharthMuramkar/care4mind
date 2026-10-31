export const meta = {
  name: 'ship',
  description:
    "Build a spec's tickets: one PR per ticket into main, each left open for the developer once its checks are green and every review thread is answered",
  whenToUse:
    "After /to-tickets has published a spec's tickets as sub-issues of its spec issue. Rerun it after the developer merges, to build the tickets that were waiting. Args: { spec: <issue number>, builders?: 2, dryRun?: false }",
  phases: [
    {
      title: 'Start',
      detail: 'mark the starting point; stop at once if this session cannot write',
      model: 'haiku',
    },
    {
      title: 'Build',
      detail: 'one builder per ready ticket, each in its own worktree',
      model: 'opus',
    },
    {
      title: 'Finish',
      detail:
        'once every ticket is closed: review the whole spec, fix in one PR, remove merged worktrees',
      model: 'sonnet',
    },
  ],
}

const REPO = 'SiddharthMuramkar/care4mind'
const spec = Number(args?.spec)
if (!Number.isInteger(spec) || spec < 1) throw new Error('Pass args: { spec: <spec issue number> }')
const builders = Number(args?.builders ?? 2)
const startTag = `ship/spec-${spec}`

// Workflow agents run light; the session that runs ship judges their results.
const LIGHT = { model: 'haiku', effort: 'medium' }
const BUILDER = { model: 'opus', effort: 'low' }
const REVIEWER = { model: 'sonnet', effort: 'low' }

const TICKET = {
  type: 'object',
  properties: { number: { type: 'integer' }, title: { type: 'string' } },
  required: ['number', 'title'],
}
const AWAITING = {
  type: 'object',
  properties: { number: { type: 'integer' }, pr: { type: 'integer' } },
  required: ['number', 'pr'],
}
const FRONTIER = {
  type: 'object',
  properties: {
    ready: { type: 'array', items: TICKET },
    awaitingYou: { type: 'array', items: AWAITING },
    forDeveloper: { type: 'array', items: TICKET },
    open: { type: 'integer' },
  },
  required: ['ready', 'awaitingYou', 'forDeveloper', 'open'],
}
const OUTCOME = {
  type: 'object',
  properties: {
    opened: { type: 'boolean' },
    ready: { type: 'boolean' },
    pr: { type: 'integer' },
    note: { type: 'string' },
  },
  required: ['opened', 'ready', 'note'],
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
- A ticket is unblocked when every issue in gh api repos/${REPO}/issues/<number>/dependencies/blocked_by is closed. A blocker whose PR is open but not merged is not closed: the developer merges.
- A ticket's PR is an open PR whose body says it closes the ticket (gh pr list --state open --json number,body).
- awaitingYou: open tickets whose PR has every check green (gh pr checks <pr>) and every review thread resolved or answered, each with its PR number.
- ready: open, unblocked tickets labelled ready-for-agent and not needs-info, with no PR yet or with a PR that is red or has an unanswered thread${skip.length ? `, except #${skip.join(', #')}` : ''}.
- forDeveloper: open, unblocked tickets labelled ready-for-human or needs-info.
- open: how many of the spec's tickets are still open.`,
    { label: 'frontier', phase: 'Build', schema: FRONTIER, ...LIGHT },
  )

const build = (ticket, slot) =>
  agent(
    `You are a builder in ${REPO}. Build ticket #${ticket.number} ("${ticket.title}") of spec #${spec} as one PR into main, and leave it open for the developer, who reviews and merges every PR.
You are in a worktree of your own. Your browser-test port is ${3110 + 10 * slot} (E2E_PORT); no other builder uses it. Run browser tests and Lighthouse through \`scripts/lane/heavy.sh\`, which queues them one at a time on this machine.

1. git fetch origin. If an open PR already says it closes #${ticket.number}, check it out (gh pr checkout) and carry on where it stopped. Otherwise branch from origin/main: git switch -c ticket-${ticket.number}-<two or three words> --no-track origin/main.
2. Read the ticket (gh issue view ${ticket.number} --comments) and the spec (gh issue view ${spec}). Follow CLAUDE.md, and read SPEC.md before you change a module, a seam, a content kind or a page.
3. pnpm install --frozen-lockfile. Build the ticket test-first with the tdd skill. Look library APIs up with Context7, and the web with Octen, Firecrawl or Parallel, instead of guessing.
4. pnpm check must pass, and so must the browser tests you added or touched. Commit in plain English, then git push -u origin <your branch>.
5. If the PR isn't open yet, gh pr create --base main: the title is the ticket's title, and the body starts "Closes #${ticket.number}", then follows the pr skill's template.
6. gh pr checks --watch. On a red check, read gh run view <run id> --log-failed, fix, push, and watch again. If the PR is behind main, gh pr update-branch, then watch again.
7. Review. Read every review comment (gh api repos/${REPO}/pulls/<pr>/comments, and the PR's reviews). Fix each, or reply with the reason you won't, then resolve its thread (GraphQL resolveReviewThread). Then read your own diff against the ticket, CLAUDE.md and SPEC.md: does it meet every acceptance criterion, and does it make any line in CLAUDE.md or SPEC.md untrue? After any push, the checks must go green again.
8. Stop there, with the PR open. The developer reviews it, merges it and deletes its branch, so you never merge it, never turn on auto-merge, and never delete a branch. If only the developer can unblock you, comment on the ticket saying exactly what you need, add the needs-info label, and stop.
Never push to main, force-push, skip hooks, weaken or skip a check, or change files the ticket doesn't need.
Return opened, ready (every check green and every thread answered), the PR number and a one-line note.`,
    {
      label: `#${ticket.number}`,
      phase: 'Build',
      isolation: 'worktree',
      schema: OUTCOME,
      ...BUILDER,
    },
  )

const numbers = (tickets) => tickets.map((t) => `#${t.number}`).join(', ') || 'none'
const prs = (tickets) => tickets.map((t) => `PR #${t.pr} (#${t.number})`).join(', ')

if (args?.dryRun === true) {
  const plan = await frontier([])
  log(
    `Ready: ${numbers(plan.ready)} · for your review: ${prs(plan.awaitingYou) || 'none'} · for you: ${numbers(plan.forDeveloper)} · open: ${plan.open}`,
  )
  return plan
}

phase('Start')
const started = await agent(
  `Check this session can write, then mark where spec #${spec} starts. Run git fetch origin --tags. If the tag ${startTag} exists, report ok. Otherwise create it at origin/main (git tag ${startTag} origin/main) and push it (git push origin ${startTag}). If any write is refused, for example because the session is in plan mode, report ok false with the reason.`,
  { label: 'start', phase: 'Start', schema: STARTED, ...LIGHT },
)
if (!started?.ok) throw new Error(`Cannot start: ${started?.note ?? 'no answer'}`)

phase('Build')
const running = new Map()
const freeSlots = Array.from({ length: builders }, (_, slot) => slot)
const readyForYou = new Map()
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
  if (outcome?.opened && outcome.ready) {
    readyForYou.set(ticket.number, outcome.pr)
    log(`#${ticket.number} is ready for your review: PR #${outcome.pr}`)
  } else {
    stopped.push(ticket.number)
    log(`#${ticket.number} stopped: ${outcome?.note ?? 'the builder ended without an answer'}`)
  }
  latest = await frontier([...running.keys(), ...stopped, ...readyForYou.keys()])
}

const awaitingYou = [
  ...latest.awaitingYou.filter((ticket) => !readyForYou.has(ticket.number)),
  ...[...readyForYou].map(([number, pr]) => ({ number, pr })),
]
if (awaitingYou.length) log(`Ready for your review: ${prs(awaitingYou)}`)
if (latest.forDeveloper.length) log(`Waiting on you: ${numbers(latest.forDeveloper)}`)
if (stopped.length) log(`Stopped: #${stopped.join(', #')}`)
if (latest.open > 0)
  return { awaitingYou, stopped, waitingOnYou: latest.forDeveloper, open: latest.open }

phase('Finish')
const review = await agent(
  `Every ticket of spec #${spec} in ${REPO} is closed: the developer has merged them all. Run git fetch origin --tags, then review everything built for it with the code-review skill. The fixed point is ${startTag}, the code is origin/main, the spec is issue #${spec}, and the standards are CLAUDE.md and SPEC.md: does anything built make a line in them untrue? Fix every finding worth fixing in one PR into main, by the builders' rules: branch from origin/main with --no-track, a body that starts "Part of #${spec}", checks green, every review thread answered, and then stop, because the developer reviews and merges it. Last, remove each worktree under .claude/worktrees whose PR has merged (git worktree remove <path>, then git worktree prune), and keep every branch: list the local branches whose PRs have merged, for the developer to delete. Return opened, ready, the PR number if there is one, and a one-line note on what the review found and which branches the developer can delete.`,
  { label: 'final review', phase: 'Finish', isolation: 'worktree', schema: OUTCOME, ...REVIEWER },
)
return { awaitingYou, stopped, review }
