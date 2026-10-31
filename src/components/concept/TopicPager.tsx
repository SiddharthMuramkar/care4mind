import type { Route } from 'next'
import Link from 'next/link'

import type { ConceptCard, TopicRef } from '@/content'

import { turnBack, turnForward } from '../PageTurn'
import { LinkPreview } from '../preview'
import { conceptPreview } from './previews'
import styles from './TopicPager.module.css'

/** One way through the topic, named by the Concept it leads to. */
function Turn({ concept, rel }: { concept: ConceptCard; rel: 'prev' | 'next' }) {
  return (
    <LinkPreview preview={conceptPreview(concept)}>
      {/* The Concept's path, made by hrefFor() in the content module. */}
      <Link
        href={concept.href as Route}
        rel={rel}
        transitionTypes={rel === 'next' ? turnForward : turnBack}
        className={rel === 'next' ? styles.next : styles.previous}
        data-ink
      >
        <span className={styles.direction}>{rel === 'next' ? 'Next' : 'Previous'}</span>
        <span className={styles.name} {...(concept.lang ? { lang: concept.lang } : {})}>
          {concept.name}
        </span>
      </Link>
    </LinkPreview>
  )
}

/**
 * The Concepts before and after this one in its primary topic: "next" turns the page forward and
 * "previous" turns it back. The first has no "previous", the last no "next".
 */
export function TopicPager({
  topic,
  previous,
  next,
}: {
  topic: TopicRef
  previous?: ConceptCard
  next?: ConceptCard
}) {
  if (!previous && !next) return null
  return (
    <nav className={styles.pager} aria-label={`Concepts in ${topic.name}`}>
      {previous ? <Turn concept={previous} rel="prev" /> : null}
      {next ? <Turn concept={next} rel="next" /> : null}
    </nav>
  )
}
