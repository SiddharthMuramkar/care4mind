import type { Metadata, Route } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { hrefFor, site } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { resultGroups, substringSearch } from '@/lib/search'

import listing from '../listing.module.css'
import reading from '../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'search' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * Search, rendered on the server for each query, so it works without JavaScript. It finds a
 * query inside any stored spelling.
 */
export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ''
  const found = query === '' ? [] : await substringSearch(await site.searchDocuments())(query)
  const groups = resultGroups(found)

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="search-title">
          <header className={reading.titlePage}>
            <h1 id="search-title" className={reading.title}>
              Search
            </h1>
            <form action={PATH} role="search" className={styles.form}>
              <label htmlFor="search-query" className={styles.label}>
                A Concept, a term, a verse, a text or an author
              </label>
              <input
                id="search-query"
                name="q"
                type="search"
                defaultValue={query}
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                Search
              </button>
            </form>
          </header>

          {query === '' ? null : (
            <section className={reading.section} aria-labelledby="results-title">
              <h2 id="results-title" className={reading.sectionTitle}>
                {found.length} {found.length === 1 ? 'result' : 'results'} for “{query}”
              </h2>
              {groups.map(({ kind, heading, results, total }) => (
                <div key={kind} className={listing.group}>
                  <h3 className={listing.groupTitle}>{heading}</h3>
                  <ul className={listing.entries}>
                    {results.map((result) => (
                      <li key={result.id} className={listing.entry}>
                        <p className={listing.entryName}>
                          {/* Each result's path, made by hrefFor() in the content module. */}
                          <Link
                            href={result.href as Route}
                            lang={result.lang}
                            transitionTypes={turnForward}
                          >
                            {result.title}
                          </Link>
                        </p>
                        {result.parent ? <p className={listing.meta}>In {result.parent}</p> : null}
                      </li>
                    ))}
                  </ul>
                  {total > results.length ? (
                    <p className={listing.note}>And {total - results.length} more.</p>
                  ) : null}
                </div>
              ))}
            </section>
          )}
        </Folio>
      </main>
    </PageTurn>
  )
}
