import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import { Contents } from '@/components/concept/Contents'
import { BookGroup } from '@/components/library/Books'
import { counted, holdingsOf } from '@/components/library/catalogue'
import { CourseGroup } from '@/components/library/Courses'
import styles from '@/components/library/library.module.css'
import { OrnamentRule } from '@/components/ornaments/OrnamentRule'
import { Provenance, Sections, Text } from '@/components/prose'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { library, site, type PageView, type ResourceListView } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import reading from '../../reading.module.css'

export const dynamicParams = false

export const generateStaticParams = () => site.params('/library/[slug]/')

export async function generateMetadata({
  params,
}: PageProps<'/library/[slug]'>): Promise<Metadata> {
  const page = await library.get((await params).slug)
  if (!page) notFound()
  return metadataFor(page.href)
}

/** A reading list: its books on their shelves, or its courses as cards, group by group. */
function ReadingList({ list }: { list: ResourceListView }) {
  // One group's heading would only repeat the page's title.
  const headed = list.groups.length > 1
  return list.groups.map((group) =>
    group.items.every((item) => item.type === 'course') ? (
      <CourseGroup key={group.id} group={group} headed={headed} />
    ) : (
      <BookGroup key={group.id} group={group} headed={headed} />
    ),
  )
}

/** A page of text, such as Therapy approaches: its contents beside its sections, tables in their frames. */
function TextPage({ page }: { page: PageView }) {
  return (
    <div
      className={styles.body}
      // The sections' view timelines, for the contents to follow (see Contents).
      style={
        {
          timelineScope: page.toc.map(({ id }) => `--section-${id}`).join(', '),
        } as CSSProperties
      }
    >
      <Contents
        entries={page.toc.map(({ id, heading, terms }) => ({
          id,
          heading,
          terms: terms.map((term) => ({ id: term.id, name: term.name })),
        }))}
      />
      <div className={styles.text}>
        <Sections sections={page.sections} />
      </div>
    </div>
  )
}

/**
 * A Library page: a reading list, its groups anchored where links lead
 * (`/library/textbooks/#positive-psychology`), or a page of text such as Therapy approaches.
 */
export default async function LibraryItemPage({ params }: PageProps<'/library/[slug]'>) {
  const page = await library.get((await params).slug)
  if (!page) notFound()
  const { count, unit } = holdingsOf(page)

  return (
    <ReadingPage path={page.href} className={cx(styles.page, page.kind === 'page' && styles.wide)}>
      <TitlePage>
        <p className={reading.kicker}>Library</p>
        <PageTitle>{page.title}</PageTitle>
        {page.kind === 'page' ? (
          <p className={reading.summary}>
            <Text text={page.summary} />
          </p>
        ) : (
          <p className={styles.facts}>
            {`${count} ${unit}`}
            {page.groups.length > 1
              ? unit.startsWith('book')
                ? ` on ${counted(page.groups.length, 'shelf', 'shelves')}`
                : ` in ${counted(page.groups.length, 'group', 'groups')}`
              : null}
          </p>
        )}
      </TitlePage>

      {page.kind === 'page' ? <TextPage page={page} /> : <ReadingList list={page} />}

      <OrnamentRule className={styles.rule} />
      <Provenance of={page} />
    </ReadingPage>
  )
}
