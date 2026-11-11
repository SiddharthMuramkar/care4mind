import { Fragment, type ReactNode } from 'react'

/** A letter that, in the site's English text, only a transliterated word carries. */
const IAST_LETTER = /[āīūṛṝḷḹṅñṭḍṇśṣḥṃĀĪŪṚṜḶḸṄÑṬḌṆŚṢḤṂ]/u

/**
 * Plain text that may hold transliterated words, such as a topic's name ("Temperament (guṇa)").
 * Each word with an IAST letter is tagged Sanskrit, so where the text around it is set in the
 * interface sans, the word keeps the serif that has its diacritics, and it is read as Sanskrit.
 */
export function Transliterated({ text }: { text: string }): ReactNode {
  const words = text.split(/([\p{L}\p{M}]+)/u)
  if (!words.some((word) => IAST_LETTER.test(word))) return text
  return words.map((word, index) =>
    IAST_LETTER.test(word) ? (
      <span key={index} lang="sa-Latn">
        {word}
      </span>
    ) : (
      <Fragment key={index}>{word}</Fragment>
    ),
  )
}
