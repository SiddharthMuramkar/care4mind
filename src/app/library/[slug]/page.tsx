import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Contents } from '@/components/concept/Contents'
import { Folio } from '@/components/Folio'
import { BookGroup } from '@/components/library/Books'
import { counted, holdingsOf } from '@/components/library/catalogue'
import { CourseGroup } from '@/components/library/Courses'
import styles from '@/components/library/library.module.css'
import { OrnamentRule } from '@/components/OrnamentRule'
import { PageTurn } from '@/components/PageTurn'
import { Provenance, Sections, Text } from '@/components/prose'
import { library, type PageView, type ResourceListView } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import reading from '../../reading.module.css'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await library.list()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/library/[slug]'>): Promise<Metadata> {
  const page = await library.get((await params).slug)
  if (!page) notFound()
  return metadataFor(page.href)
}

/** A reading list: its books on their shelves, or its courses as cards, group by group. */
function ReadingList({ list }: { list: ResourceListView }) {
  return list.groups.map((group) =>
    group.items.every((item) => item.type === 'course') ? (
      <CourseGroup key={group.id} group={group} />
    ) : (
      <BookGroup key={group.id} group={group} />
    ),
  )
}

/** A page of text, such as Methods: its contents beside its sections, tables in their frames. */
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
 * A Library page (D13): a reading list, its groups anchored where links lead
 * (`/library/textbooks/#positive-psychology`), or a page of text such as Methods.
 */
export default async function LibraryItemPage({ params }: PageProps<'/library/[slug]'>) {
  const page = await library.get((await params).slug)
  if (!page) notFound()
  const { count, unit } = holdingsOf(page)

  return (
    <PageTurn>
      <main
        id="main"
        className={cx(reading.page, styles.page, page.kind === 'page' && styles.wide)}
      >
        <Breadcrumbs path={page.href} />
        <Folio as="article" className={reading.article} aria-labelledby="page-title">
          <header className={reading.titlePage}>
            <p className={reading.kicker}>Library</p>
            <h1 id="page-title" className={reading.title}>
              {page.title}
            </h1>
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
          </header>

          {page.kind === 'page' ? <TextPage page={page} /> : <ReadingList list={page} />}

          <OrnamentRule className={styles.rule} />
          <Provenance of={page} />
        </Folio>
      </main>
    </PageTurn>
  )
}
