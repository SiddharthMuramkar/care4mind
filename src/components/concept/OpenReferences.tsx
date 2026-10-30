'use client'

import { useEffect } from 'react'

/** The References entry a link leads to, if it is one: `#ref-…` on this page. */
function entryFor(target: EventTarget | null): HTMLElement | null {
  const link = target instanceof Element ? target.closest('a') : null
  if (!link || link.origin + link.pathname !== location.origin + location.pathname) return null
  if (!link.hash.startsWith('#ref-')) return null
  return document.getElementById(decodeURIComponent(link.hash.slice(1)))
}

/**
 * The References accordion's island: a citation, or any link to an entry, opens the list if it
 * is closed, and once the browser has brought the entry into view, puts focus on it, by mouse
 * or keyboard alike. Printing opens the list too. Without JavaScript the native disclosure still
 * opens at an entry a link leads to.
 */
export function OpenReferences({ list }: { list: string }) {
  useEffect(() => {
    const found = document.getElementById(list)
    if (!(found instanceof HTMLDetailsElement)) return
    const details: HTMLDetailsElement = found
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const entry = entryFor(event.target)
      if (!entry || !details.contains(entry)) return
      details.open = true
      // After the browser's own jump to the fragment.
      requestAnimationFrame(() => entry.focus())
    }
    let wasOpen = details.open
    const beforePrint = () => {
      wasOpen = details.open
      details.open = true
    }
    const afterPrint = () => {
      details.open = wasOpen
    }
    document.addEventListener('click', onClick)
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [list])
  return null
}
