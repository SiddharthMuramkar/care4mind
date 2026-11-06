import type { Metadata } from 'next'
import Link from 'next/link'

import { HelpLine } from '@/components/HelpLine'
import { turnForward } from '@/components/PageTurn'
import { ReadingPage } from '@/components/ReadingPage'
import { SearchForm, StartingPoints } from '@/components/search'
import { TopicChip } from '@/components/TopicChip'
import { concepts, hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { readingTimeWords } from '@/lib/text'
import { isSearchGroupKind, resultGroups } from '@/lib/search/search'
import { search } from '@/lib/search/server'

import reading from '../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'search' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

const firstOf = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

/**
 * Search, rendered on the server for each query, so it works without JavaScript. It finds any
 * spelling of a name, a typo or a match by sound included, and groups what it finds; a group
 * shows its five strongest results until its “Show all” address asks for the rest.
 */
export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q, all } = await searchParams
  const query = firstOf(q)?.trim() ?? ''
  const expandedWord = firstOf(all) ?? ''
  const expanded = isSearchGroupKind(expandedWord) ? expandedWord : undefined
  const found = query === '' ? [] : await search(query)
  const groups = resultGroups(found, expanded)
  // A Concept result shows its card's chip and reading time, as every Concept card does.
  const cards = new Map(
    (query === '' ? [] : await concepts.list()).map((card) => [card.href, card]),
  )
  const cardOf = (result: (typeof found)[number]) =>
    result.kind === 'concept' ? cards.get(result.href) : undefined

  return (
    <ReadingPage
      path={PATH}
      titleId="search-title"
      title="Search"
      afterTitle={<SearchForm query={query} />}
    >
      {query === '' ? (
        <StartingPoints />
      ) : found.length === 0 ? (
        <section className={reading.section} aria-labelledby="results-title">
          <h2 id="results-title" className={reading.sectionTitle}>
            No results for “{query}”
          </h2>
          <StartingPoints />
          <p className={styles.browse}>
            <Link href={hrefFor({ page: 'concepts' })} transitionTypes={turnForward}>
              Browse all concepts
            </Link>
          </p>
          <HelpLine className={styles.help} />
        </section>
      ) : (
        <section className={reading.section} aria-labelledby="results-title">
          <h2 id="results-title" className={reading.sectionTitle}>
            {found.length} {found.length === 1 ? 'result' : 'results'} for “{query}”
          </h2>
          {groups.map(({ kind, heading, results, total }) => (
            <div key={kind} className={styles.group}>
              <h3 className={styles.groupTitle}>{heading}</h3>
              <ul className={styles.entries}>
                {results.map((result) => {
                  const card = cardOf(result)
                  return (
                    <li key={result.id} className={styles.entry}>
                      <p className={styles.entryName}>
                        <Link href={result.href} lang={result.lang} transitionTypes={turnForward}>
                          {result.title}
                        </Link>
                        {result.gloss ? (
                          <span className={styles.gloss}> · {result.gloss}</span>
                        ) : null}
                      </p>
                      {card ? (
                        <p className={styles.conceptMeta}>
                          <TopicChip topic={card.topic} />
                          <span>{readingTimeWords(card.readingMinutes)}</span>
                        </p>
                      ) : null}
                      {result.parent ? <p className={styles.meta}>In {result.parent}</p> : null}
                    </li>
                  )
                })}
              </ul>
              {total > results.length ? (
                <p className={styles.note}>
                  <Link
                    href={{ pathname: PATH, query: { q: query, all: kind } }}
                    transitionTypes={turnForward}
                  >
                    Show all {total}
                  </Link>
                </p>
              ) : null}
            </div>
          ))}
        </section>
      )}
    </ReadingPage>
  )
}
