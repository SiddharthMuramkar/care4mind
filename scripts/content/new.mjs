#!/usr/bin/env node
// Writes a new record file, with every field of its kind laid out, then the content registry.
//
//   pnpm content:new <kind> <id>
//   node scripts/content/new.mjs <kind> <id> [--root <dir>]
//
// It refuses a file that exists and an id that breaks the id rules. It reads no saved page and
// never touches the network. How to fill the template: docs/agents/content-migration.md.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runTool, ToolError } from './extract.mjs'
import { KIND_FOLDERS, rootFrom } from './verify.mjs'

const USAGE = `Usage: pnpm content:new <kind> <id>
Kinds: ${Object.keys(KIND_FOLDERS).join(', ')}.`

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LOCATOR = /^\d+(?:\.\d+)*$/

/** Why an id breaks the id rules for its kind (D02, settled rule 15), or nothing if it doesn't. */
function idProblem(kind, id) {
  if (kind === 'home') return id === 'home' ? undefined : 'The homepage’s id is always “home”.'
  if (kind === 'passage') {
    const [work = '', locator = '', ...rest] = id.split('/')
    if (rest.length === 0 && SLUG.test(work) && LOCATOR.test(locator)) return undefined
    return `“${id}” is not a passage id: its work’s slug and its locator, as in yoga-sutra/1.30.`
  }
  if (SLUG.test(id)) return undefined
  return kind === 'reference'
    ? `“${id}” is not a Reference id: lowercase ASCII words joined by hyphens, as in tomar-2024 or jain-diwakar-2019.`
    : `“${id}” is not a slug: lowercase ASCII words joined by hyphens, as in vikshepa or five-steps-of-perfection.`
}

const PROVENANCE = `  provenance: {
    // The saved page's address, such as https://care4mind.org/vikshepa/, and the day the
    // saved copies were made.
    sources: [{ url: '', retrieved: '2026-10-27' }],
    edits: [], // one change each; a replacement is written “old” → “new”, a deletion “old” → “”
    flags: [], // { for: 'research-editor' | 'psychology-expert' | 'project-owner', note, ticket? }
    // drafted: [], // fields written for the new site: never in a migration ticket
  },`

