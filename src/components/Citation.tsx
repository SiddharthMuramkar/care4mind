import type { ReferenceView } from '@/content'

import styles from './Citation.module.css'

// The site's citation style is still to be chosen (FR-03, planning ticket 17). Until then
// References follow the APA-like pattern the current site uses.

type Cited = Pick<
  ReferenceView,
  | 'authors'
  | 'year'
  | 'title'
  | 'edition'
  | 'container'
  | 'publisher'
  | 'volume'
  | 'issue'
  | 'pages'
  | 'doi'
  | 'url'
>

function linkFor(reference: Cited): { href: string; label: string } | null {
  if (reference.doi)
    return { href: `https://doi.org/${reference.doi}`, label: `doi:${reference.doi}` }
  if (reference.url)
    return { href: reference.url, label: new URL(reference.url).hostname.replace(/^www\./, '') }
  return null
}

/** Where it was published: its journal or publisher, volume, issue and pages, as one. */
function publicationOf(reference: Cited): string {
  const volume =
    reference.volume === undefined || reference.issue === undefined
      ? reference.volume
      : `${reference.volume}(${reference.issue})`
  return [reference.container ?? reference.publisher, volume, reference.pages]
    .filter((part) => part !== undefined)
    .join(', ')
}

/** One Reference, formatted for reading. Each run of text is one string, which keeps long lists light. */
export function Citation({ reference }: { reference: Cited }) {
  const link = linkFor(reference)
  const publication = publicationOf(reference)
  const before = [reference.authors, reference.year && `(${reference.year}).`]
    .filter(Boolean)
    .join(' ')
  const after = `${reference.edition ? ` (${reference.edition})` : ''}. ${publication ? `${publication}. ` : ''}`
  return (
    <span className={styles.citation}>
      {before ? `${before} ` : null}
      <cite className={styles.title}>{reference.title}</cite>
      {after}
      {link ? <a href={link.href}>{link.label}</a> : null}
    </span>
  )
}
