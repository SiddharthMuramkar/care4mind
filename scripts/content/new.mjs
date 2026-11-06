#!/usr/bin/env node
// @ts-check
// Writes a new record file, with every field of its kind laid out, then the content registry.
//
//   pnpm content:new <kind> <id> [--written]
//   node scripts/content/new.mjs <kind> <id> [--written] [--root <dir>]
//
// Without --written the record is carried over from a saved page. With it the record is written
// for the new site: its provenance names its author and day instead of a source page.
//
// It refuses a file that exists and an id that breaks the id rules. It reads no saved page and
// never touches the network. How to fill it is in the comment atop each template (`FILLING`), the
// comments on its fields, and the schema's doc comments; tests/unit/content-integrity.test.ts
// enforces the rest.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { isSlug } from '../../src/content/schema/common.ts'
import { KIND_FOLDERS } from '../../src/content/schema/kinds.ts'
import { rootFrom, runTool, ToolError } from './cli.mjs'

const USAGE = `Usage: pnpm content:new <kind> <id> [--written]
Kinds: ${Object.keys(KIND_FOLDERS).join(', ')}. --written writes a record written for the new site, with no source page.`
// No leading zeros: the locator becomes the number literals of `order`, where 05 is not a number.
const LOCATOR = /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))*$/

/** Why an id breaks the id rules for its kind, or nothing if it doesn't. */
function idProblem(kind, id) {
  if (kind === 'home') return id === 'home' ? undefined : 'The homepage’s id is always “home”.'
  if (kind === 'passage') {
    const [work = '', locator = '', ...rest] = id.split('/')
    if (rest.length === 0 && isSlug(work) && LOCATOR.test(locator)) return undefined
    return `“${id}” is not a passage id: its work’s slug and its locator, as in yoga-sutra/1.30.`
  }
  if (isSlug(id)) return undefined
  return kind === 'reference'
    ? `“${id}” is not a Reference id: lowercase ASCII words joined by hyphens, as in tomar-2024 or jain-diwakar-2019.`
    : `“${id}” is not a slug: lowercase ASCII words joined by hyphens, as in vikshepa or five-steps-of-perfection.`
}

const PROVENANCE = `  provenance: {
    // The saved page's address, such as https://care4mind.org/vikshepa/, and the day the
    // saved copies were made.
    sources: [{ url: '', retrieved: '2026-10-27' }],
    edits: [], // one change each; a replacement is written “old” → “new”, a deletion “old” → “”
    flags: [], // { for: 'research-editor' | 'psychology-expert' | 'project-owner', note, decidedBy?, missing?, citation? }
    // drafted: [], // fields written for the new site: never in a migration ticket
    // origin: 'written', writtenBy: '', writtenOn: '', // only a record made with --written
  },`

const PROVENANCE_WRITTEN = `  provenance: {
    // Written for the new site: no saved page holds these words, so no source is named.
    origin: 'written',
    sources: [],
    edits: [],
    flags: [], // { for: 'research-editor' | 'psychology-expert' | 'project-owner', note, decidedBy?, missing?, citation? }
    writtenBy: '', // who wrote this record
    writtenOn: '', // the day it was written, as 2026-11-06
  },`

/** A template's provenance and review status: carried over, or written with `--written`. */
const provenanceOf = (written) => (written ? PROVENANCE_WRITTEN : PROVENANCE)
const statusOf = (written) => (written ? 'drafted-not-reviewed' : 'carried-over-not-reviewed')

/** How to fill any record from a saved page: the rules no test or type can check. */
const FILLING = `//
// - Every string is the page's own text, or a change listed in provenance.edits. Nothing is
//   invented, reworded or looked up: a gap is flagged.
// - Text is NFC, with anusvara written ṃ, never ṁ (normaliseSanskrit() does both; list it once).
// - Typos are fixed and listed: “Negliegence” → “Negligence”. Questionnaire items, options and
//   forms are the exception: kept verbatim, and an oddity is flagged for the psychology expert.
// - A problem you notice but may not fix stays as the page has it, flagged for the role that
//   decides it: research-editor (sources, spellings, wording), psychology-expert (anything about
//   a Questionnaire) or project-owner (keep, merge or drop, rights, links with nowhere to go).
//   Write each note to stand alone; a question another record asks is copied word for word.
// - # links are dropped and flagged; other links in running text are dropped and listed. A
//   Reference's own link moves to its url or doi.
// - Interface text ("Read more", "Click to learn more", accordion titles) and images are dropped,
//   and listed once: no image or other media file from the current site is carried over.
// - Score and interpretation text never comes over: describe each in heldBack, never quote it.
// - Nothing is drafted: a migrated record is carried-over-not-reviewed.
//`

/** How to write a record new: the rules no test or type can check. */
const FILLING_WRITTEN = `//
// - Every field is yours to write: nothing came from a saved page, so provenance names no
//   source, no edits and no drafted fields — only origin: 'written', writtenBy and writtenOn.
// - Text is NFC, with anusvara written ṃ, never ṁ. A fact you cannot stand over is flagged
//   for the role that decides it: research-editor (sources, spellings, wording),
//   psychology-expert (anything about a Questionnaire) or project-owner (rights, scope).
//   Write each note to stand alone.
// - Score and interpretation text is never written: describe each in heldBack, never quote it.
// - Until a person checks it, a written record is drafted-not-reviewed.
//`

