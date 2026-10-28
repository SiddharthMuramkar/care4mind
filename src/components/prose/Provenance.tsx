import type { CarriedOver } from '@/content'
import { cx } from '@/lib/cx'

import styles from './Prose.module.css'

const CURRENT_SITE = /^https?:\/\/(?:www\.)?care4mind\.org\//

/** The separator before item `index` of `count`: "a", "a and b", "a, b and c". */
const before = (index: number, count: number) =>
  index === 0 ? '' : index === count - 1 ? ' and ' : ', '

/** Words listed in a sentence: "a", "a and b", "a, b and c". */
const listed = (words: readonly string[]) =>
  words.map((word, index) => `${before(index, words.length)}${word}`).join('')

/**
 * Where a record's text came from and whether anyone has reviewed it, as every content page
 * shows: the pages it was read from and when, what was drafted for the new site, and its review.
 */
export function Provenance({ of, className }: { of: CarriedOver; className?: string }) {
  const { sources, drafted = [] } = of.provenance
  const fromCurrentSite = sources.every((source) => CURRENT_SITE.test(source.url))
  const dates = [...new Set(sources.map((source) => source.retrieved))].sort()
  const draftedNote =
    drafted.length > 0
      ? `; its ${listed(drafted)} ${drafted.length === 1 ? 'was' : 'were'} drafted for the new site`
      : ''
  const review =
    of.reviewStatus === 'reviewed' ? 'Reviewed.' : 'Not yet reviewed by the Research editor.'
  if (sources.length === 0) return <p className={cx(styles.provenance, className)}>{review}</p>
  return (
    <p className={cx(styles.provenance, className)}>
      {fromCurrentSite
        ? `Carried over from the current site’s ${sources.length === 1 ? 'page' : 'pages'} `
        : 'Taken from '}
      {sources.map((source, index) => (
        <span key={source.url}>
          {before(index, sources.length)}
          <a href={source.url}>{source.url.replace(/^https?:\/\//, '')}</a>
        </span>
      ))}
      {`, read on ${listed(dates)}${draftedNote}. ${review}`}
    </p>
  )
}
