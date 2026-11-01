#!/usr/bin/env node
// @ts-check
// Makes the ruleset GitHub enforces on main match .github/rulesets/main.json.
//
//   pnpm ruleset:apply --commit <sha>
//
// It refuses to require a check that hasn't completed on <sha> (a PR's head, or main's), so a
// misspelt or renamed check can't lock main: with no bypass, nothing could merge until someone
// fixed the ruleset by hand. The guard asks the developer before this runs.
//
// To undo an apply, put the previous file back (git show <commit>:.github/rulesets/main.json)
// and apply again, or edit the ruleset under Settings → Rules on GitHub.

import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { differences, findLive, gh, readWanted, REPO, requiredChecks } from './ruleset.mjs'

/** The checks that have run on a commit, as { name, status, conclusion }. */
function checksOn(sha) {
  const pages = gh([
    'api',
    '--paginate',
    `repos/${REPO}/commits/${sha}/check-runs`,
    '--jq',
    '.check_runs[] | [.name, .status, .conclusion // ""] | @tsv',
  ])
  return pages
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, status, conclusion] = line.split('\t')
      return { name, status, conclusion }
    })
}

function main(argv) {
  const at = argv.indexOf('--commit')
  const sha = at === -1 ? null : argv[at + 1]
  if (!sha)
    throw new Error('Pass --commit <sha>: a commit on which every required check has completed.')

  const wanted = readWanted()
  const ran = checksOn(sha)
  for (const name of requiredChecks(wanted)) {
    const run = ran.find((check) => check.name === name)
    if (!run || run.status !== 'completed')
      throw new Error(`"${name}" hasn't completed on ${sha}, so requiring it now could lock main.`)
    if (run.conclusion !== 'success')
      console.error(`Warning: "${name}" ended ${run.conclusion} on ${sha}.`)
  }

  const live = findLive()
  const before = live
    ? differences(wanted, live)
    : ['GitHub has no ruleset for the default branch yet']
  if (live && before.length === 0) {
    console.log(`GitHub's ruleset "${live.name}" (${live.id}) already matches the file.`)
    return
  }
  const endpoint = live ? `repos/${REPO}/rulesets/${live.id}` : `repos/${REPO}/rulesets`
  const saved = JSON.parse(
    gh(
      ['api', '--method', live ? 'PUT' : 'POST', endpoint, '--input', '-'],
      JSON.stringify(wanted),
    ),
  )
  console.log(`Applied .github/rulesets/main.json to "${saved.name}" (${saved.id}). It changed:`)
  for (const line of before) console.log(`  ${line}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(`ruleset:apply: ${error.message}`)
    process.exitCode = 1
  }
}
