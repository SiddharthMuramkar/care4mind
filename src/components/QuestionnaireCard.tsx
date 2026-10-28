import Link from 'next/link'

import { features } from '@/config/features'
import { hrefFor, type QuestionnaireCard as Card, type QuestionnaireStatus } from '@/content'
import { cx } from '@/lib/cx'

import styles from './ConceptCard.module.css'
import { turnForward } from './PageTurn'
import { Text } from './prose/Text'
import own from './QuestionnaireCard.module.css'

const STATUS: Record<QuestionnaireStatus, string> = {
  live: 'Open',
  preview: 'Preview',
  'coming-soon': 'Coming soon',
  'coming-later': 'Coming later',
}

/**
 * A Questionnaire's status in words, never by colour alone (WCAG 1.4.1). A preview opens only
 * where its flag is on; elsewhere it is coming soon (D16).
 */
export function statusOf(status: QuestionnaireStatus): string {
  return status === 'preview' && !features.questionnairePreview
    ? STATUS['coming-soon']
    : STATUS[status]
}

/** A Questionnaire in brief, with its status. Shares the Concept card's press style. */
export function QuestionnaireCard({ questionnaire }: { questionnaire: Card }) {
  const { slug, title, status, summary } = questionnaire
  return (
    <article className={cx(styles.card, own.card)}>
      <h3 className={styles.title}>{title}</h3>
      <p className={own.badge}>{statusOf(status)}</p>
      {summary ? (
        <p className={styles.summary}>
          <Text text={summary} />
        </p>
      ) : null}
      <div className={styles.action}>
        <Link
          href={hrefFor({ kind: 'questionnaire', id: slug, status })}
          transitionTypes={turnForward}
        >
          About the {title}
        </Link>
      </div>
    </article>
  )
}
