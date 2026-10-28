import styles from './ReadingThread.module.css'

/**
 * A turmeric thread across the top of the screen that fills as the page is
 * read. Decorative and silent; with reduced motion, or where the browser
 * can't drive it by scroll, there is none. Place it inside the page's <main>:
 * Next.js finds where a new page starts from its outermost elements, and a
 * line pinned to the top of the screen would make every page look scrolled past.
 */
export function ReadingThread() {
  return <div className={styles.thread} aria-hidden />
}
