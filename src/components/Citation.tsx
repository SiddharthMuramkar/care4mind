import type { Reference } from '@/content'

import styles from './Citation.module.css'

// The site's citation style is still to be chosen (FR-03, planning ticket 17). Until then
// References follow the APA-like pattern the current site uses.

function linkFor(reference: Reference): { href: string; label: string } | null {
  if (reference.doi)
    return { href: `https://doi.org/${reference.doi}`, label: `doi:${reference.doi}` }
  if (reference.url)
    return { href: reference.url, label: new URL(reference.url).hostname.replace(/^www\./, '') }
  return null
}

/** One Reference, formatted for reading. */
export function Citation({ reference }: { reference: Reference }) {
  const link = linkFor(reference)
  return (
    <span className={styles.citation}>
      {reference.authors ? <>{reference.authors} </> : null}
      {reference.year ? <>({reference.year}). </> : null}
      <cite className={styles.title}>{reference.title}</cite>.{' '}
      {reference.publication ? <>{reference.publication}. </> : null}
      {link ? <a href={link.href}>{link.label}</a> : null}
    </span>
  )
}
