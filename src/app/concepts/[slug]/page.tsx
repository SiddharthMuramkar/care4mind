import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import { artFor } from '@/art'
import { HeadPicture } from '@/components/art'
import { AtAGlance, Contents, type ContentsEntry } from '@/components/concept'
import { LinkedKnowledge } from '@/components/concept'
import { TitleSpellings } from '@/components/concept'
import { TopicPager } from '@/components/concept'
import { citationLinks, Provenance, Sections, Text } from '@/components/prose'
import { TitleMorph } from '@/components/PageTurn'
import { ReadingPage } from '@/components/ReadingPage'
import { VerseCard } from '@/components/prose'
import { ReadingThread } from '@/components/ReadingThread'
import { ReferenceList } from '@/components/ReferenceList'
import { TopicChip } from '@/components/TopicChip'
import {
  concepts,
  hrefFor,
  site,
  type BlockView,
  type ConceptView,
  type VerseView,
} from '@/content'
import { capitalise, readingTimeWords } from '@/lib/text'
import { metadataFor } from '@/lib/metadata'

import reading from '@/styles/reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

const PATTERN = '/concepts/[slug]/' as const

export const generateStaticParams = () => site.params(PATTERN)

export async function generateMetadata({
  params,
}: PageProps<'/concepts/[slug]'>): Promise<Metadata> {
  return metadataFor(PATTERN.replace('[slug]', (await params).slug))
}

/** Every verse the page sets, below its sections and inside them, by passage. */
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

/**
 * The page's contents: its lead, its sections, the traditional texts, then Linked knowledge
 * and the References.
 */
function contentsOf(concept: ConceptView): ContentsEntry[] {
  return [
    { id: 'in-short', heading: 'In short' },
    ...(concept.glance.length > 0 ? [{ id: 'at-a-glance', heading: 'At a glance' }] : []),
    ...concept.toc.map(({ id, heading, role, terms }) => ({
      id,
      heading,
      ...(role ? { role } : {}),
      terms: terms.map((term) => ({ id: term.id, name: term.name })),
    })),
    ...(concept.verses.length > 0
      ? [{ id: 'from-the-traditional-texts', heading: 'From the traditional texts' }]
      : []),
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

  return (
    <ReadingPage
      path={hrefFor({ kind: 'concept', id: concept.slug })}
      titleId="concept-title"
      width="contents"
      pageClassName={styles.page}
      articleClassName={styles.article}
      beforeTrail={<ReadingThread />}
      beforeTitle={
        <HeadPicture
          art={artFor({ kind: 'concept', slug: concept.slug, topic: concept.topic.slug })}
          size={120}
          phoneSize={88}
          className={reading.headPicture}
        />
      }
      title={
        // A Concept card's title flies into the heading's IAST spelling, or its English title.
        concept.term?.devanagari ? (
          <TitleSpellings
            iast={capitalise(concept.term.iast)}
            devanagari={concept.term.devanagari}
            slug={concept.slug}
          />
        ) : (
          <TitleMorph kind="concept" slug={concept.slug}>
            <span {...(concept.term ? { lang: 'sa-Latn' } : {})}>
              {concept.term ? capitalise(concept.term.iast) : concept.name}
            </span>
          </TitleMorph>
        )
      }
      afterTitle={
        <>
          {concept.gloss ? <p className={styles.gloss}>{concept.gloss}</p> : null}
          <p className={styles.meta}>
            {[concept.topic, ...concept.secondaryTopics].map((topic) => (
              <TopicChip key={topic.slug} topic={topic} />
            ))}
            <span>{readingTimeWords(concept.readingMinutes)}</span>
          </p>
          {concept.term && concept.spellings.length > 0 ? (
            <p className={styles.alsoWritten}>
              Also written: <span lang="sa-Latn">{concept.spellings.join(', ')}</span>
            </p>
          ) : null}
        </>
      }
    >
      <div
        className={styles.scope}
        // The sections' view timelines, for the contents to follow (see Contents).
        style={
          {
            timelineScope: contents.map(({ id }) => `--section-${id}`).join(', '),
          } as CSSProperties
        }
      >
        <section
          id="in-short"
          className={styles.lead}
          aria-labelledby="in-short-title"
          style={{ '--timeline': '--section-in-short' } as CSSProperties}
        >
          <h2 id="in-short-title" className={reading.sectionTitle}>
            In short
          </h2>
          <p className={reading.summary}>
            <Text text={concept.summary} citations={citations} />
          </p>
          {concept.whyItMatters ? (
            <p className={styles.why}>
              <span className={styles.whyLabel}>Why it matters</span>{' '}
              <Text text={concept.whyItMatters} citations={citations} />
            </p>
          ) : null}
        </section>

        <AtAGlance terms={concept.glance} />

        <div className={styles.body}>
          <Contents entries={contents} />

          <div className={styles.text}>
            <Sections sections={concept.sections} citations={citations} />

            {concept.verses.length > 0 ? (
              <section
                id="from-the-traditional-texts"
                className={styles.lead}
                aria-labelledby="from-the-traditional-texts-title"
                style={{ '--timeline': '--section-from-the-traditional-texts' } as CSSProperties}
              >
                <h2 id="from-the-traditional-texts-title" className={reading.sectionTitle}>
                  From the traditional texts
                </h2>
                <div className={styles.verses}>
                  {concept.verses.map((verse) => (
                    <VerseCard key={verse.passage} verse={verse} foldOriginal />
                  ))}
                </div>
              </section>
            ) : null}

            <LinkedKnowledge concept={concept} verses={versesOf(concept)} />

            <ReferenceList references={concept.references} />

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

            <TopicPager
              topic={concept.topic}
              {...(previous ? { previous } : {})}
              {...(next ? { next } : {})}
            />

            <Provenance of={concept} />
          </div>
        </div>
      </div>
    </ReadingPage>
  )
}
