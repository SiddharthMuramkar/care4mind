import type { SearchDocument, SearchKind } from '@/content'
import { stripDiacritics } from '@/lib/sanskrit'

/**
 * One thing found. The palette and a later engine return this same shape; the page's
 * substring matcher is the first thing that does.
 */
export interface SearchHit {
  id: string
  kind: SearchKind
  title: string
  href: string
  parent?: string
  lang?: SearchDocument['lang']
}

/**
 * The one way the search page asks (the archive's seam): a query in, hits out. A content
 * back end can answer it later without the page changing.
 */
export type Search = (q: string) => Promise<readonly SearchHit[]>

/** Each kind of result, in the order the page shows them. */
const KINDS: readonly { kind: SearchKind; heading: string }[] = [
  { kind: 'concept', heading: 'Concepts' },
  { kind: 'term', heading: 'Terms inside Concepts' },
  { kind: 'topic', heading: 'Topics' },
  { kind: 'glossary', heading: 'Glossary' },
  { kind: 'work', heading: 'Texts' },
  { kind: 'passage', heading: 'Verses' },
  { kind: 'questionnaire', heading: 'Questionnaires' },
  { kind: 'reference', heading: 'References' },
  { kind: 'library-item', heading: 'In the Library' },
  { kind: 'page', heading: 'Pages' },
]

/** The most results shown of one kind. */
export const SHOWN = 25

/** For matching: one form, lower case, no diacritics. */
export const fold = (text: string) => stripDiacritics(text.normalize('NFC')).toLowerCase()

/** Whether a name, title, keyword or author holds the query. */
function holds(document: SearchDocument, query: string): boolean {
  const { title, names, keywords, people } = document
  return [title, ...names, ...keywords, ...people].some((field) => fold(field).includes(query))
}

function hitOf(document: SearchDocument): SearchHit {
  return {
    id: document.id,
    kind: document.kind,
    title: document.title,
    href: document.href,
    ...(document.parent ? { parent: document.parent } : {}),
    ...(document.lang ? { lang: document.lang } : {}),
  }
}

/** Today's matcher: a substring, diacritics and case ignored, kinds in page order. */
export function substringHits(
  documents: readonly SearchDocument[],
  query: string,
): readonly SearchHit[] {
  const folded = fold(query.trim())
  if (folded === '') return []
  const found = documents.filter((document) => holds(document, folded))
  return KINDS.flatMap(({ kind }) => found.filter((document) => document.kind === kind).map(hitOf))
}

/** The substring matcher as a Search. */
export function substringSearch(documents: readonly SearchDocument[]): Search {
  return async (q) => substringHits(documents, q)
}

export interface ResultGroup {
  kind: SearchKind
  heading: string
  /** At most SHOWN of this kind. */
  results: readonly SearchHit[]
  /** How many matched, including those past the cap. */
  total: number
}

/** Groups hits by kind, dropping empty kinds and keeping only the first SHOWN of each. */
export function groupHits(hits: readonly SearchHit[], shown = SHOWN): readonly ResultGroup[] {
  return KINDS.map(({ kind, heading }) => {
    const matched = hits.filter((hit) => hit.kind === kind)
    return { kind, heading, results: matched.slice(0, shown), total: matched.length }
  }).filter((group) => group.total > 0)
}
