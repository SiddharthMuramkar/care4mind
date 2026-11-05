/**
 * The links between records: the index that resolves an id, the check that refuses a dangling
 * one, and the passages and References each record links to.
 *
 * Each kind's outgoing links are declared once, in `LINKS`: how to check them, which References
 * they cite, which passages they quote and which anchors they hold. The table covers every
 * kind, so a new kind fails to compile until its links are declared here.
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

/** The checks a kind's link declaration runs against the index, collecting one line per problem. */
interface Check {
  /** Refuse `field` naming no record of `kind` with `id`. */
  need(field: string, kind: ContentKind, id: string): void
  /** Refuse a quote naming no passage, or no translation of it. */
  quote(field: string, quote: PassageQuote): void
  /** Check every link in a record's sections. */
  sections(field: string, list: readonly Section[]): void
  /** Refuse a target naming no record, or no anchor in it. */
  target(field: string, to: Target): void
  /** Record a problem at `field`, in the same words a dangling id is refused with. */
  fail(field: string, problem: string): void
}

/** One kind's outgoing links: its check, the References it cites, its quotes and its anchors. */
interface LinksOf<K extends ContentKind> {
  check(record: RecordOf<K>, check: Check): void
  references(record: RecordOf<K>): string[]
  quotes(record: RecordOf<K>): PassageQuote[]
  anchors(record: RecordOf<K>): string[]
}

/** Every quote in a list of blocks, term blocks included, in reading order. */
function quotesIn(list: readonly Block[]): PassageQuote[] {
  return list.flatMap((block) =>
    block.kind === 'verse' ? [block.quote] : block.kind === 'term' ? quotesIn(block.blocks) : [],
  )
}

/** The quotes in a list of sections, in reading order. */
const quotesInSections = (sections: readonly Section[]): PassageQuote[] =>
  sections.flatMap((s) => quotesIn(s.blocks))

/** Every anchor in a list of sections: section, term and table ids. */
function anchorsInSections(sections: readonly Section[]): string[] {
  const anchors: string[] = []
  const addBlocks = (blocks: readonly Block[]) => {
    for (const block of blocks) {
      if (block.kind === 'term' || block.kind === 'table') anchors.push(block.id)
      if (block.kind === 'term') addBlocks(block.blocks)
    }
  }
  for (const section of sections) {
    anchors.push(section.id)
    addBlocks(section.blocks)
  }
  return anchors
}

/** A kind that links nowhere: no ids to check, nothing cited or quoted, no anchors. */
const noLinks = <K extends ContentKind>(): LinksOf<K> => ({
  check: () => {},
  references: () => [],
  quotes: () => [],
  anchors: () => [],
})

