import type { ReactNode } from 'react'

import type { Inline, NumberedReference } from '@/content'

import { LinkPreview, type PreviewPayload } from '../preview/LinkPreview'
import { citedIn } from './in-text-citations'

/** A citation the page can link: its entry's anchor, and what its preview card shows. */
export interface CitedEntry {
  anchor: string
  preview: PreviewPayload
}

/** In-text citations as written inside their parentheses ("Tomar, 2024"), each to its entry. */
export type CitationLinks = Readonly<Record<string, CitedEntry>>

/**
 * The citations a page can link: those whose Reference the page lists, each to that entry's
 * anchor (`ref-<id>`), so every link lands on the page, with the Reference's title to preview.
 */
export function citationLinks(
  citations: Readonly<Record<string, string>>,
  references: readonly NumberedReference[],
): CitationLinks {
  const entries = new Map(
    references.map((reference): [string, CitedEntry] => [
      reference.id,
      {
        anchor: reference.anchor,
        preview: { kind: 'reference', name: reference.label, text: reference.title },
      },
    ]),
  )
  return Object.fromEntries(
    Object.entries(citations).flatMap(([text, id]) => {
      const entry = entries.get(id)
      return entry === undefined ? [] : [[text, entry]]
    }),
  )
}

const DEVANAGARI = '\\u0900-\\u097F\\uA8E0-\\uA8FF\\u1CD0-\\u1CFF'
/** A run of Devanagari: from one letter to the last, across spaces, joiners and "||". */
const DEVANAGARI_RUN = new RegExp(
  `[${DEVANAGARI}](?:[${DEVANAGARI}\\s\\u200C\\u200D|]*[${DEVANAGARI}])?`,
  'gu',
)
/** Plain text with each Devanagari run tagged, so it is read and set as Sanskrit (WCAG 3.1.2). */
function scripts(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let at = 0
  for (const match of text.matchAll(DEVANAGARI_RUN)) {
    if (match.index > at) nodes.push(text.slice(at, match.index))
    nodes.push(
      <span key={`${key}-${match.index}`} lang="sa-Deva">
        {match[0]}
      </span>,
    )
    at = match.index + match[0].length
  }
  if (at < text.length) nodes.push(text.slice(at))
  return nodes
}

/**
 * Running text (a record's `Inline`): Devanagari runs carry `lang="sa-Deva"`, and each in-text
 * citation the page can link ("Tomar, 2024") leads to its entry in the page's References, with
 * a preview of the entry on hover and focus.
 */
export function Text({ text, citations = {} }: { text: Inline; citations?: CitationLinks }) {
  const nodes: ReactNode[] = []
  let at = 0
  for (const { start, cited, entry } of citedIn(text, citations)) {
    nodes.push(...scripts(text.slice(at, start), String(at)))
    nodes.push(
      <LinkPreview key={`cite-${start}`} preview={entry.preview}>
        <a href={`#${entry.anchor}`}>{cited}</a>
      </LinkPreview>,
    )
    at = start + cited.length
  }
  nodes.push(...scripts(text.slice(at), String(at)))
  // Plain text stays a plain string, which keeps the page's payload light.
  return nodes.length === 1 ? nodes[0] : <>{nodes}</>
}
