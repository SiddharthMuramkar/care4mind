/** Lowercase ASCII words joined by hyphens: a slug, a Reference id, an anchor. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Text as a record stores it. NFC, one precomposed character per letter, because decomposed text
 * renders with misplaced marks in some browsers and NFC is what search matches against.
 * Anusvara is ṃ, never ṁ: IAST uses ṃ, and the current site mixes both.
 */
export function normaliseSanskrit(text: string): string {
  return text.normalize('NFC').replaceAll('ṁ', 'ṃ').replaceAll('Ṁ', 'Ṃ')
}

/** True when the text is already stored the way normaliseSanskrit would store it. */
export function isNormalisedSanskrit(text: string): boolean {
  return normaliseSanskrit(text) === text
}
