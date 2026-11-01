import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { Provenance, Text } from '@/components/prose'
import { ReadingThread } from '@/components/ReadingThread'
import { Limitations, RelatedConcepts, Source } from '@/components/questionnaire/Sections'
import { StatusBadge } from '@/components/StatusBadge'
import { hrefFor, questionnaires } from '@/content'
import { metadataFor } from '@/lib/metadata'

import cta from '../../cta.module.css'
import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

/** A Questionnaire coming later has no page: it is an entry on the Questionnaires page. */
export async function generateStaticParams() {
  return (await questionnaires.list())
    .filter(({ status }) => status !== 'coming-later')
    .map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/questionnaires/[slug]'>): Promise<Metadata> {
  const questionnaire = await questionnaires.get((await params).slug)
  if (!questionnaire) notFound()
  return metadataFor(
    hrefFor({ kind: 'questionnaire', id: questionnaire.slug, status: questionnaire.status }),
  )
}

/**
 * A Questionnaire's description page (FR-05): purpose and limitations come
 * before anything starts. Start opens the flow only where the Questionnaire
 * can be taken in this build; otherwise it is disabled and says why.
 */
export default async function QuestionnairePage({ params }: PageProps<'/questionnaires/[slug]'>) {
  const questionnaire = await questionnaires.get((await params).slug)
  if (!questionnaire || questionnaire.status === 'coming-later') notFound()

  const { slug, status, shownStatus, takeHref } = questionnaire

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <ReadingThread />
        <Breadcrumbs path={hrefFor({ kind: 'questionnaire', id: slug, status })} />
        <Folio as="article" className={reading.article} aria-labelledby="questionnaire-title">
          <header className={reading.titlePage}>
            <p className={reading.kicker}>Questionnaire</p>
            <h1 id="questionnaire-title" className={reading.title}>
              {/* The Questionnaires page's card flies into this heading. */}
              <ViewTransition name={`questionnaire-title-${slug}`} share="morph" default="none">
                <span>{questionnaire.title}</span>
              </ViewTransition>
            </h1>
            <StatusBadge status={shownStatus} />
            {questionnaire.summary ? (
              <p className={reading.summary}>
                <Text text={questionnaire.summary} />
              </p>
            ) : null}
          </header>

          {questionnaire.purpose ? (
            <section className={reading.section} aria-labelledby="purpose-title">
              <h2 id="purpose-title" className={reading.sectionTitle}>
                What it is for
              </h2>
              {questionnaire.purpose.map((paragraph) => (
                <p key={paragraph}>
                  <Text text={paragraph} />
                </p>
              ))}
            </section>
          ) : null}

          {questionnaire.format ? (
            <section className={reading.section} aria-labelledby="format-title">
              <h2 id="format-title" className={reading.sectionTitle}>
                How it works
              </h2>
              <ul className={styles.list}>
                {questionnaire.format.map((item) => (
                  <li key={item}>
                    <Text text={item} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <Limitations
            limitations={questionnaire.limitations}
            title="Before you start: its limits"
            id="limitations-title"
            level={2}
            className={`${reading.section} ${styles.limitations}`}
            headingClassName={reading.sectionTitle}
          />

          <Source
            reference={questionnaire.source}
            id="source-title"
            level={2}
            className={reading.section}
            headingClassName={reading.sectionTitle}
          />

          <div className={styles.start}>
            {takeHref ? (
              <>
                <Link
                  href={takeHref as Route}
                  className={cta.primary}
                  transitionTypes={turnForward}
                  data-ink
                  aria-describedby="start-note"
                >
                  Start the Questionnaire
                </Link>
                <p id="start-note" className={styles.startNote}>
                  <strong>Your answers aren’t scored yet.</strong> Its scoring rules are with the
                  Psychology expert. Nothing you answer is saved or sent anywhere.
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.startButton}
                  disabled
                  aria-describedby="start-note"
                >
                  Start the Questionnaire
                </button>
                <p id="start-note" className={styles.startNote}>
                  <strong>Coming soon.</strong> The questions open here once their scoring rules are
                  confirmed.
                </p>
              </>
            )}
          </div>

          <RelatedConcepts
            concepts={questionnaire.relatedConcepts}
            id="related-title"
            level={2}
            className={reading.section}
            headingClassName={reading.sectionTitle}
          />

          <Provenance of={questionnaire} />
        </Folio>
      </main>
    </PageTurn>
  )
}
