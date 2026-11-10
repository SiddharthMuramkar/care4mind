import type { Metadata } from 'next'
import Link from 'next/link'

import { artFor } from '@/art'
import { Medallion } from '@/components/art'
import { Emblem } from '@/components/Emblem'
import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { SearchForm, StartingPoints } from '@/components/search'
import { concepts, hrefFor } from '@/content'
import { cx } from '@/lib/cx'
import { notFoundMetadata } from '@/lib/metadata'

import cta from '@/components/Cta'
import page from './error-page.module.css'
import reading from '@/styles/reading.module.css'
import styles from './not-found.module.css'

export const metadata: Metadata = notFoundMetadata

export default async function NotFound() {
  // The foundation's first Concept, offered as somewhere to start reading.
  const start = await concepts.get('vikshepa')
  const picture = artFor({ kind: 'section', key: 'notFound' })
  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Folio variant="page" className={page.folio}>
          {picture.family === 'plate' ? (
            <Medallion art={picture} size={200} firstScreen className={styles.picture} />
          ) : (
            <Emblem variant="mark" size={200} firstScreen className={styles.picture} />
          )}
          <p className={reading.kicker}>Error 404 · Page not found</p>
          <h1 className={cx(page.title, styles.title)}>This page isn’t in the book</h1>
          <Fleuron className={styles.fleuron} />
          <p className={page.text}>
            The address may be mistyped, or the page may not have moved across yet: the new site is
            still being built from the current one.
          </p>
          <div className={styles.search}>
            <SearchForm variant="secondary" id="not-found-search-query" />
            <StartingPoints />
          </div>
          <ul className={styles.links}>
            <li>
              <Link href={hrefFor({ page: 'home' })} className={cta.primary} data-ink>
                Go to the homepage
              </Link>
            </li>
            {start ? (
              <li>
                <Link
                  href={hrefFor({ kind: 'concept', id: start.slug })}
                  transitionTypes={turnForward}
                >
                  {/* One box inside the flex link, so the spaces around the dot aren't trimmed. */}
                  <span>
                    Read about&nbsp;<span lang={start.lang}>{start.name}</span>
                    {start.gloss ? <> · {start.gloss}</> : null}
                  </span>
                </Link>
              </li>
            ) : null}
          </ul>
        </Folio>
      </main>
    </PageTurn>
  )
}
