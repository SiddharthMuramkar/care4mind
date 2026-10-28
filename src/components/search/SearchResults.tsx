import type { Route } from 'next'
import Link from 'next/link'
import type { Ref } from 'react'

import { turnForward } from '@/components/PageTurn'
import type { SearchHit } from '@/lib/search/search'

import { groupByKind, langOf, resultCount, shownVariant, SUGGESTIONS } from './kinds'
import styles from './SearchResults.module.css'

/** The results listed of one kind before the rest wait behind "more". */
const SHOWN = 12

interface Props {
  query: string
  hits: readonly SearchHit[]
  /** The results page's own path, for the suggestions' links. */
  searchPath: Route
  /** The heading over the results, where focus goes after a search with JavaScript. */
  headingRef?: Ref<HTMLHeadingElement>
}

const tag = (text: string | undefined) => {
  const lang = text === undefined ? undefined : langOf(text)
  return lang ? { lang } : {}
}

/**
 * The results page's list (design A4): grouped by kind, each group set like a book's contents,
 * each result naming what it sits in and the spelling that found it. With nothing to show it
 * suggests real searches. Rendered on the server, and again by the page's island as you type.
 */
export function SearchResults({ query, hits, searchPath, headingRef }: Props) {
  const typed = query.trim()
  const suggestions = (
    <p className={styles.suggestions}>
      Try{' '}
      {SUGGESTIONS.map(({ query: suggestion, lang }, index) => (
        <span key={suggestion}>
          {index > 0 ? <span aria-hidden> · </span> : null}
          {/* The results page's path, from hrefFor() on the server, with a query. */}
          <Link
            href={`${searchPath}?q=${encodeURIComponent(suggestion)}` as Route}
            {...(lang ? { lang } : {})}
          >
            {suggestion}
          </Link>
        </span>
      ))}
    </p>
  )

  if (typed === '') {
    return (
      <section className={styles.results} aria-labelledby="results-title">
        <h2 id="results-title" ref={headingRef} tabIndex={-1} className={styles.heading}>
          Search by any spelling
        </h2>
        <p className={styles.lead}>
          A name in IAST, in Devanagari or in plain letters, a verse by its locator, or an author.
        </p>
        {suggestions}
      </section>
    )
  }

  if (hits.length === 0) {
    return (
      <section className={styles.results} aria-labelledby="results-title">
        <h2 id="results-title" ref={headingRef} tabIndex={-1} className={styles.heading}>
          Nothing found for “{typed}”
        </h2>
        <p className={styles.lead}>Spellings are forgiven, but not every word is in the site.</p>
        {suggestions}
      </section>
    )
  }

  return (
    <section className={styles.results} aria-labelledby="results-title">
      <h2 id="results-title" ref={headingRef} tabIndex={-1} className={styles.heading}>
        {resultCount(hits.length)} for “{typed}”
      </h2>
      {groupByKind(hits).map(({ kind, heading, hits: found }) => (
        <section key={kind} className={styles.group} aria-labelledby={`results-${kind}`}>
          <h3 id={`results-${kind}`} className={styles.groupTitle}>
            {heading}
            <span className={styles.leader} aria-hidden />
            <span className={styles.count}>{found.length}</span>
          </h3>
          <Entries hits={found.slice(0, SHOWN)} />
          {found.length > SHOWN ? (
            <details className={styles.more}>
              <summary>
                {found.length - SHOWN} more {heading.toLowerCase()}
              </summary>
              <Entries hits={found.slice(SHOWN)} />
            </details>
          ) : null}
        </section>
      ))}
    </section>
  )
}

function Entries({ hits }: { hits: readonly SearchHit[] }) {
  return (
    <ol className={styles.entries}>
      {hits.map((hit) => {
        const variant = shownVariant(hit)
        return (
          <li key={hit.id} className={styles.entry}>
            {/* Each result's path, made by hrefFor() in the content module. */}
            <Link
              href={hit.href as Route}
              className={styles.name}
              transitionTypes={turnForward}
              {...tag(hit.title)}
            >
              {hit.title}
            </Link>
            {hit.parent || variant ? (
              <span className={styles.meta}>
                {hit.parent ? (
                  <span>
                    in <span {...tag(hit.parent)}>{hit.parent}</span>
                  </span>
                ) : null}
                {variant ? (
                  <span className={styles.chip}>
                    matched{' '}
                    <i className={styles.variant} {...tag(variant)}>
                      {variant}
                    </i>
                  </span>
                ) : null}
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
