import type { Metadata, Route } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { hrefFor, type SearchKind } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { search } from '@/lib/search/server'

import listing from '../listing.module.css'
import reading from '../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'search' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** Each kind of result under its heading. */
const KINDS: readonly { kind: SearchKind; heading: string }[] = [
  { kind: 'concept', heading: 'Concepts' },
  { kind: 'term', heading: 'Terms inside Concepts' },
  { kind: 'topic', heading: 'Topics' },
  { kind: 'glossary', heading: 'Glossary' },
  { kind: 'work', heading: 'Texts' },
  { kind: 'passage', heading: 'Verses' },
  { kind: 'questionnaire', heading: 'Questionnaires' },
  { kind: 'reference', heading: 'References' },
  { kind: 'library-item', heading: 'In the Library' },
  { kind: 'page', heading: 'Pages' },
]

/** The most results shown of one kind. */
const SHOWN = 25

/** IAST's own letters: a title holding one is a transliteration, read as Sanskrit. */
const IAST = /[āīūṛṝḷḹṅñṭḍṇśṣṃḥ]/iu

/**
 * Search, rendered on the server for each query, so it works without JavaScript. It finds any
 * spelling of a name, a typo or a match by sound included.
 */
export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ''
  const found = query === '' ? [] : await search(query)
  // Groups in the order search ranks them: the kind holding the best result first.
  const groups = [...new Set(found.map(({ kind }) => kind))].map((kind) => ({
    kind,
    heading: KINDS.find((entry) => entry.kind === kind)?.heading ?? kind,
    results: found.filter((result) => result.kind === kind),
  }))

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
              {groups.map(({ kind, heading, results }) => (
                <div key={kind} className={listing.group}>
                  <h3 className={listing.groupTitle}>{heading}</h3>
                  <ul className={listing.entries}>
                    {results.slice(0, SHOWN).map((result) => (
                      <li key={result.id} className={listing.entry}>
                        <p className={listing.entryName}>
                          {/* Each result's path, made by hrefFor() in the content module. */}
                          <Link
                            href={result.href as Route}
                            lang={IAST.test(result.title) ? 'sa-Latn' : undefined}
                            transitionTypes={turnForward}
                          >
                            {result.title}
                          </Link>
                        </p>
                        {result.parent ? <p className={listing.meta}>In {result.parent}</p> : null}
                      </li>
                    ))}
                  </ul>
                  {results.length > SHOWN ? (
                    <p className={listing.note}>And {results.length - SHOWN} more.</p>
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
