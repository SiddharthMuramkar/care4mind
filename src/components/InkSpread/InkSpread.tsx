'use client'

import { useEffect } from 'react'

/** Where a press landed: the pointer's spot in the control, or its centre for a press from the keyboard. */
function pressPoint(event: MouseEvent, control: Element): [string, string] {
  // A keyboard press (Enter, or Space on a button) clicks without a pointer.
  if (event.detail === 0) return ['50%', '50%']
  const box = control.getBoundingClientRect()
  return [`${event.clientX - box.left}px`, `${event.clientY - box.top}px`]
}

/**
 * Ink-spread: a press on anything marked `data-ink` spreads vermilion ink
 * from the point pressed (styles in globals.css). One listener serves the
 * whole site, so the controls stay server components. It only notes where
 * and restarts the animation: being passive, it can't stop or hold up the press.
 */
export function InkSpread() {
  useEffect(() => {
    const spread = (event: MouseEvent) => {
      const control = event.target instanceof Element ? event.target.closest('[data-ink]') : null
      if (!(control instanceof HTMLElement)) return
      const [x, y] = pressPoint(event, control)
      control.style.setProperty('--ink-x', x)
      control.style.setProperty('--ink-y', y)
      // The spread runs from one of two identical animations; switching between them restarts it.
      control.dataset.inkPress = control.dataset.inkPress === 'a' ? 'b' : 'a'
    }
    document.addEventListener('click', spread, { passive: true })
    return () => document.removeEventListener('click', spread)
  }, [])

  return null
}
