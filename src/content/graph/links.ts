/**
 * The links between records: the index that resolves an id, the check that refuses a dangling
 * one, and the passages and References each record links to.
 */
import {
  idOf,
  type Block,
  type ContentKind,
  type ContentRecord,
  type PassageQuote,
  type RecordOf,
  type Section,
  type Target,
} from '../schema'

/** A record named by its kind and id (ids are unique within a kind, not across kinds). */
export interface RecordKey {
  kind: ContentKind
  id: string
}

/** Every record, by kind and then by id. */
export type Index = ReadonlyMap<ContentKind, ReadonlyMap<string, ContentRecord>>

export function lookup<K extends ContentKind>(index: Index, kind: K, id: string) {
  return index.get(kind)?.get(id) as RecordOf<K> | undefined
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
export function danglingLinks(record: ContentRecord, index: Index): string[] {
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
      record.form?.parts.forEach((part, p) =>
        part.items.forEach((item, i) => {
          if (!Object.hasOwn(sets, item.responseSet))
            problems.push(
              `${where(`form.parts[${p}].items[${i}].responseSet`)}: no response set “${item.responseSet}”`,
            )
        }),
      )
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
    default: {
      const unchecked: never = record
      throw new Error(`The graph has no link check for a ${(unchecked as ContentRecord).kind}.`)
    }
  }
  return problems
}

/** Every quote in a list of blocks, term blocks included, in reading order. */
function quotesIn(list: readonly Block[]): PassageQuote[] {
  return list.flatMap((block) =>
    block.kind === 'verse' ? [block.quote] : block.kind === 'term' ? quotesIn(block.blocks) : [],
  )
}

/** The passages a record quotes, in reading order. */
export function quotesOf(record: ContentRecord): PassageQuote[] {
  const inSections = (sections: readonly Section[]) => sections.flatMap((s) => quotesIn(s.blocks))
  switch (record.kind) {
    case 'concept':
      return [...record.verses, ...inSections(record.sections)]
    case 'topic':
      return inSections(record.intro?.sections ?? [])
    case 'page':
      return inSections(record.sections)
    case 'work':
    case 'passage':
    case 'reference':
    case 'questionnaire':
    case 'glossary':
    case 'resource-list':
    case 'home':
      return []
    default: {
      const unchecked: never = record
      throw new Error(`The graph can't tell what a ${(unchecked as ContentRecord).kind} quotes.`)
    }
  }
}

/** The References a record cites, in its own order. */
export function referencesOf(record: ContentRecord): string[] {
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
    case 'work':
    case 'passage':
    case 'reference':
    case 'glossary':
    case 'page':
    case 'home':
      return []
    default: {
      const unchecked: never = record
      throw new Error(`The graph can't tell what a ${(unchecked as ContentRecord).kind} cites.`)
    }
  }
}
