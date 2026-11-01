import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

// The ruleset that protects main (.github/rulesets/main.json), read offline: what it demands,
// and that the check it requires is one CI really runs, as a gate that waits for every job.

interface Rule {
  type: string
  parameters?: Record<string, unknown>
}

interface Ruleset {
  name: string
  target: string
  enforcement: string
  conditions: { ref_name: { include: string[]; exclude: string[] } }
  bypass_actors: unknown[]
  rules: Rule[]
}

interface Job {
  name?: string
  needs?: string | string[]
  if?: string
}

const { differences, requiredChecks } = (await import(
  pathToFileURL(resolve('scripts/github/ruleset.mjs')).href
)) as {
  differences(wanted: unknown, live: unknown): string[]
  requiredChecks(ruleset: Ruleset): string[]
}

const wanted = JSON.parse(readFileSync('.github/rulesets/main.json', 'utf8')) as Ruleset
const jobs = Object.entries(
  (parse(readFileSync('.github/workflows/ci.yml', 'utf8')) as { jobs: Record<string, Job> }).jobs,
)
const parameters = (type: string) => wanted.rules.find((rule) => rule.type === type)?.parameters

/** GitHub Actions' app id, so only a check GitHub Actions reports can satisfy the ruleset. */
const ACTIONS = 15368
/** Jobs that only gather what others found, so the gate needn't wait for them. */
const REPORTS_ONLY = new Set(['report'])

describe('the ruleset on main', () => {
  it('is active on the default branch, and nobody can bypass it', () => {
    expect(wanted.enforcement).toBe('active')
    expect(wanted.target).toBe('branch')
    expect(wanted.conditions.ref_name.include).toEqual(['~DEFAULT_BRANCH'])
    // Agents use the developer's own login, so a bypass for the developer is one for every agent.
    expect(wanted.bypass_actors).toEqual([])
  })

  it('keeps main from being deleted, force-pushed or given merge commits', () => {
    const types = wanted.rules.map((rule) => rule.type)
    expect(types).toEqual(
      expect.arrayContaining(['deletion', 'non_fast_forward', 'required_linear_history']),
    )
  })

  it('takes every change through a squashed PR whose conversations are all resolved', () => {
    expect(parameters('pull_request')).toMatchObject({
      // GitHub won't let anyone approve a PR opened from their own login, which is every PR here.
      required_approving_review_count: 0,
      required_review_thread_resolution: true,
      allowed_merge_methods: ['squash'],
    })
  })

  it('requires its checks, from GitHub Actions, on a branch that is up to date with main', () => {
    const checks = parameters('required_status_checks') as {
      strict_required_status_checks_policy: boolean
      required_status_checks: { context: string; integration_id: number }[]
    }
    expect(checks.strict_required_status_checks_policy).toBe(true)
    expect(checks.required_status_checks.length).toBeGreaterThan(0)
    for (const check of checks.required_status_checks) expect(check.integration_id).toBe(ACTIONS)
  })
})

describe('the check it requires', () => {
  const names = jobs.map(([id, job]) => job.name ?? id)

  it.each(requiredChecks(wanted))('%j is the name of a job in ci.yml', (check) => {
    expect(names).toContain(check)
  })

  it.each(requiredChecks(wanted))('%j waits for every other job, whatever they did', (check) => {
    const found = jobs.find(([key, job]) => (job.name ?? key) === check)
    if (!found) throw new Error(`ci.yml has no job named ${check}`)
    const [id, gate] = found
    const needs = [gate.needs ?? []].flat()
    // A gate skipped because a job failed would count as passing.
    expect(gate.if?.replace(/\s/g, '')).toBe('${{always()}}')
    for (const [other] of jobs)
      if (other !== id && !REPORTS_ONLY.has(other)) expect(needs).toContain(other)
  })
})

describe('comparing the file with GitHub', () => {
  const live = structuredClone(wanted) as Ruleset & Record<string, unknown>

  it('finds nothing when GitHub matches, whatever fields GitHub adds', () => {
    const decorated = {
      ...live,
      id: 1,
      node_id: 'x',
      _links: {},
      rules: live.rules.map((rule) => ({
        ...rule,
        parameters: rule.parameters && { ...rule.parameters, extra: true },
      })),
    }
    expect(differences(wanted, decorated)).toEqual([])
  })

  it('names a setting GitHub has changed', () => {
    const relaxed = structuredClone(live)
    relaxed.rules = relaxed.rules.map((rule) =>
      rule.type === 'pull_request'
        ? { ...rule, parameters: { ...rule.parameters, required_review_thread_resolution: false } }
        : rule,
    )
    expect(differences(wanted, relaxed)).toEqual([
      'ruleset.rules[pull_request].parameters.required_review_thread_resolution: GitHub has false, the file true',
    ])
  })

  it('names a rule that is missing, and one that GitHub has and the file lacks', () => {
    const changed = structuredClone(live)
    changed.rules = [
      ...changed.rules.filter((rule) => rule.type !== 'deletion'),
      { type: 'creation' },
    ]
    expect(differences(wanted, changed)).toEqual([
      'ruleset.rules: GitHub has no deletion rule',
      "ruleset.rules: GitHub has a creation rule the file doesn't",
    ])
  })

  it('compares required checks as a set, app included', () => {
    const renamed = structuredClone(live)
    renamed.rules = renamed.rules.map((rule) =>
      rule.type === 'required_status_checks'
        ? {
            ...rule,
            parameters: {
              ...rule.parameters,
              required_status_checks: [{ context: 'Checks', integration_id: ACTIONS }],
            },
          }
        : rule,
    )
    expect(differences(wanted, renamed)).toHaveLength(1)
    expect(differences(wanted, renamed)[0]).toMatch(/GitHub requires \["Checks \(app 15368\)"\]/)
  })

  it('notices a bypass actor', () => {
    const bypassed = {
      ...structuredClone(live),
      bypass_actors: [{ actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' }],
    }
    expect(differences(wanted, bypassed)).toHaveLength(1)
  })
})
