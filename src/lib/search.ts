import type { SearchDocument, SearchKind } from '@/content'
import { stripDiacritics } from '@/lib/sanskrit'

/** One thing found: what a result line needs, whichever engine found it. */
export interface SearchHit {
  id: string
  kind: SearchKind
  title: string
  href: string
  parent?: string
  lang?: SearchDocument['lang']
}

/** The one way the search page asks: a query in, hits out, so a later engine can answer instead. */
export type Search = (query: string) => Promise<readonly SearchHit[]>

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
const fold = (text: string) => stripDiacritics(text.normalize('NFC')).toLowerCase()

/** The documents whose name, title, keyword or author holds the query, diacritics and case ignored. */
export function documentsMatching(
  documents: readonly SearchDocument[],
  query: string,
): SearchDocument[] {
  const folded = fold(query.trim())
  if (folded === '') return []
  return documents.filter(({ title, names, keywords, people }) =>
    [title, ...names, ...keywords, ...people].some((field) => fold(field).includes(folded)),
  )
}

function hitOf({ id, kind, title, href, parent, lang }: SearchDocument): SearchHit {
  return { id, kind, title, href, ...(parent ? { parent } : {}), ...(lang ? { lang } : {}) }
}

/** Today's Search: a substring match over the documents. */
export function substringSearch(documents: readonly SearchDocument[]): Search {
  return async (query) => documentsMatching(documents, query).map(hitOf)
}

/** One kind's results, as the page shows them. */
export interface ResultGroup {
  kind: SearchKind
  heading: string
  /** At most SHOWN of this kind. */
  results: readonly SearchHit[]
  /** How many matched, including those past the cap. */
  total: number
}

/** The hits grouped by kind in page order, empty kinds dropped, the first SHOWN of each kept. */
export function resultGroups(hits: readonly SearchHit[]): readonly ResultGroup[] {
  return KINDS.map(({ kind, heading }) => {
    const matched = hits.filter((hit) => hit.kind === kind)
    return { kind, heading, results: matched.slice(0, SHOWN), total: matched.length }
  }).filter(({ total }) => total > 0)
}
