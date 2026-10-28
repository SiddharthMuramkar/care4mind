'use client'

import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { type ComponentType, startTransition, useEffect, useState } from 'react'

import type { PaletteProps } from './Palette'
import {
  closePalette,
  isFieldReady,
  isShortcut,
  loadPalette,
  openPalette,
  paletteState,
  prepareSearch,
  subscribe,
  typeAhead,
} from './palette'

/** Marks the header's Search, where focus goes back to when what opened the palette is gone. */
export const HEADER_TRIGGER = 'data-search-trigger'

/**
 * Where focus goes as the palette closes: back to what opened it; to the header's Search if that
 * has gone; and nowhere when nothing had focus (⌘K pressed on the page itself).
 */
function returnTarget(): HTMLElement | false | null {
  const { opener } = paletteState()
  if (!opener || opener === document.body) return false
  if (opener.isConnected && (!('checkVisibility' in opener) || opener.checkVisibility())) {
    return opener
  }
  return document.querySelector<HTMLElement>(`[${HEADER_TRIGGER}]`)
}

/**
 * Listens for ⌘K or Ctrl+K on every page, and shows the palette when anything opens it. Mounted
 * once, by the header's Search. The palette's code and the index load only on intent (⌘K, or
 * a pointer or focus on Search), never with the page: loaded when idle they cost every visit's
 * start-up time (Lighthouse's Total Blocking Time). ⌘K before they arrive opens the palette as
 * soon as they do, with whatever was typed meanwhile in its field.
 */
export function PaletteHost({ searchPath }: { searchPath: Route }) {
  const [open, setOpen] = useState(false)
  const [Palette, setPalette] = useState<ComponentType<PaletteProps>>()
  const pathname = usePathname()

  // A chosen result's page is shown: the palette, faded as the page turned, closes.
  useEffect(() => {
    closePalette()
  }, [pathname])

  useEffect(() => {
    // Opening renders as a transition: the press is answered at once, and the card follows.
    const load = () =>
      loadPalette().then(
        (component) => startTransition(() => setPalette(() => component)),
        () => undefined,
      )
    const unsubscribe = subscribe(() => {
      const next = paletteState().open
      if (next) {
        prepareSearch()
        void load()
      }
      // Closing is at once, so it never shares a transition (and a page turn) with a navigation.
      if (next) startTransition(() => setOpen(true))
      else setOpen(false)
    })
    const onKeyDown = (event: KeyboardEvent) => {
      if (isShortcut(event)) {
        event.preventDefault()
        if (paletteState().open) closePalette()
        else openPalette()
        return
      }
      // Typed after ⌘K but before the field is there: kept for the field.
      if (!paletteState().open || isFieldReady() || event.isComposing) return
      if (event.key === 'Escape') closePalette()
      else if (event.key === 'Backspace') typeAhead((typed) => typed.slice(0, -1))
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        typeAhead((typed) => typed + event.key)
      } else return
      event.preventDefault()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      unsubscribe()
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  if (!Palette) return null
  return (
    <Palette
      open={open}
      onOpenChange={(next) => {
        if (!next) closePalette()
      }}
      finalFocus={returnTarget}
      searchPath={searchPath}
    />
  )
}
