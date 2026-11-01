#!/usr/bin/env node
// Gathers every flag in the records into one pack, grouped by who must answer it, with the
// drafted fields, each Questionnaire's held-back items and a map of the saved pages.
//
//   node scripts/content/report.mjs            prints the pack
//   node scripts/content/report.mjs --write    saves it as .scratch/content-flags.md
//
// It reads the saved copies only from $CARE4MIND_CAPTURES and never touches the network. It
// writes nothing unless asked with --write, and then only into .scratch/, which git ignores: the
// pack is a working list for the people who answer flags, rebuilt from the records at will.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { openCaptures, runTool, ToolError } from './extract.mjs'
import { idOf, loadRecords, rootFrom, sortRecords } from './verify.mjs'

/** Where --write saves the pack, relative to the repo root: a path git ignores. */
export const FLAGS_PACK = '.scratch/content-flags.md'

const ROLES = [
  ['research-editor', 'Research editor'],
  ['psychology-expert', 'Psychology expert'],
  ['project-owner', 'Project owner'],
]

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

/** Every provenance a record keeps: its own, or a topic introduction's. */
function provenancesOf(record) {
  if (record.kind === 'topic') return record.intro ? [record.intro.provenance] : []
  return [record.provenance]
}

/** The flags pack, as Markdown, for these records and the saved pages in `captures`. */
export function buildReport(records, captures) {
  const sorted = sortRecords(records)
  const name = (record) => `${record.kind}/${idOf(record)}`
  const out = []

  // Flags, by role. Identical notes collapse into one line naming every record that has them.
  const byRole = new Map(ROLES.map(([role]) => [role, new Map()]))
  for (const record of sorted)
    for (const provenance of provenancesOf(record))
      for (const flag of provenance.flags) {
        const notes = byRole.get(flag.for)
        if (!notes) continue
        const line = notes.get(flag.note) ?? { records: [], tickets: new Set(), count: 0 }
        line.count += 1
        if (!line.records.includes(name(record))) line.records.push(name(record))
        if (flag.ticket !== undefined) line.tickets.add(flag.ticket)
        notes.set(flag.note, line)
      }
  const flagCount = (role) => [...byRole.get(role).values()].reduce((sum, l) => sum + l.count, 0)

  out.push(
    '# Content v1 flags',
    '',
    `Written by \`node scripts/content/report.mjs --write\` from ${plural(sorted.length, 'record')} ` +
      `and ${plural(captures.pages.length, 'saved page')}. Run the command again rather than ` +
      'editing this file.',
    '',
    ...ROLES.map(([role, title]) => `- ${title}: ${plural(flagCount(role), 'flag')}`),
  )
  for (const [role, title] of ROLES) {
    out.push('', `## ${title}: ${plural(flagCount(role), 'flag')}`, '')
    for (const [note, line] of byRole.get(role)) {
      const tickets = [...line.tickets].sort((a, b) => a - b)
      const ticket =
        tickets.length === 0
          ? ''
          : ` (${tickets.length === 1 ? 'ticket' : 'tickets'} ${tickets.join(', ')})`
      const named =
        line.records.length > 1
          ? `${line.records.length} records: ${line.records.join(', ')}`
          : line.records[0]
      out.push(`- ${note} — ${named}${ticket}`)
    }
    if (byRole.get(role).size === 0) out.push('None.')
  }

  // Fields written for the new site rather than carried over.
  out.push('', '## Drafted fields', '')
  const drafted = sorted.flatMap((record) =>
    provenancesOf(record)
      .filter((provenance) => (provenance.drafted ?? []).length > 0)
      .map((provenance) => `- ${name(record)}: ${provenance.drafted.join(', ')}`),
  )
  out.push(...(drafted.length > 0 ? drafted : ['None.']))

  // What each Questionnaire left out: described, never quoted.
  out.push('', '## Held back', '')
  const questionnaires = sorted.filter((record) => record.kind === 'questionnaire')
  if (questionnaires.length === 0) out.push('No Questionnaires.')
  for (const questionnaire of questionnaires) {
    out.push(`### ${name(questionnaire)}`, '')
    out.push(
      ...(questionnaire.heldBack.length > 0
        ? questionnaire.heldBack.map(({ what, where }) => `- ${what} — ${where}`)
        : ['Nothing held back.']),
      '',
    )
  }
  if (out.at(-1) === '') out.pop()

  // Every saved page, with the records whose provenance names it.
  out.push(
    '',
    '## Page map',
    '',
    'Every saved page and post of the current site, with the records whose provenance names it.',
    '',
    '| Saved page | Title | Records |',
    '| --- | --- | --- |',
  )
  const pages = [...captures.pages].sort((a, b) => a.path.localeCompare(b.path))
  for (const page of pages) {
    const named = sorted.filter((record) =>
      provenancesOf(record).some((provenance) =>
        provenance.sources.some(({ url }) => captures.page(url) === page),
      ),
    )
    const cell = named.length > 0 ? named.map(name).join(', ') : 'dropped'
    out.push(`| \`${page.path}\` | ${page.title.replaceAll('|', '\\|')} | ${cell} |`)
  }
  return `${out.join('\n')}\n`
}

const USAGE = `Usage: node scripts/content/report.mjs [--write]

Prints the flags pack: every flag in the records, by role, then the drafted fields, each
Questionnaire's held-back items and a map of the saved pages in $CARE4MIND_CAPTURES.
--write saves it as ${FLAGS_PACK} instead.`

async function main(args) {
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`${USAGE}\n`)
    return 0
  }
  const captures = openCaptures()
  const { root, rest } = rootFrom(args)
  const write = rest.includes('--write')
  const unknown = rest.filter((arg) => arg !== '--write')
  if (unknown.length > 0) throw new ToolError(`Unknown argument: ${unknown[0]}\n${USAGE}`)
  const text = buildReport(await loadRecords(root), captures)
  if (!write) {
    process.stdout.write(text)
    return 0
  }
  const file = join(root, FLAGS_PACK)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
  process.stdout.write(`Wrote ${FLAGS_PACK}.\n`)
  return 0
}

await runTool(import.meta, main)
