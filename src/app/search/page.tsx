import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn } from '@/components/PageTurn'
import { RefineSearch } from '@/components/search/RefineSearch'
import { hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { search } from '@/lib/search/server'

import reading from '../reading.module.css'

const PATH = hrefFor({ page: 'search' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * Search (FR-04): rendered on the server for each query with the same engine as the palette,
 * so `/search/?q=` works without JavaScript. With it, the results follow as you type.
 */
export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ''
  const hits = query === '' ? [] : await search(query)

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="search-title">
          <header className={reading.titlePage}>
            <h1 id="search-title" className={reading.title}>
              Search
            </h1>
          </header>
          {/* A new query from the server (a suggestion, Back) starts the island afresh. */}
          <RefineSearch key={query} query={query} hits={hits} searchPath={PATH} />
        </Folio>
      </main>
    </PageTurn>
  )
}
