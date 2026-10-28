import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { OrnamentRule } from '@/components/OrnamentRule'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { citationLinks, Provenance, Sections, Text } from '@/components/prose'
import { statusOf } from '@/components/QuestionnaireCard'
import { ReadingThread } from '@/components/ReadingThread'
import { ReferenceList } from '@/components/ReferenceList'
import { ScriptChoice, ScriptSwitch, TermSpellings } from '@/components/ScriptChoice'
import { Shloka } from '@/components/Shloka'
import { SpellingsPopover } from '@/components/SpellingsPopover'
import { concepts, hrefFor } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await concepts.list()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/concepts/[slug]'>): Promise<Metadata> {
  return metadataFor(hrefFor({ kind: 'concept', id: (await params).slug }))
}

export default async function ConceptPage({ params }: PageProps<'/concepts/[slug]'>) {
  const concept = await concepts.get((await params).slug)
  if (!concept) notFound()

  const citations = citationLinks(concept.citations, concept.references)
  // A Concept card's title flies into the heading's IAST spelling, or its English title.
  const morph = `concept-title-${concept.slug}`

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <ReadingThread />
        <Breadcrumbs path={hrefFor({ kind: 'concept', id: concept.slug })} />
        <Folio as="article" className={reading.article} aria-labelledby="concept-title">
          <ScriptChoice>
            <header className={reading.titlePage}>
              <p className={reading.kicker}>Concept</p>
              <h1
                id="concept-title"
                className={concept.term ? reading.title : cx(reading.title, reading.titleLong)}
              >
                {concept.term ? (
                  <TermSpellings term={concept.term} capitalised name={morph} />
                ) : (
                  <ViewTransition name={morph} share="morph" default="none">
                    <span>{concept.name}</span>
                  </ViewTransition>
                )}
              </h1>
              {concept.term && concept.english ? (
                <p className={reading.gloss}>{concept.english}</p>
              ) : null}
              {concept.term ? (
                <div className={styles.spellingTools}>
                  <SpellingsPopover iast={concept.term.iast} spellings={concept.spellings} />
                  {concept.term.devanagari ? <ScriptSwitch /> : null}
                </div>
              ) : null}
              <p className={reading.summary}>
                <Text text={concept.summary} citations={citations} />
              </p>
            </header>
          </ScriptChoice>

          {concept.verses.map((verse) => (
            <Shloka key={verse.passage} verse={verse} className={styles.shloka} />
          ))}

          <OrnamentRule className={styles.rule} />

          <Sections sections={concept.sections} citations={citations} />

          {concept.linked.questionnaires.length > 0 ? (
            <section className={reading.section} aria-labelledby="related-title">
              <h2 id="related-title" className={reading.sectionTitle}>
                Related Questionnaires
              </h2>
              <ul className={styles.related}>
                {concept.linked.questionnaires.map(({ slug, title, status, summary }) => (
                  <li key={slug}>
                    <Link
                      href={hrefFor({ kind: 'questionnaire', id: slug, status })}
                      transitionTypes={turnForward}
                    >
                      {title}
                    </Link>
                    <span className={styles.relatedNote}>
                      {statusOf(status)}
                      {summary ? (
                        <>
                          {' · '}
                          <Text text={summary} />
                        </>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {concept.external.length > 0 ? (
            <p className={styles.external}>
              Read more on another site:{' '}
              {concept.external.map((link, index) => (
                <span key={link.url}>
                  {index > 0 ? ', ' : null}
                  <a href={link.url}>{link.label}</a>
                </span>
              ))}
              .
            </p>
          ) : null}

          <ReferenceList references={concept.references} />

          <Provenance of={concept} />
        </Folio>
      </main>
    </PageTurn>
  )
}
