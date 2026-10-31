import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Citation } from '@/components/Citation'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { Text } from '@/components/prose'
import { StatusBadge } from '@/components/StatusBadge'
import { Flow } from '@/components/questionnaire/Flow'
import { concepts, hrefFor, questionnaires } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import reading from '../../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

/** A flow exists only for a Questionnaire that can be taken in this build (D16). */
export async function generateStaticParams() {
  const all = await questionnaires.list()
  const open = await Promise.all(all.map(({ slug }) => questionnaires.form(slug)))
  return open.flatMap((form) => (form ? [{ slug: form.slug }] : []))
}

export async function generateMetadata({
  params,
}: PageProps<'/questionnaires/[slug]/take'>): Promise<Metadata> {
  const questionnaire = await questionnaires.get((await params).slug)
  if (!questionnaire) notFound()
  const { slug, status } = questionnaire
  return metadataFor(hrefFor({ kind: 'questionnaire', id: slug, status, flow: true }))
}

/**
 * Taking a Questionnaire (C4): the flow is a client island, server-rendered at part 1. Its end
 * screen's limitations, source and related Concepts are set here and handed to it. Without
 * JavaScript the page says why it can't work and leads back to the purpose and limitations.
 */
export default async function TakeQuestionnairePage({
  params,
}: PageProps<'/questionnaires/[slug]/take'>) {
  const { slug } = await params
  const [questionnaire, form] = await Promise.all([
    questionnaires.get(slug),
    questionnaires.form(slug),
  ])
  if (!questionnaire || !form) notFound()
  const { title, status, shownStatus, limitations, source } = questionnaire
  const intro = hrefFor({ kind: 'questionnaire', id: slug, status })
  const related = (await concepts.list()).filter((concept) =>
    questionnaire.concepts.some((ref) => ref.slug === concept.slug),
  )

  const limits = limitations ? (
    <section className={styles.limits} aria-labelledby="end-limits">
      <h3 id="end-limits" className={styles.title}>
        What this is not
      </h3>
      {limitations.status === 'draft-pending-psychology-expert' ? (
        <p className={styles.draft}>
          Draft wording. The Psychology expert has not reviewed these limitations yet.
        </p>
      ) : null}
      <ul className={styles.list}>
        {limitations.items.map((item) => (
          <li key={item}>
            <Text text={item} />
          </li>
        ))}
      </ul>
    </section>
  ) : null

  const sources = (
    <>
      {source ? (
        <section className={styles.section} aria-labelledby="end-source">
          <h3 id="end-source" className={styles.title}>
            Source
          </h3>
          <p>
            <Citation reference={source} />
          </p>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section className={styles.section} aria-labelledby="end-related">
          <h3 id="end-related" className={styles.title}>
            Related Concepts
          </h3>
          <ul className={styles.list}>
            {related.map((concept) => (
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
    </>
  )

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={hrefFor({ kind: 'questionnaire', id: slug, status, flow: true })} />
        <Folio as="article" className={reading.article} aria-labelledby="flow-title">
          <header className={cx(reading.titlePage, styles.head)}>
            <p className={reading.kicker}>Take the Questionnaire</p>
            <h1 id="flow-title" className={cx(reading.title, reading.titleLong)}>
              {title}
            </h1>
            <StatusBadge status={shownStatus} />
            <p className={styles.promise}>
              Your answers aren’t scored yet. They stay on this page while it is open: nothing you
              answer is saved or sent anywhere.
            </p>
          </header>

          <noscript>
            <section className={styles.noscript} aria-labelledby="noscript-title">
              <h2 id="noscript-title" className={styles.title}>
                This Questionnaire needs JavaScript
              </h2>
              <p>
                Your answers may go neither into the address nor to a server, so they can only be
                kept in this page while it is open, and that takes JavaScript. Switch it on to take
                the {title}.
              </p>
              <p>
                <a href={intro}>Back to what the {title} is for, and its limits</a>
              </p>
            </section>
          </noscript>

          <Flow
            form={form}
            instructions={form.parts.map((part) => (
              <Text key={part.id} text={part.instructions} />
            ))}
            intro={intro}
            limits={limits}
            sources={sources}
          />
        </Folio>
      </main>
    </PageTurn>
  )
}
