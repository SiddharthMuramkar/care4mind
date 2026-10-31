'use client'

import { Folio } from '@/components/Folio'
import { cx } from '@/lib/cx'

import cta from './cta.module.css'
import styles from './error-page.module.css'
import reading from './reading.module.css'

/** A page that failed to render, set inside the site's own header and footer, which lead back in. */
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main id="main" className={reading.page}>
      <Folio className={styles.folio}>
        <p className={reading.kicker}>Error · Page not shown</p>
        <h1 className={styles.title}>This page couldn’t be set</h1>
        <p className={styles.text}>
          Something went wrong while putting this page together. Try again, or carry on from the
          menu above.
        </p>
        <button type="button" className={cx(cta.primary, styles.action)} onClick={() => retry()}>
          Try again
        </button>
      </Folio>
    </main>
  )
}
