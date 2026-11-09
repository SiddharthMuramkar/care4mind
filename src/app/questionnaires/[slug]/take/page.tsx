import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Citation } from '@/components/Citation'
import { LoginRequired } from '@/components/login'
import { ReadingPage } from '@/components/ReadingPage'
import { Text } from '@/components/prose'
import { StatusBadge } from '@/components/StatusBadge'
import { Flow, Limitations, RelatedConcepts } from '@/components/questionnaire'
import { hrefFor, questionnaires, site } from '@/content'
import { metadataFor } from '@/lib/metadata'

import styles from './page.module.css'

export const dynamicParams = false

const PATTERN = '/questionnaires/[slug]/take/' as const

/** A flow exists only for a Questionnaire that can be taken in this build. */
export const generateStaticParams = () => site.params(PATTERN)

export async function generateMetadata({
  params,
}: PageProps<'/questionnaires/[slug]/take'>): Promise<Metadata> {
  return metadataFor(PATTERN.replace('[slug]', (await params).slug))
}

/**
 * Taking a Questionnaire: the flow is a client island, server-rendered at part 1. Its end
 * screen's limitations, source and related Concepts are set here and handed to it. Without
 * JavaScript the page says why it can't work and leads back to the purpose and limitations.
 * Behind the login switch, only a user who is logged in sees the flow; the page stays static.
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

  const limits = limitations ? <Limitations limitations={limitations} variant="end" /> : null

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
      <RelatedConcepts concepts={questionnaire.concepts} variant="end" />
    </>
  )

  return (
    <ReadingPage
      path={hrefFor({ kind: 'questionnaire', id: slug, status, flow: true })}
      titleId="flow-title"
      headerClassName={styles.head}
      kicker="Take the Questionnaire"
      title={title}
      longTitle
      afterTitle={
        <>
          <StatusBadge status={shownStatus} />
          <p className={styles.promise}>
            Your answers aren’t scored yet. They stay on this page while it is open: nothing you
            answer is saved or sent anywhere.
          </p>
        </>
      }
    >
      <noscript>
        <section className={styles.noscript} aria-labelledby="noscript-title">
          <h2 id="noscript-title" className={styles.title}>
            This Questionnaire needs JavaScript
          </h2>
          <p>
            Your answers may go neither into the address nor to a server, so they can only be kept
            in this page while it is open, and that takes JavaScript. Switch it on to take the{' '}
            {title}.
          </p>
          <p>
            <a href={intro}>Back to what the {title} is for, and its limits</a>
          </p>
        </section>
      </noscript>

      <LoginRequired>
        <Flow
          form={form}
          instructions={form.parts.map((part) => (
            <Text key={part.id} text={part.instructions} />
          ))}
          intro={intro}
          limits={limits}
          sources={sources}
        />
      </LoginRequired>
    </ReadingPage>
  )
}
