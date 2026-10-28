import styles from './Logo.module.css'

/**
 * The Press wordmark: Care4Mind in Playfair, with the 4 set in a vermilion
 * roundel. Type and its roundel only: nothing in it is drawn in or animated.
 */
export function Logo() {
  return (
    <span className={styles.wordmark}>
      Care
      <span className={styles.four}>
        <svg className={styles.roundel} viewBox="0 0 2 2" aria-hidden focusable="false">
          <circle cx="1" cy="1" r="1" />
        </svg>
        4
      </span>
      Mind
    </span>
  )
}
