#!/usr/bin/env node
// The no-invented-text check: every string in a record must be found on the saved page it came
// from, after normalising both sides and applying the record's listed edits.
//
//   node scripts/content/verify.mjs                      every record
//   node scripts/content/verify.mjs concept work/...    records of a kind, or one by kind/id
//
// It reads the saved copies only from $CARE4MIND_CAPTURES, never writes into the repo and never
// touches the network. Exit code 0 when nothing is missing, 1 when a string is on none of its
// pages, 2 when it can't run. What it checks and skips: docs/agents/content-migration.md.

import { openCaptures } from './captures.mjs'
import { rootFrom, runTool, ToolError } from './cli.mjs'
import { idOf, KIND_FOLDERS, loadRecords, schema, sortRecords } from './records.mjs'

/** The records the arguments name: kinds (`concept`) and records (`passage/yoga-sutra/1.30`). */
function selectRecords(records, selectors) {
  if (selectors.length === 0) return records
  const chosen = new Set()
  for (const selector of selectors) {
    const [kind, ...rest] = selector.split('/')
    const id = rest.join('/')
    if (!(kind in KIND_FOLDERS))
      throw new ToolError(
        `“${kind}” is not a kind of record. The kinds: ${Object.keys(KIND_FOLDERS).join(', ')}.`,
      )
    const matching = records.filter(
      (record) => record.kind === kind && (!id || idOf(record) === id),
    )
    if (matching.length === 0)
      throw new ToolError(id ? `No record ${kind}/${id}.` : `No ${kind} records.`)
    matching.forEach((record) => chosen.add(record))
  }
  return records.filter((record) => chosen.has(record))
}
// ---------------------------------------------------------------------------------------------
// Normalising: both a record's strings and its pages are compared in one form, so the check
// ignores what doesn't change the words: Unicode composition (NFC), ṁ for ṃ, letter case,
// curly or straight quotes, the kind of dash, runs of whitespace, and spaces inside brackets or
// before punctuation.

