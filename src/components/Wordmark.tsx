import { cx } from '@/lib/cx'

import styles from './Wordmark.module.css'

/** Care4Mind, with the 4 set in a vermilion roundel. */
export function Wordmark({
  size = 'small',
  className,
}: {
  size?: 'small' | 'large'
  className?: string
}) {
  return (
    <span className={cx(styles.wordmark, size === 'large' && styles.large, className)}>
      Care<span className={styles.four}>4</span>Mind
    </span>
  )
}
