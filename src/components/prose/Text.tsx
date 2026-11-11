import type { ReactNode } from 'react'

import type { Inline, NumberedReference } from '@/content'

import { LinkPreview, referencePreview, type PreviewPayload } from '../preview'
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
      { anchor: reference.anchor, preview: referencePreview(reference) },
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
/** A slash joining two words ("Psychoanalysis/Psychodynamic"), which a line may break after. */
const JOINING_SLASH = /\/(?=\S)/g

/** Plain text with a line-break opportunity (`<wbr>`) after each slash that joins two words. */
function slashBreaks(text: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let at = 0
  for (const match of text.matchAll(JOINING_SLASH)) {
    const end = match.index + 1
    nodes.push(text.slice(at, end), <wbr key={`${key}-wbr-${match.index}`} />)
    at = end
  }
  if (at < text.length) nodes.push(text.slice(at))
  return nodes
}

/**
 * Plain text with each Devanagari run tagged, so it is read and set as Sanskrit (WCAG 3.1.2),
 * and, where asked, a line allowed to break after each slash between two words.
 */
function scripts(text: string, key: string, breakAfterSlash: boolean): ReactNode[] {
  const nodes: ReactNode[] = []
  const plain = (from: number, to: number) => {
    const piece = text.slice(from, to)
    nodes.push(...(breakAfterSlash ? slashBreaks(piece, `${key}-${from}`) : [piece]))
  }
  let at = 0
  for (const match of text.matchAll(DEVANAGARI_RUN)) {
    if (match.index > at) plain(at, match.index)
    nodes.push(
      <span key={`${key}-${match.index}`} lang="sa-Deva">
        {match[0]}
      </span>,
    )
    at = match.index + match[0].length
  }
  if (at < text.length) plain(at, text.length)
  return nodes
}

/**
 * Running text (a record's `Inline`): Devanagari runs carry `lang="sa-Deva"`, and each in-text
 * citation the page can link ("Tomar, 2024") leads to its entry in the page's References, with
 * a preview of the entry on hover and focus. With `breakAfterSlash`, as a table's narrow cells
 * set it, a line may break after each slash between two words ("Psychoanalysis/" then
 * "Psychodynamic") rather than inside one; the stored text is left as it is.
 */
export function Text({
  text,
  citations = {},
  breakAfterSlash = false,
}: {
  text: Inline
  citations?: CitationLinks
  breakAfterSlash?: boolean
}) {
  const nodes: ReactNode[] = []
  let at = 0
  for (const { start, cited, entry } of citedIn(text, citations)) {
    nodes.push(...scripts(text.slice(at, start), String(at), breakAfterSlash))
    nodes.push(
      <LinkPreview key={`cite-${start}`} preview={entry.preview}>
        <a href={`#${entry.anchor}`}>{cited}</a>
      </LinkPreview>,
    )
    at = start + cited.length
  }
  nodes.push(...scripts(text.slice(at), String(at), breakAfterSlash))
  // Plain text stays a plain string, which keeps the page's payload light.
  return nodes.length === 1 ? nodes[0] : <>{nodes}</>
}
