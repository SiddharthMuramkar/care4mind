import type { QuestionnaireStatus } from '@/content'
import { cx } from '@/lib/cx'

import styles from './StatusBadge.module.css'

const WORDS: Record<QuestionnaireStatus, string> = {
  live: 'Open',
  preview: 'Preview',
  'coming-soon': 'Coming soon',
  'coming-later': 'Coming later',
}

/** A Questionnaire's status in words, never by colour alone (WCAG 1.4.1). */
export function statusWords(status: QuestionnaireStatus): string {
  return WORDS[status]
}

/**
 * A Questionnaire's status as a visitor sees it: its words on its status's colour. Pass the view's
 * `shownStatus`, never its `status`, so a preview whose flag is off reads as coming soon.
 */
export function StatusBadge({
  status,
  small = false,
  className,
}: {
  status: QuestionnaireStatus
  /** Set a size down, for the slips on the Questionnaires page. */
  small?: boolean
  className?: string
}) {
  return (
    <p className={cx(styles.badge, small && styles.small, className)} data-status={status}>
      {statusWords(status)}
    </p>
  )
}
