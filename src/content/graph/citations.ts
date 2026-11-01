/**
 * In-text citations, "(Tomar, 2024)": found in a record's running text and resolved against the
 * record's own References.
 */
import { stripDiacritics } from '@/lib/sanskrit'

import type { Block, Inline, ReferenceRecord, Section } from '../schema'

/** An in-text citation, "(Tomar, 2024)", and the Reference it resolves to, if exactly one fits. */
export interface Citation {
  /** As the text writes it, without the parentheses: `Tomar, 2024`. */
  text: string
  /** One of the citing record's own References. */
  reference?: string
}

/** The running text of a list of sections, in reading order, where citations can appear. */
export function textsIn(sections: readonly Section[]): Inline[] {
  const fromBlocks = (blocks: readonly Block[]): Inline[] =>
    blocks.flatMap((block) => {
      switch (block.kind) {
        case 'paragraph':
          return [block.text]
        case 'list':
          return [...block.items]
        case 'term':
          return fromBlocks(block.blocks)
        case 'table':
          return [
            block.caption,
            ...block.rows.flatMap((row) => [
              ...(typeof row.head === 'string' ? [row.head] : []),
              ...row.cells,
            ]),
          ]
        case 'verse':
          return block.quote.meaning === undefined ? [] : [block.quote.meaning]
        case 'topic-intro':
          return []
      }
    })
  return sections.flatMap((section) => [section.heading, ...fromBlocks(section.blocks)])
}

/** For matching: no diacritics, lower case, one kind of dash, single spaces. */
function fold(text: string): string {
  return stripDiacritics(text.normalize('NFC'))
    .toLowerCase()
    .replace(/[‐-―−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasWords(field: string, words: string): boolean {
  const escaped = words.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, 'u').test(field)
}

/**
 * The text inside each pair of parentheses, in reading order: an outer pair before those nested
 * in it, so a citation whose author holds parentheses of its own ("EPRA … (IJMR),” 2019b") is read
 * whole, and one inside a parenthetical aside is still read.
 */
function parenthesised(text: string): string[] {
  const open: number[] = []
  const pairs: { start: number; inside: string }[] = []
  for (let at = 0; at < text.length; at++) {
    if (text[at] === '(') open.push(at)
    else if (text[at] === ')') {
      const start = open.pop()
      if (start !== undefined) pairs.push({ start, inside: text.slice(start + 1, at) })
    }
  }
  return pairs.sort((a, b) => a.start - b.start).map(({ inside }) => inside)
}

/** Author, then year; the comma may sit inside a closing quote: `“A Journal,” 2019b`. */
const WITH_YEAR = /^(.+?),[”"’]?\s*(\d{4}[a-z]?|n\.d\.(?:-[a-z])?)(?:,[^,]+)*$/i
/** Quotation marks around a title standing in for an author. */
const QUOTES = /^[“"‘]+|[”"’]+$/g
const ET_AL = /^(.+?\bet al\.?)$/i

/** The References among `candidates` that an in-text citation's author part and year fit. */
function resolveCitation(
  who: string,
  year: string | undefined,
  candidates: readonly ReferenceRecord[],
): string | undefined {
  const names = fold(who.replace(/\s*\bet al\.?$/i, ''))
    .split(/\s*(?:&|\band\b)\s*/)
    .filter(Boolean)
  const matches = candidates.filter((reference) => {
    if (year !== undefined) {
      const theirs = fold(reference.year ?? '')
      if (theirs !== fold(year) && !theirs.startsWith(`${fold(year)},`)) return false
    }
    const fields = [reference.authors, reference.title].filter((f) => f !== undefined).map(fold)
    return names.every((name) => fields.some((field) => hasWords(field, name)))
  })
  return matches.length === 1 ? matches[0]?.id : undefined
}

/** The in-text citations in some running text, each resolved against the given References. */
export function citationsIn(
  texts: readonly Inline[],
  references: readonly ReferenceRecord[],
): Citation[] {
  const found = new Map<string, Citation>()
  for (const text of texts) {
    for (const inside of parenthesised(text)) {
      for (const part of inside.split(';').map((p) => p.trim())) {
        const dated = WITH_YEAR.exec(part)
        const undated = dated ? null : ET_AL.exec(part)
        const who = (dated?.[1] ?? undated?.[1])?.replace(QUOTES, '')
        if (who === undefined || found.has(part)) continue
        const reference = resolveCitation(who, dated?.[2], references)
        found.set(part, reference === undefined ? { text: part } : { text: part, reference })
      }
    }
  }
  return [...found.values()]
}
