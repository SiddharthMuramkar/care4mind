/**
 * How the site names things: pure helpers shared by the views, the derivations and the graph.
 */
import { stripDiacritics } from '@/lib/sanskrit'
import { capitalise } from '@/lib/text'

import type { PassageRecord, ReferenceRecord, SanskritName, WorkRecord } from './schema'

/**
 * The name a heading leads with (D07): the capitalised IAST term if there is one, otherwise the
 * English title. `vikṣepa` → "Vikṣepa"; a Concept with no term → its English title.
 */
export function displayName(name: {
  term?: { iast: string; devanagari?: string; ascii?: readonly string[] }
  english?: string
}): string {
  if (name.term) return capitalise(name.term.iast)
  return name.english ?? ''
}

/**
 * Every plain-keyboard spelling of a term: its IAST with diacritics removed
 * (NFR-03's minimum), then the spellings stored with it, without repeats.
 */
export function asciiSpellings(term: SanskritName): readonly string[] {
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

/** A passage named by its work and locator: "Yoga Sūtra 1.30". */
export function passageLabel(passage: PassageRecord, work: WorkRecord): string {
  return `${displayName({ term: work.title })} ${passage.locator}`
}

/** Initials as reference lists write them: "R.", "Y. D. A. B.", "L. V. G.". */
const INITIALS = /^(?:\p{Lu}\.\s*-?)+$/u

/**
 * The names in a Reference's free-text authors, without initials: "Jain, R., & Diwakar, A." →
 * Jain and Diwakar. An organisation's name ("APA Dictionary of Psychology") stays whole.
 */
export function authorNames(authors: string): string[] {
  return authors
    .split(/\s*[,&]\s*/)
    .map((part) => part.trim())
    .filter((part) => part !== '' && !INITIALS.test(part) && !/^et al\.?$/i.test(part))
}

/**
 * A Reference in brief, as an in-text citation names it: "Rao (2001)", "Jain & Diwakar (2019)",
 * "Thapliyal et al. (2023)". A Reference with no authors goes by its title.
 */
export function referenceLabel(reference: ReferenceRecord): string {
  const names = reference.authors === undefined ? [] : authorNames(reference.authors)
  const etAl = /\bet al\b/i.test(reference.authors ?? '')
  const [first, second] = names
  const who =
    first === undefined
      ? reference.title
      : names.length > 2 || etAl
        ? `${first} et al.`
        : second === undefined
          ? first
          : `${first} & ${second}`
  const year = reference.year?.split(',')[0]?.trim()
  return year ? `${who} (${year})` : who
}
