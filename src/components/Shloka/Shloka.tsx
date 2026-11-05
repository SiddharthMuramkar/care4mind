import Link from 'next/link'

import { hrefFor, type VerseView } from '@/content'
import { cx } from '@/lib/cx'
import { toDevanagariDigits } from '@/lib/text'

import { turnForward } from '../PageTurn'
import { Text } from '../prose'
import styles from './Shloka.module.css'

/**
 * A verse in Devanagari and transliteration, with its translation and its source, which leads to
 * the verse on its text's page. With `foldOriginal`, the translation leads instead and the
 * Devanagari and transliteration sit behind a "Show original" disclosure, which a wide screen
 * and print show open (see the stylesheet).
 */
export function Shloka({
  verse,
  className,
  foldOriginal = false,
}: {
  verse: VerseView
  className?: string
  foldOriginal?: boolean
}) {
  const lastLine = verse.devanagari.length - 1
  const lastTransliteration = verse.transliteration.length - 1
  const original =
    verse.devanagari.length > 0 || verse.transliteration.length > 0 ? (
      <blockquote className={styles.verse}>
        {verse.devanagari.length > 0 ? (
          <p lang="sa-Deva" className={styles.deva}>
            {verse.devanagari.map((line, index) => (
              <span key={index} className={styles.line}>
                {line}
                {index === lastLine ? (
                  <>
                    {' '}
                    <span className={styles.number}>॥ {toDevanagariDigits(verse.verse)} ॥</span>
                  </>
                ) : null}
              </span>
            ))}
          </p>
        ) : null}
        {verse.transliteration.length > 0 ? (
          <p lang={verse.work.lang} className={styles.transliteration}>
            {verse.transliteration.map((line, index) => (
              <span key={index} className={styles.line}>
                {line}
                {index === lastTransliteration ? (
                  <>
                    {' '}
                    <span className={styles.number}>‖ {verse.verse} ‖</span>
                  </>
                ) : null}
              </span>
            ))}
          </p>
        ) : null}
      </blockquote>
    ) : null
  const gloss =
    verse.translation || verse.meaning ? (
      <div className={styles.gloss}>
        {verse.translation ? (
          <p>
            <span className={styles.label}>Translation</span> <Text text={verse.translation} />
            {verse.translationSource ? <> ({verse.translationSource})</> : null}
          </p>
        ) : null}
        {verse.meaning ? (
          <p>
            <span className={styles.label}>Meaning</span> <Text text={verse.meaning} />
          </p>
        ) : null}
      </div>
    ) : null
  return (
    <figure className={cx(styles.shloka, className)}>
      {foldOriginal ? (
        <>
          {gloss}
          {original ? (
            <details className={styles.original}>
              <summary className={styles.showOriginal}>Show original</summary>
              {original}
            </details>
          ) : null}
        </>
      ) : (
        <>
          {original}
          {gloss}
        </>
      )}
      <figcaption className={styles.source}>
        <Link href={hrefFor({ kind: 'passage', id: verse.passage })} transitionTypes={turnForward}>
          <span lang={verse.work.lang}>{verse.work.title}</span> {verse.verse}
        </Link>
        {verse.transliterationScheme === 'informal'
          ? ' · transliteration as on the current site'
          : null}
      </figcaption>
    </figure>
  )
}
