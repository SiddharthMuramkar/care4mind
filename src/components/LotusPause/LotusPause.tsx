'use client'

import { useSyncExternalStore } from 'react'

import { cx } from '@/lib/cx'

import { keepLotusesStill, lotusesAreStill, onLotusMotionChange } from '../lotus-motion'
import styles from './LotusPause.module.css'
import { useHydrated } from '../browser'
import { PauseGlyph } from '../nav'

/**
 * "Pause the lotus" (WCAG 2.2.2, Pause, Stop, Hide): stills every lotus, or sets them breathing
 * again, and the site remembers which. Pressed means paused. Its name never changes; its glyph
 * does. `header`: the glyph alone, in the header's strip from 72rem. `drawer`: the glyph and its
 * words, in the Menu's sheet.
 */
export function LotusPause({ placement }: { placement: 'header' | 'drawer' }) {
  const hydrated = useHydrated()
  const still = useSyncExternalStore(onLotusMotionChange, lotusesAreStill, () => false)
  return (
    <button
      type="button"
      className={cx(styles.pause, placement === 'header' ? styles.header : styles.drawer)}
      aria-pressed={still}
      // Shown once it works: without JavaScript no lotus breathes, so there is nothing to pause.
      data-ready={hydrated || undefined}
      onClick={() => keepLotusesStill(!still)}
    >
      <PauseGlyph className={styles.glyph} pressed={still} />
      <span className={placement === 'header' ? 'sr-only' : undefined}>Pause the lotus</span>
    </button>
  )
}
