import styles from './Logo.module.css'

/**
 * The Press wordmark: Care4Mind in Playfair, with the 4 set in a vermilion
 * ring. Type and its ring only, still: the header sets the lotus beside
 * it, and the footer shows it alone.
 */
export function Logo() {
  return (
    <span className={styles.wordmark}>
      Care
      <span className={styles.four}>
        <svg className={styles.ring} viewBox="0 0 2 2" aria-hidden focusable="false">
          <circle cx="1" cy="1" r="0.88" strokeWidth="0.24" />
        </svg>
        4
      </span>
      Mind
    </span>
  )
}
