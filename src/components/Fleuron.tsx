import { cx } from '@/lib/cx'

import styles from './Fleuron.module.css'
import { LOTUS } from './lotus'

/**
 * A lotus-petal printer's ornament, drawn as line art. Decorative. Still by
 * default; with `draw` it draws itself in once as the page opens, stroke by
 * stroke: for a page's one opening moment. Its width and height reserve its
 * box, so drawing in never shifts what is round it.
 */
export function Fleuron({ className, draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg
      className={cx(styles.fleuron, draw && styles.draw, className)}
      viewBox="0 0 160 40"
      width={160}
      height={40}
      aria-hidden
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path pathLength={1} d={LOTUS.petals.centre} />
        <path pathLength={1} d={LOTUS.petals.left} />
        <path pathLength={1} d={LOTUS.petals.right} />
        <path pathLength={1} d="M42 30H2" />
        <path pathLength={1} d="M118 30h40" />
      </g>
      <circle cx={LOTUS.dot.cx} cy={LOTUS.dot.cy} r={LOTUS.dot.r} fill="currentColor" />
    </svg>
  )
}
