#!/usr/bin/env node
// @ts-check
// The ruleset that protects main lives in .github/rulesets/main.json, and this compares it with
// the one GitHub enforces. Agents act through the developer's own GitHub login, so GitHub can't
// tell them apart, and the ruleset has no bypass: it holds for everyone.
//
//   pnpm ruleset:check    exit 1 when GitHub's ruleset differs from the file, saying how
//
// scripts/github/apply-ruleset.mjs makes GitHub match the file. Both read GitHub through gh.
// Tested in tests/unit/ruleset.test.ts.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const REPO = 'SiddharthMuramkar/care4mind'
export const FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../.github/rulesets/main.json',
)

export const readWanted = () => JSON.parse(readFileSync(FILE, 'utf8'))

export const gh = (args, input) =>
  execFileSync('gh', args, {
    encoding: 'utf8',
    input,
    stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
  })

/** The names of the checks a ruleset requires to pass. */
export function requiredChecks(ruleset) {
  return ruleset.rules
    .filter((rule) => rule.type === 'required_status_checks')
    .flatMap((rule) => rule.parameters.required_status_checks.map((check) => check.context))
}

const show = (value) => JSON.stringify(value)
const key = (value) => JSON.stringify(value, Object.keys(value ?? {}).sort())

/**
 * Where `live` differs from `wanted`, one line each. Only what `wanted` sets is compared, so
 * fields GitHub adds or defaults don't count, but a rule GitHub has and the file lacks does.
 */
export function differences(wanted, live, path = 'ruleset') {
  if (Array.isArray(wanted)) {
    if (!Array.isArray(live)) return [`${path}: GitHub has ${show(live)}, the file has a list`]
    if (path.endsWith('.rules')) {
      const found = wanted.flatMap((rule) => {
        const match = live.find((candidate) => candidate.type === rule.type)
        return match
          ? differences(rule, match, `${path}[${rule.type}]`)
          : [`${path}: GitHub has no ${rule.type} rule`]
      })
      const extra = live
        .filter((candidate) => !wanted.some((rule) => rule.type === candidate.type))
        .map((candidate) => `${path}: GitHub has a ${candidate.type} rule the file doesn't`)
      return [...found, ...extra]
    }
    if (path.endsWith('.required_status_checks')) {
      const named = (checks) =>
        checks.map((check) => `${check.context} (app ${check.integration_id ?? 'any'})`).sort()
      return show(named(wanted)) === show(named(live))
        ? []
        : [`${path}: GitHub requires ${show(named(live))}, the file ${show(named(wanted))}`]
    }
    const sorted = (list) => list.map(key).sort()
    return show(sorted(wanted)) === show(sorted(live))
      ? []
      : [`${path}: GitHub has ${show(live)}, the file ${show(wanted)}`]
  }
  if (wanted !== null && typeof wanted === 'object') {
    if (live === null || typeof live !== 'object') return [`${path}: GitHub has ${show(live)}`]
    return Object.keys(wanted).flatMap((name) =>
      differences(wanted[name], live[name], `${path}.${name}`),
    )
  }
  return Object.is(wanted, live)
    ? []
    : [`${path}: GitHub has ${show(live)}, the file ${show(wanted)}`]
}

/** GitHub's branch ruleset for the default branch: the one with the file's name, or the only one. */
export function findLive(repo = REPO, name = readWanted().name) {
  const summaries = JSON.parse(gh(['api', `repos/${repo}/rulesets`]))
  const details = summaries
    .filter((summary) => summary.target === 'branch')
    .map((summary) => JSON.parse(gh(['api', `repos/${repo}/rulesets/${summary.id}`])))
  return (
    details.find((ruleset) => ruleset.name === name) ??
    details.find((ruleset) => ruleset.conditions?.ref_name?.include?.includes('~DEFAULT_BRANCH')) ??
    null
  )
}

function main() {
  const live = findLive()
  if (!live) {
    console.error(`ruleset:check: ${REPO} has no ruleset for its default branch.`)
    process.exitCode = 1
    return
  }
  const found = differences(readWanted(), live)
  if (found.length === 0) {
    console.log(`GitHub's ruleset "${live.name}" (${live.id}) matches .github/rulesets/main.json.`)
    return
  }
  console.error(
    `GitHub's ruleset "${live.name}" (${live.id}) differs from .github/rulesets/main.json:`,
  )
  for (const line of found) console.error(`  ${line}`)
  process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main()
