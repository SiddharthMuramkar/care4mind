import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { hrefFor, type PassageView, type QuotedWork } from '@/content'
import { keepDandasWithWords, openingLine } from '@/lib/sanskrit'

import styles from './VerseIndex.module.css'
import { inWords, langOf } from './names'

/** A verse's opening line, in Devanagari where there is some, else in transliteration. */
function Opening({ verse }: { verse: PassageView }) {
  const deva = openingLine(verse.devanagari)
  if (deva)
    return (
      <span lang="sa-Deva" data-verse-line>
        {keepDandasWithWords(deva)}
      </span>
    )
  const line = openingLine(verse.transliteration?.lines ?? [])
  return line ? (
    <span lang={verse.work.lang} data-verse-line>
      {keepDandasWithWords(line)}
    </span>
  ) : (
    <>{verse.label}</>
  )
}

/**
 * The verses a topic's Concepts quote, by the Traditional text they come from: each verse's
 * opening line and its number, leading to its Passage, and the Concepts that quote it.
 */
export function VerseIndex({ works }: { works: readonly QuotedWork[] }) {
  return (
    <>
      {works.map((work) => (
        <div key={work.slug} className={styles.work}>
          <h3 className={styles.workTitle}>
            <Link href={hrefFor({ kind: 'work', id: work.slug })} transitionTypes={turnForward}>
              <span lang={work.lang}>{work.title}</span>
            </Link>
          </h3>
          <ol className={styles.verses}>
            {work.verses.map((verse) => (
              <li key={verse.id} className={styles.verseItem}>
                <Link href={verse.href} className={styles.verse} transitionTypes={turnForward}>
                  <span className={styles.opening}>
                    <Opening verse={verse} />
                  </span>
                  <span className={styles.verseLeader} aria-hidden />
                  <span className={styles.locator}>{verse.locator}</span>
                </Link>
                {verse.quotedIn.length > 0 ? (
                  <p className={styles.quotedIn}>
                    Quoted in{' '}
                    {inWords(
                      verse.quotedIn.map((record) => (
                        <span key={`${record.kind}:${record.id}`}>
                          <span {...langOf(record.lang)}>{record.title}</span>
                          {record.gloss ? <> · {record.gloss}</> : null}
                        </span>
                      )),
                    )}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </>
  )
}
