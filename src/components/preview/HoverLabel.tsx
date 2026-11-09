'use client'

import { useEffect, useId, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'

import { CLOSE_DELAY, LABEL_OPEN_DELAY } from './delays'
import { getNoParts, getParts, subscribe, want } from './store'

/** What a hover label shows and how it looks: both the caller's, so it can match what it names. */
export interface HoverLabelPayload {
  content: ReactNode
  className: string | undefined
  /** Its colours, as the caller's `className` reads them from `data-tone`. */
  tone: string | undefined
}

export interface HoverLabelProps {
  /** What the list item holds: a link to follow. */
  children: ReactNode
  className: string | undefined
  style: CSSProperties
  label: HoverLabelPayload
}

/**
 * A list item with a hover label: a line set across the page, on hover and keyboard focus, for
 * text that is hard to read where it stands (a book's title up its spine). Opened through the
 * page's one LinkPreviewRoot, and like a preview it repeats what is already in the page, so
 * a phone never loads it. The list item is the trigger, so the list's layout does not change.
 */
export function HoverLabel({ children, className, style, label }: HoverLabelProps) {
  const parts = useSyncExternalStore(subscribe, getParts, getNoParts)
  // Names the item across the swap, so focus can be put back on its link.
  const key = useId()
  useEffect(want, [])
  const item = { className, style, 'data-preview': key, 'data-hover-label-trigger': '' }
  if (!parts) return <li {...item}>{children}</li>
  const { Trigger, handle } = parts.label
  return (
    <Trigger
      handle={handle}
      payload={label}
      delay={LABEL_OPEN_DELAY}
      closeDelay={CLOSE_DELAY}
      id={key}
      render={<li {...item} />}
    >
      {children}
    </Trigger>
  )
}
