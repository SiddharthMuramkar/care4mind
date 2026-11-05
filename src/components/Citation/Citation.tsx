import { citationParts, type Cited } from './citation-parts'
import styles from './Citation.module.css'

/** One Reference, formatted for reading. Each run of text is one string, which keeps long lists light. */
export function Citation({ reference }: { reference: Cited }) {
  const { authorship, title, titleEnd, publication, link } = citationParts(reference)
  const after = `${titleEnd}${publication ? ` ${publication}` : ''}${link ? ' ' : ''}`
  return (
    <span className={styles.citation}>
      {authorship ? `${authorship} ` : null}
      <cite className={styles.title}>{title}</cite>
      {after}
      {link ? <a href={link.href}>{link.label}</a> : null}
    </span>
  )
}
