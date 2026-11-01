import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

// The ship workflow (.claude/workflows/ship.js), run against made-up agents: it opens PRs, has a
// reviewer agent review each and its builder answer the review, leaves them for the developer,
// never tells an agent to merge or delete a branch, and gives every agent an explicit, light model.

interface Call {
  prompt: string
  opts: { label?: string; phase?: string; model?: string; effort?: string; isolation?: string }
}

interface Ticket {
  number: number
  title: string
}

interface Frontier {
  ready: Ticket[]
  awaitingYou: { number: number; pr: number }[]
  forDeveloper: Ticket[]
  open: number
}

const SOURCE = readFileSync('.claude/workflows/ship.js', 'utf8')
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...names: string[]
) => (...values: unknown[]) => Promise<unknown>

/** Runs ship.js as the Workflow tool would, with each agent answered by `answer`. */
async function ship(args: unknown, answer: (call: Call, index: number) => unknown) {
  const calls: Call[] = []
  const logs: string[] = []
  const agent = async (prompt: string, opts: Call['opts'] = {}) => {
    calls.push({ prompt, opts })
    return answer({ prompt, opts }, calls.length - 1)
  }
  const run = new AsyncFunction(
    'args',
    'agent',
    'log',
    'phase',
    SOURCE.replace(/^export const meta/m, 'const meta'),
  )
  const result = await run(
    args,
    agent,
    (message: string) => logs.push(message),
    () => {},
  )
  return { result, calls, logs }
}

const frontiers = (...answers: (Frontier | null)[]) => {
  let next = 0
  return () => answers[Math.min(next++, answers.length - 1)]
}

const TICKET = { number: 5, title: 'A ticket' }
const OTHER = { number: 6, title: 'Another ticket' }
const NOTHING: Frontier = { ready: [], awaitingYou: [], forDeveloper: [], open: 1 }
const REVIEWED = { posted: true, comments: 2, note: 'two findings' }
const GREEN = { opened: true, ready: true, pr: 50, note: 'green' }

/** Answers the start and the reviewer; `frontier` answers the frontier and `builder` the rest. */
const agents =
  (frontier: () => unknown, builder: (call: Call) => unknown = () => GREEN) =>
  (call: Call) => {
    if (call.opts.label === 'start') return { ok: true, note: '' }
    if (call.opts.label === 'frontier') return frontier()
    if (call.opts.label?.startsWith('review')) return REVIEWED
    return builder(call)
  }

describe('ship', () => {
  it('needs a spec', async () => {
    await expect(ship({}, () => null)).rejects.toThrow(/Pass args/)
  })

  it('reports the frontier on a dry run and builds nothing', async () => {
    const plan = { ...NOTHING, ready: [TICKET] }
    const { result, calls } = await ship({ spec: 101, dryRun: true }, () => plan)
    expect(result).toEqual(plan)
    expect(calls.map((call) => call.opts.label)).toEqual(['frontier'])
  })

  it('builds a ready ticket, then leaves its PR for the developer instead of merging', async () => {
    const frontier = frontiers(
      { ...NOTHING, ready: [TICKET], open: 2 },
      { ...NOTHING, awaitingYou: [{ number: 5, pr: 50 }], open: 2 },
    )
    const { result, calls, logs } = await ship({ spec: 101 }, agents(frontier))
    expect(result).toEqual({
      awaitingYou: [{ number: 5, pr: 50 }],
      stopped: [],
      waitingOnYou: [],
      open: 2,
    })
    expect(logs).toContain('Ready for your review: PR #50 (#5)')
    expect(calls.map((call) => call.opts.label)).not.toContain('final review')
  })

  it('names a ticket whose builder stopped', async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, NOTHING)
    const { result, calls } = await ship(
      { spec: 101 },
      agents(frontier, () => ({ opened: false, ready: false, note: 'needs the captures repo' })),
    )
    expect(result).toMatchObject({ stopped: [5], awaitingYou: [] })
    expect(calls.map((call) => call.opts.label)).not.toContain('review #5')
  })

  it('tells the next frontier to skip what is running, stopped or waiting for review', async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, NOTHING)
    const { calls } = await ship({ spec: 101 }, agents(frontier))
    const [, second] = calls.filter((call) => call.opts.label === 'frontier')
    expect(second?.prompt).toMatch(/except #5/)
  })

  it('runs the final review only once the developer has merged every ticket', async () => {
    const { calls } = await ship({ spec: 101 }, (call) => {
      if (call.opts.label === 'start') return { ok: true, note: '' }
      if (call.opts.label === 'frontier') return { ...NOTHING, open: 0 }
      return { opened: false, ready: false, note: 'nothing to fix' }
    })
    expect(calls.map((call) => call.opts.label)).toEqual(['start', 'frontier', 'final review'])
  })

  it.each([0, -1, 1.5, 'two'])('throws before Start when builders is %j', async (builders) => {
    for (const dryRun of [true, false]) {
      const calls: Call[] = []
      await expect(
        ship({ spec: 101, builders, dryRun }, (call) => calls.push(call)),
      ).rejects.toThrow(/builders/)
      expect(calls).toEqual([])
    }
  })

  it('counts a blocker closed as not planned as closed', async () => {
    const { calls } = await ship({ spec: 101, dryRun: true }, () => NOTHING)
    expect(calls[0]?.prompt).toMatch(/closed as not planned counts as closed/)
  })

  it('stops before building when the session cannot write', async () => {
    await expect(ship({ spec: 101 }, () => ({ ok: false, note: 'plan mode' }))).rejects.toThrow(
      /plan mode/,
    )
  })
})

