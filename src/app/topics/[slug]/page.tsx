import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Numeral } from '@/components/Numeral'
import { ReadingPage } from '@/components/ReadingPage'
import { citationLinks, Provenance, Sections } from '@/components/prose'
import { ReferenceList } from '@/components/ReferenceList'
import { ScriptPair } from '@/components/script'
import { ConceptSpread, inWords, VerseIndex } from '@/components/topics'
import { hrefFor, site, topics } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { count } from '@/lib/text'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

const PATTERN = '/topics/[slug]/' as const

export const generateStaticParams = () => site.params(PATTERN)

export async function generateMetadata({ params }: PageProps<'/topics/[slug]'>): Promise<Metadata> {
  return metadataFor(PATTERN.replace('[slug]', (await params).slug))
}

/**
 * A topic: its Concepts as cards beside a contents plate, set like a book's, whose rows
 * light as their cards are pointed at; the introduction it shares where it has one (the values
 * topic's yama–niyama text, stored once); and the verses its Concepts quote. No JavaScript.
 */
export default async function TopicPage({ params }: PageProps<'/topics/[slug]'>) {
  const topic = await topics.get((await params).slug)
  if (!topic) notFound()
  const citations = topic.intro ? citationLinks(topic.intro.citations, topic.intro.references) : {}
  const { works } = topic
  const verseCount = works.reduce((count, work) => count + work.verses.length, 0)

  return (
    <ReadingPage
      path={hrefFor({ kind: 'topic', id: topic.slug })}
      titleId="topic-title"
      width="plate"
      kicker={
        <>
          Topic {topic.order}
          <Numeral value={topic.order} className={styles.order} decorative />
        </>
      }
      title={topic.name}
      longTitle
      titleMorph={{ kind: 'topic', slug: topic.slug }}
      afterTitle={
        <>
          {topic.term ? (
            <p className={styles.term}>
              <ScriptPair
                iast={topic.term.iast}
                {...(topic.term.devanagari ? { devanagari: topic.term.devanagari } : {})}
              />
            </p>
          ) : null}
          <p className={styles.facts}>
            {count(topic.conceptCount, 'Concept', 'Concepts')}
            {topic.secondaryConcepts.length > 0
              ? ` · ${topic.secondaryConcepts.length} more also here`
              : null}{' '}
            · {count(verseCount, 'verse', 'verses')} quoted
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
        </>
      }
    >
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
