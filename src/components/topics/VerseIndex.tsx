import type { Route } from 'next'
import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { hrefFor, type PassageView, type QuotedWork } from '@/content'
import { openingLine } from '@/lib/sanskrit'

import styles from './VerseIndex.module.css'
import { inWords, langOf } from './words'

/** A verse's opening line, in Devanagari where there is some, else in transliteration. */
function Opening({ verse }: { verse: PassageView }) {
  const deva = openingLine(verse.devanagari)
  if (deva) return <span lang="sa-Deva">{deva}</span>
  const line = openingLine(verse.transliteration?.lines ?? [])
  return line ? <span lang={verse.work.lang}>{line}</span> : <>{verse.label}</>
}

/**
 * The verses a topic's Concepts quote, by work, set like a manuscript's index: each opening
 * line, a dotted leader, its number, and the records that quote it.
 */
export function VerseIndex({ works }: { works: readonly QuotedWork[] }) {
  return works.map((work) => (
    <div key={work.slug} className={styles.work}>
      <h3 className={styles.workTitle}>
        <Link href={hrefFor({ kind: 'work', id: work.slug })} transitionTypes={turnForward}>
          <span lang={work.lang}>{work.title}</span>
        </Link>
      </h3>
      <ol className={styles.verses}>
        {work.verses.map((verse) => (
          <li key={verse.id} className={styles.verseItem}>
            {/* A passage's anchor on its work's page, made by hrefFor() in the content module. */}
            <Link href={verse.href as Route} className={styles.verse} transitionTypes={turnForward}>
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
                    <span key={`${record.kind}:${record.id}`} {...langOf(record.lang)}>
                      {record.title}
                    </span>
                  )),
                )}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  ))
}
