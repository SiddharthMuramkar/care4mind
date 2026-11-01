import Link from 'next/link'
import { ViewTransition } from 'react'

import { hrefFor, type QuestionnaireCard as Card, type QuestionnaireStatus } from '@/content'
import { cx } from '@/lib/cx'
import { shownStatus, statusWords } from '@/lib/questionnaire/gate'

import styles from './ConceptCard.module.css'
import { titleMorphName, turnForward } from './PageTurn'
import { Text } from './prose/Text'
import own from './QuestionnaireCard.module.css'

/**
 * A Questionnaire's status in words, never by colour alone (WCAG 1.4.1). A preview opens only
 * where its flag is on; elsewhere it is coming soon (D16).
 */
export function statusOf(status: QuestionnaireStatus): string {
  return statusWords(status)
}

/**
 * A Questionnaire in brief, with its status. Shares the Concept card's press style, and its
 * title morphs into the Questionnaire page's heading as the card is followed.
 */
export function QuestionnaireCard({ questionnaire }: { questionnaire: Card }) {
  const { slug, title, status, summary } = questionnaire
  return (
    <article className={cx(styles.card, own.card)}>
      <ViewTransition name={titleMorphName('questionnaire', slug)} share="morph" default="none">
        <h3 className={styles.title}>{title}</h3>
      </ViewTransition>
      <p className={own.badge} data-status={shownStatus(status)}>
        {statusWords(status)}
      </p>
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
