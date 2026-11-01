import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Citation } from '@/components/Citation'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { Provenance, Sections, Text } from '@/components/prose'
import { library, type ResourceItemView } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { count } from '@/lib/text'

import listing from '../../listing.module.css'
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

/** One entry on a reading list: a book, cited in full with its note, or a course. */
function Item({ item }: { item: ResourceItemView }) {
  if (item.type === 'reference')
    return (
      <li className={listing.entry}>
        <p>
          <Citation reference={item.reference} />
        </p>
        {item.annotation ? (
          <p className={listing.note}>
            <Text text={item.annotation} />
          </p>
        ) : null}
      </li>
    )
  return (
    <li className={listing.entry}>
      <p className={listing.entryName}>{item.name}</p>
      <p className={listing.meta}>{item.provider}</p>
      {item.description ? (
        <p>
          <Text text={item.description} />
        </p>
      ) : null}
      {item.url ? (
        <p>
          <a href={item.url}>{new URL(item.url).hostname.replace(/^www\./, '')}</a>, another site
        </p>
      ) : null}
    </li>
  )
}

/**
 * A Library page (D13): a reading list, its groups anchored where links lead
 * (`/library/textbooks/#positive-psychology`), or a page of text such as Methods.
 */
export default async function LibraryItemPage({ params }: PageProps<'/library/[slug]'>) {
  const page = await library.get((await params).slug)
  if (!page) notFound()

  return (
    <ReadingPage path={page.href}>
      <TitlePage>
        <p className={reading.kicker}>Library</p>
        <PageTitle>{page.title}</PageTitle>
        {page.kind === 'page' ? (
          <p className={reading.summary}>
            <Text text={page.summary} />
          </p>
        ) : (
          <p className={listing.facts}>
            {count(
              page.groups.reduce((sum, group) => sum + group.items.length, 0),
              'entry',
              'entries',
            )}
          </p>
        )}
      </TitlePage>

      {page.kind === 'page' ? (
        <Sections sections={page.sections} />
      ) : (
        page.groups.map((group) => (
          <section key={group.id} id={group.id} className={reading.section}>
            <h2 className={reading.sectionTitle}>{group.heading}</h2>
            <ul className={listing.entries}>
              {group.items.map((item, index) => (
                <Item key={index} item={item} />
              ))}
            </ul>
          </section>
        ))
      )}

      <Provenance of={page} />
    </ReadingPage>
  )
}
