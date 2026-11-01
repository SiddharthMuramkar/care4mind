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

/** A number with its noun: "1 entry", "20 entries". */
export function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

// British English, as the site writes: no serial comma.
const PROSE_LIST = new Intl.ListFormat('en-GB', { type: 'conjunction' })

/** Names as running prose: "References, Courses and Text Books". */
export function listed(names: readonly string[]): string {
  return PROSE_LIST.format(names)
}
