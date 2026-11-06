import type { Metadata } from 'next'
import Link from 'next/link'

import { azModel, ConceptsAz } from '@/components/az'
import { turnForward } from '@/components/PageTurn'
import { ReadingPage } from '@/components/ReadingPage'
import { TopicCard } from '@/components/topics'
import { concepts, hrefFor, site, topics, works } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { count } from '@/lib/text'

import reading from '@/styles/reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'concepts' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * The Concepts A–Z: the topics as cards, then every Concept, every term explained inside
 * one (or in a topic's introduction) and every glossary entry, by letter, under a rail of letters
 * and filter chips.
 */
export default async function ConceptsPage() {
  const [letters, topicCards, workCards, conceptCards, routes] = await Promise.all([
    site.azIndex(),
    topics.list(),
    works.list(),
    concepts.list(),
    site.routes(),
  ])
  const az = azModel({ letters, topics: topicCards, works: workCards, concepts: conceptCards })
  const { counts } = az

  return (
    <ReadingPage
      path={PATH}
      titleId="concepts-title"
      width="plate"
      kicker="From A to Z"
      title="Concepts"
      afterTitle={
        <>
          <p className={reading.summary}>
            Every Concept, every term explained inside one, and every glossary entry.
          </p>
          <p className={styles.facts}>
            {count(counts.all, 'entry', 'entries')}:{' '}
            {count(counts.concept, 'Concept page', 'Concept pages')},{' '}
            {count(counts.term, 'term', 'terms')} and{' '}
            {count(counts.glossary, 'glossary entry', 'glossary entries')}
          </p>
        </>
      }
    >
      <section className={reading.section} aria-labelledby="topics-title">
        <h2 id="topics-title" className={reading.sectionTitle}>
          By topic
        </h2>
        <ul className={styles.topics}>
          {topicCards.map((topic) => (
            <li key={topic.slug}>
              <TopicCard topic={topic} />
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          Looking for a term by another spelling?{' '}
          <Link href={hrefFor({ page: 'search' })}>Search the site</Link>.
          {routes.some((route) => route.kind === 'concept-map') ? (
            <>
              {' '}
              Or see how the Concepts connect on the{' '}
              <Link href={hrefFor({ page: 'concept-map' })} transitionTypes={turnForward}>
                Concept map
              </Link>{' '}
              (a proposal).
            </>
          ) : null}
        </p>
      </section>

      <section className={reading.section} aria-labelledby="az-title">
        <h2 id="az-title" className={reading.sectionTitle}>
          From A to Z
        </h2>
        <ConceptsAz model={az} />
      </section>
    </ReadingPage>
  )
}
