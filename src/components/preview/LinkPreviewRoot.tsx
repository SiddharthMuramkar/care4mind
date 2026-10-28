'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

import { getNoParts, getParts, provide, subscribe, whenWanted } from './store'

type Card = typeof import('./PreviewCard')
let loaded: Card | undefined
let card: Promise<Card> | undefined
/** The card's code, fetched once. */
const code = () =>
  (card ??= import('./PreviewCard').then((module) => {
    loaded = module
    return module
  }))

const span = (key: string) =>
  document.querySelector<HTMLElement>(`[data-preview="${CSS.escape(key)}"]`)

/** The LinkPreview span an event happened in, if any: its key. */
const keyOf = (target: EventTarget | null) =>
  target instanceof Element
    ? target.closest<HTMLElement>('[data-preview]')?.dataset.preview
    : undefined

/** Whether a page turn or other view transition is running, which redrawing links would cut short. */
const turning = () => Boolean((document as { activeViewTransition?: unknown }).activeViewTransition)

/**
 * Fetches the card's code at the first sign of a mouse or keyboard (never touch), and swaps the
 * triggers in once a pointer or keyboard focus reaches a link to preview, while no button is held
 * and no page turn is under way. The links are drawn again: focus goes back to the link that had
 * it, and the one under the pointer opens its card after the usual pause.
 */
function listen(): () => void {
  const options = { capture: true, passive: true }
  const events = ['pointermove', 'keydown', 'pointerdown', 'pointerup', 'pointerover', 'focusin']
  let pressed = false
  let reached: { key: string; focused: boolean } | undefined
  const stop = () => events.forEach((type) => document.removeEventListener(type, on, options))

  function still({ key, focused }: { key: string; focused: boolean }) {
    return focused ? keyOf(document.activeElement) === key : span(key)?.matches(':hover')
  }
  function swap() {
    if (!loaded || !reached || pressed || turning() || !still(reached)) return
    const { key, focused } = reached
    const { parts, OPEN_DELAY } = loaded
    stop()
    flushSync(() => provide(parts))
    if (focused) {
      span(key)?.querySelector('a')?.focus()
    } else {
      setTimeout(() => {
        if (span(key)?.matches(':hover')) parts.handle.open(key)
      }, OPEN_DELAY)
    }
  }
  function on(event: Event) {
    if (event instanceof PointerEvent && event.pointerType === 'touch') return
    if (event.type === 'pointerdown') pressed = true
    else if (event.type === 'pointerup') pressed = false
    else if (event.type === 'pointerover' || event.type === 'focusin') {
      const key = keyOf(event.target)
      const visible =
        event.type === 'pointerover' || (event.target as Element).matches(':focus-visible')
      if (key === undefined || !visible) return
      reached = { key, focused: event.type === 'focusin' }
      swap()
    }
    void code().then(swap)
  }
  events.forEach((type) => document.addEventListener(type, on, options))
  return stop
}

/**
 * The one preview card every LinkPreview on a page opens (front-end-site ticket 05), mounted
 * once in the root layout. A page with no LinkPreview never loads it; one with them fetches it
 * when a mouse moves or a key is pressed, so touch screens never do.
 */
export function LinkPreviewRoot() {
  const parts = useSyncExternalStore(subscribe, getParts, getNoParts)
  useEffect(() => {
    let stop = () => {}
    const unwatch = whenWanted(() => {
      stop = listen()
    })
    return () => {
      unwatch()
      stop()
    }
  }, [])
  return parts ? <parts.Card /> : null
}
