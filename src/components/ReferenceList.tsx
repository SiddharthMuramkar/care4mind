import type { Reference } from '@/content'

import { Citation } from './Citation'
import { Kolam } from './Kolam'
import styles from './ReferenceList.module.css'

/**
 * A Concept's References, folded away so they don't interrupt reading. A
 * native disclosure, so it needs no JavaScript: while it is closed the
 * browser's find-in-page still reaches every entry, and a link to one
 * (`#ref-…`) opens it there.
 */
export function ReferenceList({ references }: { references: readonly Reference[] }) {
  return (
    <details className={styles.root}>
      <summary className={styles.trigger}>
        <h2 className={styles.heading}>References</h2>
        <span className={styles.count}>({references.length})</span>
        <Kolam columns={1} rows={1} className={styles.knot} />
      </summary>
      <ol className={styles.list}>
        {references.map((reference) => (
          <li key={reference.id} id={`ref-${reference.id}`}>
            <Citation reference={reference} />
          </li>
        ))}
      </ol>
    </details>
  )
}
