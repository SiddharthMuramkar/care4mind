import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'

import { titleMorphName } from '@/components/PageTurn'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { citationLinks, Provenance, Sections } from '@/components/prose'
import { ReferenceList } from '@/components/ReferenceList'
import { ScriptPair } from '@/components/script/ScriptPair'
import { ConceptSpread, inWords, VerseIndex } from '@/components/topics'
import { hrefFor, site, topics } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { toDevanagariDigits } from '@/lib/text'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export const generateStaticParams = () => site.params('/topics/[slug]/')

export async function generateMetadata({ params }: PageProps<'/topics/[slug]'>): Promise<Metadata> {
  return metadataFor(hrefFor({ kind: 'topic', id: (await params).slug }))
}

const plural = (count: number, one: string) => `${count} ${count === 1 ? one : `${one}s`}`

/**
 * A topic: its Concepts beside a contents plate, the introduction it shares where it has one and
 * the verses its Concepts quote, by work. It ships no JavaScript: CSS :has() lights the plate.
 */
export default async function TopicPage({ params }: PageProps<'/topics/[slug]'>) {
  const topic = await topics.get((await params).slug)
  if (!topic) notFound()
  const citations = topic.intro ? citationLinks(topic.intro.citations, topic.intro.references) : {}
  const { works } = topic
  const verseCount = works.reduce((sum, { verses }) => sum + verses.length, 0)

  return (
    <ReadingPage path={hrefFor({ kind: 'topic', id: topic.slug })} width="wide">
      <TitlePage>
        <p className={reading.kicker}>
          Topic{' '}
          <span className={styles.order} aria-hidden>
            {toDevanagariDigits(String(topic.order))}
          </span>
        </p>
        <ViewTransition name={titleMorphName('topic', topic.slug)} share="morph" default="none">
          <PageTitle long>{topic.name}</PageTitle>
        </ViewTransition>
        {topic.term ? (
          <p className={styles.term}>
            <ScriptPair
              iast={topic.term.iast}
              {...(topic.term.devanagari ? { devanagari: topic.term.devanagari } : {})}
            />
          </p>
        ) : null}
        <p className={styles.facts}>
          {plural(topic.conceptCount, 'Concept')}
          {topic.secondaryConcepts.length > 0
            ? ` · ${topic.secondaryConcepts.length} more also here`
            : null}{' '}
          · {plural(verseCount, 'verse')} quoted
          {works.length > 0 ? (
            <>
              , from{' '}
              {inWords(
                works.map((work) => (
                  <cite key={work.slug} lang={work.lang} className={styles.workName}>
                    {work.title}
                  </cite>
                )),
              )}
            </>
          ) : null}
        </p>
      </TitlePage>

      {topic.intro ? (
        <div className={styles.prose}>
          <Sections sections={topic.intro.sections} citations={citations} />
        </div>
      ) : null}

      <section className={reading.section} aria-labelledby="concepts-title">
        <h2 id="concepts-title" className={reading.sectionTitle}>
          Its Concepts
        </h2>
        <ConceptSpread concepts={topic.concepts} secondaryConcepts={topic.secondaryConcepts} />
      </section>

      {works.length > 0 ? (
        <section className={reading.section} aria-labelledby="verses-title">
          <h2 id="verses-title" className={reading.sectionTitle}>
            Verses its Concepts quote
          </h2>
          <VerseIndex works={works} />
        </section>
      ) : null}

      {topic.intro ? (
        <>
          <ReferenceList references={topic.intro.references} />
          <Provenance of={topic.intro} />
        </>
      ) : null}
    </ReadingPage>
  )
}
