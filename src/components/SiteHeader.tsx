import Link from 'next/link'

import { Logo } from './Logo'
import styles from './SiteHeader.module.css'

// Only sections that exist are linked. The site map ticket decides the full navigation
// and its mobile pattern; until then two links fit at every width.
export function SiteHeader() {
  return (
    // Its own transition name keeps it still while the page turns (globals.css).
    <header className={styles.header} style={{ viewTransitionName: 'site-header' }}>
      <Link href="/" className={styles.home} aria-label="Care4Mind home">
        <Logo redraw />
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
