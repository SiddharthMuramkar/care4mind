import Link from 'next/link'

import { artFor } from '@/art'
import { Sticker } from '@/components/art'
import { Numeral } from '@/components/Numeral'
import { TitleMorph, turnForward } from '@/components/PageTurn'
import { ScriptPair } from '@/components/script'
import { hrefFor, type TopicCard as Topic } from '@/content'
import { cx } from '@/lib/cx'
import { count } from '@/lib/text'

import styles from './TopicCard.module.css'

/**
 * A topic in brief: its Sticker, its number, its name and how many Concepts it holds. The whole
 * card leads to the topic's page, and its name flies into that page's heading as the page turns
 * forward.
 */
export function TopicCard({ topic, className }: { topic: Topic; className?: string }) {
  return (
    <article className={cx(styles.card, className)} data-topic={topic.slug}>
      <Sticker
        art={artFor({ kind: 'topic-card', slug: topic.slug })}
        size={64}
        className={styles.art}
      />
      <span className={styles.numeral} aria-hidden>
        <span>{topic.order}</span> <Numeral value={topic.order} />
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
      <p className={styles.count}>{count(topic.conceptCount, 'Concept', 'Concepts')}</p>
    </article>
  )
}
