import Link from 'next/link'

import { Transliterated } from '@/components/script'
import { hrefFor, type ConceptCard, type TopicRef } from '@/content'

import { turnBack } from '../PageTurn'
import { Pager, Turn } from '../Pager'
import { conceptPreview, LinkPreview } from '../preview'
import styles from './TopicPager.module.css'

/** One way through the topic, named by the Concept it leads to. */
function ConceptTurn({ concept, rel }: { concept: ConceptCard; rel: 'prev' | 'next' }) {
  return (
    <LinkPreview preview={conceptPreview(concept)}>
      <Turn
        href={concept.href}
        rel={rel}
        direction={rel === 'next' ? 'Next' : 'Previous'}
        name={<span {...(concept.lang ? { lang: concept.lang } : {})}>{concept.name}</span>}
        {...(concept.gloss ? { gloss: concept.gloss } : {})}
      />
    </LinkPreview>
  )
}

/**
 * The Concepts before and after this one in its primary topic: "next" turns the page forward and
 * "previous" turns it back. The first has no "previous"; the last leads on to the next topic
 * instead, where there is one. Every Concept's page ends with a way back up to its whole topic.
 */
export function TopicPager({
  topic,
  previous,
  next,
  nextTopic,
}: {
  topic: TopicRef
  previous?: ConceptCard
  next?: ConceptCard
  nextTopic?: TopicRef
}) {
  return (
    <Pager
      label={`Concepts in ${topic.name}`}
      after={
        <p className={styles.all}>
          <Link
            href={hrefFor({ kind: 'topic', id: topic.slug, anchor: 'its-concepts' })}
            transitionTypes={turnBack}
          >
            All concepts in this topic
          </Link>
        </p>
      }
    >
      {previous ? <ConceptTurn concept={previous} rel="prev" /> : null}
      {next ? (
        <ConceptTurn concept={next} rel="next" />
      ) : nextTopic ? (
        <Turn
          href={nextTopic.href}
          rel="next"
          direction="Next topic"
          name={<Transliterated text={nextTopic.name} />}
        />
      ) : null}
    </Pager>
  )
}
