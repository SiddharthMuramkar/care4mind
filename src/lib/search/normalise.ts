/**
 * How search reads text (design A4): every spelling of a word folds to one form, and every form
 * has a phonetic key, so vikṣepa, viksepa, vikshepa and विक्षेप meet.
 */

/** Combining marks of the Latin script only: Devanagari's vowel signs and virāma stay. */
const LATIN_MARKS = /[\u0300-\u036f]/g

/** Zero-width joiner and non-joiner, which change how Devanagari looks but not what it says. */
const JOINERS = /[\u200c\u200d]/g

/**
 * A Devanagari nasal (ङ ञ ण न म) with virāma before a consonant is written as anusvāra, so पञ्च
 * and पंच are one form.
 */
const NASAL = /[ङञणनम]्(?=[क-ह])/g

/** A word: letters with their marks and digits, keeping a locator's dots (1.30). */
const WORD = /[\p{L}\p{M}\p{N}]+(?:[.:]\p{N}+)*/gu

/** One form for matching: NFC, lower case, no Latin diacritics, one way to write a nasal. */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(LATIN_MARKS, '')
    .normalize('NFC')
    .toLowerCase()
    .replace(JOINERS, '')
    .replace(NASAL, 'ं')
}

/** The words of a text, folded. */
export function words(text: string): string[] {
  return fold(text).match(WORD) ?? []
}

/** The words of a text as written, for showing which one matched. */
export function writtenWords(text: string): string[] {
  return text.normalize('NFC').match(WORD) ?? []
}

/** Only plain Latin letters: the words a phonetic key or a typo can be found for. */
const LATIN = /^[a-z]+$/

/** Whether a folded word is spelt in plain Latin letters. */
export const isLatin = (word: string) => LATIN.test(word)

/**
 * A folded word's sound (design A4): sh, ṣ and ś → s; ch → c; aa → a; ee and ii → i; oo and uu
 * → u; ri → r; w → v; doubled letters collapsed; a final a or h dropped. Other words, such as
 * Devanagari and numbers, are their own key.
 */
export function phoneticKey(word: string): string {
  if (!isLatin(word)) return word
  return word
    .replaceAll('sh', 's')
    .replaceAll('ch', 'c')
    .replaceAll('aa', 'a')
    .replace(/ee|ii/g, 'i')
    .replace(/oo|uu/g, 'u')
    .replaceAll('ri', 'r')
    .replaceAll('w', 'v')
    .replace(/(.)\1+/g, '$1')
    .replace(/(?<=.)[ah]$/, '')
}

/**
 * The number of single-letter edits between two words, or `max + 1` once it is certain to be
 * more than `max`.
 */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  // One row of the edit table at a time: the row before, and the one being filled.
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    let lowest = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const value = Math.min(
        (previous[j] ?? Infinity) + 1,
        (current[j - 1] ?? Infinity) + 1,
        (previous[j - 1] ?? Infinity) + cost,
      )
      current.push(value)
      if (value < lowest) lowest = value
    }
    if (lowest > max) return max + 1
    previous = current
  }
  return previous[b.length] ?? max + 1
}
