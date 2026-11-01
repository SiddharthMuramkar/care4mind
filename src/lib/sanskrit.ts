/**
 * Sanskrit text rules shared by content and display.
 *
 * Stored text is NFC: one precomposed character per letter. Decomposed text
 * renders with misplaced marks in some browsers (ticket 07), and NFC is what
 * search will match against.
 *
 * Anusvara is written ṃ (m with dot below), never ṁ (m with dot above). The
 * current site mixes both; IAST uses ṃ.
 */
export function normaliseSanskrit(text: string): string {
  return text.normalize('NFC').replaceAll('ṁ', 'ṃ').replaceAll('Ṁ', 'Ṃ')
}

/** IAST with every diacritic removed, as NFR-03 requires (vikṣepa → viksepa). Devanagari is unchanged. */
export function stripDiacritics(text: string): string {
  // Vowel signs, virama, anusvara and visarga are marks too, but they sit outside this block.
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .normalize('NFC')
}

/** True when the text is already stored the way normaliseSanskrit would store it. */
export function isNormalisedSanskrit(text: string): boolean {
  return normaliseSanskrit(text) === text
}
