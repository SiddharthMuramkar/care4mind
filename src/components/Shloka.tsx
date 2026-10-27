import type { Shloka as ShlokaContent } from '@/content'
import { toDevanagariDigits } from '@/lib/text'

import { cx } from '@/lib/cx'

import styles from './Shloka.module.css'

/** A verse in Devanagari and transliteration, with its translation and source. */
export function Shloka({ shloka, className }: { shloka: ShlokaContent; className?: string }) {
  const lastLine = shloka.devanagari.length - 1
  const lastTransliteration = shloka.transliteration.length - 1
  return (
    <figure className={cx(styles.shloka, className)}>
      <blockquote className={styles.verse}>
        <p lang="sa-Deva" className={styles.deva}>
          {shloka.devanagari.map((line, index) => (
            <span key={index} className={styles.line}>
              {line}
              {index === lastLine ? (
                <span className={styles.number}> ॥ {toDevanagariDigits(shloka.verse)} ॥</span>
              ) : null}
            </span>
          ))}
        </p>
        <p lang="sa-Latn" className={styles.transliteration}>
          {shloka.transliteration.map((line, index) => (
            <span key={index} className={styles.line}>
              {line}
              {index === lastTransliteration ? (
                <span className={styles.number}> ‖ {shloka.verse} ‖</span>
              ) : null}
            </span>
          ))}
        </p>
      </blockquote>
      <div className={styles.gloss}>
        <p>
          <span className={styles.label}>Translation</span> {shloka.translation}
        </p>
        {shloka.meaning ? (
          <p>
            <span className={styles.label}>Meaning</span> {shloka.meaning}
          </p>
        ) : null}
      </div>
      <figcaption className={styles.source}>
        {shloka.source}
        {shloka.transliterationScheme === 'informal'
          ? ' · transliteration as on the current site'
          : null}
      </figcaption>
    </figure>
  )
}
