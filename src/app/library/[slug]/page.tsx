import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import { SectionSticker } from '@/components/art'
import { Contents } from '@/components/concept'
import { BookGroup, CourseGroup, holdingsOf, libraryStyles as styles } from '@/components/library'
import { OrnamentRule } from '@/components/OrnamentRule'
import { turnForward } from '@/components/PageTurn'
import { Provenance, Sections, Text } from '@/components/prose'
import { ReadingPage } from '@/components/ReadingPage'
import { hrefFor, library, site, type PageView, type ResourceListView } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { count } from '@/lib/text'

import reading from '@/styles/reading.module.css'

export const dynamicParams = false

const PATTERN = '/library/[slug]/' as const

export const generateStaticParams = () => site.params(PATTERN)

export async function generateMetadata({
  params,
}: PageProps<'/library/[slug]'>): Promise<Metadata> {
  return metadataFor(PATTERN.replace('[slug]', (await params).slug))
}

/** The two book lists, as the review names them: Inspirational and Academic. */
const BOOK_LISTS = [
  { slug: 'inspirational-books', label: 'Inspirational' },
  { slug: 'textbooks', label: 'Academic' },
] as const

/** The Library's pages, each of which names its Sticker by its slug. */
const LIBRARY_SECTIONS = ['textbooks', 'inspirational-books', 'courses', 'methods'] as const

function sectionOf(slug: string) {
  const section = LIBRARY_SECTIONS.find((key) => key === slug)
  if (!section) throw new Error(`The Library's page ${slug} has no Sticker.`)
  return section
}

/** A reading list: its books on their shelves, or its courses as cards, group by group. */
function ReadingList({ list }: { list: ResourceListView }) {
  // One group's heading would only repeat the page's title.
  const headed = list.groups.length > 1
  const isBookList = BOOK_LISTS.some(({ slug }) => slug === list.slug)
  return (
    <>
      {isBookList ? (
        <nav aria-label="Book lists" className={styles.kinds}>
          {BOOK_LISTS.map(({ slug, label }) => (
            <Link
              key={slug}
              href={hrefFor({ kind: 'resource-list', id: slug })}
              transitionTypes={[...turnForward]}
              aria-current={slug === list.slug ? 'page' : undefined}
              className={slug === list.slug ? styles.kindCurrent : styles.kind}
              data-ink
            >
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
      {list.groups.map((group) =>
        group.items.every((item) => item.type === 'course') ? (
          <CourseGroup key={group.id} group={group} headed={headed} />
        ) : (
          <BookGroup key={group.id} group={group} headed={headed} />
        ),
      )}
    </>
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
        tallLines
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
  const { count: tally, unit } = holdingsOf(page)

  return (
    <ReadingPage
      path={page.href}
      titleId="page-title"
      width={page.kind === 'page' ? 'libraryContents' : 'library'}
      beforeTitle={<SectionSticker section={sectionOf(page.slug)} />}
      kicker="Library"
      title={page.title}
      afterTitle={
        page.kind === 'page' ? (
          <p className={reading.summary}>
            <Text text={page.summary} />
          </p>
        ) : (
          <>
            <p className={reading.summary}>
              <Text text={page.summary} />
            </p>
            <p className={styles.facts}>
              {`${tally} ${unit}`}
              {page.groups.length > 1
                ? unit.startsWith('book')
                  ? ` on ${count(page.groups.length, 'shelf', 'shelves')}`
                  : ` in ${count(page.groups.length, 'group', 'groups')}`
                : null}
            </p>
          </>
        )
      }
    >
      {page.kind === 'page' ? <TextPage page={page} /> : <ReadingList list={page} />}

      <OrnamentRule className={styles.rule} />
      <Provenance of={page} />
    </ReadingPage>
  )
}
