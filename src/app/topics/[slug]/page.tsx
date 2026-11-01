import type { Metadata, Route } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment, ViewTransition, type ReactNode } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ConceptCard } from '@/components/ConceptCard'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { citationLinks, Provenance, Sections } from '@/components/prose'
import { ReferenceList } from '@/components/ReferenceList'
import { ScriptPair } from '@/components/script/ScriptPair'
import { ContentsPlate, plateCard, plateScope, type PlateRow } from '@/components/topics'
import {
  hrefFor,
  site,
  topics,
  type ConceptCard as Concept,
  type PassageView,
  type WorkRef,
} from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'
import { openingLine } from '@/lib/sanskrit'
import { toDevanagariDigits } from '@/lib/text'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

const PATTERN = '/topics/[slug]/' as const

export const generateStaticParams = () => site.params(PATTERN)

export async function generateMetadata({ params }: PageProps<'/topics/[slug]'>): Promise<Metadata> {
  return metadataFor(PATTERN.replace('[slug]', (await params).slug))
}

/** A `lang` attribute only where there is one: an undefined prop still travels with the page. */
const langOf = (lang: string | undefined) => (lang ? { lang } : {})

const plural = (count: number, one: string) => `${count} ${count === 1 ? one : `${one}s`}`

/** Names in words: "A", "A and B", "A, B and C". */
function inWords(items: readonly ReactNode[]) {
  return items.map((item, index) => (
    <Fragment key={index}>
      {index === 0 ? null : index === items.length - 1 ? ' and ' : ', '}
      {item}
    </Fragment>
  ))
}

/** A Concept's row in the plate: its name, and its Devanagari where a book has its page number. */
const rowOf = (concept: Concept): PlateRow => ({
  key: concept.slug,
  href: hrefFor({ kind: 'concept', id: concept.slug }),
  name: <span {...langOf(concept.lang)}>{concept.name}</span>,
  ...(concept.term?.devanagari
    ? { trailing: concept.term.devanagari, trailingLang: 'sa-Deva' as const }
    : {}),
})

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

/** A verse's opening line, in Devanagari where there is some, else in transliteration. */
function Opening({ verse }: { verse: PassageView }) {
  const deva = openingLine(verse.devanagari)
  if (deva) return <span lang="sa-Deva">{deva}</span>
  const line = openingLine(verse.transliteration?.lines ?? [])
  return line ? <span lang={verse.work.lang}>{line}</span> : <>{verse.label}</>
}

/**
 * A topic (D03): its Concepts as cards beside a contents plate, set like a book's, whose rows
 * light as their cards are pointed at; the introduction it shares where it has one (the values
 * topic's yama–niyama text, stored once); and the verses its Concepts quote. No JavaScript.
 */
export default async function TopicPage({ params }: PageProps<'/topics/[slug]'>) {
  const topic = await topics.get((await params).slug)
  if (!topic) notFound()
  const citations = topic.intro ? citationLinks(topic.intro.citations, topic.intro.references) : {}
  const works = byWork(topic.verses)
  const all = [...topic.concepts, ...topic.secondaryConcepts]
  const card = (concept: Concept) => (
    <li key={concept.slug} {...plateCard(all.indexOf(concept) + 1)}>
      <ConceptCard
        concept={concept}
        className={styles.card}
        action={
          <Link
            href={hrefFor({ kind: 'concept', id: concept.slug })}
            transitionTypes={turnForward}
            data-ink
          >
            {/* One span: the action is a flex box, which would swallow the space. */}
            <span>
              Read about <span {...langOf(concept.lang)}>{concept.name}</span>
            </span>
          </Link>
        }
      />
    </li>
  )

  return (
    <PageTurn>
      <main id="main" className={cx(reading.page, styles.page)}>
        <Breadcrumbs path={hrefFor({ kind: 'topic', id: topic.slug })} />
        <Folio as="article" className={reading.article} aria-labelledby="topic-title">
          <header className={reading.titlePage}>
            <p className={reading.kicker}>
              Topic{' '}
              <span className={styles.order} aria-hidden>
                {toDevanagariDigits(String(topic.order))}
              </span>
            </p>
            <ViewTransition name={`topic-title-${topic.slug}`} share="morph" default="none">
              <h1 id="topic-title" className={cx(reading.title, reading.titleLong)}>
                {topic.name}
              </h1>
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
              · {plural(topic.verses.length, 'verse')} quoted
              {topic.works.length > 0 ? (
                <>
                  , from{' '}
                  {inWords(
                    topic.works.map((work) => (
                      <cite key={work.slug} lang={work.lang} className={styles.workName}>
                        {work.title}
                      </cite>
                    )),
                  )}
                </>
              ) : null}
            </p>
          </header>

          {topic.intro ? (
            <div className={styles.prose}>
              <Sections sections={topic.intro.sections} citations={citations} />
            </div>
          ) : null}

          <section className={reading.section} aria-labelledby="concepts-title">
            <h2 id="concepts-title" className={reading.sectionTitle}>
              Its Concepts
            </h2>
            <div className={cx(plateScope, styles.spread)}>
              <ContentsPlate
                label="Contents"
                className={styles.plate}
                groups={[
                  { rows: topic.concepts.map(rowOf) },
                  ...(topic.secondaryConcepts.length > 0
                    ? [{ title: 'Also in this topic', rows: topic.secondaryConcepts.map(rowOf) }]
                    : []),
                ]}
              />
              <div className={styles.cards}>
                <ul className={styles.cardList}>{topic.concepts.map(card)}</ul>
                {topic.secondaryConcepts.length > 0 ? (
                  <>
                    <h3 className={styles.also}>Also in this topic</h3>
                    <ul className={styles.cardList}>{topic.secondaryConcepts.map(card)}</ul>
                  </>
                ) : null}
              </div>
            </div>
          </section>

          {works.length > 0 ? (
            <section className={reading.section} aria-labelledby="verses-title">
              <h2 id="verses-title" className={reading.sectionTitle}>
                Verses its Concepts quote
              </h2>
              {works.map(({ work, verses }) => (
                <div key={work.slug} className={styles.work}>
                  <h3 className={styles.workTitle}>
                    <Link
                      href={hrefFor({ kind: 'work', id: work.slug })}
                      transitionTypes={turnForward}
                    >
                      <span lang={work.lang}>{work.title}</span>
                    </Link>
                  </h3>
                  <ol className={styles.verses}>
                    {verses.map((verse) => (
                      <li key={verse.id} className={styles.verseItem}>
                        {/* A passage's anchor on its work's page, made by hrefFor() in the content module. */}
                        <Link
                          href={verse.href as Route}
                          className={styles.verse}
                          transitionTypes={turnForward}
                        >
                          <span className={styles.opening}>
                            <Opening verse={verse} />
                          </span>
                          <span className={styles.verseLeader} aria-hidden />
                          <span className={styles.locator}>{verse.locator}</span>
                        </Link>
                        {verse.quotedIn.length > 0 ? (
                          <p className={styles.quotedIn}>
                            Quoted in{' '}
                            {inWords(
                              verse.quotedIn.map((record) => (
                                <span key={`${record.kind}:${record.id}`} {...langOf(record.lang)}>
                                  {record.title}
                                </span>
                              )),
                            )}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
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
