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
