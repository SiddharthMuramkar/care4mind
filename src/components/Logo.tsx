import { Kolam } from './Kolam'
import styles from './Logo.module.css'

/**
 * The kolam mark, one line looped round two dots, beside "care4mind" in
 * lowercase italic. With `redraw`, the mark draws itself again whenever the
 * link around it is hovered or focused.
 */
export function Logo({ redraw = false }: { redraw?: boolean }) {
  return (
    <span className={styles.logo}>
      <Kolam
        columns={2}
        rows={1}
        behaviour={redraw ? 'redraw-on-hover' : 'still'}
        className={styles.mark}
      />
      care4mind
    </span>
  )
}
