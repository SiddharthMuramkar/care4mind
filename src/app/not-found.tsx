import type { Metadata } from 'next'
import Link from 'next/link'

import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'

import reading from './reading.module.css'
import styles from './not-found.module.css'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <main id="main" className={reading.page}>
      <Folio className={styles.folio}>
        <p className={reading.kicker}>Error 404 · Page not found</p>
        <h1 className={styles.title}>This page isn’t in the book</h1>
        <Fleuron className={styles.fleuron} />
        <p className={styles.text}>
          The address may be mistyped, or the page may not have moved across yet: the new site is
          still being built from the current one.
        </p>
        <ul className={styles.links}>
          <li>
            <Link href="/">Go to the homepage</Link>
          </li>
          <li>
            <Link href="/concepts/vikshepa">
              Read about <span lang="sa-Latn">Vikṣepa</span>
            </Link>
          </li>
        </ul>
      </Folio>
    </main>
  )
}
