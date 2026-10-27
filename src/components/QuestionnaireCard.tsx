import Link from 'next/link'

import type { Questionnaire } from '@/content'
import { cx } from '@/lib/cx'

import styles from './ConceptCard.module.css'
import own from './QuestionnaireCard.module.css'

/** A Questionnaire in brief, with its availability. Shares the Concept card's press style. */
export function QuestionnaireCard({ questionnaire }: { questionnaire: Questionnaire }) {
  return (
    <article className={cx(styles.card, own.card)}>
      <h3 className={styles.title}>{questionnaire.title}</h3>
      {questionnaire.availability === 'coming-soon' ? (
        <p className={own.badge}>Coming soon</p>
      ) : null}
      <p className={styles.summary}>{questionnaire.summary}</p>
      <div className={styles.action}>
        <Link href={`/questionnaires/${questionnaire.slug}`}>About the {questionnaire.title}</Link>
      </div>
    </article>
  )
}
