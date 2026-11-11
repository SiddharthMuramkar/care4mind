'use client'

import { useSyncExternalStore } from 'react'

import { ArrowGlyph } from '../glyphs'
import styles from './BackToTop.module.css'

/** How far down the reader must be, in screens, before the button shows. */
const SCREENS = 2

function subscribe(changed: () => void) {
  window.addEventListener('scroll', changed, { passive: true })
  window.addEventListener('resize', changed)
  return () => {
    window.removeEventListener('scroll', changed)
    window.removeEventListener('resize', changed)
  }
}

const farDown = () => window.scrollY >= SCREENS * window.innerHeight
const atTop = () => false

/**
 * Back to top: a round 44 px button at the lower right of the screen, clear of its safe area,
 * shown once the reader is two screens down a page, so only a long page ever shows it. It takes
 * the reader back to the top, gliding only where motion is welcome, and puts focus on the page's
 * first stop, its skip link, so the keyboard carries on from the top too.
 */
export function BackToTop() {
  const shown = useSyncExternalStore(subscribe, farDown, atTop)
  const toTop = () => {
    // The page's own scroll-behavior decides whether this glides or jumps.
    window.scrollTo({ top: 0 })
    document.querySelector<HTMLElement>('.skip-link')?.focus({ preventScroll: true })
  }
  return (
    <button
      type="button"
      className={styles.button}
      onClick={toTop}
      {...(shown ? { 'data-shown': '' } : {})}
    >
      <ArrowGlyph className={styles.arrow} />
      <span className="sr-only">Back to top</span>
    </button>
  )
}
