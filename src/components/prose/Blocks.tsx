import Link from 'next/link'
import type { CSSProperties } from 'react'

import { turnForward } from '@/components/page-turn'
import { hrefFor, type BlockView, type SectionView, type TopicRef } from '@/content'

import { SanskritTerm } from './SanskritTerm'
import styles from './Prose.module.css'
import { Text, type CitationLinks } from './Text'
import { VerseCard } from './VerseCard'

type Level = 3 | 4 | 5 | 6
type Table = Extract<BlockView, { kind: 'table' }>

const below = (level: Level): Level => (level < 6 ? ((level + 1) as Level) : 6)

/** Where shared text came from: the topic whose introduction it is. */
function SharedFrom({ topic }: { topic: TopicRef }) {
  return (
    <p className={styles.shared}>
      From the introduction to{' '}
      <Link href={hrefFor({ kind: 'topic', id: topic.slug })} transitionTypes={turnForward}>
        {topic.name}
      </Link>
      .
    </p>
  )
}

/**
 * A table, scrolling sideways in its own frame on a narrow screen (WCAG 1.4.10 allows it for data
 * tables): its first column stays in view, and shadows at the edges show there is more.
 */
function DataTable({ table, citations }: { table: Table; citations?: CitationLinks }) {
  const caption = `${table.id}-caption`
  return (
    <figure id={table.id} className={styles.figure}>
      <div
        className={styles.frame}
        role="region"
        aria-labelledby={caption}
        // A frame that scrolls takes focus, so it can be scrolled from the keyboard.
        tabIndex={0}
      >
        <table
          className={styles.table}
          // Wide enough for its columns to stay readable; the frame scrolls beyond that.
          style={{ '--columns': table.columns.length } as CSSProperties}
        >
          <caption id={caption} className={styles.caption}>
            <Text text={table.caption} citations={citations} />
          </caption>
          <thead>
            <tr>
              {table.columns.map((column, index) => (
                <th key={index} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={index}>
                {row.head === undefined ? null : (
                  <th scope="row">
                    {typeof row.head === 'string' ? (
                      <Text text={row.head} citations={citations} />
                    ) : (
                      <SanskritTerm
                        term={row.head.term}
                        gloss={row.head.gloss}
                        devanagari={false}
                        capitalised
                      />
                    )}
                  </th>
                )}
                {row.cells.map((cell, column) => (
                  <td key={column}>
                    <Text text={cell} citations={citations} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

function Block({
  block,
  citations,
  level,
}: {
  block: BlockView
  citations?: CitationLinks
  level: Level
}) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p>
          <Text text={block.text} citations={citations} />
        </p>
      )
    case 'list': {
      const List = block.style === 'number' ? 'ol' : 'ul'
      return (
        <List className={styles.list}>
          {block.items.map((item, index) => (
            <li key={index}>
              <Text text={item} citations={citations} />
            </li>
          ))}
        </List>
      )
    }
    case 'term': {
      const Heading = `h${level}` as const
      return (
        <div id={block.id} className={styles.term}>
          <div className={styles.termHead}>
            <Heading className={styles.termTitle}>
              <SanskritTerm term={block.term} gloss={block.gloss} capitalised />
            </Heading>
            <a href={`#${block.id}`} className={styles.anchor}>
              <span aria-hidden>¶</span>
              <span className="sr-only">
                Link to <span lang="sa-Latn">{block.name}</span>
              </span>
            </a>
          </div>
          <Blocks blocks={block.blocks} citations={citations} level={below(level)} />
        </div>
      )
    }
    case 'table':
      return <DataTable table={block} citations={citations} />
    case 'verse':
      return <VerseCard verse={block.verse} />
    case 'topic-intro': {
      const Heading = `h${level}` as const
      return (
        <div className={styles.intro}>
          {block.sections.map((section) => (
            <div key={section.id} id={section.id} className={styles.introSection}>
              <Heading className={styles.termTitle}>
                <Text text={section.heading} citations={citations} />
              </Heading>
              <Blocks blocks={section.blocks} citations={citations} level={below(level)} />
            </div>
          ))}
          <SharedFrom topic={block.topic} />
        </div>
      )
    }
  }
}

/**
 * A record's blocks, every kind drawn: paragraphs and lists, terms anchored at their own ids,
 * tables, verses and shared topic introductions. Terms take headings from `level` down.
 */
export function Blocks({
  blocks,
  citations,
  level = 3,
}: {
  blocks: readonly BlockView[]
  citations?: CitationLinks
  level?: Level
}) {
  return blocks.map((block, index) => (
    <Block key={index} block={block} citations={citations} level={level} />
  ))
}

/**
 * The topic introduction a section stands in for: a section holding nothing but a shared topic
 * introduction whose own section has the same id and heading (the values Concepts' yama–niyama
 * section). Drawn in the section's place, its heading shows once and its anchor stays unique.
 */
function standingIn(section: SectionView) {
  const [only, ...rest] = section.blocks
  if (only?.kind !== 'topic-intro' || rest.length > 0) return undefined
  const own = only.sections.find((inner) => inner.id === section.id)
  return own && { own, others: only.sections.filter((inner) => inner !== own), topic: only.topic }
}

/** How a section's role is named above its heading (D05). */
const ROLES = { applications: 'Applications', comparison: 'Comparison' } as const

/**
 * A record's sections in reading order, each anchored at its id under its own heading, an
 * applications or comparison section labelled as one. Each names a view timeline after its id,
 * which a table of contents can follow where `:target-current` is missing.
 */
export function Sections({
  sections,
  citations,
}: {
  sections: readonly SectionView[]
  citations?: CitationLinks
}) {
  return sections.map((section) => {
    const shared = standingIn(section)
    return (
      <section
        key={section.id}
        id={section.id}
        className={styles.section}
        style={{ '--timeline': `--section-${section.id}` } as CSSProperties}
      >
        <h2 className={styles.sectionTitle}>
          {section.role ? <span className={styles.role}>{ROLES[section.role]}</span> : null}
          <Text text={section.heading} citations={citations} />
        </h2>
        {shared ? (
          <>
            <Blocks blocks={shared.own.blocks} citations={citations} />
            {shared.others.length > 0 ? (
              <Blocks
                blocks={[{ kind: 'topic-intro', topic: shared.topic, sections: shared.others }]}
                citations={citations}
              />
            ) : (
              <SharedFrom topic={shared.topic} />
            )}
          </>
        ) : (
          <Blocks blocks={section.blocks} citations={citations} />
        )}
      </section>
    )
  })
}
