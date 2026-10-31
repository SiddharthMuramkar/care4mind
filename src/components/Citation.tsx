import { citationParts, type CitationSource } from './citation'

import styles from './Citation.module.css'

/** One Reference, formatted for reading. Each run of text is one string, which keeps long lists light. */
export function Citation({ reference }: { reference: CitationSource }) {
  const { before, title, after, link } = citationParts(reference)
  return (
    <span className={styles.citation}>
      {before ? `${before} ` : null}
      <cite className={styles.title}>{title}</cite>
      {after}
      {link ? <a href={link.href}>{link.label}</a> : null}
    </span>
  )
}
