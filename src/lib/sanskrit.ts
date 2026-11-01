/** IAST with every diacritic removed, as NFR-03 requires (vikṣepa → viksepa). */
export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC')
}