/** Each kind's outgoing links, declared once; the link check and the reverse indexes read it. */
const LINKS = {
  concept: {
    check: (record, { need, quote, sections }) => {
      need('topics.primary', 'topic', record.topics.primary)
      record.topics.also?.forEach((topic, i) => need(`topics.also[${i}]`, 'topic', topic))
      record.verses.forEach((verse, i) => quote(`verses[${i}]`, verse))
      sections('sections', record.sections)
      record.references.forEach((id, i) => need(`references[${i}]`, 'reference', id))
      if (record.questionnaire !== undefined)
        need('questionnaire', 'questionnaire', record.questionnaire)
      record.related?.forEach((link, i) => need(`related[${i}].concept`, 'concept', link.concept))
    },
    references: (record) => [...record.references],
    quotes: (record) => [...record.verses, ...quotesInSections(record.sections)],
    anchors: (record) => anchorsInSections(record.sections),
  },
  topic: {
    check: (record, { need, sections }) => {
      if (record.intro) {
        sections('intro.sections', record.intro.sections)
        record.intro.references.forEach((id, i) => need(`intro.references[${i}]`, 'reference', id))
      }
    },
    references: (record) => [...(record.intro?.references ?? [])],
    quotes: (record) => quotesInSections(record.intro?.sections ?? []),
    anchors: (record) => (record.intro ? anchorsInSections(record.intro.sections) : []),
  },
  work: noLinks(),
  passage: {
    ...noLinks(),
    check: (record, { need }) => need('work', 'work', record.work),
  },
  reference: noLinks(),
  questionnaire: {
    check: (record, { need, fail }) => {
      record.concepts.forEach((slug, i) => need(`concepts[${i}]`, 'concept', slug))
      if (record.source !== undefined) need('source', 'reference', record.source)
      if (record.candidateSource !== undefined)
        need('candidateSource', 'reference', record.candidateSource)
      const sets = record.form?.responseSets ?? {}
      const partIds = new Set<string>()
      const itemIds = new Set<string>()
      record.form?.parts.forEach((part, p) => {
        if (partIds.has(part.id)) fail(`form.parts[${p}].id`, `repeated part id “${part.id}”`)
        partIds.add(part.id)
        part.items.forEach((item, i) => {
          if (itemIds.has(item.id))
            fail(`form.parts[${p}].items[${i}].id`, `repeated item id “${item.id}”`)
          itemIds.add(item.id)
          if (!Object.hasOwn(sets, item.responseSet))
            fail(
              `form.parts[${p}].items[${i}].responseSet`,
              `no response set “${item.responseSet}”`,
            )
        })
      })
    },
    references: (record) =>
      [record.source, record.candidateSource].filter((id) => id !== undefined),
    quotes: () => [],
    anchors: () => [],
  },
  glossary: {
    ...noLinks(),
    check: (record, { need }) => {
      if (record.concept !== undefined) need('concept', 'concept', record.concept)
    },
  },
  'resource-list': {
    check: (record, { need }) => {
      record.groups.forEach((group, g) =>
        group.items.forEach((item, i) => {
          if (item.type === 'reference')
            need(`groups[${g}].items[${i}].reference`, 'reference', item.reference)
        }),
      )
    },
    references: (record) =>
      record.groups.flatMap((group) =>
        group.items.flatMap((item) => (item.type === 'reference' ? [item.reference] : [])),
      ),
    quotes: () => [],
    anchors: (record) => record.groups.map((group) => group.id),
  },
  page: {
    check: (record, { sections }) => sections('sections', record.sections),
    references: () => [],
    quotes: (record) => quotesInSections(record.sections),
    anchors: (record) => anchorsInSections(record.sections),
  },
  home: {
    check: (record, { need, target }) => {
      record.areas.forEach((area, i) => {
        if (area.target) target(`areas[${i}].target`, area.target)
      })
      record.featured.forEach((slug, i) => need(`featured[${i}]`, 'concept', slug))
      record.onYourMind.forEach(({ concept }, i) =>
        need(`onYourMind[${i}].concept`, 'concept', concept),
      )
    },
    references: () => [],
    quotes: () => [],
    anchors: () => [],
  },
} as const satisfies { [K in ContentKind]: LinksOf<K> }

/** A record's link declaration, typed for its kind. */
function linksFor(record: ContentRecord): LinksOf<ContentKind> {
  return LINKS[record.kind] as LinksOf<ContentKind>
}

/** Every anchor a link may target inside a record: section, term, table and group ids. */
function anchorsOf(record: ContentRecord): Set<string> {
  return new Set(linksFor(record).anchors(record))
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

  linksFor(record).check(record, {
    need,
    quote,
    sections,
    target,
    fail: (field, problem) => problems.push(`${where(field)}: ${problem}`),
  })
  return problems
}

/** The passages a record quotes, in reading order. */
export function quotesOf(record: ContentRecord): PassageQuote[] {
  return linksFor(record).quotes(record)
}

/** The References a record cites, in its own order. */
export function referencesOf(record: ContentRecord): string[] {
  return linksFor(record).references(record)
}
