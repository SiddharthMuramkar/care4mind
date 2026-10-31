/**
 * The graph: every record from a content source, with every link between them resolved once.
 *
 * It is built once per source (a memoised promise) and refuses a broken link: a dangling id
 * throws, naming the record, the field and the missing id, so a broken link can't build. It also
 * holds what is computed rather than stored: the reverse links ("cited by", "quoted in", the
 * Concepts per topic and per work), each record's in-text citations, and the facts that relate
 * one Concept to another (D06).
 */
import { stripDiacritics } from '@/lib/sanskrit'

import {
  CONTENT_KINDS,
  idOf,
  type Block,
  type ContentKind,
  type ContentRecord,
  type Inline,
  type PassageQuote,
  type RecordOf,
  type ReferenceRecord,
  type Section,
  type Slug,
  type Target,
} from './schema'
import { localSource, type ContentSource } from './source'
import type { RelationKind } from './types'
import { displayName, passageLabel, referenceLabel } from './views/names'

/** A record named by its kind and id (ids are unique within a kind, not across kinds). */
export interface RecordKey {
  kind: ContentKind
  id: string
}

/** A place a passage is quoted, with the translation the quote shows. */
export interface Quotation {
  record: RecordKey
  translation?: string
}

/** An in-text citation, "(Tomar, 2024)", and the Reference it resolves to, if exactly one fits. */
export interface Citation {
  /** As the text writes it, without the parentheses: `Tomar, 2024`. */
  text: string
  /** One of the citing record's own References. */
  reference?: string
}

/** One fact that relates a Concept to another. */
export interface Relation {
  /** The other Concept. */
  concept: Slug
  kind: RelationKind
  /** The shared passage, work, Reference or topic, by its id. */
  via: string
  /** The fact, as a reader sees it: "Both quote Yoga Sūtra 2.30". */
  reason: string
}

export interface ContentGraph {
  /** Every record of a kind, in the source's order. */
  records<K extends ContentKind>(kind: K): readonly RecordOf<K>[]
  record<K extends ContentKind>(kind: K, id: string): RecordOf<K> | undefined
  /** The records that cite a Reference: Concepts, topic introductions, Questionnaires, lists. */
  citedBy(reference: string): readonly RecordKey[]
  /** Where a passage is quoted ("quoted in"), in source order. */
  quotedIn(passage: string): readonly Quotation[]
  /** The Concepts whose primary topic this is, and those that are also in it. */
  conceptsInTopic(topic: Slug): { primary: readonly Slug[]; also: readonly Slug[] }
  /** The Concepts that quote any passage of a work. */
  conceptsQuotingWork(work: Slug): readonly Slug[]
  /** The in-text citations in a Concept, or in a topic's introduction, in reading order. */
  citations(kind: 'concept' | 'topic', id: string): readonly Citation[]
  /**
   * Every fact relating a Concept to another (D06), by the other Concept in source order, then
   * by kind, then in the Concept's own order: shared passages, then works it quotes from with no
   * passage in common, then rarely cited References, then topics.
   */
  related(concept: Slug): readonly Relation[]
}

/** Thrown when a record names an id that doesn't exist, as the kind its field links to. */
export class DanglingIdError extends Error {
  readonly problems: readonly string[]

  constructor(problems: readonly string[]) {
    super(`Content links to ids that don’t exist:\n${problems.map((p) => `- ${p}`).join('\n')}`)
    this.name = 'DanglingIdError'
    this.problems = problems
  }
}

type Index = ReadonlyMap<ContentKind, ReadonlyMap<string, ContentRecord>>

function lookup<K extends ContentKind>(index: Index, kind: K, id: string) {
  return index.get(kind)?.get(id) as RecordOf<K> | undefined
}

/** Every anchor a link may target inside a record: section, term, table and group ids. */
function anchorsOf(record: ContentRecord): Set<string> {
  const anchors = new Set<string>()
  const addBlocks = (blocks: readonly Block[]) => {
    for (const block of blocks) {
      if (block.kind === 'term' || block.kind === 'table') anchors.add(block.id)
      if (block.kind === 'term') addBlocks(block.blocks)
    }
  }
  const addSections = (sections: readonly Section[]) => {
    for (const section of sections) {
      anchors.add(section.id)
      addBlocks(section.blocks)
    }
  }
  if (record.kind === 'concept' || record.kind === 'page') addSections(record.sections)
  if (record.kind === 'topic' && record.intro) addSections(record.intro.sections)
  if (record.kind === 'resource-list') for (const group of record.groups) anchors.add(group.id)
  return anchors
}

