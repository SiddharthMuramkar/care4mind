'use client'

import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'

import reading from './reading.module.css'
import styles from './error.module.css'

export default function PageError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main id="main" className={reading.page}>
      <Folio className={styles.folio}>
        <p className={reading.kicker}>Error</p>
        <h1 className={styles.title}>This page didn’t come through</h1>
        <Fleuron className={styles.fleuron} />
        <p className={styles.text}>
          Try it again, or go back into the site from the header or the footer.
        </p>
        <button type="button" className={styles.retry} data-ink onClick={() => retry()}>
          Try again
        </button>
      </Folio>
    </main>
  )
}
