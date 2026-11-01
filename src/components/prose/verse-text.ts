import type { VerseView } from '@/content'

/** A verse as plain text to copy: its Devanagari, transliteration, translation and locator. */
export function verseAsText(verse: VerseView): string {
  const translation = verse.translation
    ? `${verse.translation}${verse.translationSource ? ` (${verse.translationSource})` : ''}`
    : ''
  return [verse.devanagari.join('\n'), verse.transliteration.join('\n'), translation, verse.source]
    .filter(Boolean)
    .join('\n\n')
}
