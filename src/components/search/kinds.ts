import type { SearchKind } from '@/content'
import type { SearchHit } from '@/lib/search/search'
import { fold } from '@/lib/search/normalise'

/** Each kind of result under its heading, as the palette and the results page show them. */
export const KIND_HEADINGS: Record<SearchKind, string> = {
  concept: 'Concepts',
  term: 'Terms in Concepts',
  topic: 'Topics',
  glossary: 'Glossary',
  work: 'Texts',
  passage: 'Verses',
  questionnaire: 'Questionnaires',
  reference: 'References',
  'library-item': 'In the Library',
  page: 'Pages',
}

export interface HitGroup {
  kind: SearchKind
  heading: string
  hits: SearchHit[]
}

/** Hits in their groups, in the order search gave them (the best group first). */
export function groupByKind(hits: readonly SearchHit[]): HitGroup[] {
  const groups = new Map<SearchKind, HitGroup>()
  for (const hit of hits) {
    const group = groups.get(hit.kind)
    if (group) group.hits.push(hit)
    else groups.set(hit.kind, { kind: hit.kind, heading: KIND_HEADINGS[hit.kind], hits: [hit] })
  }
  return [...groups.values()]
}

/** Real searches to try (design C2), each a different way in. */
export const SUGGESTIONS: readonly { query: string; lang?: string }[] = [
  { query: 'vikshepa' },
  { query: 'विक्षेप', lang: 'sa-Deva' },
  { query: 'YS 1.30' },
  { query: 'Tomar' },
]

const DEVANAGARI = /[\u0900-\u097f]/
/** IAST's own letters: a title holding one is a transliteration, read as Sanskrit. */
const IAST = /[āīūṛṝḷḹṅñṭḍṇśṣṃḥ]/iu

/** The language tag a title or spelling needs: Devanagari, IAST, or none (English). */
export function langOf(text: string): 'sa-Deva' | 'sa-Latn' | undefined {
  if (DEVANAGARI.test(text)) return 'sa-Deva'
  return IAST.test(text) ? 'sa-Latn' : undefined
}

/**
 * The spelling worth showing beside a hit ("matched Sanshay"): the one that found it, unless the
 * title already shows it, diacritics aside.
 */
export function shownVariant(hit: SearchHit): string | undefined {
  const { variant } = hit.matched
  return fold(hit.title).includes(fold(variant)) ? undefined : variant
}

/**
 * How a hit's chip names the way it was found: "matched Sanshay" for a spelling or locator, "by
 * Tomar" for an author, "cites Tomar" for a Concept citing them, "mentions" for its text.
 */
export function matchLabel(hit: SearchHit): string {
  const { field } = hit.matched
  if (field === 'people') return hit.kind === 'concept' ? 'cites' : 'by'
  return field === 'excerpt' ? 'mentions' : 'matched'
}

/** "1 result", "12 results". */
export const resultCount = (count: number) => `${count} ${count === 1 ? 'result' : 'results'}`
