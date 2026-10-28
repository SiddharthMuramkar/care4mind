import Link from 'next/link'

import { hrefFor, type VerseView } from '@/content'
import { cx } from '@/lib/cx'
import { toDevanagariDigits } from '@/lib/text'

import { turnForward } from './PageTurn'
import { Text } from './prose/Text'
import styles from './Shloka.module.css'

/**
 * A verse in Devanagari and transliteration, with its translation and its source, which leads to
 * the verse on its text's page.
 */
export function Shloka({ verse, className }: { verse: VerseView; className?: string }) {
  const lastLine = verse.devanagari.length - 1
  const lastTransliteration = verse.transliteration.length - 1
  return (
    <figure className={cx(styles.shloka, className)}>
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
      {verse.translation || verse.meaning ? (
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
      ) : null}
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
