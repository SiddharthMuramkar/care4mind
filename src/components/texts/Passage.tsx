import type { Route } from 'next'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { turnForward } from '@/components/PageTurn'
import { Text } from '@/components/prose'
import { ScriptPair } from '@/components/script/ScriptPair'
import type { PassageView, RecordRef } from '@/content'
import { toDevanagariDigits } from '@/lib/text'

import styles from './Passage.module.css'

/** Words listed in a sentence: "a", "a and b", "a, b and c". */
function Listed({ records }: { records: readonly RecordRef[] }) {
  return records.map((record, index) => (
    <span key={`${record.kind}/${record.id}`}>
      {index === 0 ? null : index === records.length - 1 ? ' and ' : ', '}
      <span {...(record.lang ? { lang: record.lang } : {})}>{record.title}</span>
    </span>
  ))
}

/** Lines of a verse, one to a line, the last closed with its number as a manuscript does. */
function Lines({ lines, end }: { lines: readonly string[]; end: string }) {
  return lines.map((line, index) => (
    <span key={index} className={styles.line}>
      {line}
      {index === lines.length - 1 ? (
        <>
          {' '}
          <span className={styles.end}>{end}</span>
        </>
      ) : null}
    </span>
  ))
}

/**
 * One verse the site quotes, set like a manuscript leaf at its own address (`#1-30`): a running
 * head with its locator, the Devanagari and its transliteration, every translation with where it
 * came from, and the Concepts that quote it.
 */
export function Passage({ passage, unit }: { passage: PassageView; unit: string }) {
  const { anchor, devanagari, transliteration, translations, quotedIn } = passage
  const deva = toDevanagariDigits(passage.locator)
  const devanagariLines =
    devanagari.length > 0 ? <Lines lines={devanagari} end={`॥ ${deva} ॥`} /> : undefined
  const transliterationLines = transliteration ? (
    <>
      <Lines lines={transliteration.lines} end={`‖ ${passage.locator} ‖`} />
      <span lang="en" className={styles.scheme}>
        {transliteration.scheme === 'iast' ? 'IAST' : 'As the source wrote it'}
      </span>
    </>
  ) : undefined

  return (
    <section
      id={anchor}
      className={styles.passage}
      aria-labelledby={`verse-${anchor}`}
      // The view timeline the verse rail follows where the browser lacks scroll markers.
      style={{ '--timeline': `--verse-${anchor}` } as CSSProperties}
    >
      <header className={styles.head}>
        <h2 id={`verse-${anchor}`} className={styles.locator}>
          {/* The verse's own address, to cite or share: following it marks the verse. */}
          <a href={`#${anchor}`} className={styles.self}>
            {unit} {passage.locator}
          </a>
        </h2>
        <span lang="sa-Deva" className={styles.numeral} aria-hidden>
          {deva}
        </span>
      </header>

      {transliterationLines ? (
        <ScriptPair
          as="div"
          lang={passage.work.lang}
          iast={transliterationLines}
          className={styles.verse}
          iastClassName={styles.transliteration}
          devanagariClassName={styles.deva}
          {...(devanagariLines ? { devanagari: devanagariLines } : {})}
        />
      ) : devanagariLines ? (
        <div className={styles.verse}>
          <div lang="sa-Deva" className={styles.deva}>
            {devanagariLines}
          </div>
        </div>
      ) : null}

      <div className={styles.notes}>
        {translations.map((translation) => (
          <figure key={translation.id} className={styles.translation}>
            <blockquote className={styles.quote}>
              <p>
                <Text text={translation.text} />
              </p>
            </blockquote>
            <figcaption className={styles.credit}>
              {translation.source ? (
                <>From {translation.source}</>
              ) : (
                <>
                  As quoted in <Listed records={translation.quotedIn} />
                </>
              )}
            </figcaption>
          </figure>
        ))}
        {translations.length === 0 ? (
          <p className={styles.none}>No page quotes a translation of this verse.</p>
        ) : null}

        {quotedIn.length > 0 ? (
          <div className={styles.quoted}>
            <span id={`quoted-${anchor}`} className={styles.quotedLabel}>
              Quoted in
            </span>
            <ul className={styles.chips} aria-labelledby={`quoted-${anchor}`}>
              {quotedIn.map((record) => (
                <li key={`${record.kind}/${record.id}`}>
                  <Link
                    // The record's path, made by hrefFor() in the content module.
                    href={record.href as Route}
                    className={styles.chip}
                    transitionTypes={turnForward}
                    data-ink
                  >
                    <span {...(record.lang ? { lang: record.lang } : {})}>{record.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
