import type { Metadata } from 'next'
import Link from 'next/link'

import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { concepts, hrefFor } from '@/content'
import { notFoundMetadata } from '@/lib/metadata'

import cta from './cta.module.css'
import page from './error-page.module.css'
import reading from './reading.module.css'
import styles from './not-found.module.css'

export const metadata: Metadata = notFoundMetadata

export default async function NotFound() {
  // The foundation's first Concept, offered as somewhere to start reading.
  const start = await concepts.get('vikshepa')
  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Folio className={page.folio}>
          <p className={reading.kicker}>Error 404 · Page not found</p>
          <h1 className={page.title}>This page isn’t in the book</h1>
          <Fleuron className={styles.fleuron} />
          <p className={page.text}>
            The address may be mistyped, or the page may not have moved across yet: the new site is
            still being built from the current one.
          </p>
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
                  Read about&nbsp;<span lang={start.lang}>{start.name}</span>
                </Link>
              </li>
            ) : null}
          </ul>
        </Folio>
      </main>
    </PageTurn>
  )
}
