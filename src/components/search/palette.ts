import type { ComponentType } from 'react'

import type { PaletteProps } from './Palette'

/** Whether the palette is open, what it opens with, and what opened it (focus goes back there). */
export interface PaletteState {
  open: boolean
  query: string
  opener: HTMLElement | null
}

let state: PaletteState = { open: false, query: '', opener: null }
const listeners = new Set<() => void>()

function set(next: PaletteState) {
  state = next
  for (const listener of listeners) listener()
}

export const paletteState = () => state

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Opens the palette, filled in with a query or empty, from whatever has focus. */
export function openPalette(query = '', opener?: HTMLElement | null) {
  const from =
    opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
  set({ open: true, query, opener: from })
}

/** Changes the query an opening palette will hold, before its field is there to type in. */
export function typeAhead(change: (typed: string) => string) {
  if (state.open) set({ ...state, query: change(state.query) })
}

export function closePalette() {
  if (state.open) set({ ...state, open: false })
}

let palette: Promise<ComponentType<PaletteProps>> | undefined

/** The palette's code, loaded once; a failed load is tried again on the next call. */
export function loadPalette(): Promise<ComponentType<PaletteProps>> {
  palette ??= import('./Palette').then((module) => module.Palette)
  palette.catch(() => {
    palette = undefined
  })
  return palette
}

/**
 * Fetches what a search needs, the palette's code and the index, so it is ready when someone
 * searches: on intent (⌘K, or a pointer or focus on Search) or when the browser is idle.
 */
export function prepareSearch() {
  loadPalette().catch(() => undefined)
  import('@/lib/search/client').then(({ loadIndex }) => loadIndex()).catch(() => undefined)
}

/** ⌘K or Ctrl+K, never a single key (WCAG 2.1.4). On a keyboard without Latin letters, the K key. */
export function isShortcut(event: KeyboardEvent) {
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey || event.isComposing) {
    return false
  }
  const key = event.key.toLowerCase()
  return key === 'k' || (event.code === 'KeyK' && !/^[a-z]$/.test(key))
}

/** Whether the visitor's keyboard has ⌘ (a Mac, an iPad or an iPhone). */
export const isApple = () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
