import type { ReactElement } from 'react'

import type { LatinScript } from '@/content'

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
 * Slot, added by front-end-site ticket 04 and filled by ticket 05: gives a link to a Concept, a
 * glossary entry with a Concept page, a citation or a verse a preview card on hover and focus,
 * opened through the page's one LinkPreviewRoot. The data comes with the page, so it never waits
 * on the network. This stub renders the link alone.
 */
export function LinkPreview({ children }: LinkPreviewProps) {
  return children
}
