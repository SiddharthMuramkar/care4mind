import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { hrefFor, type WorkView } from '@/content'
import { cx } from '@/lib/cx'

import styles from './TextCard.module.css'
import { VerseTally } from './VerseTally'
import { WorkTitle } from './WorkTitle'

/** The opening line of the first verse the site quotes from a work, in its first script. */
function incipitOf(work: WorkView) {
  const [first] = work.passages
  if (!first) return undefined
  const lines = first.devanagari.length > 0 ? first.devanagari : first.transliteration?.lines
  const [line] = lines ?? []
  if (!line) return undefined
  return {
    at: `${work.locatorLabel} ${first.locator}`,
    line,
    lang: first.devanagari.length > 0 ? ('sa-Deva' as const) : work.lang,
    more: (lines?.length ?? 0) > 1,
  }
}

/**
 * A work on the shelf, set like a catalogue card: its title in both scripts, who composed it, the
 * first line it is quoted from, and a tally of the verses quoted. The whole card leads to the
 * work's page, and its title flies into that page's heading as the page turns forward.
 */
export function TextCard({ work, className }: { work: WorkView; className?: string }) {
  const incipit = incipitOf(work)
  return (
    <article className={cx(styles.card, className)}>
      <h2 className={styles.title}>
        <Link
          href={hrefFor({ kind: 'work', id: work.slug })}
          className={styles.link}
          transitionTypes={turnForward}
          data-ink
        >
          <WorkTitle
            work={work}
            className={styles.pair}
            iastClassName={styles.iast}
            devanagariClassName={styles.deva}
          />
        </Link>
      </h2>
      {work.english || work.attribution ? (
        <p className={styles.byline}>
          {[work.english, work.attribution].filter(Boolean).join(' · ')}
        </p>
      ) : null}
      {incipit ? (
        <p className={styles.incipit}>
          <span className={styles.at}>{incipit.at}</span>{' '}
          <span lang={incipit.lang} className={styles.line}>
            {incipit.line}
            {incipit.more ? ' …' : null}
          </span>
        </p>
      ) : null}
      <p className={styles.count}>
        <VerseTally locators={work.passages.map(({ locator }) => locator)} />
        <span>
          {work.passageCount} {work.passageCount === 1 ? 'verse' : 'verses'} quoted
        </span>
      </p>
    </article>
  )
}