// ‘ ’ ‚ ‛ ′ ` ´ are one quote; “ ” „ ‟ ″ « » another; and every hyphen, dash and minus is “-”.
const QUOTES = [/[\u2018\u2019\u201a\u201b\u2032`\u00b4]/g, "'"]
const DOUBLE_QUOTES = [/[\u201c\u201d\u201e\u201f\u2033\u00ab\u00bb]/g, '"']
const DASHES = [/[\u2010-\u2015\u2212\ufe58\ufe63\uff0d]/g, '-']

function normalise(text) {
  return schema
    .normaliseSanskrit(text)
    .toLowerCase()
    .replace(...QUOTES)
    .replace(...DOUBLE_QUOTES)
    .replace(...DASHES)
    .replace(/[\u200b\u00ad\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/ (?=[,.;:!?)\]}])/g, '')
    .replace(/(?<=[([{]) /g, '')
    .trim()
    .normalize('NFC')
}

// ---------------------------------------------------------------------------------------------
// Edits: each describes one change. A replacement quotes the old and the new text in curly
// quotes joined by an arrow, “old” → “new”; a deletion has empty new text, “[2]” → “”; text a
// change adds is quoted in full. Quotes may hold curly-quoted text, when its quotes balance.

/** The texts an edit quotes, and the replacements among them as [old, new] pairs. */
function parseEdit(edit) {
  const quotes = []
  let depth = 0
  let start = 0
  for (let at = 0; at < edit.length; at += 1) {
    if (edit[at] === '“') {
      if (depth === 0) start = at
      depth += 1
    } else if (edit[at] === '”' && depth > 0) {
      depth -= 1
      if (depth === 0) quotes.push({ text: edit.slice(start + 1, at), start, end: at + 1 })
    }
  }
  const replacements = []
  for (let at = 0; at + 1 < quotes.length; at += 1)
    if (/^\s*→\s*$/.test(edit.slice(quotes[at].end, quotes[at + 1].start))) {
      replacements.push([quotes[at].text, quotes[at + 1].text])
      at += 1
    }
  return { quotes: quotes.map((quote) => quote.text), replacements }
}

/** A normalised page's text with every replacement applied, in order, to all its occurrences. */
function applyReplacements(text, replacements) {
  let edited = text
  for (const [old, replacement] of replacements) {
    const from = normalise(old)
    if (from !== '') edited = edited.split(from).join(normalise(replacement))
  }
  return normalise(edited)
}

// ---------------------------------------------------------------------------------------------
// The closest text: for a miss, the run of words on a page most like the string, as the page
// writes it. Windows of the string's length are ranked by the words they share with it, and
// the best few by edit distance (for a short string sharing no word, every window is).

const WINDOWS_COMPARED = 5

function editDistance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    for (let j = 1; j <= b.length; j += 1)
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    previous = current
  }
  return previous[b.length]
}

function closestText(string, pages) {
  const target = normalise(string).split(' ')
  const wanted = new Map()
  for (const word of target) wanted.set(word, (wanted.get(word) ?? 0) + 1)
  let best
  for (const page of pages) {
    const words = [...page.text.matchAll(/\S+/g)].map((match) => ({
      start: match.index,
      end: match.index + match[0].length,
      word: normalise(match[0]),
    }))
    const size = Math.min(target.length, words.length)
    if (size === 0) continue
    // Shared words in a sliding window, kept up to date as it moves.
    const held = new Map()
    let shared = 0
    const move = (word, change) => {
      const before = Math.min(held.get(word) ?? 0, wanted.get(word) ?? 0)
      held.set(word, (held.get(word) ?? 0) + change)
      shared += Math.min(held.get(word), wanted.get(word) ?? 0) - before
    }
    for (let at = 0; at < size; at += 1) move(words[at].word, 1)
    const windows = []
    for (let start = 0; ; start += 1) {
      windows.push({ start, shared })
      if (start + size >= words.length) break
      move(words[start].word, -1)
      move(words[start + size].word, 1)
    }
    windows.sort((a, b) => b.shared - a.shared)
    const nothingShared = windows[0].shared === 0
    if (nothingShared && size > 3) continue
    const compared = nothingShared ? windows : windows.slice(0, WINDOWS_COMPARED)
    const wantedText = target.join(' ')
    for (const { start } of compared) {
      // From the window's first word, as many words as the string's length in characters needs.
      let end = start + size
      const length = () =>
        words
          .slice(start, end)
          .map((w) => w.word)
          .join(' ').length
      while (end < words.length && end < start + size + 5 && length() < wantedText.length) end += 1
      const window = words.slice(start, end)
      const distance = editDistance(wantedText, window.map((w) => w.word).join(' '))
      if (!best || distance < best.distance)
        best = {
          distance,
          url: page.url,
          text: page.text.slice(window[0].start, window.at(-1).end),
        }
    }
  }
  return best && { url: best.url, text: best.text }
}

// ---------------------------------------------------------------------------------------------
// A record's strings: everything carried over from a page. Ids, links between records, URLs and
// fields that describe the record rather than carry its content are skipped.

/** Fields that are never carried-over text, wherever they appear in a record. */
const NOT_TEXT = new Set([
  // ids and anchors
  'kind',
  'slug',
  'id',
  'anchor',
  'locator',
  ...schema.LINK_FIELDS,
  // URLs
  'url',
  'doi',
  // kinds of thing and statuses
  'type',
  'scheme',
  'role',
  'style',
  'language',
  'status',
  'reviewStatus',
  // meta fields
  'provenance',
  'heldBack',
  'scoring',
  'rights',
  'noStableLink',
])

/**
 * Every string in a value, with its field path, as { path, text }. An ASCII spelling of a
 * Sanskrit term (an `ascii` beside an `iast`) also carries the term's IAST.
 */
function stringsOf(value, skip, path = '', iast = undefined) {
  if (typeof value === 'string') return [{ path, text: value, ...(iast ? { iast } : {}) }]
  if (Array.isArray(value))
    return value.flatMap((item, i) => stringsOf(item, skip, `${path}[${i}]`, iast))
  if (!value || typeof value !== 'object') return []
  const termIast = typeof value.iast === 'string' ? value.iast : undefined
  return Object.entries(value).flatMap(([key, inner]) =>
    skip.has(key)
      ? []
      : stringsOf(
          inner,
          skip,
          path ? `${path}.${key}` : key,
          key === 'ascii' ? termIast : undefined,
        ),
  )
}

/** The IAST without diacritics, case, spaces or hyphens: what NFR-03 says an ASCII form may be. */
function bareSpelling(text) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '')
}

const isDrafted = (path, drafted) =>
  drafted.some(
    (field) => path === field || path.startsWith(`${field}.`) || path.startsWith(`${field}[`),
  )

/** A page of the current site, whose saved copy every record citing it must be checked against. */
function onCurrentSite(url) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === 'care4mind.org' || host === 'www.care4mind.org'
  } catch {
    return false
  }
}

/**
 * Checks one record against the saved copies of its source pages.
 *
 * @returns {{ record, status, checked, misses, drafted, notSaved }} where `status` is "passed",
 *   "failed" (a string is on none of its pages), "unchecked" (no source has a saved copy) or
 *   "structure" (a topic with nothing carried over), and each miss gives the string's field
 *   path, the string, and the closest text on its pages.
 */
export function checkRecord(record, captures) {
  const name = `${record.kind}/${idOf(record)}`
  // A topic carries over only its introduction, which has its own provenance; its name and
  // order are the design notes' structure (D03).
  const [provenance, content, prefix] =
    record.kind === 'topic'
      ? [record.intro?.provenance, record.intro?.sections, 'intro.sections']
      : [record.provenance, record, '']
  if (!provenance)
    return { record: name, status: 'structure', checked: 0, misses: [], drafted: [], notSaved: [] }

  const drafted = [...(provenance.drafted ?? [])]
  const skip = new Set([...NOT_TEXT, ...(schema.LINK_FIELDS_IN[record.kind] ?? [])])
  const strings = stringsOf(content, skip, prefix).filter(
    ({ path, text }) => normalise(text) !== '' && !isDrafted(path, drafted),
  )
  const sources = provenance.sources.map(({ url }) => ({ url, page: captures.page(url) }))
  const notSaved = sources.filter(({ page }) => !page).map(({ url }) => url)
  const pages = sources.flatMap(({ page }) => (page ? [page] : []))
  const result = { record: name, checked: 0, misses: [], drafted, notSaved }
  if (notSaved.some(onCurrentSite)) return { ...result, status: 'failed' }
  if (pages.length === 0) return { ...result, status: 'unchecked' }

  const edits = provenance.edits.map(parseEdit)
  const replacements = edits.flatMap((edit) => edit.replacements)
  const quoted = edits.flatMap((edit) => edit.quotes).map(normalise)
  const texts = pages.map((page) => normalise(page.text()))
  // A string may need every replacement, only one (when two edits change the same sentence
  // for different strings), or none: a record may keep the page's own wording.
  const searched = texts.flatMap((text) => [
    applyReplacements(text, replacements),
    ...(replacements.length > 1 ? replacements.map((one) => applyReplacements(text, [one])) : []),
    text,
  ])
  const found = ({ text, iast }) => {
    const wanted = normalise(text)
    if (iast !== undefined && bareSpelling(text) === bareSpelling(iast)) return true
    return (
      searched.some((page) => page.includes(wanted)) ||
      quoted.some((quote) => quote.includes(wanted))
    )
  }
  const misses = strings
    .filter((string) => !found(string))
    .map(({ path, text }) => {
      const closest = closestText(
        text,
        pages.map((page) => ({ url: page.url, text: page.text() })),
      )
      return { path, text, ...(closest ? { closest } : {}) }
    })
  return {
    ...result,
    status: misses.length > 0 ? 'failed' : 'passed',
    checked: strings.length,
    misses,
  }
}

// ---------------------------------------------------------------------------------------------
// Printing the results.

const SHOWN = 240

/** Long text, cut in the middle so both ends show. */
function shorten(text) {
  if (text.length <= SHOWN) return text
  return `${text.slice(0, SHOWN / 2 - 1)} … ${text.slice(-(SHOWN / 2 - 1))}`
}

/** Where a string and the closest text part ways, as “…same[record] / …same[page]”, normalised. */
function difference(text, closest) {
  const a = normalise(text)
  const b = normalise(closest)
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1
  let end = 0
  while (
    end < a.length - start &&
    end < b.length - start &&
    a[a.length - 1 - end] === b[b.length - 1 - end]
  )
    end += 1
  const before = a.slice(Math.max(0, start - 30), start)
  const show = (s) => `…${before}[${s.slice(start, s.length - end).slice(0, 60)}]`
  return `${show(a)}  where the page has  ${show(b)}`
}

function formatResults(results) {
  const out = []
  const tag = (name) => name.padEnd(11)
  const of = (status) => results.filter((result) => result.status === status)
  const indent = ' '.repeat(11)

  for (const result of of('failed')) {
    const missing = result.notSaved.filter(onCurrentSite)
    if (missing.length > 0)
      out.push(`${tag('FAILED')}${result.record}: no saved copy of ${missing.join(', ')}`)
    if (result.misses.length === 0) continue
    out.push(
      `${tag('FAILED')}${result.record}: ${result.misses.length} of ${result.checked} strings not found`,
    )
    for (const miss of result.misses) {
      out.push(`${indent}${miss.path}`)
      out.push(`${indent}  string   ${shorten(miss.text)}`)
      if (miss.closest) {
        out.push(`${indent}  closest  ${shorten(miss.closest.text)}   (${miss.closest.url})`)
        out.push(`${indent}  differs  ${difference(miss.text, miss.closest.text)}`)
      } else out.push(`${indent}  closest  nothing like it on ${result.record}'s pages`)
    }
  }
  const passed = of('passed').map((result) => result.record)
  if (passed.length > 0) out.push(`${tag('passed')}${passed.join(', ')}`)
  for (const result of results)
    if (result.drafted.length > 0)
      out.push(`${tag('drafted')}${result.record}: ${result.drafted.join(', ')} (not checked)`)
  for (const result of of('unchecked'))
    out.push(`${tag('unchecked')}${result.record}: no saved copy of ${result.notSaved.join(', ')}`)
  const structure = of('structure').map((result) => result.record)
  if (structure.length > 0)
    out.push(`${tag('structure')}${structure.join(', ')}: no introduction, nothing carried over`)
  out.push(
    '',
    `verify: ${results.length} records · ${of('passed').length} passed · ` +
      `${of('unchecked').length} unchecked · ${structure.length} structure only · ` +
      `${of('failed').length} failed`,
  )
  return `${out.join('\n')}\n`
}

const USAGE = `Usage: node scripts/content/verify.mjs [kind | kind/id ...]

Checks every string in the records named (all of them when none is) against the saved copies
of their source pages, read from $CARE4MIND_CAPTURES. Exit code 0 when every string is found,
1 when one is on none of its pages, 2 when it can't run. Kinds: ${Object.keys(KIND_FOLDERS).join(', ')}.`

async function main(args) {
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`${USAGE}\n`)
    return 0
  }
  const captures = openCaptures()
  const { root, rest } = rootFrom(args)
  const records = sortRecords(selectRecords(await loadRecords(root), rest))
  const results = records.map((record) => checkRecord(record, captures))
  process.stdout.write(formatResults(results))
  return results.some((result) => result.status === 'failed') ? 1 : 0
}

await runTool(import.meta, main)