/** Every link in a record that names a missing id, as one line each. */
function danglingLinks(record: ContentRecord, index: Index): string[] {
  const problems: string[] = []
  const where = (field: string) => `${record.kind} “${idOf(record)}”, field ${field}`
  const need = (field: string, kind: ContentKind, id: string) => {
    if (!lookup(index, kind, id)) problems.push(`${where(field)}: no ${kind} “${id}”`)
  }
  const quote = (field: string, { passage, translation }: PassageQuote) => {
    need(`${field}.passage`, 'passage', passage)
    const found = lookup(index, 'passage', passage)
    if (found && translation !== undefined && !found.translations.some((t) => t.id === translation))
      problems.push(
        `${where(`${field}.translation`)}: no translation “${translation}” in passage “${passage}”`,
      )
  }
  const blocks = (field: string, list: readonly Block[]) =>
    list.forEach((block, i) => {
      const at = `${field}[${i}]`
      if (block.kind === 'verse') quote(`${at}.quote`, block.quote)
      if (block.kind === 'term') blocks(`${at}.blocks`, block.blocks)
      if (block.kind === 'topic-intro') {
        need(`${at}.topic`, 'topic', block.topic)
        const topic = lookup(index, 'topic', block.topic)
        if (topic && !topic.intro)
          problems.push(`${where(`${at}.topic`)}: topic “${block.topic}” has no introduction`)
      }
    })
  const sections = (field: string, list: readonly Section[]) =>
    list.forEach((section, i) => blocks(`${field}[${i}].blocks`, section.blocks))
  const target = (field: string, to: Target) => {
    if ('index' in to) return
    need(`${field}.id`, to.kind, to.id)
    const found = lookup(index, to.kind, to.id)
    if (found && to.anchor !== undefined && !anchorsOf(found).has(to.anchor))
      problems.push(
        `${where(`${field}.anchor`)}: no anchor “${to.anchor}” in ${to.kind} “${to.id}”`,
      )
  }

  switch (record.kind) {
    case 'concept':
      need('topics.primary', 'topic', record.topics.primary)
      record.topics.also?.forEach((topic, i) => need(`topics.also[${i}]`, 'topic', topic))
      record.verses.forEach((verse, i) => quote(`verses[${i}]`, verse))
      sections('sections', record.sections)
      record.references.forEach((id, i) => need(`references[${i}]`, 'reference', id))
      if (record.questionnaire !== undefined)
        need('questionnaire', 'questionnaire', record.questionnaire)
      record.related?.forEach((link, i) => need(`related[${i}].concept`, 'concept', link.concept))
      break
    case 'topic':
      if (record.intro) {
        sections('intro.sections', record.intro.sections)
        record.intro.references.forEach((id, i) => need(`intro.references[${i}]`, 'reference', id))
      }
      break
    case 'passage':
      need('work', 'work', record.work)
      break
    case 'questionnaire': {
      record.concepts.forEach((slug, i) => need(`concepts[${i}]`, 'concept', slug))
      if (record.source !== undefined) need('source', 'reference', record.source)
      if (record.candidateSource !== undefined)
        need('candidateSource', 'reference', record.candidateSource)
      const sets = record.form?.responseSets ?? {}
      const partIds = new Set<string>()
      const itemIds = new Set<string>()
      record.form?.parts.forEach((part, p) => {
        if (partIds.has(part.id))
          problems.push(`${where(`form.parts[${p}].id`)}: part “${part.id}” repeated`)
        partIds.add(part.id)
        part.items.forEach((item, i) => {
          if (itemIds.has(item.id))
            problems.push(`${where(`form.parts[${p}].items[${i}].id`)}: item “${item.id}” repeated`)
          itemIds.add(item.id)
          if (!Object.hasOwn(sets, item.responseSet))
            problems.push(
              `${where(`form.parts[${p}].items[${i}].responseSet`)}: no response set “${item.responseSet}”`,
            )
        })
      })
      break
    }
    case 'glossary':
      if (record.concept !== undefined) need('concept', 'concept', record.concept)
      break
    case 'resource-list':
      record.groups.forEach((group, g) =>
        group.items.forEach((item, i) => {
          if (item.type === 'reference')
            need(`groups[${g}].items[${i}].reference`, 'reference', item.reference)
        }),
      )
      break
    case 'page':
      sections('sections', record.sections)
      break
    case 'home':
      record.areas.forEach((area, i) => {
        if (area.target) target(`areas[${i}].target`, area.target)
      })
      break
    case 'work':
    case 'reference':
      break
  }
  return problems
}

