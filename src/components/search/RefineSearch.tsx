'use client'

import type { Route } from 'next'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import type { SearchHit } from '@/lib/search/search'

import { resultCount } from './kinds'
import { SearchResults } from './SearchResults'
import styles from './SearchResults.module.css'

interface Props {
  /** The query the server answered, and its hits. */
  query: string
  hits: SearchHit[]
  searchPath: Route
}

const loadSearch = () => import('@/lib/search/client')

/**
 * The results page's form and results. Without JavaScript the form asks the server; with it the
 * results follow as you type, and the address follows them (replaceState), from the index the
 * browser loads once the field is focused. Searching moves focus to the results' heading.
 */
export function RefineSearch({ query: answered, hits: answeredHits, searchPath }: Props) {
  const [query, setQuery] = useState(answered)
  const [shown, setShown] = useState({ query: answered, hits: answeredHits })
  const [focusHeading, setFocusHeading] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)

  const typed = query.trim()
  useEffect(() => {
    if (typed === shown.query.trim()) return
    let current = true
    loadSearch()
      .then(({ search }) => (typed === '' ? [] : search(typed)))
      .then(
        (hits) => {
          if (!current) return
          setShown({ query: typed, hits })
          const address = typed === '' ? searchPath : `${searchPath}?q=${encodeURIComponent(typed)}`
          window.history.replaceState(null, '', address)
        },
        () => undefined,
      )
    return () => {
      current = false
    }
  }, [typed, shown.query, searchPath])

  useEffect(() => {
    if (focusHeading > 0) heading.current?.focus()
  }, [focusHeading])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFocusHeading((count) => count + 1)
  }

  const settled = typed === shown.query.trim()
  return (
    <>
      <form action={searchPath} role="search" className={styles.form} onSubmit={submit}>
        <label htmlFor="search-query" className={styles.label}>
          A Concept, a term, a verse, a text or an author
        </label>
        <input
          id="search-query"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() =>
            void loadSearch()
              .then(({ loadIndex }) => loadIndex())
              .catch(() => undefined)
          }
          className={styles.input}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        <button type="submit" className={styles.button} data-ink>
          Search
        </button>
      </form>
      <p role="status" className={styles.hidden}>
        {settled && typed !== '' ? `${resultCount(shown.hits.length)} for “${typed}”` : ''}
      </p>
      <SearchResults
        query={shown.query}
        hits={shown.hits}
        searchPath={searchPath}
        headingRef={heading}
      />
    </>
  )
}
