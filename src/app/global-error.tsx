'use client'

import { Folio } from '@/components/folio/Folio'
import { siteConfig } from '@/config/site'
import { playfairText } from '@/fonts/playfair'
import { cx } from '@/lib/cx'

import cta from '@/components/cta/cta.module.css'
import styles from './error-page.module.css'
import reading from './reading.module.css'

import '@/styles/globals.css'

/** The whole document when the root layout itself fails, so it brings its own <html> and title. */
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en" className={playfairText.variable}>
      <body>
        <title>{`Page not shown · ${siteConfig.name}`}</title>
        <main id="main" className={reading.page}>
          <Folio className={styles.folio}>
            <p className={reading.kicker}>Error · Page not shown</p>
            <h1 className={styles.title}>This page couldn’t be set</h1>
            <p className={styles.text}>
              Something went wrong while putting the site together. Reloading the page usually
              brings it back.
            </p>
            <button
              type="button"
              className={cx(cta.primary, styles.action)}
              onClick={() => retry()}
            >
              Reload the page
            </button>
          </Folio>
        </main>
      </body>
    </html>
  )
}
