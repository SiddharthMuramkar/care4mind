import type { ReactNode } from 'react'

import type { Inline, NumberedReference } from '@/content'

import { LinkPreview, type PreviewPayload } from '../preview/LinkPreview'

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
/**
 * Each pair of parentheses, where in-text citations sit ("(Tomar, 2024; Rao, 2001)"): its text
 * and where that starts, outer pairs before those nested in them, as the content module reads them.
 */
function parenthesised(text: string): { start: number; inside: string }[] {
  const open: number[] = []
  const pairs: { start: number; inside: string }[] = []
  for (let at = 0; at < text.length; at++) {
    if (text[at] === '(') open.push(at)
    else if (text[at] === ')') {
      const start = open.pop()
      if (start !== undefined) pairs.push({ start: start + 1, inside: text.slice(start + 1, at) })
    }
  }
  return pairs.sort((a, b) => a.start - b.start)
}

/** Where each citation the page can link sits in the text, in reading order, none overlapping. */
function citedIn(text: string, citations: CitationLinks) {
  const found: { start: number; cited: string; entry: CitedEntry }[] = []
  for (const { start, inside } of parenthesised(text)) {
    let offset = start
    for (const part of inside.split(';')) {
      const cited = part.trim()
      const entry = citations[cited]
      if (entry !== undefined) found.push({ start: offset + part.indexOf(cited), cited, entry })
      offset += part.length + 1
    }
  }
  let end = 0
  return found
    .sort((a, b) => a.start - b.start)
    .filter(({ start, cited }) => {
      if (start < end) return false
      end = start + cited.length
      return true
    })
}

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
