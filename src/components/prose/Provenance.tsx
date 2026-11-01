import type { CarriedOver } from '@/content'
import { cx } from '@/lib/cx'

import { provenanceSentence } from './provenance-sentence'
import styles from './Prose.module.css'

/**
 * Where a record's text came from and whether anyone has reviewed it, as every content page
 * shows: the pages it was read from and when, what was drafted for the new site, and its review.
 */
export function Provenance({ of, className }: { of: CarriedOver; className?: string }) {
  const { opening, sources, closing } = provenanceSentence(of)
  return (
    <p className={cx(styles.provenance, className)}>
      {opening || null}
      {sources.map((source) => (
        <span key={source.url}>
          {source.before}
          <a href={source.url}>{source.label}</a>
        </span>
      ))}
      {closing}
    </p>
  )
}
