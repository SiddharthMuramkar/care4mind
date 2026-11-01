import Link from 'next/link'
import { ViewTransition } from 'react'

import { hrefFor, type QuestionnaireCard as Card } from '@/content'
import { cx } from '@/lib/cx'

import styles from './ConceptCard.module.css'
import { turnForward } from './PageTurn'
import { Text } from './prose/Text'
import own from './QuestionnaireCard.module.css'
import { StatusBadge } from './StatusBadge'

/**
 * A Questionnaire in brief, with its status. Shares the Concept card's press style, and its
 * title morphs into the Questionnaire page's heading as the card is followed.
 */
export function QuestionnaireCard({ questionnaire }: { questionnaire: Card }) {
  const { slug, title, status, shownStatus, summary } = questionnaire
  return (
    <article className={cx(styles.card, own.card)}>
      <ViewTransition name={`questionnaire-title-${slug}`} share="morph" default="none">
        <h3 className={styles.title}>{title}</h3>
      </ViewTransition>
      <StatusBadge status={shownStatus} className={own.badge} />
      {summary ? (
        <p className={styles.summary}>
          <Text text={summary} />
        </p>
      ) : null}
      <div className={styles.action}>
        <Link
          href={hrefFor({ kind: 'questionnaire', id: slug, status })}
          transitionTypes={turnForward}
          data-ink
        >
          About the {title}
        </Link>
      </div>
    </article>
  )
}
