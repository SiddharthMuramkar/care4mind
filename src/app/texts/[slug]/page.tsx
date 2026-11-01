import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import { Fleuron } from '@/components/Fleuron'
import { OrnamentRule } from '@/components/OrnamentRule'
import { Provenance } from '@/components/prose'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { ReadingThread } from '@/components/ReadingThread'
import { Passage, VerseRail, VerseTally, WorkTitle } from '@/components/texts'
import { hrefFor, site, works } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export const generateStaticParams = () => site.params('/texts/[slug]/')

export async function generateMetadata({ params }: PageProps<'/texts/[slug]'>): Promise<Metadata> {
  return metadataFor(hrefFor({ kind: 'work', id: (await params).slug }))
}

/**
 * A traditional text, set like a manuscript: every verse the site quotes from it, in the
 * work's own order, each at its own address (`#1-30`), with a rail of verse numbers beside it.
 * Only the verses and their translations: no commentary. No JavaScript of its own.
 */
export default async function WorkPage({ params }: PageProps<'/texts/[slug]'>) {
  const work = await works.get((await params).slug)
  if (!work) notFound()
  const path = hrefFor({ kind: 'work', id: work.slug })

  return (
    <ReadingPage
      path={path}
      className={styles.page}
      articleClassName={styles.article}
      lead={<ReadingThread />}
    >
      <TitlePage>
        <p className={reading.kicker}>Traditional text</p>
        <PageTitle className={styles.title}>
          <WorkTitle
            work={work}
            className={styles.titlePair}
            devanagariClassName={styles.titleDeva}
          />
        </PageTitle>
        {work.english ? <p className={reading.gloss}>{work.english}</p> : null}
        {work.attribution ? <p className={styles.attribution}>{work.attribution}</p> : null}
        <p className={styles.count}>
          <VerseTally locators={work.passages.map(({ locator }) => locator)} ink />
          <span>
            {work.passageCount} {work.passageCount === 1 ? 'verse' : 'verses'} quoted
          </span>
        </p>
      </TitlePage>

      <OrnamentRule className={styles.rule} />

      <div
        className={styles.body}
        // The verses' view timelines, for the rail to follow (see VerseRail).
        style={
          {
            timelineScope: work.passages.map(({ anchor }) => `--verse-${anchor}`).join(', '),
          } as CSSProperties
        }
      >
        <VerseRail passages={work.passages} />

        <div className={styles.verses}>
          {work.passages.map((passage) => (
            <Passage key={passage.id} passage={passage} unit={work.locatorLabel} />
          ))}
          <Fleuron className={styles.tailpiece} />
          <Provenance of={work} />
        </div>
      </div>
    </ReadingPage>
  )
}
