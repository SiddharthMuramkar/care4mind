import type { Metadata } from 'next'
import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { hrefFor, library, references } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { count } from '@/lib/text'

import listing from '../listing.module.css'
import reading from '../reading.module.css'

const PATH = hrefFor({ page: 'library' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * The Library (D13): every Reference the site cites, its reading lists and its pages.
 */
export default async function LibraryPage() {
  const [pages, all] = await Promise.all([library.list(), references.list()])
  // What each holds: a reading list its entries, a page its sections.
  const holds = await Promise.all(
    pages.map(async (page) => {
      if (page.kind === 'resource-list') return count(page.itemCount, 'entry', 'entries')
      const view = await library.get(page.slug)
      return view?.kind === 'page' ? count(view.sections.length, 'section', 'sections') : ''
    }),
  )
  const shelf = [
    {
      key: 'references',
      title: 'References',
      href: hrefFor({ page: 'references' }),
      holds: count(all.length, 'Reference', 'References'),
    },
    ...pages.map((page, index) => ({
      key: page.slug,
      title: page.title,
      href: hrefFor({ kind: page.kind, id: page.slug }),
      holds: holds[index],
    })),
  ]

  return (
    <ReadingPage path={PATH}>
      <TitlePage>
        <PageTitle>Library</PageTitle>
        <p className={reading.summary}>
          Every source the site cites, its reading lists, and the methods it describes.
        </p>
      </TitlePage>

      <ul className={listing.contents}>
        {shelf.map((item) => (
          <li key={item.key}>
            <Link href={item.href} transitionTypes={turnForward}>
              {item.title}
            </Link>
            <span className={listing.leader} aria-hidden />
            <span className={listing.count}>{item.holds}</span>
          </li>
        ))}
      </ul>
    </ReadingPage>
  )
}
