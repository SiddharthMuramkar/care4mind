import type { CSSProperties } from 'react'

import type { ConceptView } from '@/content'

import styles from './AtAGlance.module.css'

/** The most letters a Term's name sets on half a phone's row. */
const LONG_NAME = 15

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
          // A name too long for half a phone's width takes the whole row there, never breaking.
          <li key={term.id} className={term.name.length > LONG_NAME ? styles.long : undefined}>
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