/** Every quote in a list of blocks, term blocks included, in reading order. */
function quotesIn(list: readonly Block[]): PassageQuote[] {
  return list.flatMap((block) =>
    block.kind === 'verse' ? [block.quote] : block.kind === 'term' ? quotesIn(block.blocks) : [],
  )
}

function quotesOf(record: ContentRecord): PassageQuote[] {
  const inSections = (sections: readonly Section[]) => sections.flatMap((s) => quotesIn(s.blocks))
  if (record.kind === 'concept') return [...record.verses, ...inSections(record.sections)]
  if (record.kind === 'topic') return inSections(record.intro?.sections ?? [])
  if (record.kind === 'page') return inSections(record.sections)
  return []
}

/** The References a record cites, in its own order. */
function referencesOf(record: ContentRecord): string[] {
  switch (record.kind) {
    case 'concept':
      return [...record.references]
    case 'topic':
      return [...(record.intro?.references ?? [])]
    case 'questionnaire':
      return [record.source, record.candidateSource].filter((id) => id !== undefined)
    case 'resource-list':
      return record.groups.flatMap((group) =>
        group.items.flatMap((item) => (item.type === 'reference' ? [item.reference] : [])),
      )
    default:
      return []
  }
}

/** The running text of a list of sections, in reading order, where citations can appear. */
function textsIn(sections: readonly Section[]): Inline[] {
  const fromBlocks = (blocks: readonly Block[]): Inline[] =>
    blocks.flatMap((block) => {
      switch (block.kind) {
        case 'paragraph':
          return [block.text]
        case 'list':
          return [...block.items]
        case 'term':
          return fromBlocks(block.blocks)
        case 'table':
          return [
            block.caption,
            ...block.rows.flatMap((row) => [
              ...(typeof row.head === 'string' ? [row.head] : []),
              ...row.cells,
            ]),
          ]
        case 'verse':
          return block.quote.meaning === undefined ? [] : [block.quote.meaning]
        case 'topic-intro':
          return []
      }
    })
  return sections.flatMap((section) => [section.heading, ...fromBlocks(section.blocks)])
}

/** For matching: no diacritics, lower case, one kind of dash, single spaces. */
function fold(text: string): string {
  return stripDiacritics(text.normalize('NFC'))
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasWords(field: string, words: string): boolean {
  const escaped = words.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, 'u').test(field)
}

/**
 * The text inside each pair of parentheses, in reading order: an outer pair before those nested
 * in it, so a citation whose author holds parentheses of its own ("EPRA … (IJMR),” 2019b") is read
 * whole, and one inside a parenthetical aside is still read.
 */
function parenthesised(text: string): string[] {
  const open: number[] = []
  const pairs: { start: number; inside: string }[] = []
  for (let at = 0; at < text.length; at++) {
    if (text[at] === '(') open.push(at)
    else if (text[at] === ')') {
      const start = open.pop()
      if (start !== undefined) pairs.push({ start, inside: text.slice(start + 1, at) })
    }
  }
  return pairs.sort((a, b) => a.start - b.start).map(({ inside }) => inside)
}

