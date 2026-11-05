import type { CSSProperties } from 'react'

import type { ConceptView } from '@/content'

import styles from './AtAGlance.module.css'

/**
 * The Terms a Concept explains, at a glance: each one's Sanskrit name and gloss on a slip
 * linking to its place in the sections below. A Concept with no Terms shows nothing.
 */
export function AtAGlance({ terms }: { terms: ConceptView['glance'] }) {
  if (terms.length === 0) return null
  return (
    <section
      id="at-a-glance"
      className={styles.glance}
      aria-labelledby="at-a-glance-title"
      style={{ '--timeline': '--section-at-a-glance' } as CSSProperties}
    >
      <h2 id="at-a-glance-title" className={styles.title}>
        At a glance
      </h2>
      <ul className={styles.grid}>
        {terms.map((term) => (
          <li key={term.id}>
            <a href={`#${term.id}`} className={styles.term}>
              <span lang="sa-Latn" className={styles.name}>
                {term.name}
              </span>
              {term.gloss ? <span className={styles.gloss}>{term.gloss}</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
