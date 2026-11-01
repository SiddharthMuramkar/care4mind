import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Text } from '@/components/prose'
import { StatusBadge } from '@/components/StatusBadge'
import { Flow } from '@/components/questionnaire/Flow'
import { Limitations, RelatedConcepts, Source } from '@/components/questionnaire/Sections'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { hrefFor, questionnaires, site } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '../../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export const generateStaticParams = () => site.params('/questionnaires/[slug]/take/')

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
  const { title, status, shownStatus, limitations, source, concepts } = questionnaire
  const intro = hrefFor({ kind: 'questionnaire', id: slug, status })

  const limits = (
    <Limitations
      limitations={limitations}
      title="What this is not"
      id="end-limits"
      level={3}
      className={styles.limits}
      headingClassName={styles.title}
    />
  )

  const sources = (
    <>
      <Source
        reference={source}
        id="end-source"
        level={3}
        className={styles.section}
        headingClassName={styles.title}
      />
      <RelatedConcepts
        concepts={concepts}
        id="end-related"
        level={3}
        className={styles.section}
        headingClassName={styles.title}
      />
    </>
  )

  return (
    <ReadingPage path={hrefFor({ kind: 'questionnaire', id: slug, status, flow: true })}>
      <TitlePage className={styles.head}>
        <p className={reading.kicker}>Take the Questionnaire</p>
        <PageTitle long>{title}</PageTitle>
        <StatusBadge status={shownStatus} />
        <p className={styles.promise}>
          Your answers aren’t scored yet. They stay on this page while it is open: nothing you
          answer is saved or sent anywhere.
        </p>
      </TitlePage>

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
    </ReadingPage>
  )
}
