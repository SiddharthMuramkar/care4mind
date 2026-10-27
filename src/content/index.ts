/**
 * The content module: the only way pages read content.
 *
 * Today it reads typed files in this folder. When the Architecture review picks
 * a content back end, these functions are reimplemented against it and no page
 * changes. That is why they are async already.
 */
import { stripDiacritics } from '@/lib/sanskrit'

import { vikshepa } from './concepts/vikshepa'
import { homepage } from './home'
import { karmayogaScale } from './questionnaires/karmayoga-scale'
import type { Concept, Homepage, Questionnaire, SanskritTerm } from './types'

export type * from './types'

const concepts: readonly Concept[] = [vikshepa]
const questionnaires: readonly Questionnaire[] = [karmayogaScale]

export async function getConcept(slug: string): Promise<Concept | null> {
  return concepts.find((concept) => concept.slug === slug) ?? null
}

export async function listConcepts(): Promise<readonly Concept[]> {
  return concepts
}

export async function getQuestionnaire(slug: string): Promise<Questionnaire | null> {
  return questionnaires.find((questionnaire) => questionnaire.slug === slug) ?? null
}

export async function listQuestionnaires(): Promise<readonly Questionnaire[]> {
  return questionnaires
}

export async function getHomepage(): Promise<Homepage> {
  return homepage
}

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
