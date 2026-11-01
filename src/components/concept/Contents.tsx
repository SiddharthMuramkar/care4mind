import type { CSSProperties } from 'react'

import { Text } from '@/components/prose'
import type { Inline } from '@/content'
import { toDevanagariDigits } from '@/lib/text'

import styles from './Contents.module.css'

/** A line of the contents: a section of the page, and the terms set inside it. */
export interface ContentsEntry {
  id: string
  heading: Inline
  role?: 'applications' | 'comparison'
  terms?: readonly { id: string; name: string }[]
}

const ROLES = { applications: 'Applications', comparison: 'Comparison' } as const

/*
 * The scroll marker for the section in view, set in ink with its lozenge shown. Written here,
 * not in the CSS Module, because the build's CSS parser doesn't know :target-current yet.
 */
const CURRENT = `[data-contents] a:target-current { color: var(--color-surface-ink) }
[data-contents] a:target-current::before { transform: rotate(45deg) scale(1); opacity: 1 }`

/**
 * The page's contents, set like a book's: a numeral, each section, the terms inside it. Plain
 * links, so it works without JavaScript. Beside the text on a wide screen it stays in view, and
 * the section being read is marked in CSS alone: `:target-current` where the browser has scroll
 * markers, otherwise each section's view timeline, otherwise not at all.
 */
export function Contents({ entries }: { entries: readonly ContentsEntry[] }) {
  return (
    <nav className={styles.contents} aria-labelledby="contents-title" data-contents>
      <style href="concept-contents" precedence="default">
        {CURRENT}
      </style>
      <h2 id="contents-title" className={styles.title}>
        Contents
      </h2>
      <ol className={styles.list}>
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={styles.entry}
              style={{ '--timeline': `--section-${entry.id}` } as CSSProperties}
            >
              <span className={styles.numeral} aria-hidden>
                {toDevanagariDigits(String(index + 1))}
              </span>
              <span className={styles.heading}>
                {entry.role ? <span className={styles.role}>{ROLES[entry.role]}: </span> : null}
                <Text text={entry.heading} />
              </span>
            </a>
            {entry.terms && entry.terms.length > 0 ? (
              <ol className={styles.terms}>
                {entry.terms.map((term) => (
                  <li key={term.id}>
                    <a href={`#${term.id}`} className={styles.term} lang="sa-Latn">
                      {term.name}
                    </a>
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
