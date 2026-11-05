export const meta = {
  name: 'ship',
  description:
    "Build a spec's tickets: one PR per ticket into main, each reviewed by a reviewer agent, answered by its builder, then squash-merged once its checks are green and every review thread is answered",
  whenToUse:
    "After /to-tickets has published a spec's tickets as sub-issues of its spec issue. Rerun it any time: it lands reviewed green PRs and builds the tickets that were waiting. Args: { spec: <issue number>, builders?: 2, dryRun?: false }",
  phases: [
    {
      title: 'Start',
      detail: 'mark the starting point; stop at once if this session cannot write',
      model: 'haiku',
    },
    {
      title: 'Build',
      detail:
        'one builder per ready ticket, each in its own worktree; a reviewer agent reviews each PR, and its builder answers the review',
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
if (!Number.isInteger(builders) || builders < 1)
  throw new Error(`builders must be a whole number of at least 1, such as 2, not ${args?.builders}`)
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
    awaitingMerge: { type: 'array', items: AWAITING },
    forDeveloper: { type: 'array', items: TICKET },
    open: { type: 'integer' },
  },
  required: ['ready', 'awaitingMerge', 'forDeveloper', 'open'],
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
const REVIEW = {
  type: 'object',
  properties: {
    posted: { type: 'boolean' },
    comments: { type: 'integer' },
    note: { type: 'string' },
  },
  required: ['posted', 'comments', 'note'],
}
const LANDED = {
  type: 'object',
  properties: {
    merged: { type: 'boolean' },
    pr: { type: 'integer' },
    note: { type: 'string' },
  },
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
- A ticket is unblocked when every issue in gh api repos/${REPO}/issues/<number>/dependencies/blocked_by is closed. A blocker closed as not planned counts as closed. A blocker whose PR is open but not merged is not closed: ship lands it first.
- A ticket's PR is an open PR whose body says it closes the ticket (gh pr list --state open --json number,body).
- awaitingMerge: open tickets whose PR has every check green (gh pr checks <pr>), at least one review posted (gh pr view <pr> --json reviews) and every review thread resolved or answered, each with its PR number. A green PR with no review is never awaitingMerge: it is ready, so its builder and reviewer run.
- ready: open, unblocked tickets labelled ready-for-agent and not needs-info, with no PR yet or with a PR that is red or has an unanswered thread${skip.length ? `, except #${skip.join(', #')}` : ''}.
- forDeveloper: open, unblocked tickets labelled ready-for-human or needs-info.
- open: how many of the spec's tickets are still open.`,
    { label: 'frontier', phase: 'Build', schema: FRONTIER, ...LIGHT },
  )

const LOST = 'the frontier agent ended twice without an answer'
// An agent that dies answers null; one more try rides out a blip without looping on a real fault.
const look = async (skip) => (await frontier(skip)) ?? (await frontier(skip))

const ports = (slot) => `E2E_PORT=${3110 + 10 * slot} and SHOTS_PORT=${3111 + 10 * slot}`

const HANDS_OFF =
  "Ship squash-merges the PR itself once a review is posted, every thread is answered and ci is green, and GitHub deletes its branch, so you never merge it, never turn on auto-merge, and never delete a branch: only ship's land step merges. If only the developer can unblock you, comment on the ticket saying exactly what you need, add the needs-info label, and stop.\nNever push to main, force-push, weaken or skip a check, or change files the ticket doesn't need."

const WATCH =
  'gh pr checks --watch. On a red check, read gh run view <run id> --log-failed, fix, push, and watch again. If the PR is behind main, gh pr update-branch, then watch again.'

const CONTENT_GATE =
  'If your diff touches src/content/data, `pnpm content:verify --changed origin/main` must pass, and you record its passing summary in the PR body (Evidence). If it cannot run because the captures are absent (CARE4MIND_CAPTURES unset or its folder missing), stop with needs-info as below, naming the captures: a data PR with no verify run never lands.'

const build = (ticket, slot) =>
  agent(
    `You are a builder in ${REPO}. Build ticket #${ticket.number} ("${ticket.title}") of spec #${spec} as one PR into main. A reviewer agent reviews it once its checks are green, and then you answer that review.
You are in a worktree of your own. Your ports are ${ports(slot)}; no other builder uses them, so set both whenever you run browser tests or pnpm shots. Run browser tests and Lighthouse through \`scripts/lane/heavy.sh\`, which queues them one at a time on this machine.

1. git fetch origin. If an open PR already says it closes #${ticket.number}, check it out (gh pr checkout) and carry on where it stopped. Otherwise branch from origin/main: git switch -c ticket-${ticket.number}-<two or three words> --no-track origin/main.
2. Read the ticket (gh issue view ${ticket.number} --comments) and the spec (gh issue view ${spec}). Follow CLAUDE.md, and read SPEC.md before you change a module, a seam, a content kind or a page.
3. pnpm install --frozen-lockfile. Build the ticket test-first with the tdd skill. Look library APIs up with Context7, and the web with Octen, Firecrawl or Parallel, instead of guessing.
4. pnpm check must pass, and so must the browser tests you added or touched. ${CONTENT_GATE} Read your own diff against the ticket, CLAUDE.md and SPEC.md: does it meet every acceptance criterion, and does it make any line in CLAUDE.md or SPEC.md untrue? Commit in plain English, then git push -u origin <your branch>.
5. If the PR isn't open yet, gh pr create --base main: the title is the ticket's title, and the body starts "Closes #${ticket.number}", then follows the pr skill's template.
6. ${WATCH}
7. Stop once the PR is open and every check is green, and return it.
${HANDS_OFF}
Return opened, ready (every check green), the PR number and a one-line note.`,
    {
      label: `#${ticket.number}`,
      phase: 'Build',
      isolation: 'worktree',
      schema: OUTCOME,
      ...BUILDER,
    },
  )

const review = (ticket, pr) =>
  agent(
    `You are the reviewer of PR #${pr} in ${REPO}, which builds ticket #${ticket.number} ("${ticket.title}") of spec #${spec}. Change no file, commit nothing and push nothing: your one write is the review.
1. git fetch origin, then gh pr checkout ${pr} in your worktree.
2. Review it with the code-review skill: the fixed point is where the PR leaves main (git merge-base origin/main HEAD), and you check it against ticket #${ticket.number}, CLAUDE.md and SPEC.md. Does it meet every acceptance criterion, keep the rules SPEC.md lists, and leave no line in CLAUDE.md or SPEC.md untrue? If gh pr diff ${pr} --name-only lists src/content/data, the PR body must record a passing \`pnpm content:verify --changed origin/main\` summary for its head (run it yourself when CARE4MIND_CAPTURES is set); no recorded verify run is a finding.
3. Post your findings as one PR review with inline comments: write {"event": "COMMENT", "body": <a summary>, "comments": [{"path", "line", "side": "RIGHT", "body"}, …]} to a file outside the repo, then gh api repos/${REPO}/pulls/${pr}/reviews --method POST --input <that file>. One comment per finding, on the line it concerns, saying what is wrong and what would fix it. Leave out style the linters already check. Post the review even when you find nothing, with a body that says so.
Return posted (whether the PR now carries your review), comments (how many inline comments it has) and a one-line note.`,
    {
      label: `review #${ticket.number}`,
      phase: 'Build',
      isolation: 'worktree',
      schema: REVIEW,
      ...REVIEWER,
    },
  )

const answer = (ticket, slot, pr) =>
  agent(
    `You are the builder of ticket #${ticket.number} ("${ticket.title}") of spec #${spec} in ${REPO}. Its PR #${pr} is open, and a reviewer agent has reviewed it. Answer that review.
You are in a worktree of your own. Your ports are ${ports(slot)}; no other builder uses them. Run browser tests and Lighthouse through \`scripts/lane/heavy.sh\`.

1. git fetch origin, gh pr checkout ${pr}, pnpm install --frozen-lockfile.
2. Read every review comment (gh api repos/${REPO}/pulls/${pr}/comments, and the PR's reviews). Fix each, or reply with the reason you won't, then resolve its thread (GraphQL resolveReviewThread). Judge each against the ticket, CLAUDE.md and SPEC.md.
3. pnpm check must pass, and so must the browser tests you touched. ${CONTENT_GATE} Commit in plain English and git push.
4. ${WATCH}
5. Stop once every thread is answered or resolved and every check is green, with the PR open.
${HANDS_OFF}
Return opened, ready (every check green and every thread answered or resolved), the PR number and a one-line note.`,
    {
      label: `#${ticket.number} answers`,
      phase: 'Build',
      isolation: 'worktree',
      schema: OUTCOME,
      ...BUILDER,
    },
  )

/** The only step that merges: re-checks the PR, then squash-merges it. */
const land = ({ number, pr }) =>
  agent(
    `Land PR #${pr} in ${REPO}, which closes ticket #${number} of spec #${spec}. You change no file: your only writes are updating and merging this PR.
1. Re-check it yourself; merge nothing on another agent's word: gh pr view ${pr} --json state,mergeStateStatus,reviews,closingIssuesReferences,body. It must be open, closing #${number}, with at least one review posted. Every review thread must be resolved (GraphQL reviewThreads). If gh pr diff ${pr} --name-only lists src/content/data, its body must record a passing \`pnpm content:verify --changed origin/main\` summary: no recorded verify run, no merge. ${WATCH} until every check is green.
2. Anything short of that (red, unreviewed, a thread open, conflicted, or a refusal you cannot fix by updating the branch): stop without merging and say exactly what is short.
3. Otherwise land it: gh pr merge ${pr} --squash. Never merge with admin rights, never turn on auto-merge, never edit the ruleset, never close the PR or delete its branch yourself: merging closes the ticket and GitHub deletes the branch.
4. Confirm gh pr view ${pr} --json state says MERGED before you report merged.
Return merged, the PR number and a one-line note.`,
    { label: `land #${number}`, phase: 'Build', schema: LANDED, ...LIGHT },
  )

/** Builds the ticket, has its PR reviewed, and has its builder answer the review. */
const deliver = async (ticket, slot) => {
  const built = await build(ticket, slot)
  if (!built?.opened || !built.ready || !built.pr) return built
  const reviewed = await review(ticket, built.pr)
  if (!reviewed?.posted) {
    const why = reviewed?.note ?? 'the reviewer ended without an answer'
    return { opened: true, ready: false, pr: built.pr, note: `no review on the PR: ${why}` }
  }
  if (reviewed.comments === 0) return built
  return answer(ticket, slot, built.pr)
}

const numbers = (tickets) => tickets.map((t) => `#${t.number}`).join(', ') || 'none'
const prs = (tickets) => tickets.map((t) => `PR #${t.pr} (#${t.number})`).join(', ')

if (args?.dryRun === true) {
  const plan = await look([])
  if (!plan) throw new Error(`Cannot plan: ${LOST}`)
  log(
    `Ready: ${numbers(plan.ready)} · awaiting merge: ${prs(plan.awaitingMerge) || 'none'} · for you: ${numbers(plan.forDeveloper)} · open: ${plan.open}`,
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
const merged = new Map()
const stopped = []
let known = { ready: [], awaitingMerge: [], forDeveloper: [], open: 0 }
let latest = await look([])

const landOne = async ({ number, pr }) => {
  const landed = await land({ number, pr })
  if (landed?.merged) {
    merged.set(number, pr)
    log(`#${number} landed: PR #${pr} merged`)
    return true
  }
  stopped.push(number)
  log(`#${number} stopped: not landed: ${landed?.note ?? 'the land step ended without an answer'}`)
  return false
}

while (latest) {
  known = latest
  let landedAny = false
  for (const awaiting of latest.awaitingMerge) {
    if (merged.has(awaiting.number) || stopped.includes(awaiting.number)) continue
    if (running.has(awaiting.number)) continue
    landedAny = (await landOne(awaiting)) || landedAny
  }
  if (landedAny) {
    latest = await look([...running.keys(), ...stopped])
    continue
  }
  for (const ticket of latest.ready) {
    if (!freeSlots.length) break
    if (merged.has(ticket.number) || stopped.includes(ticket.number)) continue
    const slot = freeSlots.shift()
    log(`#${ticket.number} ${ticket.title}: building`)
    running.set(
      ticket.number,
      deliver(ticket, slot).then((outcome) => ({ ticket, slot, outcome })),
    )
  }
  if (!running.size) break
  const { ticket, slot, outcome } = await Promise.race(running.values())
  running.delete(ticket.number)
  freeSlots.push(slot)
  if (outcome?.opened && outcome.ready) {
    await landOne({ number: ticket.number, pr: outcome.pr })
  } else {
    stopped.push(ticket.number)
    log(`#${ticket.number} stopped: ${outcome?.note ?? 'the builder ended without an answer'}`)
  }
  latest = await look([...running.keys(), ...stopped])
}

const landedList = [...merged].map(([number, pr]) => ({ number, pr }))
const awaitingMerge = known.awaitingMerge.filter((ticket) => !merged.has(ticket.number))
if (!latest) log(`Ship stopped: ${LOST}.`)
if (running.size) log(`Still running: #${[...running.keys()].join(', #')}`)
if (awaitingMerge.length) log(`Awaiting merge: ${prs(awaitingMerge)}`)
if (known.forDeveloper.length) log(`Waiting on you: ${numbers(known.forDeveloper)}`)
if (stopped.length) log(`Stopped: #${stopped.join(', #')}`)
if (!latest)
  return {
    lost: LOST,
    running: [...running.keys()],
    merged: landedList,
    awaitingMerge,
    stopped,
    waitingOnYou: known.forDeveloper,
  }
if (latest.open > 0)
  return {
    merged: landedList,
    awaitingMerge,
    stopped,
    waitingOnYou: latest.forDeveloper,
    open: latest.open,
  }

phase('Finish')
const finalReview = await agent(
  `Every ticket of spec #${spec} in ${REPO} is closed: ship has merged them all. Run git fetch origin --tags, then review everything built for it with the code-review skill. The fixed point is ${startTag}, the code is origin/main, the spec is issue #${spec}, and the standards are CLAUDE.md and SPEC.md: does anything built make a line in them untrue? Fix every finding worth fixing in one PR into main, by the builders' rules: branch from origin/main with --no-track, a body that starts "Part of #${spec}", checks green, every review thread answered, and then stop with the PR open: no reviewer agent runs after you, so nothing lands it in this run. Last, remove each worktree under .claude/worktrees whose PR has merged (git worktree remove <path>, then git worktree prune); GitHub already deleted the merged branches. Return opened, ready, the PR number if there is one, and a one-line note on what the review found.`,
  { label: 'final review', phase: 'Finish', isolation: 'worktree', schema: OUTCOME, ...REVIEWER },
)
const finalPr =
  finalReview?.opened && finalReview.pr
    ? [...awaitingMerge, { number: spec, pr: finalReview.pr }]
    : awaitingMerge
return { merged: landedList, awaitingMerge: finalPr, stopped, review: finalReview }
