import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

// The ship workflow (.claude/workflows/ship.js), run against made-up agents: it opens PRs and
// leaves them for the developer, never tells an agent to merge or delete a branch, and gives
// every agent an explicit, light model.

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

const frontiers = (...answers: Frontier[]) => {
  let next = 0
  return () => answers[Math.min(next++, answers.length - 1)]
}

const TICKET = { number: 5, title: 'A ticket' }
const NOTHING: Frontier = { ready: [], awaitingYou: [], forDeveloper: [], open: 1 }

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
    const { result, calls, logs } = await ship({ spec: 101 }, (call) => {
      if (call.opts.label === 'start') return { ok: true, note: '' }
      if (call.opts.label === 'frontier') return frontier()
      return { opened: true, ready: true, pr: 50, note: 'green' }
    })
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
    const { result } = await ship({ spec: 101 }, (call) => {
      if (call.opts.label === 'start') return { ok: true, note: '' }
      if (call.opts.label === 'frontier') return frontier()
      return { opened: false, ready: false, note: 'needs the captures repo' }
    })
    expect(result).toMatchObject({ stopped: [5], awaitingYou: [] })
  })

  it('tells the next frontier to skip what is running, stopped or waiting for review', async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, NOTHING)
    const { calls } = await ship({ spec: 101 }, (call) => {
      if (call.opts.label === 'start') return { ok: true, note: '' }
      if (call.opts.label === 'frontier') return frontier()
      return { opened: true, ready: true, pr: 50, note: '' }
    })
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

  it('stops before building when the session cannot write', async () => {
    await expect(ship({ spec: 101 }, () => ({ ok: false, note: 'plan mode' }))).rejects.toThrow(
      /plan mode/,
    )
  })
})

describe("ship's agents", () => {
  const everyCall = async () => {
    const frontier = frontiers({ ...NOTHING, ready: [TICKET] }, { ...NOTHING, open: 0 })
    const { calls } = await ship({ spec: 101 }, (call) => {
      if (call.opts.label === 'start') return { ok: true, note: '' }
      if (call.opts.label === 'frontier') return frontier()
      return { opened: true, ready: true, pr: 50, note: '' }
    })
    return calls
  }

  it('each run on an explicit, light model', async () => {
    const calls = await everyCall()
    expect(calls.map((call) => call.opts.label)).toEqual([
      'start',
      'frontier',
      '#5',
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
    const builder = (await everyCall()).find((call) => call.opts.label === '#5')
    expect(builder?.prompt).toMatch(
      /never merge it, never turn on auto-merge, and never delete a branch/,
    )
    expect(builder?.prompt).toMatch(/CLAUDE\.md and SPEC\.md/)
  })
})
