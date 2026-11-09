import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { KarmaCycle } from '@/components/art'
import { Citation } from '@/components/Citation'
import { HelpLine } from '@/components/HelpLine'
import { TitleMorph, turnForward } from '@/components/PageTurn'
import { ReadingPage } from '@/components/ReadingPage'
import { Provenance, Text } from '@/components/prose'
import { Limitations, RelatedConcepts } from '@/components/questionnaire'
import { ReadingThread } from '@/components/ReadingThread'
import { StatusBadge } from '@/components/StatusBadge'
import { hrefFor, questionnaires, site } from '@/content'
import { metadataFor } from '@/lib/metadata'

import cta from '@/components/Cta'
import reading from '@/styles/reading.module.css'
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

  const { slug, status, shownStatus, takeHref } = questionnaire

  return (
    <ReadingPage
      path={hrefFor({ kind: 'questionnaire', id: slug, status })}
      titleId="questionnaire-title"
      beforeTrail={<ReadingThread />}
      kicker="Questionnaire"
      title={
        <>
          {/* The Questionnaires page's card flies into this heading. */}
          <TitleMorph kind="questionnaire" slug={slug}>
            <span>{questionnaire.title}</span>
          </TitleMorph>
        </>
      }
      afterTitle={
        <>
          <StatusBadge status={shownStatus} />
          {questionnaire.summary ? (
            <p className={reading.summary}>
              <Text text={questionnaire.summary} />
            </p>
          ) : null}
        </>
      }
    >
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
          {slug === 'karmayoga-scale' ? <KarmaCycle /> : null}
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
        <Limitations limitations={questionnaire.limitations}>
          <HelpLine className={styles.help} />
        </Limitations>
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
        {takeHref ? (
          <>
            <Link
              href={takeHref}
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
              <strong>In preparation.</strong> The questions open here once their scoring rules are
              confirmed.
            </p>
          </>
        )}
      </div>

      <RelatedConcepts concepts={questionnaire.concepts} />

      <Provenance of={questionnaire} />
    </ReadingPage>
  )
}
