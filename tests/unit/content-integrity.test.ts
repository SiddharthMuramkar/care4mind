import { readFileSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'

import { beforeAll, describe, expect, it } from 'vitest'

import { contentGraph, type ContentGraph } from '@/content/graph'
import {
  CONTENT_KINDS,
  idOf,
  isNormalisedSanskrit,
  SLUG,
  type Block,
  type ContentRecord,
  type Provenance,
  type RecordOf,
  type SanskritName,
  type Section,
} from '@/content/schema'
import { localSource } from '@/content/source'

// Every content rule of the content-v1 spec (Testing Decisions → Integrity), run over every real
// record, read through the content source. They hold from ticket 01 on: a record that breaks one
// fails CI. Rules that can only pass once all content has arrived are in content-completeness.

let records: ContentRecord[] = []
let graph: ContentGraph

beforeAll(async () => {
  records = (await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))).flat()
  graph = await contentGraph()
})

function ofKind<K extends ContentRecord['kind']>(kind: K): RecordOf<K>[] {
  return records.filter((record): record is RecordOf<K> => record.kind === kind)
}

const nameOf = (record: ContentRecord) => `${record.kind} “${idOf(record)}”`

/** Fields that describe a record rather than carry its content (verify skips them too). */
const META = new Set(['provenance', 'heldBack', 'scoring', 'rights', 'status', 'reviewStatus'])

/** Every string in a value, with its path, leaving out the fields named in `skip`. */
function stringsIn(value: unknown, skip = new Set<string>(), path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]]
  if (Array.isArray(value))
    return value.flatMap((item, i) => stringsIn(item, skip, `${path}[${i}]`))
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, inner]) =>
      skip.has(key) ? [] : stringsIn(inner, skip, path ? `${path}.${key}` : key),
    )
  return []
}

/** Every key anywhere inside a value. */
function keysIn(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysIn)
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, inner]) => [key, ...keysIn(inner)])
  return []
}

/** Every Sanskrit name inside a value: anything with an IAST form and its ASCII spellings. */
function sanskritNamesIn(value: unknown): SanskritName[] {
  if (Array.isArray(value)) return value.flatMap(sanskritNamesIn)
  if (value && typeof value === 'object') {
    const own =
      'iast' in value &&
      typeof value.iast === 'string' &&
      'ascii' in value &&
      Array.isArray(value.ascii)
        ? [value as SanskritName]
        : []
    return [...own, ...Object.values(value).flatMap(sanskritNamesIn)]
  }
  return []
}

/** Every provenance a record keeps: its own, and a topic introduction's. */
function provenancesOf(record: ContentRecord): Provenance[] {
  if (record.kind === 'topic') return record.intro ? [record.intro.provenance] : []
  return [record.provenance]
}

describe('text', () => {
  it('is NFC everywhere, with anusvara written ṃ, never ṁ', () => {
    const offenders = records.flatMap((record) =>
      stringsIn(record)
        .filter(([, text]) => !isNormalisedSanskrit(text))
        .map(([path, text]) => `${nameOf(record)} ${path}: ${text}`),
    )
    expect(offenders).toEqual([])
  })
})

// IAST: Latin letters, the IAST letters and the ISO 15919 extras (ē ō, r̥ l̥ with a ring below,
// m̐ with a candrabindu), spaces, hyphens and the apostrophe written for an avagraha.
const IAST_LETTERS = 'A-Za-zĀāĪīŪūṚṛṜṝḶḷḸḹṂṃḤḥṄṅÑñṬṭḌḍṆṇŚśṢṣĒēŌōṈṉṞṟḺḻ\u0304\u0310\u0325'
const IAST_NAME = new RegExp(`^[${IAST_LETTERS} \\-’']+$`, 'u')
/** A transliterated verse line may also keep the verse's own punctuation. */
const IAST_LINE = new RegExp(`^[${IAST_LETTERS} \\-’'.,;:!?|]+$`, 'u')
/** Devanagari, the dandas, Vedic signs and the joiners, with spaces and line-end hyphens. */
const DEVANAGARI = /^[\u0900-\u097F\u1CD0-\u1CFF\uA8E0-\uA8FF\u200C\u200D \-]+$/u
const ASCII = /^[\x20-\x7E]+$/

