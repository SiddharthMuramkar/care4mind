import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Citation } from '@/components/Citation'
import { Folio } from '@/components/Folio'
import { HelpLine } from '@/components/HelpLine'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { Provenance, Text } from '@/components/prose'
import { ReadingThread } from '@/components/ReadingThread'
import { hrefFor, questionnaires, site } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { shownStatus, startOf, statusWords } from '@/lib/questionnaire/gate'

import cta from '../../cta.module.css'
import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

const PATTERN = '/questionnaires/[slug]/' as const

/** A Questionnaire coming later has no page: it is an entry on the Questionnaires page. */
export const generateStaticParams = () => site.params(PATTERN)

export async function generateMetadata({
  params,
}: PageProps<'/questionnaires/[slug]'>): Promise<Metadata> {
  return metadataFor(PATTERN.replace('[slug]', (await params).slug))
}

/**
 * A Questionnaire's description page (FR-05): purpose and limitations come
 * before anything starts. Start opens the flow only where the Questionnaire
 * can be taken in this build; otherwise it is disabled and says why.
 */
export default async function QuestionnairePage({ params }: PageProps<'/questionnaires/[slug]'>) {
  const questionnaire = await questionnaires.get((await params).slug)
  if (!questionnaire || questionnaire.status === 'coming-later') notFound()

  const { slug, status } = questionnaire
  const start = startOf(questionnaire, await questionnaires.form(slug))

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
            <p className={styles.status} data-status={shownStatus(status)}>
              {statusWords(status)}
            </p>
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

          {questionnaire.limitations ? (
            <section
              className={`${reading.section} ${styles.limitations}`}
              aria-labelledby="limitations-title"
            >
              <h2 id="limitations-title" className={reading.sectionTitle}>
                Before you start: its limits
              </h2>
              {questionnaire.limitations.status === 'draft-pending-psychology-expert' ? (
                <p className={styles.draft}>
                  Draft wording. The Psychology expert has not reviewed these limitations yet.
                </p>
              ) : null}
              <ul className={styles.list}>
                {questionnaire.limitations.items.map((item) => (
                  <li key={item}>
                    <Text text={item} />
                  </li>
                ))}
              </ul>
              <HelpLine className={styles.help} />
            </section>
          ) : (
            <HelpLine className={`${reading.section} ${styles.help}`} />
          )}

          {questionnaire.source ? (
            <section className={reading.section} aria-labelledby="source-title">
              <h2 id="source-title" className={reading.sectionTitle}>
                Source
              </h2>
              <p>
                <Citation reference={questionnaire.source} />
              </p>
            </section>
          ) : null}

          <div className={styles.start}>
            {start.open ? (
              <>
                <Link
                  href={start.href}
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

          {questionnaire.concepts.length > 0 ? (
            <section className={reading.section} aria-labelledby="related-title">
              <h2 id="related-title" className={reading.sectionTitle}>
                Related Concepts
              </h2>
              <ul className={styles.list}>
                {questionnaire.concepts.map((concept) => (
                  <li key={concept.slug}>
                    <Link
                      href={hrefFor({ kind: 'concept', id: concept.slug })}
                      transitionTypes={turnForward}
                    >
                      <span lang={concept.lang}>{concept.name}</span>
                      {concept.term && concept.english ? ` (${concept.english})` : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <Provenance of={questionnaire} />
        </Folio>
      </main>
    </PageTurn>
  )
}
