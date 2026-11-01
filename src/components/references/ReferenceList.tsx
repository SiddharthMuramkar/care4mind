import type { ReferenceView } from '@/content'

import { Citation } from './Citation'
import { OpenReferences } from './OpenReferences'
import styles from './ReferenceList.module.css'

/**
 * A page's References, folded away so they don't interrupt reading. A native
 * disclosure, so it needs no JavaScript: while it is closed the browser's
 * find-in-page still reaches every entry, and a link to one (`#ref-…`) opens
 * it there. With JavaScript, following a citation also puts focus on its entry,
 * and printing opens it. A page with none shows nothing.
 */
export function ReferenceList({ references }: { references: readonly ReferenceView[] }) {
  if (references.length === 0) return null
  return (
    <details id="references" className={styles.root}>
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
          // Focusable, so a citation can hand focus to its entry.
          <li key={reference.id} id={reference.anchor} tabIndex={-1}>
            <Citation reference={reference} />
          </li>
        ))}
      </ol>
      <OpenReferences list="references" />
    </details>
  )
}
