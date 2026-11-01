import type { ContentGraph } from '../graph'
import type {
  Block,
  ConceptRecord,
  PassageQuote,
  Section,
  TableRowHead,
  TermBlock,
  TopicRecord,
} from '../schema'
import type { BlockView, SectionView, TableRowView, TocEntry, TopicRef } from '../types'
import { must, nameCopy, present } from './common'
import { hrefFor } from './href'
import { asciiSpellings, displayName } from '../names'
import { verseView } from './passage'

/** The page a record's sections are shown on, whose anchors their links point at. */
export type Owner = { kind: 'concept' | 'topic' | 'resource-list' | 'page'; id: string }

const anchorOn = (owner: Owner, anchor: string) => hrefFor({ ...owner, anchor })

export function topicRef(topic: TopicRecord): TopicRef {
  return {
    slug: topic.slug,
    name: topic.name.english,
    href: hrefFor({ kind: 'topic', id: topic.slug }),
  }
}

function rowHead(head: TableRowHead): TableRowView['head'] {
  if (typeof head === 'string') return head
  return { term: nameCopy(head.term), name: displayName(head), ...present({ gloss: head.gloss }) }
}

function blockView(block: Block, owner: Owner, graph: ContentGraph): BlockView {
  switch (block.kind) {
    case 'paragraph':
      return { kind: 'paragraph', text: block.text }
    case 'list':
      return { kind: 'list', style: block.style, items: [...block.items] }
    case 'term':
      return {
        kind: 'term',
        id: block.id,
        href: anchorOn(owner, block.id),
        name: displayName(block),
        term: nameCopy(block.term),
        spellings: asciiSpellings(block.term),
        ...present({ gloss: block.gloss }),
        blocks: block.blocks.map((inner) => blockView(inner, owner, graph)),
      }
    case 'table':
      return {
        kind: 'table',
        id: block.id,
        caption: block.caption,
        columns: [...block.columns],
        rows: block.rows.map((row) => ({
          ...(row.head === undefined ? {} : { head: rowHead(row.head) }),
          cells: [...row.cells],
        })),
      }
    case 'verse':
      return { kind: 'verse', verse: verseView(block.quote, graph) }
    case 'topic-intro': {
      // Shared text stored once on its topic, shown wherever the page had it.
      const topic = must(graph, 'topic', block.topic)
      return {
        kind: 'topic-intro',
        topic: topicRef(topic),
        sections: sectionViews(topic.intro?.sections ?? [], owner, graph),
      }
    }
  }
}

/** A record's sections, every block resolved, every anchor a link on the owner's page. */
export function sectionViews(
  sections: readonly Section[],
  owner: Owner,
  graph: ContentGraph,
): SectionView[] {
  return sections.map((section) => ({
    id: section.id,
    heading: section.heading,
    ...present({ role: section.role }),
    href: anchorOn(owner, section.id),
    blocks: section.blocks.map((block) => blockView(block, owner, graph)),
  }))
}

/** Every term block in a list of blocks, nested ones included, in reading order. */
export function termsIn(blocks: readonly Block[]): TermBlock[] {
  return blocks.flatMap((block) => (block.kind === 'term' ? [block, ...termsIn(block.blocks)] : []))
}

/** The sections, each with the terms inside it, for a page's table of contents. */
export function tocOf(sections: readonly Section[], owner: Owner): TocEntry[] {
  return sections.map((section) => ({
    id: section.id,
    heading: section.heading,
    ...present({ role: section.role }),
    href: anchorOn(owner, section.id),
    terms: termsIn(section.blocks).map((term) => ({
      id: term.id,
      name: displayName(term),
      href: anchorOn(owner, term.id),
    })),
  }))
}

/**
 * Every verse a Concept quotes, in reading order: those at the top of its page, then those in its
 * sections, term blocks included. A shared topic introduction's verses are its topic's.
 */
export function conceptQuotes(concept: ConceptRecord): PassageQuote[] {
  const inBlocks = (blocks: readonly Block[]): PassageQuote[] =>
    blocks.flatMap((block) =>
      block.kind === 'verse' ? [block.quote] : block.kind === 'term' ? inBlocks(block.blocks) : [],
    )
  return [...concept.verses, ...concept.sections.flatMap((section) => inBlocks(section.blocks))]
}
