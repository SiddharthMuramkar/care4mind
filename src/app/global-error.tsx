'use client'

import { Folio } from '@/components/Folio'
import { site } from '@/config/site'
import { playfairText } from '@/fonts/playfair'
import { cx } from '@/lib/cx'

import cta from './cta.module.css'
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
      <head>
        <title>{`Page not shown · ${site.name}`}</title>
        {/* The root layout's robots meta fails with it. */}
        {site.indexable ? null : <meta name="robots" content="noindex, nofollow" />}
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <main id="main" className={reading.page}>
          <Folio className={styles.folio}>
            <p className={reading.kicker}>Error · Page not shown</p>
            <h1 className={styles.title}>This page couldn’t be set</h1>
            <p className={styles.text}>
              Something went wrong while putting the site together. Reloading the page usually
              brings it back.
            </p>
            {/* A submit reloads the document even when its scripts never start. */}
            <form>
              <button
                type="submit"
                className={cx(cta.primary, styles.action)}
                onClick={() => retry()}
              >
                Reload the page
              </button>
            </form>
          </Folio>
        </main>
      </body>
    </html>
  )
}
