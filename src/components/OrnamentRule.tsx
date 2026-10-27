import { cx } from '@/lib/cx'

import { Fleuron } from './Fleuron'
import styles from './OrnamentRule.module.css'

/** A section break: two printer's rules either side of the fleuron. They ink in as it scrolls into view. */
export function OrnamentRule({ className }: { className?: string }) {
  return (
    <div className={cx(styles.rule, className)} aria-hidden>
      <span className={styles.line} />
      <Fleuron className={styles.fleuron} />
      <span className={styles.line} />
    </div>
  )
}
