import type { ConceptCard, LatinScript, VerseView } from '@/content'

import type { PreviewPayload } from '../preview'

/** What a Concept link's preview shows: its name, its Devanagari, its gloss and its summary. */
export function conceptPreview(concept: ConceptCard): PreviewPayload {
  return {
    kind: 'concept',
    name: concept.name,
    ...(concept.lang ? { lang: concept.lang } : {}),
    ...(concept.term?.devanagari ? { devanagari: concept.term.devanagari } : {}),
    ...(concept.english && concept.term ? { gloss: concept.english } : {}),
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
