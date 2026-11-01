import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { turnForward } from '@/components/page-turn'
import { cx } from '@/lib/cx'
import { toDevanagariDigits } from '@/lib/text'

import styles from './ContentsPlate.module.css'

export interface PlateRow {
  key: string
  href: Route
  /** The row's name, which is all its link says. */
  name: ReactNode
  /** What sits where a book's page number would: a count, a Devanagari name. */
  trailing?: ReactNode
  /** The trailing text's language, when it is a name in another script. */
  trailingLang?: 'sa-Deva'
}

export interface PlateGroup {
  /** A group after the first gets a running head of its own ("Also in this topic"). */
  title?: string
  rows: readonly PlateRow[]
}

/** The most rows a plate can light from its cards (one selector each in the CSS Module). */
export const MOST_LIT_ROWS = 12

/**
 * Put round a plate and its cards: a card carrying `data-plate-card={n}` lights row n while it
 * is pointed at or focused. CSS alone (`:has()`), so it costs no JavaScript.
 */
export const plateScope = styles.scope

/** Spread onto the card that stands for row n (from 1), inside a `plateScope`. */
export const plateCard = (row: number) => ({ 'data-plate-card': row })

/**
 * The Topics contents plate (D21): rows set like a book's contents, each a Devanagari numeral,
 * a name and a dotted leader running out to what the row holds. Pointing at or focusing a row,
 * or the card it stands for, lights it, and its leader inks in from the centre. Finished and
 * still by default and in print; the numerals and leaders are decoration. The homepage sets its
 * five topics with it too (ticket 11).
 */
export function ContentsPlate({
  label,
  head = label,
  groups,
  className,
}: {
  /** The plate's name for assistive technology, such as "Contents". */
  label: string
  /** Its running head, set in small capitals over a double rule. */
  head?: string
  groups: readonly PlateGroup[]
  className?: string
}) {
  const starts = groups.map((_, at) =>
    groups.slice(0, at).reduce((sum, { rows }) => sum + rows.length, 1),
  )
  const last = (starts.at(-1) ?? 1) + (groups.at(-1)?.rows.length ?? 0) - 1
  if (last > MOST_LIT_ROWS)
    throw new Error(
      `A contents plate lights at most ${MOST_LIT_ROWS} rows: add selectors to ContentsPlate.module.css.`,
    )
  return (
    <nav aria-label={label} className={cx(styles.plate, className)}>
      <p className={styles.head} aria-hidden>
        {head}
      </p>
      {groups.map((group, index) => (
        <div key={group.title ?? index} className={styles.group}>
          {group.title ? <p className={styles.groupTitle}>{group.title}</p> : null}
          <ol className={styles.rows} start={starts[index]}>
            {group.rows.map((row, offset) => {
              const number = (starts[index] ?? 1) + offset
              return (
                <li key={row.key} className={styles.row} data-plate-row={number}>
                  <span className={styles.numeral} aria-hidden>
                    {toDevanagariDigits(String(number))}
                  </span>
                  <Link
                    href={row.href}
                    className={styles.link}
                    transitionTypes={turnForward}
                    data-ink
                  >
                    <span className={styles.name}>{row.name}</span>
                  </Link>
                  <span className={styles.leader} data-leader aria-hidden>
                    <span className={styles.ink} />
                  </span>
                  {row.trailing ? (
                    <span
                      className={styles.trailing}
                      {...(row.trailingLang ? { lang: row.trailingLang } : {})}
                    >
                      {row.trailing}
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </nav>
  )
}
