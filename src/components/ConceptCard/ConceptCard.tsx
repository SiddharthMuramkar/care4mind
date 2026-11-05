import { ViewTransition, type ReactNode } from 'react'

import { FrameCorners } from '@/components/Folio'
import { TopicChip } from '@/components/topics'
import type { ConceptCard as Card } from '@/content'
import { cx } from '@/lib/cx'

import styles from './ConceptCard.module.css'
import { Text } from '../prose'

interface Props {
  concept: Pick<Card, 'slug' | 'name' | 'lang' | 'term' | 'english' | 'summary' | 'topic'> & {
    /** How long the Concept's page takes to read, where the card's page shows it. */
    readingMinutes?: number
  }
  /** The card's one action: a link or button, stretched to cover the whole card. */
  action: ReactNode
  className?: string
  /** A featured card takes the printer's double frame; the rest keep a single thin rule. */
  featured?: boolean
}

/**
 * A Concept in brief. Its title shares a view-transition name with the Concept
 * page's heading, so following the card morphs one into the other.
 */
export function ConceptCard({ concept, action, className, featured = false }: Props) {
  return (
    <article className={cx(styles.card, featured && styles.featured, className)} data-paper>
      {featured ? <FrameCorners /> : null}
      <ViewTransition name={`concept-title-${concept.slug}`} share="morph" default="none">
        <h3 className={styles.title}>
          <span lang={concept.lang}>{concept.name}</span>
        </h3>
      </ViewTransition>
      {concept.term?.devanagari ? (
        <p lang="sa-Deva" className={styles.deva}>
          {concept.term.devanagari}
        </p>
      ) : null}
      {/* The English gloss of a Sanskrit headword; a page with an English title has none. */}
      {concept.term && concept.english ? <p className={styles.gloss}>{concept.english}</p> : null}
      <p className={styles.topic}>
        <TopicChip topic={concept.topic} />
        {concept.readingMinutes ? (
          <span className={styles.reading}>{concept.readingMinutes} min read</span>
        ) : null}
      </p>
      <p className={styles.summary}>
        <Text text={concept.summary} />
      </p>
      <div className={styles.action}>{action}</div>
    </article>
  )
}