/** Author, then year; the comma may sit inside a closing quote: `“A Journal,” 2019b`. */
const WITH_YEAR = /^(.+?),[”"’]?\s*(\d{4}[a-z]?|n\.d\.(?:-[a-z])?)(?:,[^,]+)*$/i
/** Quotation marks around a title standing in for an author. */
const QUOTES = /^[“"‘]+|[”"’]+$/g
const ET_AL = /^(.+?\bet al\.?)$/i

/** The References among `candidates` that an in-text citation's author part and year fit. */
function resolveCitation(
  who: string,
  year: string | undefined,
  candidates: readonly ReferenceRecord[],
): string | undefined {
  const names = fold(who.replace(/\s*\bet al\.?$/i, ''))
    .split(/\s*(?:&|\band\b)\s*/)
    .filter(Boolean)
  const matches = candidates.filter((reference) => {
    if (year !== undefined) {
      const theirs = fold(reference.year ?? '')
      if (theirs !== fold(year) && !theirs.startsWith(`${fold(year)},`)) return false
    }
    const fields = [reference.authors, reference.title].filter((f) => f !== undefined).map(fold)
    return names.every((name) => fields.some((field) => hasWords(field, name)))
  })
  return matches.length === 1 ? matches[0]?.id : undefined
}

/** The in-text citations in some running text, each resolved against the given References. */
function citationsIn(texts: readonly Inline[], references: readonly ReferenceRecord[]): Citation[] {
  const found = new Map<string, Citation>()
  for (const text of texts) {
    for (const inside of parenthesised(text)) {
      for (const part of inside.split(';').map((p) => p.trim())) {
        const dated = WITH_YEAR.exec(part)
        const undated = dated ? null : ET_AL.exec(part)
        const who = (dated?.[1] ?? undated?.[1])?.replace(QUOTES, '')
        if (who === undefined || found.has(part)) continue
        const reference = resolveCitation(who, dated?.[2], references)
        found.set(part, reference === undefined ? { text: part } : { text: part, reference })
      }
    }
  }
  return [...found.values()]
}

/**
 * A Reference relates the Concepts citing it only while it is rarely cited: by at most this many
 * Concepts (D06). A source most pages cite would relate everything to everything.
 */
const RARELY_CITED = 3

/** Tomar (2024) never relates Concepts (D06): it is the handbook nearly every page cites. */
const NEVER_RELATES: ReadonlySet<string> = new Set(['tomar-2024'])

/** What a Concept may share with another, each in the Concept's own order. */
interface Shared {
  slug: Slug
  passages: readonly string[]
  works: readonly Slug[]
  references: readonly string[]
  topics: readonly Slug[]
}

/** The items of one list that another holds too, in the first list's order. */
const inBoth = <T>(mine: readonly T[], theirs: readonly T[]) =>
  mine.filter((item) => theirs.includes(item))

/** Every fact relating each Concept to each other one (D06), by Concept slug. */
function relationsOf(
  concepts: readonly RecordOf<'concept'>[],
  index: Index,
  citedBy: ReadonlyMap<string, readonly RecordKey[]>,
): Map<Slug, Relation[]> {
  const rare = (reference: string) =>
    !NEVER_RELATES.has(reference) &&
    (citedBy.get(reference) ?? []).filter((key) => key.kind === 'concept').length <= RARELY_CITED
  const workOf = (passage: string) => lookup(index, 'passage', passage)?.work
  const shared = concepts.map((concept): Shared => {
    const passages = [...new Set(quotesOf(concept).map((quote) => quote.passage))]
    return {
      slug: concept.slug,
      passages,
      works: [...new Set(passages.flatMap((passage) => workOf(passage) ?? []))],
      references: [...new Set(concept.references)].filter(rare),
      topics: [concept.topics.primary, ...(concept.topics.also ?? [])],
    }
  })

  const reasons = {
    passage: (id: string) => {
      const passage = lookup(index, 'passage', id)
      const work = passage && lookup(index, 'work', passage.work)
      return `Both quote ${passage && work ? passageLabel(passage, work) : id}`
    },
    work: (slug: string) => {
      const work = lookup(index, 'work', slug)
      return `Both quote the ${work ? displayName({ term: work.title }) : slug}`
    },
    reference: (id: string) => {
      const reference = lookup(index, 'reference', id)
      return `Both cite ${reference ? referenceLabel(reference) : id}`
    },
    topic: (slug: string) =>
      `Both are in the topic “${lookup(index, 'topic', slug)?.name.english ?? slug}”`,
  } satisfies Record<RelationKind, (via: string) => string>

  const related = new Map<Slug, Relation[]>()
  for (const mine of shared) {
    const relations: Relation[] = []
    for (const theirs of shared) {
      if (theirs === mine) continue
      const passages = inBoth(mine.passages, theirs.passages)
      // A shared passage already says both quote its work: the work counts only without one.
      const quotedTogether = new Set(passages.map(workOf))
      const facts: [RelationKind, readonly string[]][] = [
        ['passage', passages],
        ['work', inBoth(mine.works, theirs.works).filter((work) => !quotedTogether.has(work))],
        ['reference', inBoth(mine.references, theirs.references)],
        ['topic', inBoth(mine.topics, theirs.topics)],
      ]
      for (const [kind, vias] of facts)
        for (const via of vias)
          relations.push({ concept: theirs.slug, kind, via, reason: reasons[kind](via) })
    }
    related.set(mine.slug, relations)
  }
  return related
}

/** Builds the graph from a source, refusing duplicate and dangling ids. */
export async function buildGraph(source: ContentSource): Promise<ContentGraph> {
  const byKind = new Map<ContentKind, readonly ContentRecord[]>(
    await Promise.all(
      CONTENT_KINDS.map(async (kind) => [kind, await source.records(kind)] as const),
    ),
  )

  const index = new Map<ContentKind, Map<string, ContentRecord>>()
  const duplicates: string[] = []
  for (const [kind, records] of byKind) {
    const ids = new Map<string, ContentRecord>()
    for (const record of records) {
      const id = idOf(record)
      if (ids.has(id)) duplicates.push(`${kind} “${id}”`)
      ids.set(id, record)
    }
    index.set(kind, ids)
  }
  if (duplicates.length > 0)
    throw new Error(`Two records of the same kind share an id: ${duplicates.join(', ')}`)

  const all = [...byKind.values()].flat()
  const problems = all.flatMap((record) => danglingLinks(record, index))
  if (problems.length > 0) throw new DanglingIdError(problems)

  const recordsOf = <K extends ContentKind>(kind: K) =>
    (byKind.get(kind) ?? []) as readonly RecordOf<K>[]
  const keyOf = (record: ContentRecord): RecordKey => ({ kind: record.kind, id: idOf(record) })
  const add = <T>(map: Map<string, T[]>, key: string, value: T) => {
    const list = map.get(key)
    if (list) list.push(value)
    else map.set(key, [value])
  }

  const citedBy = new Map<string, RecordKey[]>()
  const quotedIn = new Map<string, Quotation[]>()
  const quotingWork = new Map<string, Slug[]>()
  const inTopic = new Map<string, { primary: Slug[]; also: Slug[] }>()
  const citations = new Map<string, Citation[]>()

  for (const record of all) {
    for (const reference of new Set(referencesOf(record))) add(citedBy, reference, keyOf(record))

    const seen = new Set<string>()
    for (const { passage, translation } of quotesOf(record)) {
      if (seen.has(`${passage} ${translation}`)) continue
      seen.add(`${passage} ${translation}`)
      const by = keyOf(record)
      add(
        quotedIn,
        passage,
        translation === undefined ? { record: by } : { record: by, translation },
      )
    }
  }

  const topicLists = (slug: Slug) => {
    const lists = inTopic.get(slug) ?? { primary: [], also: [] }
    inTopic.set(slug, lists)
    return lists
  }

  for (const concept of recordsOf('concept')) {
    const works = new Set(
      quotesOf(concept).map(({ passage }) => lookup(index, 'passage', passage)?.work),
    )
    for (const work of works) if (work !== undefined) add(quotingWork, work, concept.slug)

    topicLists(concept.topics.primary).primary.push(concept.slug)
    for (const slug of concept.topics.also ?? []) topicLists(slug).also.push(concept.slug)

    const own = concept.references.flatMap((id) => lookup(index, 'reference', id) ?? [])
    const texts = [
      concept.summary,
      ...concept.verses.flatMap((verse) => (verse.meaning === undefined ? [] : [verse.meaning])),
      ...textsIn(concept.sections),
    ]
    citations.set(`concept/${concept.slug}`, citationsIn(texts, own))
  }

  for (const topic of recordsOf('topic')) {
    if (!topic.intro) continue
    const own = topic.intro.references.flatMap((id) => lookup(index, 'reference', id) ?? [])
    citations.set(`topic/${topic.slug}`, citationsIn(textsIn(topic.intro.sections), own))
  }

  const related = relationsOf(recordsOf('concept'), index, citedBy)

  return {
    records: recordsOf,
    record: (kind, id) => lookup(index, kind, id),
    citedBy: (reference) => citedBy.get(reference) ?? [],
    quotedIn: (passage) => quotedIn.get(passage) ?? [],
    conceptsInTopic: (topic) => inTopic.get(topic) ?? { primary: [], also: [] },
    conceptsQuotingWork: (work) => quotingWork.get(work) ?? [],
    citations: (kind, id) => citations.get(`${kind}/${id}`) ?? [],
    related: (concept) => related.get(concept) ?? [],
  }
}

const graphs = new WeakMap<ContentSource, Promise<ContentGraph>>()

/** The graph of a source, built the first time it is asked for and shared after that. */
export function graphFor(source: ContentSource): Promise<ContentGraph> {
  let graph = graphs.get(source)
  if (!graph) {
    graph = buildGraph(source)
    graphs.set(source, graph)
  }
  return graph
}

/** The graph of the site's own content: built once per process. */
export function contentGraph(): Promise<ContentGraph> {
  return graphFor(localSource)
}
