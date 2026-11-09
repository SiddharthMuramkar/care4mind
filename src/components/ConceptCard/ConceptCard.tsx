import type { ReactNode } from 'react'

import { ownArt } from '@/art'
import { Medallion } from '@/components/art'
import { FrameCorners } from '@/components/Folio'
import { TitleMorph } from '@/components/PageTurn'
import { TopicChip } from '@/components/TopicChip'
import type { ConceptCard as Card } from '@/content'
import { cx } from '@/lib/cx'
import { readingTimeWords } from '@/lib/text'

import styles from './ConceptCard.module.css'
import { Text } from '../prose'

interface Props {
  concept: Pick<
    Card,
    'slug' | 'name' | 'lang' | 'term' | 'gloss' | 'summary' | 'topic' | 'readingMinutes'
  >
  /** The card's one action: a link or button, stretched to cover the whole card. */
  action: ReactNode
  className?: string
  /** A featured card takes the printer's double frame; the rest keep a single thin rule. */
  featured?: boolean
  /** The width of the Concept's Medallion, where it has its own Plate. */
  pictureSize?: 64 | 72
}

/**
 * A Concept in brief. Its title shares a view-transition name with the Concept
 * page's heading, so following the card morphs one into the other. A Concept with its own Plate
 * shows it in a row above the title, with the Devanagari to its right; the rest stay bare.
 */
export function ConceptCard({
  concept,
  action,
  className,
  featured = false,
  pictureSize = 64,
}: Props) {
  const picture = ownArt({ kind: 'concept', slug: concept.slug })
  return (
    <article
      className={cx(styles.card, picture && styles.withArt, featured && styles.featured, className)}
      data-paper
      data-plate={picture ? '' : undefined}
    >
      {featured ? <FrameCorners /> : null}
      {picture ? <Medallion art={picture} size={pictureSize} className={styles.art} /> : null}
      <TitleMorph kind="concept" slug={concept.slug}>
        <h3 className={styles.title}>
          <span lang={concept.lang}>{concept.name}</span>
        </h3>
      </TitleMorph>
      {concept.term?.devanagari ? (
        <p lang="sa-Deva" className={styles.deva}>
          {concept.term.devanagari}
        </p>
      ) : null}
      {/* The English gloss of a Sanskrit headword; a page with an English title has none. */}
      {concept.gloss ? <p className={styles.gloss}>{concept.gloss}</p> : null}
      <p className={styles.meta}>
        <TopicChip topic={concept.topic} />
        <span>{readingTimeWords(concept.readingMinutes)}</span>
      </p>
      <p className={styles.summary}>
        <Text text={concept.summary} />
      </p>
      <div className={styles.action}>{action}</div>
    </article>
  )
}
