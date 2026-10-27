import Link from 'next/link'

import styles from './SiteHeader.module.css'
import { Wordmark } from './Wordmark'

// Only sections that exist are linked. The site map ticket decides the full navigation
// and its mobile pattern; until then two links fit at every width.
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.home} aria-label="Care4Mind home">
        <Wordmark />
      </Link>
      <nav aria-label="Main">
        <ul className={styles.links}>
          <li>
            <Link href="/#concepts" className={styles.link}>
              Concepts
            </Link>
          </li>
          <li>
            <Link href="/#questionnaires" className={styles.link}>
              Questionnaires
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
