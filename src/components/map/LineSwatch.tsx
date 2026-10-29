import { cx } from '@/lib/cx'

import styles from './ConceptMap.module.css'
import type { ConnectionKind } from './kinds'

/** A short length of a kind's line, as the plate draws it: in the legend, the list and the filters. */
export function LineSwatch({ kind, className }: { kind: ConnectionKind; className?: string }) {
  return (
    <svg
      className={cx(styles.swatch, className)}
      viewBox="0 0 40 10"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.line} data-kind={kind} d="M3 5H37" />
    </svg>
  )
}
