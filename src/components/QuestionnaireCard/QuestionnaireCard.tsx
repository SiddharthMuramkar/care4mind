import Link from 'next/link'

import { ownArt } from '@/art'
import { Medallion } from '@/components/art'
import { FrameCorners } from '@/components/Folio'
import { hrefFor, type QuestionnaireCard as Card } from '@/content'
import { cx } from '@/lib/cx'

import { conceptCardStyles as styles } from '../ConceptCard'
import { TitleMorph, turnForward } from '../PageTurn'
import { Text } from '../prose'
import own from './QuestionnaireCard.module.css'
import { StatusBadge } from '../StatusBadge'

/**
 * A Questionnaire in brief, with its status. Shares the Concept card's press style, and its
 * title morphs into the Questionnaire page's heading as the card is followed. One with its own
 * Plate shows it in a row above the title, with the status to its right; the rest stay bare.
 */
export function QuestionnaireCard({
  questionnaire,
  featured = false,
}: {
  questionnaire: Card
  /** A featured card takes the printer's double frame; the rest keep a single thin rule. */
  featured?: boolean
}) {
  const { slug, title, status, shownStatus, summary } = questionnaire
  const picture = ownArt({ kind: 'questionnaire', slug })
  return (
    <article
      className={cx(
        styles.card,
        picture && styles.withArt,
        featured && styles.featured,
        own.card,
        picture && own.withArt,
      )}
      data-paper
    >
      {featured ? <FrameCorners /> : null}
      {picture ? <Medallion art={picture} size={64} className={styles.art} /> : null}
      <TitleMorph kind="questionnaire" slug={slug}>
        <h3 className={styles.title}>{title}</h3>
      </TitleMorph>
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
        >
          About the {title}
        </Link>
      </div>
    </article>
  )
}
