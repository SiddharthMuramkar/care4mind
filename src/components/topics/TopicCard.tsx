import Link from 'next/link'

import { TitleMorph, turnForward } from '@/components/PageTurn'
import { ScriptPair } from '@/components/script'
import { hrefFor, type TopicCard as Topic } from '@/content'
import { cx } from '@/lib/cx'
import { toDevanagariDigits } from '@/lib/text'

import styles from './TopicCard.module.css'

/**
 * A topic in brief: its number, its name and how many Concepts it holds. The whole card leads to
 * the topic's page, and its name flies into that page's heading as the page turns forward.
 */
export function TopicCard({ topic, className }: { topic: Topic; className?: string }) {
  return (
    <article className={cx(styles.card, className)} data-topic={topic.slug}>
      <span className={styles.numeral} aria-hidden>
        <span>{topic.order}</span>{' '}
        <span lang="sa-Deva">{toDevanagariDigits(String(topic.order))}</span>
      </span>
      <h3 className={styles.title}>
        <Link
          href={hrefFor({ kind: 'topic', id: topic.slug })}
          className={styles.link}
          transitionTypes={turnForward}
          data-ink
        >
          <TitleMorph kind="topic" slug={topic.slug}>
            <span>{topic.name}</span>
          </TitleMorph>
        </Link>
      </h3>
      {topic.term ? (
        <p className={styles.term}>
          <ScriptPair
            iast={topic.term.iast}
            {...(topic.term.devanagari ? { devanagari: topic.term.devanagari } : {})}
          />
        </p>
      ) : null}
      <p className={styles.count}>
        {topic.conceptCount} {topic.conceptCount === 1 ? 'Concept' : 'Concepts'}
      </p>
    </article>
  )
}