describe("ship's review", () => {
  it('has a reviewer agent review the PR, then its builder answer every thread', async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, NOTHING)
    const { calls, result } = await ship({ spec: 101 }, agents(frontier))
    expect(calls.map((call) => call.opts.label)).toEqual([
      'start',
      'frontier',
      '#5',
      'review #5',
      '#5 answers',
      'frontier',
    ])
    const [build, review, answers] = calls.slice(2)
    expect(build?.prompt).toMatch(/Stop once the PR is open and every check is green/)
    expect(review?.opts).toMatchObject({ model: 'sonnet', effort: 'low' })
    expect(review?.prompt).toMatch(/PR #50/)
    expect(review?.prompt).toMatch(/code-review skill/)
    expect(review?.prompt).toMatch(/ticket #5, CLAUDE\.md and SPEC\.md/)
    expect(review?.prompt).toMatch(/one PR review with inline comments/)
    expect(review?.prompt).toMatch(/Change no file/)
    expect(answers?.prompt).toMatch(/gh pr checkout 50/)
    expect(answers?.prompt).toMatch(/resolveReviewThread/)
    expect(result).toMatchObject({ awaitingYou: [{ number: 5, pr: 50 }] })
  })

  it('reports the PR ready only once its builder has answered the review', async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, NOTHING)
    const { result } = await ship(
      { spec: 101 },
      agents(frontier, (call) =>
        call.opts.label === '#5 answers'
          ? { opened: true, ready: false, pr: 50, note: 'a thread is open' }
          : GREEN,
      ),
    )
    expect(result).toMatchObject({ stopped: [5], awaitingYou: [] })
  })

  it('needs no answers when the review found nothing', async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, NOTHING)
    const answer = agents(frontier)
    const { calls, result } = await ship({ spec: 101 }, (call) =>
      call.opts.label === 'review #5'
        ? { posted: true, comments: 0, note: 'nothing' }
        : answer(call),
    )
    expect(calls.map((call) => call.opts.label)).not.toContain('#5 answers')
    expect(result).toMatchObject({ awaitingYou: [{ number: 5, pr: 50 }] })
  })

  it('stops a ticket whose reviewer posted nothing', async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, NOTHING)
    const answer = agents(frontier)
    const { result, calls } = await ship({ spec: 101 }, (call) =>
      call.opts.label === 'review #5' ? null : answer(call),
    )
    expect(result).toMatchObject({ stopped: [5], awaitingYou: [] })
    expect(calls.map((call) => call.opts.label)).not.toContain('#5 answers')
  })

  it('hands each builder its own browser-test and shots ports', async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET, OTHER] }, NOTHING)
    const { calls } = await ship({ spec: 101 }, agents(frontier))
    const prompt = (label: string) => calls.find((call) => call.opts.label === label)?.prompt
    expect(prompt('#5')).toMatch(/E2E_PORT=3110 and SHOTS_PORT=3111/)
    expect(prompt('#6')).toMatch(/E2E_PORT=3120 and SHOTS_PORT=3121/)
    expect(prompt('#5 answers')).toMatch(/E2E_PORT=3110 and SHOTS_PORT=3111/)
  })
})

describe("ship's frontier", () => {
  it('is asked again once when its agent dies', async () => {
    const frontier = frontiers(null, { ...NOTHING, ready: [TICKET] }, NOTHING)
    const { calls } = await ship({ spec: 101 }, agents(frontier))
    expect(calls.map((call) => call.opts.label)).toContain('#5')
  })

  it('stops the loop when it dies twice, and says what is running, waiting and stopped', async () => {
    const yours = { number: 7, title: 'Yours' }
    const frontier = frontiers({ ...NOTHING, ready: [TICKET, OTHER], forDeveloper: [yours] }, null)
    const answer = agents(frontier)
    const { result, logs } = await ship({ spec: 101 }, (call) =>
      call.opts.label === '#6' ? new Promise(() => {}) : answer(call),
    )
    expect(result).toEqual({
      lost: 'the frontier agent ended twice without an answer',
      running: [6],
      awaitingYou: [{ number: 5, pr: 50 }],
      stopped: [],
      waitingOnYou: [yours],
    })
    expect(logs).toContain('Still running: #6')
  })

  it('throws on a dry run when it dies twice', async () => {
    await expect(ship({ spec: 101, dryRun: true }, () => null)).rejects.toThrow(/frontier/)
  })
})

describe("ship's agents", () => {
  const everyCall = async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, { ...NOTHING, open: 0 })
    const { calls } = await ship({ spec: 101 }, agents(frontier))
    return calls
  }

  it('each run on an explicit, light model', async () => {
    const calls = await everyCall()
    expect(calls.map((call) => call.opts.label)).toEqual([
      'start',
      'frontier',
      '#5',
      'review #5',
      '#5 answers',
      'frontier',
      'final review',
    ])
    for (const { opts } of calls) {
      expect(['opus', 'sonnet', 'haiku']).toContain(opts.model)
      expect(['low', 'medium']).toContain(opts.effort)
    }
  })

  it.each([
    'gh pr merge',
    '--auto',
    'branch -d',
    'branch -D',
    'squash-merged',
    'merge it yourself',
  ])('are never told %j', async (phrase) => {
    expect(SOURCE).not.toContain(phrase)
    for (const { prompt } of await everyCall()) expect(prompt).not.toContain(phrase)
  })

  it('are told the developer merges and deletes', async () => {
    const calls = await everyCall()
    for (const label of ['#5', '#5 answers']) {
      const builder = calls.find((call) => call.opts.label === label)
      expect(builder?.prompt).toMatch(
        /never merge it, never turn on auto-merge, and never delete a branch/,
      )
      expect(builder?.prompt).toMatch(/CLAUDE\.md and SPEC\.md/)
    }
  })
})
