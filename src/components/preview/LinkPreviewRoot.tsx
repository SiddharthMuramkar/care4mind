'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

import { getNoParts, getParts, provide, subscribe, whenWanted } from './store'

/** Waits for a sign of a mouse or keyboard, never touch, then calls `load` once. */
function onIntent(load: () => void): () => void {
  const options = { capture: true, passive: true }
  const stop = () => {
    document.removeEventListener('pointermove', onPointer, options)
    document.removeEventListener('keydown', go, options)
    document.removeEventListener('focusin', onFocus, options)
  }
  function go() {
    stop()
    load()
  }
  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'touch') go()
  }
  function onFocus(event: FocusEvent) {
    if (event.target instanceof Element && event.target.matches(':focus-visible')) go()
  }
  document.addEventListener('pointermove', onPointer, options)
  document.addEventListener('keydown', go, options)
  document.addEventListener('focusin', onFocus, options)
  return stop
}

/** Turns every LinkPreview into its trigger, keeping focus on the link that had it. */
async function load() {
  const { parts } = await import('./PreviewCard')
  const focused = document.activeElement
  const key = focused?.closest<HTMLElement>('[data-preview]')?.dataset.preview
  flushSync(() => provide(parts))
  if (key !== undefined) {
    document.querySelector<HTMLElement>(`[data-preview="${CSS.escape(key)}"] a`)?.focus()
  }
}

/**
 * The one preview card every LinkPreview on a page opens (front-end-site ticket 05), mounted
 * once in the root layout. A page with no LinkPreview never loads it; one with them loads it
 * when a mouse moves or a key is pressed, so touch screens never do.
 */
export function LinkPreviewRoot() {
  const parts = useSyncExternalStore(subscribe, getParts, getNoParts)
  useEffect(() => {
    let stop = () => {}
    const unwatch = whenWanted(() => {
      stop = onIntent(() => void load())
    })
    return () => {
      unwatch()
      stop()
    }
  }, [])
  return parts ? <parts.Card /> : null
}
