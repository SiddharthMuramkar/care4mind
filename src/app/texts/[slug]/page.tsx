import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'
import { OrnamentRule } from '@/components/OrnamentRule'
import { PageTurn } from '@/components/PageTurn'
import { Provenance } from '@/components/prose'
import { ReadingThread } from '@/components/ReadingThread'
import { Passage, VerseRail, VerseTally, WorkTitle } from '@/components/texts'
import { hrefFor, works } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await works.list()).map(({ slug }) => ({ slug }))
}

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
    <PageTurn>
      <main id="main" className={cx(reading.page, styles.page)}>
        <ReadingThread />
        <Breadcrumbs path={path} />
        <Folio
          as="article"
          className={cx(reading.article, styles.article)}
          aria-labelledby="work-title"
        >
          <header className={reading.titlePage}>
            <p className={reading.kicker}>Traditional text</p>
            <h1 id="work-title" className={cx(reading.title, styles.title)}>
              <WorkTitle
                work={work}
                className={styles.titlePair}
                devanagariClassName={styles.titleDeva}
              />
            </h1>
            {work.english ? <p className={reading.gloss}>{work.english}</p> : null}
            {work.attribution ? <p className={styles.attribution}>{work.attribution}</p> : null}
            <p className={styles.count}>
              <VerseTally locators={work.passages.map(({ locator }) => locator)} ink />
              <span>
                {work.passageCount} {work.passageCount === 1 ? 'verse' : 'verses'} quoted
              </span>
            </p>
          </header>

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
        </Folio>
      </main>
    </PageTurn>
  )
}
