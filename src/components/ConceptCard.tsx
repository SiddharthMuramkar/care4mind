import { ViewTransition, type ReactNode } from 'react'

import type { Concept } from '@/content'
import { cx } from '@/lib/cx'
import { capitalise } from '@/lib/text'

import styles from './ConceptCard.module.css'

interface Props {
  concept: Pick<Concept, 'slug' | 'term' | 'gloss' | 'summary'>
  /** The card's one action: a link or button, stretched to cover the whole card. */
  action: ReactNode
  className?: string
}

/**
 * A Concept in brief. Its title shares a view-transition name with the Concept
 * page's heading, so following the card morphs one into the other.
 */
export function ConceptCard({ concept, action, className }: Props) {
  return (
    <article className={cx(styles.card, className)}>
      <ViewTransition name={`concept-title-${concept.slug}`} share="morph" default="none">
        <h3 className={styles.title}>
          <span lang="sa-Latn">{capitalise(concept.term.iast)}</span>
        </h3>
      </ViewTransition>
      {concept.term.devanagari ? (
        <p lang="sa-Deva" className={styles.deva}>
          {concept.term.devanagari}
        </p>
      ) : null}
      <p className={styles.gloss}>{concept.gloss}</p>
      <p className={styles.summary}>{concept.summary}</p>
      <div className={styles.action}>{action}</div>
    </article>
  )
}
