/** Where the reader's pause is remembered. Only a press of "Pause the lotus" writes it. */
export const LOTUS_MOTION_KEY = 'care4mind:lotus-motion'

/** What the lotuses do, from what is stored: only a stored pause keeps them still. */
export function lotusMotionFrom(stored: string | null): 'still' | 'breathing' {
  return stored === 'still' ? 'still' : 'breathing'
}

/** Whether the reader has paused the lotuses, as <html> says. */
export function lotusesAreStill() {
  return document.documentElement.dataset.lotusMotion === 'still'
}

/** Calls back each time the lotuses are paused or set breathing again; returns its unsubscribe. */
export function onLotusMotionChange(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributeFilter: ['data-lotus-motion'] })
  return () => observer.disconnect()
}

/** Stills every lotus, or sets them breathing again, and remembers the choice. */
export function keepLotusesStill(still: boolean) {
  document.documentElement.dataset.lotusMotion = still ? 'still' : 'breathing'
  try {
    if (still) localStorage.setItem(LOTUS_MOTION_KEY, 'still')
    else localStorage.removeItem(LOTUS_MOTION_KEY)
  } catch {
    // Blocked storage throws; the choice then holds in this tab until it reloads.
  }
}
