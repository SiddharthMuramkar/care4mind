import type { Metadata } from 'next'
import Link from 'next/link'

import { OrnamentRule } from '@/components/ornaments/OrnamentRule'
import { turnForward } from '@/components/page-turn/PageTurn'
import { QuestionnaireCard } from '@/components/cards/QuestionnaireCard'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { StatusBadge } from '@/components/StatusBadge'
import { hrefFor, questionnaires, topics, type QuestionnaireCard as Card } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../listing.module.css'
import reading from '../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'questionnaires' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * A Questionnaire coming later: a catalogue slip at its anchor (`#dosha-survey`), where the
 * current site's address for it now leads. It names the page it came from, says "Coming later"
 * in words, and links to its Concept.
 */
function Later({ questionnaire }: { questionnaire: Card }) {
  const { anchor, sourceTitle, shownStatus, concepts } = questionnaire
  return (
    <li id={anchor} className={styles.slip}>
      <h4 className={styles.slipTitle}>{sourceTitle}</h4>
      <StatusBadge status={shownStatus} small className={styles.slipStatus} />
      {concepts.length > 0 ? (
        <p className={styles.slipConcepts}>
          <span className={styles.slipLabel}>{concepts.length === 1 ? 'Concept' : 'Concepts'}</span>{' '}
          {concepts.map((concept, index) => (
            <span key={concept.slug}>
              {index > 0 ? ', ' : null}
              <Link
                href={hrefFor({ kind: 'concept', id: concept.slug })}
                transitionTypes={turnForward}
              >
                <span lang={concept.lang}>{concept.name}</span>
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </li>
  )
}

/**
 * The Questionnaires (D16): those with a page of their own first, then the ones coming later,
 * grouped by the topic of their Concepts. Every status is written in words.
 */
export default async function QuestionnairesPage() {
  const [all, topicCards] = await Promise.all([questionnaires.list(), topics.list()])
  const featured = all.filter(({ status }) => status !== 'coming-later')
  const later = all.filter(({ status }) => status === 'coming-later')
  const groups = topicCards
    .map((topic) => ({
      topic,
      questionnaires: later.filter(({ topics }) => topics[0]?.slug === topic.slug),
    }))
    .filter(({ questionnaires }) => questionnaires.length > 0)
  const ungrouped = later.filter(({ topics }) => topics.length === 0)

  return (
    <ReadingPage path={PATH}>
      <TitlePage>
        <PageTitle className={styles.title}>Questionnaires</PageTitle>
        <p className={reading.summary}>
          Each one sets out what it is for, and its limits, before you start.
        </p>
        <p className={listing.facts}>
          {featured.length} with a page of {featured.length === 1 ? 'its' : 'their'} own ·{' '}
          {later.length} coming later
        </p>
      </TitlePage>

      {featured.length > 0 ? (
        <section className={reading.section} aria-labelledby="featured-title">
          <h2 id="featured-title" className="sr-only">
            With a page of {featured.length === 1 ? 'its' : 'their'} own
          </h2>
          <ul className={styles.featured}>
            {featured.map((questionnaire) => (
              <li key={questionnaire.slug}>
                <QuestionnaireCard questionnaire={questionnaire} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {later.length > 0 ? (
        <section className={reading.section} aria-labelledby="later-title">
          <OrnamentRule />
          <h2 id="later-title" className={reading.sectionTitle}>
            Coming later
          </h2>
          <p className={styles.note}>
            The current site describes these {later.length} Questionnaires. Each opens here once its
            questions and scoring rules are confirmed; until then its Concept says what it is about.
          </p>
          {groups.map(({ topic, questionnaires }) => (
            <section
              key={topic.slug}
              className={styles.group}
              data-topic={topic.slug}
              aria-labelledby={`later-${topic.slug}`}
            >
              <header className={styles.groupHead}>
                <h3 id={`later-${topic.slug}`} className={styles.groupTitle}>
                  <Link
                    href={hrefFor({ kind: 'topic', id: topic.slug })}
                    transitionTypes={turnForward}
                  >
                    {topic.name}
                  </Link>
                </h3>
                <p className={styles.groupCount}>{questionnaires.length} coming later</p>
              </header>
              <ul className={styles.slips}>
                {questionnaires.map((questionnaire) => (
                  <Later key={questionnaire.slug} questionnaire={questionnaire} />
                ))}
              </ul>
            </section>
          ))}
          {ungrouped.length > 0 ? (
            <ul className={styles.slips}>
              {ungrouped.map((questionnaire) => (
                <Later key={questionnaire.slug} questionnaire={questionnaire} />
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </ReadingPage>
  )
}
