import type { ConceptCard, LatinScript, NumberedReference, VerseView } from '@/content'

import type { PreviewPayload } from './LinkPreview'

/** The names a link shows its Concept by: its own, or an A–Z entry's when the link is that entry. */
export interface PreviewNames {
  name: string
  lang?: LatinScript
  devanagari?: string
  gloss?: string
}

/**
 * What a Concept link's preview shows: its name, its Devanagari, its gloss, its topic and
 * reading time, and its summary.
 */
export function conceptPreview(
  concept: ConceptCard,
  names: PreviewNames = {
    name: concept.name,
    ...(concept.lang ? { lang: concept.lang } : {}),
    ...(concept.term?.devanagari ? { devanagari: concept.term.devanagari } : {}),
    ...(concept.gloss ? { gloss: concept.gloss } : {}),
  },
): PreviewPayload {
  return {
    kind: 'concept',
    name: names.name,
    ...(names.lang ? { lang: names.lang } : {}),
    ...(names.devanagari ? { devanagari: names.devanagari } : {}),
    ...(names.gloss ? { gloss: names.gloss } : {}),
    topic: concept.topic,
    readingMinutes: concept.readingMinutes,
    text: concept.summary,
  }
}

/** What a verse link's preview shows: its locator, its first line in Devanagari, its translation. */
export function passagePreview(
  label: string,
  lang: LatinScript,
  verse?: VerseView,
): PreviewPayload {
  const text = verse?.translation || verse?.meaning
  const devanagari = verse?.devanagari[0]
  return {
    kind: 'passage',
    name: label,
    lang,
    ...(devanagari ? { devanagari } : {}),
    ...(text ? { text } : {}),
  }
}

/** What a citation's preview shows: the Reference's label and its title. */
export function referencePreview(reference: NumberedReference): PreviewPayload {
  return { kind: 'reference', name: reference.label, text: reference.title }
}
