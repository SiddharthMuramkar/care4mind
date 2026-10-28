import { cx } from '@/lib/cx'
import { kolam } from '@/lib/kolam'

import styles from './Kolam.module.css'

type Behaviour = 'still' | 'draw-on-load' | 'draw-on-scroll' | 'redraw-on-hover'

const BEHAVIOURS: Record<Behaviour, string | undefined> = {
  still: undefined,
  'draw-on-load': styles.drawOnLoad,
  'draw-on-scroll': styles.drawOnScroll,
  'redraw-on-hover': styles.redrawOnHover,
}

interface Props {
  /** Dots across and down. They must share no factor, so the line is one loop. */
  columns: number
  rows: number
  /**
   * Still by default. The others draw the line in, only for visitors who allow
   * motion: once on load, as it scrolls into view (where scroll timelines are
   * supported), or whenever the link around it is hovered or focused.
   */
  behaviour?: Behaviour
  className?: string
}

/**
 * A kolam: one unbroken line looped round a grid of dots, as decorative SVG.
 * Its width and height attributes reserve its box, so it never shifts layout.
 */
export function Kolam({ columns, rows, behaviour = 'still', className }: Props) {
  const { d, dots, width, height } = kolam(columns, rows)
  return (
    <svg
      className={cx(styles.kolam, BEHAVIOURS[behaviour], className)}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
      focusable="false"
    >
      <path className={styles.line} d={d} pathLength={1} />
      {dots.map(([x, y]) => (
        <circle key={`${x} ${y}`} className={styles.dot} cx={x} cy={y} r={4} />
      ))}
    </svg>
  )
}
