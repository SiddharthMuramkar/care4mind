/** Capitalise the first letter, keeping diacritics: ālasya → Ālasya. */
export function capitalise(text: string): string {
  const [first = '', ...rest] = Array.from(text)
  return first.toLocaleUpperCase('en') + rest.join('')
}

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

/** Write a verse number in Devanagari digits: 1.30 → १.३०. */
export function toDevanagariDigits(text: string): string {
  return text.replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)] ?? digit)
}

/**
 * A line that only names who speaks, not the verse. Sandhi joins the name to the verb, so the
 * उ may be the vowel sign ु, as in श्रीभगवानुवाच.
 */
export function isSpeakerLine(line: string): boolean {
  const text = line.trim()
  return /(?:उ|ु)वाच\s*[।॥|]?$/u.test(text) || /uvāca\s*[।॥|]?$/u.test(text)
}
