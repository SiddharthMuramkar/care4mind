import type { ReferenceView } from '@/content'

import { siteOf } from './catalogue'
import styles from './library.module.css'

/** Where a Reference can be read: its DOI, else its stable address, as the Concept pages cite it. */
export function sourceOf(reference: Pick<ReferenceView, 'doi' | 'url'>) {
  if (reference.doi)
    return { href: `https://doi.org/${reference.doi}`, label: `doi:${reference.doi}` }
  if (reference.url) return { href: reference.url, label: siteOf(reference.url) }
  return null
}

/**
 * A link to another site that says so in words: its name or a book's DOI, then "another site"
 * (the arrow is decoration). `data-source` lets "Copy citation" find the full address.
 */
export function AwayLink({ href, label }: { href: string; label: string }) {
  return (
    // No class: it keeps the underline every link in running text has.
    <a href={href} data-source>
      {label}
      <span className={styles.awayNote}>
        , another site<span aria-hidden> ↗</span>
      </span>
    </a>
  )
}

/** A Reference's DOI or address, or the stated reason it has neither. */
export function SourceLink({ reference }: { reference: ReferenceView }) {
  const source = sourceOf(reference)
  if (source) return <AwayLink {...source} />
  if (!reference.noStableLink) return null
  return <span className={styles.noLink}>No DOI or stable address: {reference.noStableLink}.</span>
}
