import Link from 'next/link'
import { Fragment } from 'react'

import { ConceptCard } from '@/components/cards/ConceptCard'
import { turnForward } from '@/components/page-turn/PageTurn'
import { hrefFor, type ConceptCard as Concept } from '@/content'
import { cx } from '@/lib/cx'

import styles from './ConceptSpread.module.css'
import { ContentsPlate, plateCard, plateScope, type PlateRow } from './ContentsPlate'
import { langOf } from './words'

/** A Concept's row in the plate: its name, and its Devanagari where a book has its page number. */
const rowOf = (concept: Concept): PlateRow => ({
  key: concept.slug,
  href: hrefFor({ kind: 'concept', id: concept.slug }),
  name: <span {...langOf(concept.lang)}>{concept.name}</span>,
  ...(concept.term?.devanagari
    ? { trailing: concept.term.devanagari, trailingLang: 'sa-Deva' as const }
    : {}),
})

/**
 * A topic's Concepts as cards beside a contents plate, whose rows light as their cards are
 * pointed at. Rows and cards are numbered from one list of groups, so they can't drift apart.
 */
export function ConceptSpread({
  concepts,
  secondaryConcepts,
}: {
  /** The Concepts whose primary topic it is. */
  concepts: readonly Concept[]
  /** The Concepts that are also in it, under a running head of their own. */
  secondaryConcepts: readonly Concept[]
}) {
  const groups = [
    { concepts },
    ...(secondaryConcepts.length > 0
      ? [{ title: 'Also in this topic', concepts: secondaryConcepts }]
      : []),
  ]
  const firstRows = groups.map((_, at) =>
    groups.slice(0, at).reduce((sum, group) => sum + group.concepts.length, 1),
  )

  return (
    <div className={cx(plateScope, styles.spread)}>
      <ContentsPlate
        label="Contents"
        className={styles.plate}
        groups={groups.map(({ title, concepts }) => ({
          ...(title ? { title } : {}),
          rows: concepts.map(rowOf),
        }))}
      />
      <div className={styles.cards}>
        {groups.map(({ title, concepts }, at) => (
          <Fragment key={title ?? 'primary'}>
            {title ? <h3 className={styles.also}>{title}</h3> : null}
            <ul className={styles.cardList}>
              {concepts.map((concept, offset) => (
                <li key={concept.slug} {...plateCard((firstRows[at] ?? 1) + offset)}>
                  <ConceptCard
                    concept={concept}
                    className={styles.card}
                    action={
                      <Link
                        href={hrefFor({ kind: 'concept', id: concept.slug })}
                        transitionTypes={turnForward}
                        data-ink
                      >
                        {/* One span: the action is a flex box, which would swallow the space. */}
                        <span>
                          Read about <span {...langOf(concept.lang)}>{concept.name}</span>
                        </span>
                      </Link>
                    }
                  />
                </li>
              ))}
            </ul>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
