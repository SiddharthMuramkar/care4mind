import Link from 'next/link'

import { ConceptCard } from '@/components/ConceptCard'
import { turnForward } from '@/components/PageTurn'
import { hrefFor, type ConceptCard as Concept } from '@/content'
import { cx } from '@/lib/cx'

import styles from './ConceptSpread.module.css'
import { ContentsPlate, plateCard, plateScope, type PlateRow } from './ContentsPlate'
import { langOf } from './names'

/** A Concept's row in the plate: its name and gloss, and its Devanagari where a book has its page number. */
const rowOf = (concept: Concept): PlateRow => ({
  key: concept.slug,
  href: hrefFor({ kind: 'concept', id: concept.slug }),
  name: (
    <>
      <span {...langOf(concept.lang)}>{concept.name}</span>
      {concept.gloss ? <> · {concept.gloss}</> : null}
    </>
  ),
  ...(concept.term?.devanagari
    ? { trailing: concept.term.devanagari, trailingLang: 'sa-Deva' as const }
    : {}),
})

/**
 * A topic's Concepts as cards beside a contents plate, set like a book's, whose rows light
 * as their cards are pointed at. The rows and the cards are numbered from this one list,
 * the Concepts whose topic it is first, so a card always lights its own row. No JavaScript.
 */
export function ConceptSpread({
  concepts,
  secondaryConcepts,
}: {
  concepts: readonly Concept[]
  secondaryConcepts: readonly Concept[]
}) {
  const numbered = [...concepts, ...secondaryConcepts].map((concept, index) => ({
    concept,
    number: index + 1,
  }))
  const primary = numbered.slice(0, concepts.length)
  const secondary = numbered.slice(concepts.length)
  const card = ({ concept, number }: (typeof numbered)[number]) => (
    <li key={concept.slug} {...plateCard(number)}>
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
  )

  return (
    <div className={cx(plateScope, styles.spread)}>
      <ContentsPlate
        label="Contents"
        className={styles.plate}
        groups={[
          { rows: primary.map(({ concept }) => rowOf(concept)) },
          ...(secondary.length > 0
            ? [
                {
                  title: 'Also in this topic',
                  rows: secondary.map(({ concept }) => rowOf(concept)),
                },
              ]
            : []),
        ]}
      />
      <div className={styles.cards}>
        <ul className={styles.cardList}>{primary.map(card)}</ul>
        {secondary.length > 0 ? (
          <>
            <h3 className={styles.also}>Also in this topic</h3>
            <ul className={styles.cardList}>{secondary.map(card)}</ul>
          </>
        ) : null}
      </div>
    </div>
  )
}
