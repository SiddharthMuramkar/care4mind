'use client'

import { useEffect, useId, useSyncExternalStore, type ReactElement } from 'react'

import type { LatinScript } from '@/content'

import { CLOSE_DELAY, OPEN_DELAY } from './delays'
import { getNoParts, getParts, subscribe, want } from './store'

/** What a link's preview card shows. Supplementary only: all of it is on the page the link opens. */
export interface PreviewPayload {
  kind: 'concept' | 'glossary' | 'reference' | 'passage'
  /** A Concept's or glossary entry's name, a citation's authors and year, or a verse's locator. */
  name: string
  /** Set when the name is a transliteration, such as a Concept's IAST. */
  lang?: LatinScript
  devanagari?: string
  /** The English gloss, where there is one. */
  gloss?: string
  /** A short text from the content: a summary, a definition, a Reference's title, a translation. */
  text?: string
}

export interface LinkPreviewProps {
  /** The link itself, as its page renders it (Next's Link or an <a>), with its own props. */
  children: ReactElement
  preview: PreviewPayload
}

/**
 * Gives a link to a Concept, a glossary entry with a Concept page, a citation or a verse a
 * preview card on hover and keyboard focus (front-end-site ticket 05), opened through the
 * page's one LinkPreviewRoot. The data comes with the page, so it never waits on the network.
 *
 * The link sits in an inline span, which becomes a detached Base UI trigger with this payload
 * once a mouse or keyboard is first used: until then the card's code stays away, and a phone
 * never loads it. (The link itself is left as its page made it: an element a server component
 * hands to a client one may arrive unresolved, so it can't be cloned.)
 */
export function LinkPreview({ children, preview }: LinkPreviewProps) {
  const parts = useSyncExternalStore(subscribe, getParts, getNoParts)
  // Names the link's span across the swap, so focus can be put back on the link.
  const key = useId()
  useEffect(want, [])
  if (!parts) return <span data-preview={key}>{children}</span>
  const { Trigger, handle } = parts
  return (
    <Trigger
      handle={handle}
      payload={preview}
      delay={OPEN_DELAY}
      closeDelay={CLOSE_DELAY}
      id={key}
      render={<span data-preview={key} />}
    >
      {children}
    </Trigger>
  )
}
