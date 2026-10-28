import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { QuestionnaireCard, statusOf } from '@/components/QuestionnaireCard'
import { hrefFor, questionnaires, topics, type QuestionnaireCard as Card } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../listing.module.css'
import reading from '../reading.module.css'

const PATH = hrefFor({ page: 'questionnaires' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** A Questionnaire coming later: an entry anchored at its slug (`#dosha-survey`), with its Concepts. */
function Later({ questionnaire }: { questionnaire: Card }) {
  return (
    <li id={questionnaire.anchor} className={listing.entry}>
      <p className={listing.entryName}>{questionnaire.title}</p>
      <p className={listing.meta}>
        {statusOf(questionnaire.status)}
        {questionnaire.concepts.map((concept) => (
          <span key={concept.slug}>
            {' · '}
            <Link
              href={hrefFor({ kind: 'concept', id: concept.slug })}
              transitionTypes={turnForward}
            >
              <span lang={concept.lang}>{concept.name}</span>
            </Link>
          </span>
        ))}
      </p>
    </li>
  )
}

/**
 * The Questionnaires (D16): those with a page of their own first, then the ones coming later,
 * grouped by the topic of their Concepts. Every status is written in words. Front-end-site
 * ticket 10 builds this page out.
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
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="questionnaires-title">
          <header className={reading.titlePage}>
            <h1 id="questionnaires-title" className={reading.title}>
              Questionnaires
            </h1>
            <p className={reading.summary}>
              Each one sets out what it is for, and its limits, before you start.
            </p>
            <p className={listing.facts}>
              {featured.length} with a page of {featured.length === 1 ? 'its' : 'their'} own ·{' '}
              {later.length} coming later
            </p>
          </header>

          {featured.length > 0 ? (
            <ul className={listing.entries}>
              {featured.map((questionnaire) => (
                <li key={questionnaire.slug}>
                  <QuestionnaireCard questionnaire={questionnaire} />
                </li>
              ))}
            </ul>
          ) : null}

          {later.length > 0 ? (
            <section className={reading.section} aria-labelledby="later-title">
              <h2 id="later-title" className={reading.sectionTitle}>
                Coming later
              </h2>
              <p className={listing.note}>
                More Questionnaires from the current site follow once their questions and scoring
                rules are confirmed.
              </p>
              {groups.map(({ topic, questionnaires }) => (
                <div key={topic.slug} className={listing.group}>
                  <h3 className={listing.groupTitle}>
                    <Link
                      href={hrefFor({ kind: 'topic', id: topic.slug })}
                      transitionTypes={turnForward}
                    >
                      {topic.name}
                    </Link>
                  </h3>
                  <ul className={listing.entries}>
                    {questionnaires.map((questionnaire) => (
                      <Later key={questionnaire.slug} questionnaire={questionnaire} />
                    ))}
                  </ul>
                </div>
              ))}
              {ungrouped.length > 0 ? (
                <ul className={listing.entries}>
                  {ungrouped.map((questionnaire) => (
                    <Later key={questionnaire.slug} questionnaire={questionnaire} />
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </Folio>
      </main>
    </PageTurn>
  )
}
