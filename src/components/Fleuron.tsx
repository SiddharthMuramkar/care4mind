import { cx } from '@/lib/cx'

import styles from './Fleuron.module.css'

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
        <path pathLength={1} d="M80 4c7 9 7 21 0 32-7-11-7-23 0-32Z" />
        <path pathLength={1} d="M80 36c-9-8-20-11-31-9 8-8 22-7 31 9Z" />
        <path pathLength={1} d="M80 36c9-8 20-11 31-9-8-8-22-7-31 9Z" />
        <path pathLength={1} d="M42 30H2" />
        <path pathLength={1} d="M118 30h40" />
      </g>
      <circle cx="80" cy="18" r="2.2" fill="currentColor" />
    </svg>
  )
}
