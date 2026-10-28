import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { citationLinks, Provenance, Sections, Text } from '@/components/prose'
import { ReferenceList } from '@/components/ReferenceList'
import { hrefFor, topics, type ConceptCard, type PassageView, type WorkRef } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import listing from '../../listing.module.css'
import reading from '../../reading.module.css'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await topics.list()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/topics/[slug]'>): Promise<Metadata> {
  return metadataFor(hrefFor({ kind: 'topic', id: (await params).slug }))
}

/** A Concept in the topic: its name, which flies into its page's heading, and its summary. */
function ConceptEntry({ concept }: { concept: ConceptCard }) {
  return (
    <li className={listing.entry}>
      <p className={listing.entryName}>
        <Link href={hrefFor({ kind: 'concept', id: concept.slug })} transitionTypes={turnForward}>
          <ViewTransition name={`concept-title-${concept.slug}`} share="morph" default="none">
            <span lang={concept.lang}>{concept.name}</span>
          </ViewTransition>
        </Link>
        {concept.term?.devanagari ? <span lang="sa-Deva">{concept.term.devanagari}</span> : null}
      </p>
      {concept.term && concept.english ? <p className={listing.meta}>{concept.english}</p> : null}
      <p>
        <Text text={concept.summary} />
      </p>
    </li>
  )
}

/** The verses, by the work they come from, in each work's order. */
function byWork(verses: readonly PassageView[]) {
  const works = new Map<string, { work: WorkRef; verses: PassageView[] }>()
  for (const verse of verses) {
    const entry = works.get(verse.work.slug) ?? { work: verse.work, verses: [] }
    entry.verses.push(verse)
    works.set(verse.work.slug, entry)
  }
  return [...works.values()]
}

/**
 * A topic (D03): its Concepts, the introduction it shares where it has one (the values topic's
 * yama–niyama text), and the verses its Concepts quote. Front-end-site ticket 06 builds its
 * rosette here.
 */
export default async function TopicPage({ params }: PageProps<'/topics/[slug]'>) {
  const topic = await topics.get((await params).slug)
  if (!topic) notFound()
  const citations = topic.intro ? citationLinks(topic.intro.citations, topic.intro.references) : {}
  const works = byWork(topic.verses)

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={hrefFor({ kind: 'topic', id: topic.slug })} />
        <Folio as="article" className={reading.article} aria-labelledby="topic-title">
          <header className={reading.titlePage}>
            <p className={reading.kicker}>Topic</p>
            <h1 id="topic-title" className={cx(reading.title, reading.titleLong)}>
              {topic.name}
            </h1>
            {topic.term ? (
              <p className={reading.gloss}>
                <span lang="sa-Latn">{topic.term.iast}</span>
                {topic.term.devanagari ? (
                  <>
                    {' '}
                    <span lang="sa-Deva">{topic.term.devanagari}</span>
                  </>
                ) : null}
              </p>
            ) : null}
            <p className={listing.facts}>
              {topic.conceptCount} {topic.conceptCount === 1 ? 'Concept' : 'Concepts'} ·{' '}
              {topic.verses.length} {topic.verses.length === 1 ? 'verse' : 'verses'} quoted
            </p>
          </header>

          {topic.intro ? <Sections sections={topic.intro.sections} citations={citations} /> : null}

          <section className={reading.section} aria-labelledby="concepts-title">
            <h2 id="concepts-title" className={reading.sectionTitle}>
              Its Concepts
            </h2>
            <ul className={listing.entries}>
              {topic.concepts.map((concept) => (
                <ConceptEntry key={concept.slug} concept={concept} />
              ))}
            </ul>
          </section>

          {topic.secondaryConcepts.length > 0 ? (
            <section className={reading.section} aria-labelledby="also-title">
              <h2 id="also-title" className={reading.sectionTitle}>
                Also in this topic
              </h2>
              <ul className={listing.entries}>
                {topic.secondaryConcepts.map((concept) => (
                  <ConceptEntry key={concept.slug} concept={concept} />
                ))}
              </ul>
            </section>
          ) : null}

          {works.length > 0 ? (
            <section className={reading.section} aria-labelledby="verses-title">
              <h2 id="verses-title" className={reading.sectionTitle}>
                Verses its Concepts quote
              </h2>
              <ul className={listing.entries}>
                {works.map(({ work, verses }) => (
                  <li key={work.slug} className={listing.entry}>
                    <p className={listing.entryName}>
                      <Link
                        href={hrefFor({ kind: 'work', id: work.slug })}
                        transitionTypes={turnForward}
                      >
                        <span lang={work.lang}>{work.title}</span>
                      </Link>
                    </p>
                    <ul className={listing.inline}>
                      {verses.map((verse) => (
                        <li key={verse.id}>
                          <Link
                            href={hrefFor({ kind: 'passage', id: verse.id })}
                            transitionTypes={turnForward}
                          >
                            {verse.locator}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {topic.intro ? (
            <>
              <ReferenceList references={topic.intro.references} />
              <Provenance of={topic.intro} />
            </>
          ) : null}
        </Folio>
      </main>
    </PageTurn>
  )
}
