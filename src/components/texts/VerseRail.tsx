import type { CSSProperties } from 'react'

import type { PassageView } from '@/content'
import { toDevanagariDigits } from '@/lib/text'

import styles from './VerseRail.module.css'

/*
 * The scroll marker for the verse in view, set in ink with its lozenge shown and its leader
 * inked. Written here, not in the CSS Module, because the build's CSS parser doesn't know
 * :target-current yet.
 */
const CURRENT = `[data-verse-rail] a:target-current { color: var(--color-surface-ink) }
[data-verse-rail] a:target-current::before { transform: rotate(45deg) scale(1); opacity: 1 }
[data-verse-rail] a:target-current > span:nth-child(2)::after { clip-path: inset(0) }`

/** The part of a work a locator falls in: `2` for `2.54`; a single number has none. */
const partOf = (locator: string) =>
  locator.includes('.') ? locator.slice(0, locator.indexOf('.')) : ''

/**
 * The work's verse numbers, each a link to its verse, set like a book's contents: the locator, a
 * dotted leader and its Devanagari numeral, a little space where a new part begins. Plain links,
 * so it works without JavaScript. Beside the text on a wide screen it stays in view and marks
 * the verse being read in CSS alone (`:target-current`, else each verse's view timeline); on a
 * phone it is a compact list above the text.
 */
export function VerseRail({ passages }: { passages: readonly PassageView[] }) {
  return (
    <nav className={styles.rail} aria-labelledby="verses-title" data-verse-rail>
      <style href="verse-rail" precedence="default">
        {CURRENT}
      </style>
      <h2 id="verses-title" className={styles.title}>
        Verses
      </h2>
      <ol className={styles.list}>
        {passages.map((passage, index) => (
          <li
            key={passage.id}
            {...(index > 0 && partOf(passage.locator) !== partOf(passages[index - 1]?.locator ?? '')
              ? { 'data-part': '' }
              : {})}
          >
            <a
              href={`#${passage.anchor}`}
              className={styles.link}
              style={{ '--timeline': `--verse-${passage.anchor}` } as CSSProperties}
              data-ink
            >
              <span>{passage.locator}</span>
              <span className={styles.leader} aria-hidden />
              <span lang="sa-Deva" className={styles.numeral} aria-hidden>
                {toDevanagariDigits(passage.locator)}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
