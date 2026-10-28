import type { ReferenceView } from '@/content'

import { Citation } from './Citation'
import styles from './ReferenceList.module.css'

/**
 * A page's References, folded away so they don't interrupt reading. A native
 * disclosure, so it needs no JavaScript: while it is closed the browser's
 * find-in-page still reaches every entry, and a link to one (`#ref-…`) opens
 * it there. A page with none shows nothing.
 */
export function ReferenceList({ references }: { references: readonly ReferenceView[] }) {
  if (references.length === 0) return null
  return (
    <details className={styles.root}>
      <summary className={styles.trigger}>
        <h2 className={styles.heading}>References</h2>
        <span className={styles.count}>({references.length})</span>
        <span className={styles.icon} aria-hidden>
          <span />
          <span />
        </span>
      </summary>
      <ol className={styles.list}>
        {references.map((reference) => (
          <li key={reference.id} id={reference.anchor}>
            <Citation reference={reference} />
          </li>
        ))}
      </ol>
    </details>
  )
}
