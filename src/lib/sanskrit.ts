/** IAST with every diacritic removed, as NFR-03 requires (vikṣepa → viksepa). */
export function stripDiacritics(text: string): string {
  // Only the Combining Diacritical Marks block: Devanagari's vowel signs and virama are marks too.
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC')
}

/** "Said", in Devanagari and IAST. Sandhi joins a name ending in -n to it (भगवानुवाच), so उ becomes ु. */
const SPEAKER = [/(?:उ|ु)वाच\s*[।॥|]?$/u, /uvāca\s*[।॥|]?$/u]

/** True when a line names who speaks a verse ("अर्जुन उवाच ।") rather than being part of it. */
export function isSpeakerLine(line: string): boolean {
  const trimmed = line.trim()
  return SPEAKER.some((pattern) => pattern.test(trimmed))
}

/** A verse's opening, as a manuscript's index gives it: its first line after any speaker's. */
export function openingLine(lines: readonly string[]): string | undefined {
  return lines.find((line) => !isSpeakerLine(line)) ?? lines[0]
}
