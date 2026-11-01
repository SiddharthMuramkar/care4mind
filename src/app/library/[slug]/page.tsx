import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Citation } from '@/components/Citation'
import { Folio } from '@/components/Folio'
import { PageTurn } from '@/components/PageTurn'
import { Provenance, Sections, Text } from '@/components/prose'
import { library, site, type ResourceItemView } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../../listing.module.css'
import reading from '../../reading.module.css'

export const dynamicParams = false

const PATTERN = '/library/[slug]/' as const

export const generateStaticParams = () => site.params(PATTERN)

export async function generateMetadata({
  params,
}: PageProps<'/library/[slug]'>): Promise<Metadata> {
  return metadataFor(PATTERN.replace('[slug]', (await params).slug))
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
    <PageTurn>
      <main id="main" className={reading.page}>
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
              <p className={listing.facts}>
                {page.groups.reduce((sum, group) => sum + group.items.length, 0)} entries
              </p>
            )}
          </header>

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
        </Folio>
      </main>
    </PageTurn>
  )
}
