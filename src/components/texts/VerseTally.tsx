import type { CSSProperties } from 'react'

import { cx } from '@/lib/cx'

import styles from './VerseTally.module.css'

/** Locators grouped by the part of the work they come from: `2.54` and `2.55` are both in part 2. */
function partsOf(locators: readonly string[]) {
  const parts: { part: string; marks: { locator: string; index: number }[] }[] = []
  locators.forEach((locator, index) => {
    const part = locator.includes('.') ? locator.slice(0, locator.indexOf('.')) : ''
    const last = parts.at(-1)
    if (last && last.part === part) last.marks.push({ locator, index })
    else parts.push({ part, marks: [{ locator, index }] })
  })
  return parts
}

/**
 * A scribe's tally of the verses the site quotes from a work: one short rule for each, grouped by
 * the part of the work it comes from. Decoration, always beside the count in words. With `ink`
 * the rules ink in once, in turn, as the page opens; otherwise they ink while their card is
 * pointed at or focused (`--lit` on an ancestor).
 */
export function VerseTally({
  locators,
  ink = false,
  className,
}: {
  locators: readonly string[]
  ink?: boolean
  className?: string
}) {
  return (
    <span className={cx(styles.tally, ink && styles.ink, className)} aria-hidden>
      {partsOf(locators).map(({ part, marks }) => (
        <span key={`${part}/${marks[0]?.locator}`} className={styles.part}>
          {marks.map(({ locator, index }) => (
            <span key={locator} className={styles.mark} style={{ '--i': index } as CSSProperties} />
          ))}
        </span>
      ))}
    </span>
  )
}
