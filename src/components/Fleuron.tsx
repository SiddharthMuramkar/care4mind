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

/**
 * The Fleuron's flower alone, without its rules: the lotus beside the wordmark. Decorative and
 * still. Its box leaves the flower room to open, its side petals turned 23° out and its centre
 * grown by about an eighth, without drawing outside it; its width and height reserve that
 * box. The flower keeps a frame of its own from 0 0, where a pivot in px means the same in
 * every browser (csswg-drafts issue 2443).
 */
export function LotusMark({ className }: { className?: string }) {
  return (
    <svg
      data-lotus=""
      className={cx(styles.mark, className)}
      viewBox="44 -4 72 48"
      width={72}
      height={48}
      aria-hidden="true"
      focusable="false"
    >
      <svg viewBox="0 0 160 40" width={160} height={40}>
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path d={LOTUS.petals.centre} />
          <path d={LOTUS.petals.left} />
          <path d={LOTUS.petals.right} />
        </g>
        <circle cx={LOTUS.dot.cx} cy={LOTUS.dot.cy} r={LOTUS.dot.r} fill="currentColor" />
      </svg>
    </svg>
  )
}