describe('scripts', () => {
  /** [where, text] for each field of one script, across every record. */
  function fields(script: 'ascii' | 'iast-name' | 'iast-line' | 'devanagari'): [string, string][] {
    return records.flatMap((record) => {
      const at = (path: string, text: string | undefined): [string, string][] =>
        text === undefined ? [] : [[`${nameOf(record)} ${path}`, text]]
      const names = sanskritNamesIn(record)
      const found: [string, string][] = []
      if (script === 'ascii')
        found.push(...names.flatMap((n) => n.ascii.flatMap((a) => at('ascii', a))))
      if (script === 'iast-name') found.push(...names.flatMap((n) => at('iast', n.iast)))
      if (script === 'devanagari')
        found.push(...names.flatMap((n) => at('devanagari', n.devanagari)))
      if (record.kind === 'glossary') {
        if (script === 'ascii') found.push(...at('name.ascii', record.name.ascii))
        if (script === 'iast-name') found.push(...at('name.iast', record.name.iast))
        if (script === 'devanagari') found.push(...at('name.devanagari', record.name.devanagari))
      }
      if (record.kind === 'passage') {
        if (script === 'devanagari')
          found.push(...record.devanagari.flatMap((l) => at('devanagari', l)))
        if (script === 'iast-line' && record.transliteration?.scheme === 'iast')
          found.push(...record.transliteration.lines.flatMap((l) => at('transliteration', l)))
      }
      if (record.kind === 'home') {
        if (script === 'iast-line') found.push(...at('shloka.iast', record.shloka.iast))
        if (script === 'devanagari')
          found.push(...at('shloka.devanagari', record.shloka.devanagari))
      }
      return found
    })
  }

  const offenders = (list: [string, string][], pattern: RegExp) =>
    list.filter(([, text]) => !pattern.test(text)).map(([where, text]) => `${where}: ${text}`)

  it('keeps ASCII spellings plain ASCII', () => {
    expect(fields('ascii').length).toBeGreaterThan(0)
    expect(offenders(fields('ascii'), ASCII)).toEqual([])
  })

  it('keeps IAST fields to Latin letters with IAST and ISO 15919 marks', () => {
    expect(offenders(fields('iast-name'), IAST_NAME)).toEqual([])
    expect(offenders(fields('iast-line'), IAST_LINE)).toEqual([])
  })

  it('keeps Devanagari fields to Devanagari, the dandas and the joiners', () => {
    expect(fields('devanagari').length).toBeGreaterThan(0)
    expect(offenders(fields('devanagari'), DEVANAGARI)).toEqual([])
  })

  it('uses only characters the site’s font subsets cover', () => {
    const covered = coveredCharacters()
    const missing = new Map<string, string>()
    for (const record of records)
      for (const [path, text] of stringsIn(record))
        for (const character of text)
          if (!covered.has(character.codePointAt(0) ?? 0))
            missing.set(
              character,
              `U+${(character.codePointAt(0) ?? 0).toString(16).toUpperCase()} in ${nameOf(record)} ${path}`,
            )
    expect([...missing.values()]).toEqual([])
  })
})

