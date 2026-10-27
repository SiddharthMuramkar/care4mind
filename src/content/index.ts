/**
 * The content module's public interface: the only way pages read content (`@/content`).
 *
 * Under it, one content source supplies records (today the generated registry of the files in
 * `data/`; later a CMS) and the graph resolves every link between them once. Ticket 13 adds the
 * collections, views and site derivations here. Until the front-end-site spec moves the pages,
 * the foundation's functions and types come from the legacy adapter, unchanged.
 */
import { stripDiacritics } from '@/lib/sanskrit'

import type { SanskritTerm } from './legacy'

export type {
  Block,
  Comparison,
  Concept,
  Homepage,
  Provenance,
  Questionnaire,
  Reference,
  ReviewStatus,
  SanskritTerm,
  Section,
  Shloka,
} from './legacy'
export {
  getConcept,
  getHomepage,
  getQuestionnaire,
  listConcepts,
  listQuestionnaires,
} from './legacy'

/**
 * Every plain-keyboard spelling of a term: its IAST with diacritics removed
 * (NFR-03's minimum), then the spellings stored with it, without repeats.
 */
export function asciiSpellings(term: SanskritTerm): readonly string[] {
  const seen = new Set<string>()
  const spellings: string[] = []
  for (const spelling of [stripDiacritics(term.iast), ...term.ascii]) {
    const key = spelling.toLowerCase()
    if (key === term.iast.toLowerCase() || seen.has(key)) continue
    seen.add(key)
    spellings.push(spelling)
  }
  return spellings
}
