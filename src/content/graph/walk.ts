/**
 * The one walk over a record's block tree: every block in reading order, a term before the
 * blocks inside it. Quotes, terms, topic introductions, anchors and running text are read off
 * this walk, so the tree's shape is known in one place and each fact is gathered once.
 */
import type { Block, Inline, PassageQuote, Section, Slug, TermBlock } from '../schema'

/** Every block in a list, nested term blocks included, with its field path (`blocks[2].blocks[0]`). */
export function* walkBlocksAt(
  blocks: readonly Block[],
  field: string,
): Generator<{ block: Block; at: string }> {
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]
    if (block === undefined) continue
    const at = `${field}[${i}]`
    yield { block, at }
    if (block.kind === 'term') yield* walkBlocksAt(block.blocks, `${at}.blocks`)
  }
}

/** Every block in a list, nested term blocks included, in reading order. */
export function* walkBlocks(blocks: readonly Block[]): Generator<Block> {
  for (const { block } of walkBlocksAt(blocks, 'blocks')) yield block
}

/** Every term block in a list of blocks, nested ones included, in reading order. */
export function termsIn(blocks: readonly Block[]): TermBlock[] {
  return [...walkBlocks(blocks)].filter((block) => block.kind === 'term')
}

/** Every term a list of sections explains, in reading order. */
export function termsInSections(sections: readonly Section[]): TermBlock[] {
  return sections.flatMap((section) => termsIn(section.blocks))
}

/** Every verse quoted in a list of blocks, term blocks included, in reading order. */
export function quotesIn(blocks: readonly Block[]): PassageQuote[] {
  return [...walkBlocks(blocks)].flatMap((block) => (block.kind === 'verse' ? [block.quote] : []))
}

/** Every verse quoted in a list of sections, in reading order. */
export function quotesInSections(sections: readonly Section[]): PassageQuote[] {
  return sections.flatMap((section) => quotesIn(section.blocks))
}

/** The topics whose shared introduction a list of sections shows, in reading order. */
export function introTopicsInSections(sections: readonly Section[]): Slug[] {
  return sections.flatMap((section) =>
    [...walkBlocks(section.blocks)].flatMap((block) =>
      block.kind === 'topic-intro' ? [block.topic] : [],
    ),
  )
}

/** The first running text in a list of blocks: a paragraph, or a list's first item. */
export function firstTextIn(blocks: readonly Block[]): string | undefined {
  for (const block of walkBlocks(blocks)) {
    if (block.kind === 'paragraph') return block.text
    if (block.kind === 'list' && block.items[0] !== undefined) return block.items[0]
  }
  return undefined
}

/** The running text of a list of sections, in reading order, where citations can appear. */
export function textsIn(sections: readonly Section[]): Inline[] {
  const fromBlocks = (blocks: readonly Block[]): Inline[] =>
    [...walkBlocks(blocks)].flatMap((block) => {
      switch (block.kind) {
        case 'paragraph':
          return [block.text]
        case 'list':
          return [...block.items]
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
        case 'term':
        case 'topic-intro':
          return []
      }
    })
  return sections.flatMap((section) => [section.heading, ...fromBlocks(section.blocks)])
}

/** Every anchor in a list of sections: section, term and table ids, in reading order. */
export function anchorsInSections(sections: readonly Section[]): string[] {
  const anchors: string[] = []
  for (const section of sections) {
    anchors.push(section.id)
    for (const block of walkBlocks(section.blocks))
      if (block.kind === 'term' || block.kind === 'table') anchors.push(block.id)
  }
  return anchors
}