describe('provenance', () => {
  it('gives every record but a topic at least one dated source, and a topic introduction its own', () => {
    const problems = records.flatMap((record) => {
      const own = provenancesOf(record)
      if (record.kind !== 'topic' && own.length === 0)
        return [`${nameOf(record)} has no provenance`]
      return own.flatMap((provenance) =>
        provenance.sources.length === 0
          ? [`${nameOf(record)} names no source`]
          : provenance.sources
              .filter(({ url, retrieved }) => url === '' || !/^\d{4}-\d{2}-\d{2}$/.test(retrieved))
              .map(({ url }) => `${nameOf(record)}: source “${url}” needs a URL and a date`),
      )
    })
    expect(problems).toEqual([])
  })

  it('keeps WordPress addresses and author pages out of every string', () => {
    const offenders = records.flatMap((record) =>
      stringsIn(record)
        .filter(([, text]) => /wp-json|wp-admin|wp-content|\/author\//i.test(text))
        .map(([path]) => `${nameOf(record)} ${path}`),
    )
    expect(offenders).toEqual([])
  })

  it('keeps care4mind.org links inside provenance', () => {
    const offenders = records.flatMap((record) =>
      stringsIn(record, new Set(['provenance']))
        .filter(([, text]) => /care4mind\.org/i.test(text))
        .map(([path]) => `${nameOf(record)} ${path}`),
    )
    expect(offenders).toEqual([])
  })

  it('gives a record with drafted fields the review status “drafted, not reviewed”', () => {
    const offenders = records.flatMap((record) => {
      if (record.kind !== 'concept' && record.kind !== 'questionnaire') return []
      const drafted = record.provenance.drafted ?? []
      const missing = drafted.filter((path) => !((path.split('.')[0] ?? '') in record))
      return [
        ...(drafted.length > 0 && record.reviewStatus !== 'drafted-not-reviewed'
          ? [`${nameOf(record)} is “${record.reviewStatus}”`]
          : []),
        ...missing.map((path) => `${nameOf(record)} declares a missing field drafted: ${path}`),
      ]
    })
    expect(offenders).toEqual([])
  })
})

describe('links', () => {
  it('resolve every id a record names, as the right kind', async () => {
    await expect(contentGraph()).resolves.toBeDefined()
  })

  it('give each Concept one primary topic, never repeated in `also`, and a name', () => {
    const problems = ofKind('concept').flatMap((concept) => [
      ...((concept.topics.also ?? []).includes(concept.topics.primary)
        ? [`${concept.slug} repeats its primary topic in also`]
        : []),
      ...(new Set(concept.topics.also).size !== (concept.topics.also ?? []).length
        ? [`${concept.slug} repeats a topic in also`]
        : []),
      ...(concept.name.term?.iast || concept.name.english
        ? []
        : [`${concept.slug} has neither an IAST term nor an English name`]),
    ])
    expect(problems).toEqual([])
  })

  it('make a Concept’s Questionnaire list that Concept among its concepts', () => {
    const problems = ofKind('concept').flatMap((concept) => {
      if (concept.questionnaire === undefined) return []
      const questionnaire = graph.record('questionnaire', concept.questionnaire)
      return questionnaire?.concepts.includes(concept.slug)
        ? []
        : [`${concept.slug} → ${concept.questionnaire}, which doesn’t list it`]
    })
    expect(problems).toEqual([])
  })

  it('resolve every in-text citation to one of the record’s References, or flag it', () => {
    const owners = [
      ...ofKind('concept').map((concept) => ({
        key: { kind: 'concept' as const, id: concept.slug },
        flags: concept.provenance.flags,
      })),
      ...ofKind('topic').flatMap((topic) =>
        topic.intro
          ? [
              {
                key: { kind: 'topic' as const, id: topic.slug },
                flags: topic.intro.provenance.flags,
              },
            ]
          : [],
      ),
    ]
    const unresolved = owners.flatMap(({ key, flags }) =>
      graph
        .citations(key.kind, key.id)
        .filter(({ reference }) => reference === undefined)
        .filter(
          ({ text }) => !flags.some((f) => f.for === 'research-editor' && f.note.includes(text)),
        )
        .map(({ text }) => `${key.kind} “${key.id}”: (${text})`),
    )
    expect(unresolved).toEqual([])
  })

  it('give every anchor in a record a slug of its own', () => {
    const anchorsIn = (blocks: readonly Block[]): string[] =>
      blocks.flatMap((block) =>
        block.kind === 'term'
          ? [block.id, ...anchorsIn(block.blocks)]
          : block.kind === 'table'
            ? [block.id]
            : [],
      )
    const anchorsOf = (sections: readonly Section[]) =>
      sections.flatMap((section) => [section.id, ...anchorsIn(section.blocks)])
    const problems = records.flatMap((record) => {
      const anchors =
        record.kind === 'concept' || record.kind === 'page'
          ? anchorsOf(record.sections)
          : record.kind === 'topic'
            ? anchorsOf(record.intro?.sections ?? [])
            : record.kind === 'resource-list'
              ? record.groups.map((group) => group.id)
              : []
      return [
        ...anchors.filter((a) => !SLUG.test(a)).map((a) => `${nameOf(record)}: “${a}”`),
        ...anchors
          .filter((a, i) => anchors.indexOf(a) !== i)
          .map((a) => `${nameOf(record)}: “${a}” twice`),
      ]
    })
    expect(problems).toEqual([])
  })

  it('number each passage’s order from its locator', () => {
    const problems = ofKind('passage')
      .filter((passage) => passage.order.join('.') !== passage.locator)
      .map((passage) => `${passage.id}: order ${passage.order.join(', ')}`)
    expect(problems).toEqual([])
  })
})

describe('References (FR-03)', () => {
  const PAPER_OR_BOOK = new Set(['journal-article', 'chapter', 'book'])
  const MISSING_WORDS = {
    authors: /author/i,
    year: /\byear|\bdate/i,
    'container or publisher': /container|publisher|journal|publication/i,
  }

  it('gives every Reference a title and a DOI or URL, or says why it has none', () => {
    const problems = ofKind('reference').flatMap((reference) => [
      ...(reference.title.trim() === '' ? [`${reference.id} has no title`] : []),
      ...(reference.doi || reference.url || reference.noStableLink?.trim()
        ? []
        : [`${reference.id} has no DOI or URL, and no reason why`]),
    ])
    expect(problems).toEqual([])
  })

  it('gives a paper or book its authors, container or publisher and year, or flags the gap', () => {
    const problems = ofKind('reference')
      .filter((reference) => PAPER_OR_BOOK.has(reference.type))
      .flatMap((reference) => {
        const gaps = {
          authors: !reference.authors,
          year: !reference.year,
          'container or publisher': !reference.container && !reference.publisher,
        }
        const notes = reference.provenance.flags
          .filter((flag) => flag.for === 'research-editor')
          .map((flag) => flag.note)
        return Object.entries(gaps)
          .filter(([, missing]) => missing)
          .filter(
            ([field]) =>
              !notes.some((note) => MISSING_WORDS[field as keyof typeof MISSING_WORDS].test(note)),
          )
          .map(([field]) => `${reference.id}: no ${field}, and no Research-editor flag says so`)
      })
    expect(problems).toEqual([])
  })
})

/** Phrases from the held-back score sections (FR-05): none may reach content. */
const HELD_BACK = [
  /score indicator/i,
  /score[\s-]*based indicators/i,
  /score[\s-]*wise category/i,
  /scoring continuum/i,
  /\b(?:high|moderate|low) indicators\b/i,
  /\b(?:high|moderate|low) scores?\b/i,
  /\b(?:high|moderate|low) characteristics\b/i,
  /scored on a scale/i,
  // A sentence saying what a high, moderate or low score means.
  /\b(?:high|moderate|low)(?:er|est)?\b[^.!?]{0,60}\bscor(?:e|es|ing)\b[^.!?]*\b(?:means?|indicates?|suggests?|reflects?|shows?|signals?|signif(?:y|ies)|implies?|denotes?|reveals?|represents?|points? to|tends? to|likely)\b/i,
  /\bscor(?:e|es|ed|ing)\s+(?:high|low|moderate)(?:ly)?\b/i,
]

function heldBackPhrasesIn(text: string): boolean {
  return HELD_BACK.some((pattern) => pattern.test(text))
}

describe('held back (FR-05)', () => {
  it('catches score interpretation in made-up examples', () => {
    expect(heldBackPhrasesIn('Overall Score Indicator')).toBe(true)
    expect(heldBackPhrasesIn('Score Based Indicators')).toBe(true)
    expect(heldBackPhrasesIn('Someone with a higher score here tends to wander.')).toBe(true)
    expect(heldBackPhrasesIn('People who score low on this are calm.')).toBe(true)
    expect(heldBackPhrasesIn('A high reading of the text indicates care.')).toBe(false)
    expect(heldBackPhrasesIn('The scale looks at work through your own experience.')).toBe(false)
  })

  it('keeps every held-back phrase out of content', () => {
    const offenders = records.flatMap((record) =>
      stringsIn(record, META)
        .filter(([, text]) => heldBackPhrasesIn(text))
        .map(([path, text]) => `${nameOf(record)} ${path}: ${text}`),
    )
    expect(offenders).toEqual([])
  })

  it('stores no answer key, correct option, points, weights, bands, cut-offs or result text', () => {
    const banned =
      /answer|correct|points?|weights?|bands?|cut-?offs?|thresholds?|results?|^scores?$|Scores?$/i
    const offenders = records.flatMap((record) =>
      keysIn(record)
        .filter((key) => banned.test(key))
        .map((key) => `${nameOf(record)}: ${key}`),
    )
    expect(offenders).toEqual([])
  })

  it('keeps every Questionnaire’s scoring pending, with a reason', () => {
    const problems = ofKind('questionnaire')
      .filter(({ scoring }) => scoring.status !== 'pending' || scoring.reason.trim() === '')
      .map(({ slug }) => slug)
    expect(problems).toEqual([])
  })

  it('records the rights of every Questionnaire that has a form', () => {
    const problems = ofKind('questionnaire')
      .filter((questionnaire) => questionnaire.form && !questionnaire.rights)
      .map(({ slug }) => slug)
    expect(problems).toEqual([])
  })

  it('describes each held-back section and where it was', () => {
    const problems = ofKind('questionnaire').flatMap((questionnaire) =>
      questionnaire.heldBack
        .filter(({ what, where }) => what.trim() === '' || where.trim() === '')
        .map(() => questionnaire.slug),
    )
    expect(problems).toEqual([])
  })
})

// The site's self-hosted fonts are subsets (scripts/fonts/subset.py): Playfair for Latin text and
// Tiro Devanagari Sanskrit for Devanagari. A character outside them would fall back to another
// font. The covered set is read from the WOFF2 files' own character maps.

const LATIN_FONTS = [
  'src/fonts/playfair/PlayfairText-Regular.woff2',
  'src/fonts/playfair/PlayfairText-Italic.woff2',
  'src/fonts/playfair/PlayfairText-SemiBold.woff2',
  'src/fonts/playfair/PlayfairDisplay-Medium.woff2',
]
const DEVANAGARI_FONT = 'src/fonts/tiro-devanagari-sanskrit/TiroDevanagariSanskrit-Regular.woff2'

/** Code points every Latin cut maps, plus those the Devanagari font maps. */
function coveredCharacters(): Set<number> {
  const [first, ...rest] = LATIN_FONTS.map(characterMap)
  const latin = [...(first ?? [])].filter((point) => rest.every((cut) => cut.has(point)))
  return new Set([...latin, ...characterMap(DEVANAGARI_FONT)])
}

/** The code points a WOFF2 font maps to a glyph, from its `cmap` table (formats 4 and 12). */
function characterMap(file: string): Set<number> {
  const font = readFileSync(file)
  let at = 48 // past the WOFF2 header
  const base128 = () => {
    let value = 0
    for (let i = 0; i < 5; i += 1) {
      const byte = font[at++] ?? 0
      value = value * 128 + (byte & 0x7f)
      if (!(byte & 0x80)) return value
    }
    throw new Error(`${file}: bad UIntBase128`)
  }
  const tables: { tag: number; length: number }[] = []
  for (let i = 0; i < font.readUInt16BE(12); i += 1) {
    const flags = font[at++] ?? 0
    const tag = flags & 0x3f
    if (tag === 0x3f) at += 4 // an arbitrary tag, never cmap
    const original = base128()
    // glyf (10) and loca (11) are transformed unless version 3; any other table only if not 0.
    const transformed = tag === 10 || tag === 11 ? flags >> 6 !== 3 : flags >> 6 !== 0
    tables.push({ tag, length: transformed ? base128() : original })
  }
  const data = brotliDecompressSync(font.subarray(at, at + font.readUInt32BE(20)))
  let offset = 0
  let cmap: Buffer | undefined
  for (const { tag, length } of tables) {
    if (tag === 0) cmap = data.subarray(offset, offset + length)
    offset += length
  }
  if (!cmap) throw new Error(`${file}: no cmap table`)
  const points = new Set<number>()
  for (let i = 0; i < cmap.readUInt16BE(2); i += 1) {
    const start = cmap.readUInt32BE(8 + i * 8)
    const format = cmap.readUInt16BE(start)
    if (format === 4) {
      const segments = cmap.readUInt16BE(start + 6) / 2
      const ends = start + 14
      const starts = ends + segments * 2 + 2
      const deltas = starts + segments * 2
      const ranges = deltas + segments * 2
      for (let s = 0; s < segments; s += 1) {
        const first = cmap.readUInt16BE(starts + s * 2)
        const last = cmap.readUInt16BE(ends + s * 2)
        const delta = cmap.readInt16BE(deltas + s * 2)
        const range = cmap.readUInt16BE(ranges + s * 2)
        for (let point = first; point <= last && point !== 0xffff; point += 1) {
          const glyph =
            range === 0
              ? (point + delta) & 0xffff
              : cmap.readUInt16BE(ranges + s * 2 + range + (point - first) * 2)
          if (glyph !== 0) points.add(point)
        }
      }
    }
    if (format === 12) {
      for (let g = 0; g < cmap.readUInt32BE(start + 12); g += 1) {
        const first = cmap.readUInt32BE(start + 16 + g * 12)
        const last = cmap.readUInt32BE(start + 20 + g * 12)
        for (let point = first; point <= last; point += 1) points.add(point)
      }
    }
  }
  return points
}
