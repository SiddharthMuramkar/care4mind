import type { Metadata } from 'next'
import Link from 'next/link'

import { Folio } from '@/components/Folio'
import { Kolam } from '@/components/Kolam'
import { PageTurn, turnForward } from '@/components/PageTurn'

import cta from './cta.module.css'
import reading from './reading.module.css'
import styles from './not-found.module.css'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Folio className={styles.folio}>
          <p className={reading.kicker}>Error 404 · Page not found</p>
          <h1 className={styles.title}>This page isn’t in the book</h1>
          <Kolam columns={3} rows={2} behaviour="draw-on-load" className={styles.kolam} />
          <p className={styles.text}>
            The address may be mistyped, or the page may not have moved across yet: the new site is
            still being built from the current one.
          </p>
          <ul className={styles.links}>
            <li>
              <Link href="/" className={cta.primary} data-ink>
                Go to the homepage
              </Link>
            </li>
            <li>
              <Link href="/concepts/vikshepa" transitionTypes={turnForward}>
                Read about&nbsp;<span lang="sa-Latn">Vikṣepa</span>
              </Link>
            </li>
          </ul>
        </Folio>
      </main>
    </PageTurn>
  )
}
