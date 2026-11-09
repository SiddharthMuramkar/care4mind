import { useId, type ReactNode } from 'react'

import { cx } from '@/lib/cx'

import styles from './FolkBorder.module.css'

/** The strip's height in CSS pixels. */
const HEIGHT = 12

/** A dot; `accent` takes the second colour. */
const dot = (x: number, y: number, accent = false) => (
  <circle cx={x} cy={y} r={2} fill="currentColor" className={accent ? styles.accent : undefined} />
)

const rule = (y: number, width: number) => (
  <rect y={y} width={width} height={1} fill="currentColor" />
)

/** Each old border as one repeating tile. */
const TILES = {
  /** A double rule over alternating dots. */
  'dot-line': {
    width: 16,
    drawing: (
      <>
        {rule(0, 16)}
        {rule(3, 16)}
        {dot(4, 9)}
        {dot(12, 9, true)}
      </>
    ),
  },
  /** Dots between two hairlines. */
  'dot-band': {
    width: 12,
    drawing: (
      <>
        {rule(0, 12)}
        {dot(3, 6, true)}
        {dot(9, 6)}
        {rule(11, 12)}
      </>
    ),
  },
  /** One rule over dots. */
  'rule-dots': {
    width: 12,
    drawing: (
      <>
        {rule(1, 12)}
        {dot(3, 8)}
        {dot(9, 8, true)}
      </>
    ),
  },
} satisfies Record<string, { width: number; drawing: ReactNode }>

/**
 * One of the three old borders, redrawn as a full-width strip of repeating dots. Sync on purpose:
 * `useId` cannot run in an async Server Component. No `viewBox`, so the dots stay round at any width.
 */
export function FolkBorder({
  variant,
  className,
}: {
  variant: keyof typeof TILES
  className?: string
}) {
  const id = useId()
  const { width, drawing } = TILES[variant]
  return (
    <svg
      aria-hidden
      focusable="false"
      width="100%"
      height={HEIGHT}
      className={cx(styles.border, className)}
    >
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width={width} height={HEIGHT}>
          {drawing}
        </pattern>
      </defs>
      <rect width="100%" height={HEIGHT} fill={`url(#${id})`} />
    </svg>
  )
}
