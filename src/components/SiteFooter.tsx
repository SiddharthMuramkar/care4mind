import { site } from '@/config/site'

import { Fleuron } from './Fleuron'
import { Logo } from './Logo'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  return (
    // Its own transition name keeps it still while the page turns (globals.css).
    <footer className={styles.footer} style={{ viewTransitionName: 'site-footer' }}>
      <Fleuron className={styles.fleuron} />
      <Logo />
      <p className={styles.tagline}>{site.tagline}</p>
      <p className={styles.credit}>Powered by IIT Bombay-SJMSOM &amp; HUA</p>
      <p className={styles.preview}>
        A preview of the new site, not yet public. Content carried over from the current site has
        not been reviewed yet.
      </p>
    </footer>
  )
}
