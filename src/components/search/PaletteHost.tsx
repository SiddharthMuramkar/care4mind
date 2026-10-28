'use client'

import type { Route } from 'next'
import { type ComponentType, startTransition, useEffect, useState } from 'react'

import { whenIdle } from '@/components/nav/current'

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

/** Runs something once the page has loaded and the browser is idle, never before first paint. */
function afterLoad(work: () => void): () => void {
  let cancel = () => {}
  const idle = () => {
    cancel = whenIdle(work)
  }
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
  return () => {
    window.removeEventListener('load', idle)
    cancel()
  }
}

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
 * once, by the header's Search. The palette's code and the index load on intent or when the
 * browser is idle after the page has loaded; a press before they arrive opens the palette as
 * soon as they do, with whatever was typed meanwhile in its field.
 */
export function PaletteHost({ searchPath }: { searchPath: Route }) {
  const [open, setOpen] = useState(false)
  const [Palette, setPalette] = useState<ComponentType<PaletteProps>>()

  useEffect(() => {
    // Opening renders as a transition: the press is answered at once, and the card follows.
    const load = () =>
      loadPalette().then(
        (component) => setPalette(() => component),
        () => undefined,
      )
    const unsubscribe = subscribe(() => {
      const next = paletteState().open
      if (next) {
        prepareSearch()
        void load()
      }
      startTransition(() => setOpen(next))
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
    const cancel = afterLoad(() => {
      prepareSearch()
      void load()
    })
    return () => {
      unsubscribe()
      document.removeEventListener('keydown', onKeyDown)
      cancel()
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
