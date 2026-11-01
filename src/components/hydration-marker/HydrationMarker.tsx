'use client'

import { useEffect } from 'react'

/**
 * Marks <html> with `data-hydrated` once React has hydrated the page, that is,
 * attached its handlers to the server's HTML. Browser tests wait for it before
 * they press anything (gotoReady in tests/e2e/fixtures.ts). The server never
 * sends it, and nothing a visitor sees depends on it.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = ''
  }, [])

  return null
}
