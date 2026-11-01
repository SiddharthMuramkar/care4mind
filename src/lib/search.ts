import type { SearchDocument } from '@/content'
import { stripDiacritics } from '@/lib/sanskrit'

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
