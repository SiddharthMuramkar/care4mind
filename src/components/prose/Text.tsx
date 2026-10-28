import type { ReactNode } from 'react'

import type { Inline, NumberedReference } from '@/content'

/** In-text citations as written inside their parentheses ("Tomar, 2024"), each to its entry's anchor. */
export type CitationLinks = Readonly<Record<string, string>>

/**
 * The citations a page can link: those whose Reference the page lists, each to that entry's
 * anchor (`ref-<id>`), so every link lands on the page.
 */
export function citationLinks(
  citations: Readonly<Record<string, string>>,
  references: readonly NumberedReference[],
): CitationLinks {
  const anchors = new Map(references.map((reference) => [reference.id, reference.anchor]))
  return Object.fromEntries(
    Object.entries(citations).flatMap(([text, id]) => {
      const anchor = anchors.get(id)
      return anchor === undefined ? [] : [[text, anchor]]
    }),
  )
}

const DEVANAGARI = '\\u0900-\\u097F\\uA8E0-\\uA8FF\\u1CD0-\\u1CFF'
/** A run of Devanagari: from one letter to the last, across spaces, joiners and "||". */
const DEVANAGARI_RUN = new RegExp(
  `[${DEVANAGARI}](?:[${DEVANAGARI}\\s\\u200C\\u200D|]*[${DEVANAGARI}])?`,
  'gu',
)
/** The innermost parentheses, where in-text citations sit: "(Tomar, 2024; Rao, 2001)". */
const PARENTHESES = /\(([^()]+)\)/g

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
 * citation the page can link ("Tomar, 2024") leads to its entry in the page's References.
 */
export function Text({ text, citations = {} }: { text: Inline; citations?: CitationLinks }) {
  const nodes: ReactNode[] = []
  let at = 0
  for (const match of text.matchAll(PARENTHESES)) {
    let offset = match.index + 1
    for (const part of (match[1] ?? '').split(';')) {
      const cited = part.trim()
      const anchor = citations[cited]
      if (anchor !== undefined) {
        const start = offset + part.indexOf(cited)
        nodes.push(...scripts(text.slice(at, start), String(at)))
        nodes.push(
          <a key={`cite-${start}`} href={`#${anchor}`}>
            {cited}
          </a>,
        )
        at = start + cited.length
      }
      offset += part.length + 1
    }
  }
  nodes.push(...scripts(text.slice(at), String(at)))
  // Plain text stays a plain string, which keeps the page's payload light.
  return nodes.length === 1 ? nodes[0] : <>{nodes}</>
}
