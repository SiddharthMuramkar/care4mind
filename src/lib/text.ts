/** A count with its unit, the unit singular for one: "1 entry", "20 entries". */
export function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

/** How a reading time reads, the same on a card, a result and the page itself. */
export function readingTimeWords(minutes: number): string {
  return `About ${count(minutes, 'minute', 'minutes')} to read`
}

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
