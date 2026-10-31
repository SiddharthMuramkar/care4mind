import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ViewTransition, type CSSProperties } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Contents, type ContentsEntry } from '@/components/concept/Contents'
import { LinkedKnowledge } from '@/components/concept/LinkedKnowledge'
import { TitleSpellings } from '@/components/concept/TitleSpellings'
import { TopicPager } from '@/components/concept/TopicPager'
import { Folio } from '@/components/Folio'
import { OrnamentRule } from '@/components/OrnamentRule'
import { PageTurn } from '@/components/PageTurn'
import { citationLinks, Provenance, Sections, Text } from '@/components/prose'
import { VerseCard } from '@/components/prose/VerseCard'
import { ReadingThread } from '@/components/ReadingThread'
import { ReferenceList } from '@/components/ReferenceList'
import { ScriptChoice, ScriptSwitch } from '@/components/ScriptChoice'
import { SpellingsPopover } from '@/components/SpellingsPopover'
import {
  concepts,
  hrefFor,
  site,
  type BlockView,
  type ConceptView,
  type VerseView,
} from '@/content'
import { capitalise } from '@/lib/text'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export const generateStaticParams = () => site.params('/concepts/[slug]/')

export async function generateMetadata({
  params,
}: PageProps<'/concepts/[slug]'>): Promise<Metadata> {
  return metadataFor(hrefFor({ kind: 'concept', id: (await params).slug }))
}

/** Every verse the page sets, at its head and inside its sections, by passage. */
function versesOf(concept: ConceptView): Map<string, VerseView> {
  const verses = new Map(concept.verses.map((verse) => [verse.passage, verse]))
  const walk = (blocks: readonly BlockView[]) => {
    for (const block of blocks) {
      if (block.kind === 'verse') verses.set(block.verse.passage, block.verse)
      else if (block.kind === 'term') walk(block.blocks)
      else if (block.kind === 'topic-intro') block.sections.forEach((s) => walk(s.blocks))
    }
  }
  concept.sections.forEach((section) => walk(section.blocks))
  return verses
}

/** The page's contents: its sections, then Linked knowledge and the References. */
function contentsOf(concept: ConceptView): ContentsEntry[] {
  return [
    ...concept.toc.map(({ id, heading, role, terms }) => ({
      id,
      heading,
      ...(role ? { role } : {}),
      terms: terms.map((term) => ({ id: term.id, name: term.name })),
    })),
    { id: 'linked-knowledge', heading: 'Linked knowledge' },
    ...(concept.references.length > 0 ? [{ id: 'references', heading: 'References' }] : []),
  ]
}

export default async function ConceptPage({ params }: PageProps<'/concepts/[slug]'>) {
  const concept = await concepts.get((await params).slug)
  if (!concept) notFound()

  const citations = citationLinks(concept.citations, concept.references)
  const { previous, next } = concept
  const contents = contentsOf(concept)
  // A Concept card's title flies into the heading's IAST spelling, or its English title.
  const morph = `concept-title-${concept.slug}`

  return (
    <PageTurn>
      <main id="main" className={cx(reading.page, styles.page)}>
        <ReadingThread />
        <Breadcrumbs path={hrefFor({ kind: 'concept', id: concept.slug })} />
        <Folio
          as="article"
          className={cx(reading.article, styles.article)}
          aria-labelledby="concept-title"
        >
          <ScriptChoice>
            <header className={reading.titlePage}>
              <p className={reading.kicker}>Concept</p>
              <h1
                id="concept-title"
                className={concept.term ? reading.title : cx(reading.title, reading.titleLong)}
              >
                {concept.term?.devanagari ? (
                  <TitleSpellings
                    iast={capitalise(concept.term.iast)}
                    devanagari={concept.term.devanagari}
                    name={morph}
                  />
                ) : (
                  <ViewTransition name={morph} share="morph" default="none">
                    <span {...(concept.term ? { lang: 'sa-Latn' } : {})}>
                      {concept.term ? capitalise(concept.term.iast) : concept.name}
                    </span>
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

          {/* The verses it opens with stand across the page, like an epigraph. */}
          {concept.verses.length > 0 ? (
            <div className={styles.epigraph}>
              {concept.verses.map((verse) => (
                <VerseCard key={verse.passage} verse={verse} />
              ))}
            </div>
          ) : null}

          <OrnamentRule className={styles.rule} />

          <div
            className={styles.body}
            // The sections' view timelines, for the contents to follow (see Contents).
            style={
              {
                timelineScope: contents.map(({ id }) => `--section-${id}`).join(', '),
              } as CSSProperties
            }
          >
            <Contents entries={contents} />

            <div className={styles.text}>
              <Sections sections={concept.sections} citations={citations} />

              <LinkedKnowledge concept={concept} verses={versesOf(concept)} />

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

              <TopicPager
                topic={concept.topic}
                {...(previous ? { previous } : {})}
                {...(next ? { next } : {})}
              />

              <Provenance of={concept} />
            </div>
          </div>
        </Folio>
      </main>
    </PageTurn>
  )
}
