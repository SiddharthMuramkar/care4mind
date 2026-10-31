'use client'

import { useSyncExternalStore } from 'react'

const never = () => () => {}

/** False while the server renders and React hydrates, true once the page is interactive. */
export function useHydrated() {
  return useSyncExternalStore(
    never,
    () => true,
    () => false,
  )
}

/** Run something once the browser is idle, or a little later where it can't say (older Safari). */
export function whenIdle(work: () => void): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(work)
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(work, 1500)
  return () => clearTimeout(id)
}
