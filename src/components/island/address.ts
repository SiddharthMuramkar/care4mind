'use client'

import { useSyncExternalStore } from 'react'

// The address is a filter's one source: a press pushes a new one, Back restores the last.
const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}
const search = () => window.location.search
const noSearch = () => ''

/** The address's query string, read again whenever it changes; empty while the server renders. */
export function useAddressQuery() {
  return useSyncExternalStore(subscribe, search, noSearch)
}

/** Tell every island reading the address that it has changed. */
export function addressChanged() {
  for (const listener of listeners) listener()
}

/** Move to a new address (a path, a query and any fragment), and let the islands read it at once. */
export function pushAddress(href: string) {
  window.history.pushState(null, '', href)
  addressChanged()
}

/** Rewrite the address in place, without a step for Back, and let the islands read it. */
export function replaceAddress(href: string) {
  window.history.replaceState(null, '', href)
  addressChanged()
}
