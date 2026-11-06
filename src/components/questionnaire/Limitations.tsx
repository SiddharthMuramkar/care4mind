import type { ReactNode } from 'react'

import { Text } from '@/components/prose'
import type { QuestionnaireView } from '@/content'
import { cx } from '@/lib/cx'

import styles from './Limitations.module.css'

type Limits = NonNullable<QuestionnaireView['limitations']>

interface Props {
  limitations: Limits
  /** The end screen sets the same limits a size down, under its own heading. */
  variant?: 'page' | 'end'
  /** Set after the limits, inside their frame: where to call for help now. */
  children?: ReactNode
}

/** A Questionnaire's stated limits, with their draft marking where the expert hasn't reviewed them. */
export function Limitations({ limitations, variant = 'page', children }: Props) {
  const end = variant === 'end'
  const id = end ? 'end-limits' : 'limitations-title'
  const Heading = end ? 'h3' : 'h2'
  return (
    <section className={end ? styles.end : styles.page} aria-labelledby={id}>
      <Heading id={id} className={end ? styles.endTitle : styles.pageTitle}>
        {end ? 'What this is not' : 'Before you start: its limits'}
      </Heading>
      {limitations.status === 'draft-pending-psychology-expert' ? (
        <p className={cx(styles.draft, end ? styles.endDraft : styles.pageDraft)}>
          Draft wording. The Psychology expert has not reviewed these limitations yet.
        </p>
      ) : null}
      <ul className={styles.list}>
        {limitations.items.map((item) => (
          <li key={item}>
            <Text text={item} />
          </li>
        ))}
      </ul>
      {children}
    </section>
  )
}
