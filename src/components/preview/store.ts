import type { PreviewCard } from '@base-ui/react/preview-card'
import type { ComponentType } from 'react'

import type { PreviewPayload } from './LinkPreview'

/** What the preview card's code brings once it loads: the card, and the triggers that open it. */
export interface PreviewParts {
  Card: ComponentType
  Trigger: typeof PreviewCard.Trigger
  handle: PreviewCard.Handle<PreviewPayload>
}

// Shared by LinkPreview and LinkPreviewRoot without Base UI itself, which loads only on intent.
let parts: PreviewParts | null = null
const listeners = new Set<() => void>()
let wanted = false
let onWanted: (() => void) | undefined

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getParts = (): PreviewParts | null => parts
export const getNoParts = (): PreviewParts | null => null

/** For the root: the card's code has arrived, so every LinkPreview becomes its trigger. */
export function provide(loaded: PreviewParts): void {
  parts = loaded
  for (const listener of listeners) listener()
}

/** For each LinkPreview: this page has a link to preview, so the card is worth loading. */
export function want(): void {
  if (wanted) return
  wanted = true
  onWanted?.()
}

/** For the root: called once a page has a link to preview (at once if one already has). */
export function whenWanted(callback: () => void): () => void {
  onWanted = callback
  if (wanted) callback()
  return () => {
    if (onWanted === callback) onWanted = undefined
  }
}
