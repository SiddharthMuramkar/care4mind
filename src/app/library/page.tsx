import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { Folio } from '@/components/folio'
import { PageTurn, turnForward } from '@/components/page-turn'
import { hrefFor, library, references } from '@/content'
import { metadataFor } from '@/lib/metadata'

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
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
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
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="library-title">
          <header className={reading.titlePage}>
            <h1 id="library-title" className={reading.title}>
              Library
            </h1>
            <p className={reading.summary}>
              Every source the site cites, its reading lists, and the methods it describes.
            </p>
          </header>

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
        </Folio>
      </main>
    </PageTurn>
  )
}