/** The body of each kind's record, as TypeScript: every field, optional ones commented out. */
const TEMPLATES = {
  concept: (id) => `defineConcept({
  kind: 'concept',
  slug: '${id}',
  // The headword from the page's own text; \`english\` only as a gloss the page gives.
  name: { term: { iast: '', devanagari: '', ascii: [] }, english: '' },
  summary: '', // sentences from the page, never newly written
  topics: { primary: '' }, // also: []
  verses: [], // { passage: 'work/locator', translation: '', meaning: '' }, in the page's order
  sections: [], // { id, heading, role?, blocks }
  references: [], // Reference ids, in the page's order
  // questionnaire: '',
  // related: [],
  // external: [{ label: '', url: '' }],
  reviewStatus: 'carried-over-not-reviewed',
${PROVENANCE}
})`,
  topic: (id) => `defineTopic({
  kind: 'topic',
  slug: '${id}',
  name: { english: '' }, // term: { iast: '', ascii: [] }
  order: 0,
  // intro: { sections: [], references: [], provenance: { sources: [], edits: [], flags: [] } },
})`,
  work: (id) => `defineWork({
  kind: 'work',
  slug: '${id}',
  title: { iast: '', ascii: [] }, // devanagari: '', english: ''
  // language: 'pi', // Sanskrit unless stated
  // attribution: '',
  locatorLabel: '',
  // editions: [],
${PROVENANCE}
})`,
  passage: (id) => {
    const [work, locator] = id.split('/')
    return `definePassage({
  kind: 'passage',
  id: '${id}',
  work: '${work}',
  locator: '${locator}',
  order: [${locator.split('.').join(', ')}],
  devanagari: [], // lines as a page gives them; empty, and flagged, when no page does
  // transliteration: { lines: [], scheme: 'iast' }, // 'informal' unless it follows IAST
  translations: [], // { id, text, source? }: each text a page labels "Translation"
${PROVENANCE}
})`
  },
  reference: (id) => `defineReference({
  kind: 'reference',
  id: '${id}',
  type: 'journal-article', // book, chapter, thesis, web-page, dictionary-entry, report or other
  // authors: '',
  // year: '',
  title: '',
  // container: '',
  // publisher: '',
  // volume: '',
  // issue: '',
  // pages: '',
  // edition: '',
  // doi: '',
  // url: '',
  // noStableLink: 'none given on the current site; not looked up',
  asCited: [], // each distinct way a page writes it
${PROVENANCE}
})`,
  questionnaire: (id) => `defineQuestionnaire({
  kind: 'questionnaire',
  slug: '${id}',
  title: '', // the name the page gives its questionnaire, else the page title
  sourceTitle: '', // the page title as published
  status: 'coming-later',
  // summary: '',
  // purpose: [], // only text that says what it measures, flagged for the Psychology expert
  // format: [],
  concepts: [],
  // source: '',
  // candidateSource: '',
  // limitations: { items: [], status: 'draft-pending-psychology-expert' },
  // form: { responseSets: {}, parts: [] },
  scoring: { status: 'pending', reason: '' },
  heldBack: [], // { what, where }: each score section left out, described, never quoted
  // rights: { status: 'permission-needed', holder: '', note: '' },
  reviewStatus: 'carried-over-not-reviewed',
${PROVENANCE}
})`,
  glossary: (id) => `defineGlossaryEntry({
  kind: 'glossary',
  slug: '${id}',
  name: { ascii: '' }, // devanagari: '', iast: ''
  // definition: '',
  // url: '', // its DharmaWiki article, exactly as the card links it
  // concept: '',
${PROVENANCE}
})`,
  'resource-list': (id) => `defineResourceList({
  kind: 'resource-list',
  slug: '${id}',
  title: '',
  groups: [], // { id, heading, items }: each item a Reference or a course (see the schema)
${PROVENANCE}
})`,
  page: (id) => `definePage({
  kind: 'page',
  slug: '${id}',
  title: '',
  summary: '',
  sections: [],
${PROVENANCE}
})`,
  home: () => `defineHome({
  kind: 'home',
  shloka: { devanagari: '', iast: '', translation: '' },
  intro: '',
  areas: [], // { title, text, target? }
  closing: '',
  helpLine: '',
${PROVENANCE}
})`,
}

/** The record file for a new record of this kind and id. */
function template(kind, id) {
  const body = TEMPLATES[kind](id)
  const helper = body.slice(0, body.indexOf('('))
  return `import { ${helper} } from '@/content/schema'

// Written by \`pnpm content:new ${kind} ${id}\`. Fill every field from the saved page, as
// docs/agents/content-migration.md says; delete the commented fields the page doesn't give.
// Then check it with \`node scripts/content/verify.mjs ${kind}/${id}\`.
export default ${body}
`
}

async function main(args) {
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`${USAGE}\n`)
    return 0
  }
  const { root, rest } = rootFrom(args)
  const [kind, id, ...extra] = rest
  if (!kind || !id || extra.length > 0) throw new ToolError(USAGE)
  if (!(kind in KIND_FOLDERS)) throw new ToolError(`“${kind}” is not a kind of record.\n${USAGE}`)
  const problem = idProblem(kind, id)
  if (problem) throw new ToolError(problem)

  const path = `src/content/data/${KIND_FOLDERS[kind]}/${id}.ts`
  const file = join(root, path)
  if (existsSync(file)) throw new ToolError(`${path} exists already: edit it instead.`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, template(kind, id))

  const registry = fileURLToPath(new URL('./registry.mjs', import.meta.url))
  const written = spawnSync(process.execPath, [registry, '--root', root], { encoding: 'utf8' })
  if (written.status !== 0) throw new ToolError(written.stderr.trim())
  process.stdout.write(
    `Wrote ${path}, and the registry.\n` +
      `Fill it from the saved page (node scripts/content/extract.mjs <slug>), then check it with ` +
      `node scripts/content/verify.mjs ${kind}/${id}\n`,
  )
  return 0
}

await runTool(import.meta, main)