/** The body of each kind's record, as TypeScript: every field, optional ones commented out. */
const TEMPLATES = {
  concept: (id, written) => `defineConcept({
  kind: 'concept',
  slug: '${id}',
  // The headword from the page's own text; \`english\` only as a gloss the page gives.
  name: { term: { iast: '', devanagari: '', ascii: [] }, english: '' },
  summary: '', // ${written ? 'your own sentences' : 'sentences from the page, never newly written'}
  // whyItMatters: '', // one line, once the Research editor supplies it
  keywords: [], // plain lowercase words from its own text${written ? '' : "; name 'keywords' in provenance.drafted"}
  topics: { primary: '' }, // also: []
  verses: [], // { passage: 'work/locator', translation: '', meaning: '' }, in the page's order
  sections: [], // { id, heading, role?, blocks }
  references: [], // Reference ids, in the page's order
  // questionnaire: '',
  // related: [],
  // external: [{ label: '', url: '' }],
  reviewStatus: '${statusOf(written)}',
${provenanceOf(written)}
})`,
  topic: (id, written) => `defineTopic({
  kind: 'topic',
  slug: '${id}',
  name: { english: '' }, // term: { iast: '', ascii: [] }
  order: 0,
  // intro: { sections: [], references: [], provenance: { ${written ? "origin: 'written', sources: [], edits: [], flags: [], writtenBy: '', writtenOn: ''" : 'sources: [], edits: [], flags: []'} } },
})`,
  work: (id, written) => `defineWork({
  kind: 'work',
  slug: '${id}',
  title: { iast: '', ascii: [] }, // devanagari: '', english: ''
  // language: 'pi', // Sanskrit unless stated
  // attribution: '',
  locatorLabel: '',
  // editions: [],
${provenanceOf(written)}
})`,
  passage: (id, written) => {
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
${provenanceOf(written)}
})`
  },
  reference: (id, written) => `defineReference({
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
${provenanceOf(written)}
})`,
  questionnaire: (id, written) => `defineQuestionnaire({
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
  reviewStatus: '${statusOf(written)}',
${provenanceOf(written)}
})`,
  glossary: (id, written) => `defineGlossaryEntry({
  kind: 'glossary',
  slug: '${id}',
  name: { ascii: '' }, // devanagari: '', iast: ''
  // definition: '',
  // url: '', // its DharmaWiki article, exactly as the card links it
  // concept: '',
${provenanceOf(written)}
})`,
  'resource-list': (id, written) => `defineResourceList({
  kind: 'resource-list',
  slug: '${id}',
  title: '',
  groups: [], // { id, heading, items }: each item a Reference or a course (see the schema)
${provenanceOf(written)}
})`,
  page: (id, written) => `definePage({
  kind: 'page',
  slug: '${id}',
  title: '',
  summary: '',
  sections: [],
${provenanceOf(written)}
})`,
  home: (_id, written) => `defineHome({
  kind: 'home',
  tagline: '',
  shloka: { devanagari: '', iast: '', translation: '' },
  hero: { promise: '', subhead: '', startHere: '', browseConcepts: '', exploreConcepts: '' },
  sectionIntros: { concepts: '', questionnaires: '' },
  intro: '',
  areas: [], // { title, text, target? }
  featured: [],
  onYourMind: [], // { label, concept }
  howItWorks: '',
  whoBehind: '',
  closing: '',
  helpLine: '',
  footerQuestionnaires: '',
${provenanceOf(written)}
})`,
}

/** The record file for a new record of this kind and id. */
function template(kind, id, written) {
  const body = TEMPLATES[kind](id, written)
  const helper = body.slice(0, body.indexOf('('))
  const madeWith = written ? ` --written` : ''
  const filling = written
    ? `Write every field yourself; delete the commented fields you leave out.`
    : `Fill every field from the saved page's outline\n// (\`node scripts/content/extract.mjs <slug>\`); delete the commented fields the page doesn't give.`
  return `import { ${helper} } from '@/content/schema'

// Written by \`pnpm content:new ${kind} ${id}${madeWith}\`. ${filling}
${written ? FILLING_WRITTEN : FILLING}
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
  const written = rest.includes('--written')
  const [kind, id, ...extra] = rest.filter((arg) => arg !== '--written')
  if (!kind || !id || extra.length > 0) throw new ToolError(USAGE)
  if (!(kind in KIND_FOLDERS)) throw new ToolError(`“${kind}” is not a kind of record.\n${USAGE}`)
  const problem = idProblem(kind, id)
  if (problem) throw new ToolError(problem)

  const path = `src/content/data/${KIND_FOLDERS[kind]}/${id}.ts`
  const file = join(root, path)
  if (existsSync(file)) throw new ToolError(`${path} exists already: edit it instead.`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, template(kind, id, written))

  const registry = fileURLToPath(new URL('./registry.mjs', import.meta.url))
  const registryRun = spawnSync(process.execPath, [registry, '--root', root], { encoding: 'utf8' })
  if (registryRun.status !== 0) throw new ToolError(registryRun.stderr.trim())
  process.stdout.write(
    `Wrote ${path}, and the registry.\n` +
      (written
        ? `Write it, then check it with node scripts/content/verify.mjs ${kind}/${id}\n`
        : `Fill it from the saved page (node scripts/content/extract.mjs <slug>), then check it with ` +
          `node scripts/content/verify.mjs ${kind}/${id}\n`),
  )
  return 0
}

await runTool(import.meta, main)
