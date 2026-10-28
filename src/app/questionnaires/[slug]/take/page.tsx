import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnBack } from '@/components/PageTurn'
import { statusOf } from '@/components/QuestionnaireCard'
import { hrefFor, questionnaires } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '../../../reading.module.css'

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
 * Taking a Questionnaire, one part at a time. Front-end-site ticket 10 builds the flow here;
 * until then the page says so and leads back to the purpose and limitations.
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
  const { title, status } = questionnaire

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={hrefFor({ kind: 'questionnaire', id: slug, status, flow: true })} />
        <Folio as="article" className={reading.article} aria-labelledby="flow-title">
          <header className={reading.titlePage}>
            <p className={reading.kicker}>Take the Questionnaire</p>
            <h1 id="flow-title" className={reading.title}>
              {title}
            </h1>
            <p className={reading.badge}>{statusOf(status)}</p>
            <p className={reading.summary}>
              Its statements open here, one part at a time, once this preview’s flow is built.
            </p>
            <p>
              <Link
                href={hrefFor({ kind: 'questionnaire', id: slug, status })}
                transitionTypes={turnBack}
              >
                Back to what the {title} is for, and its limits
              </Link>
            </p>
          </header>
        </Folio>
      </main>
    </PageTurn>
  )
}
