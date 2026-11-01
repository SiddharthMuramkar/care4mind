import type { Metadata, Route } from 'next'
import Link from 'next/link'

import { turnForward } from '@/components/page-turn/PageTurn'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
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
  const found = query === '' ? [] : substringSearch(await site.searchDocuments()).find(query)
  const groups = resultGroups(found)

  return (
    <ReadingPage path={PATH}>
      <TitlePage>
        <PageTitle>Search</PageTitle>
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
      </TitlePage>

      {query === '' ? null : (
        <section className={reading.section} aria-labelledby="results-title">
          <h2 id="results-title" className={reading.sectionTitle}>
            {found.length} {found.length === 1 ? 'result' : 'results'} for “{query}”
          </h2>
          {groups.map(({ kind, heading, shown, more }) => (
            <div key={kind} className={listing.group}>
              <h3 className={listing.groupTitle}>{heading}</h3>
              <ul className={listing.entries}>
                {shown.map((result) => (
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
              {more > 0 ? <p className={listing.note}>And {more} more.</p> : null}
            </div>
          ))}
        </section>
      )}
    </ReadingPage>
  )
}
