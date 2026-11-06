'use client'

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'

import { whenIdle } from '@/components/browser'

/**
 * Swap an island's plain controls for their keyboard parts (Base UI), loaded when the browser is
 * idle or a pointer or focus comes near. Spread `handlers` on the island's root, and give it
 * `controls`. A control that has focus as the swap lands hands it on to its twin, found by its
 * `data-chip` or `data-rail`; without scrolling, as the twin stands where the control stood.
 */
export function useKeyboardParts<Parts>(load: () => Promise<Parts>) {
  const [parts, setParts] = useState<Parts>()
  const controls = useRef<HTMLDivElement>(null)
  const handoff = useRef<string | undefined>(undefined)

  // A press under way when the parts arrive finishes on the plain control first: swapping the
  // button between its pointerdown and its click would lose the press.
  const pressing = useRef(false)
  const waiting = useRef<(() => void) | undefined>(undefined)
  const release = useCallback(() => {
    setTimeout(() => {
      pressing.current = false
      waiting.current?.()
      waiting.current = undefined
    })
  }, [])
  const hold = useCallback(() => {
    pressing.current = true
    // A press that ends outside the island (dragged away) lets go soon all the same.
    setTimeout(release, 1000)
  }, [release])
  const holdForKey = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === ' ' || key === 'Enter') hold()
    },
    [hold],
  )

  const upgrade = useCallback(() => {
    void load().then((loaded) => {
      const swap = () => {
        const focused = document.activeElement
        if (focused instanceof HTMLElement && controls.current?.contains(focused))
          handoff.current = focused.dataset.chip ?? focused.dataset.rail
        setParts(() => loaded)
      }
      if (pressing.current) waiting.current = swap
      else swap()
    })
  }, [load])

  useEffect(() => whenIdle(upgrade), [upgrade])

  useEffect(() => {
    const key = handoff.current
    if (!parts || !key) return
    handoff.current = undefined
    controls.current
      ?.querySelector<HTMLElement>(`[data-chip="${key}"], [data-rail="${key}"]`)
      ?.focus({ preventScroll: true })
  }, [parts])

  const handlers = parts
    ? {}
    : {
        onPointerEnter: upgrade,
        onFocus: upgrade,
        onPointerDown: hold,
        onKeyDown: holdForKey,
        onPointerUp: release,
        onPointerCancel: release,
        onKeyUp: release,
      }

  return { parts, controls, handlers }
}
