import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Citation } from '@/components/Citation'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { getConcept, getQuestionnaire, listQuestionnaires } from '@/content'
import { capitalise } from '@/lib/text'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await listQuestionnaires()).map((questionnaire) => ({ slug: questionnaire.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/questionnaires/[slug]'>): Promise<Metadata> {
  const questionnaire = await getQuestionnaire((await params).slug)
  if (!questionnaire) return {}
  return { title: questionnaire.title, description: questionnaire.summary }
}

/**
 * A Questionnaire's description page (FR-05): purpose and limitations come
 * before anything starts. No Questionnaire runs yet, so the start control is
 * disabled and says why.
 */
export default async function QuestionnairePage({ params }: PageProps<'/questionnaires/[slug]'>) {
  const questionnaire = await getQuestionnaire((await params).slug)
  if (!questionnaire) notFound()

  const concepts = (
    await Promise.all(questionnaire.relatedConcepts.map((slug) => getConcept(slug)))
  ).filter((concept) => concept !== null)

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs
          trail={[
            { label: 'Home', href: '/' },
            { label: 'Questionnaires', href: '/#questionnaires' },
            { label: questionnaire.title },
          ]}
        />
        <Folio as="article" className={reading.article} aria-labelledby="questionnaire-title">
          <header className={reading.titlePage}>
            <p className={reading.kicker}>Questionnaire</p>
            <h1 id="questionnaire-title" className={reading.title}>
              {questionnaire.title}
            </h1>
            {questionnaire.availability === 'coming-soon' ? (
              <p className={reading.badge}>Coming soon</p>
            ) : null}
            <p className={reading.summary}>{questionnaire.summary}</p>
          </header>

          <section className={reading.section} aria-labelledby="purpose-title">
            <h2 id="purpose-title" className={reading.sectionTitle}>
              What it is for
            </h2>
            {questionnaire.purpose.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <section className={reading.section} aria-labelledby="format-title">
            <h2 id="format-title" className={reading.sectionTitle}>
              How it works
            </h2>
            <ul className={styles.list}>
              {questionnaire.format.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

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
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={reading.section} aria-labelledby="source-title">
            <h2 id="source-title" className={reading.sectionTitle}>
              Source
            </h2>
            <p>
              <Citation reference={questionnaire.source} />
            </p>
          </section>

          <div className={styles.start}>
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
          </div>

          {concepts.length > 0 ? (
            <section className={reading.section} aria-labelledby="related-title">
              <h2 id="related-title" className={reading.sectionTitle}>
                Related Concepts
              </h2>
              <ul className={styles.list}>
                {concepts.map((concept) => (
                  <li key={concept.slug}>
                    <Link href={`/concepts/${concept.slug}`} transitionTypes={turnForward}>
                      <span lang="sa-Latn">{capitalise(concept.term.iast)}</span> ({concept.gloss})
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className={reading.provenance}>
            Described from the current site’s page{' '}
            <a href={questionnaire.provenance.url}>
              {questionnaire.provenance.url.replace('https://', '')}
            </a>
            , read on {questionnaire.provenance.retrieved}. Its questions are not shown here.
          </p>
        </Folio>
      </main>
    </PageTurn>
  )
}
