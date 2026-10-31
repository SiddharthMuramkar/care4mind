'use client'

import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'
import { site } from '@/config/site'

import styles from './error.module.css'
import reading from './reading.module.css'

import '@/styles/globals.css'

export default function GlobalError() {
  return (
    <html lang="en">
      <head>
        {/* metadata exports are not read on this file, so the title is an element. */}
        <title>{`This page didn’t come through · ${site.name}`}</title>
        {/* The root layout's robots meta went with it. */}
        {site.indexable ? null : <meta name="robots" content="noindex, nofollow" />}
      </head>
      <body className={styles.shell}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <main id="main" className={reading.page}>
          <Folio className={styles.folio}>
            <p className={reading.kicker}>Error</p>
            <h1 className={styles.title}>This page didn’t come through</h1>
            <Fleuron className={styles.fleuron} />
            <p className={styles.text}>Reload the page to come back into the site.</p>
            {/* A submit reloads this document even when its scripts never start. */}
            <form className={styles.reload}>
              <button type="submit" className={styles.retry}>
                Reload
              </button>
            </form>
          </Folio>
        </main>
      </body>
    </html>
  )
}
