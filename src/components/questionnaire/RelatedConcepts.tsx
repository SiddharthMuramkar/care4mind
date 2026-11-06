import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { hrefFor, type ConceptRef } from '@/content'

import styles from './RelatedConcepts.module.css'

interface Props {
  concepts: readonly ConceptRef[]
  /** The end screen sets the same list a size down, under its own heading. */
  variant?: 'page' | 'end'
}

/** The Concepts a Questionnaire belongs with, each named and linked. Nothing when it has none. */
export function RelatedConcepts({ concepts, variant = 'page' }: Props) {
  if (concepts.length === 0) return null
  const end = variant === 'end'
  const id = end ? 'end-related' : 'related-title'
  const Heading = end ? 'h3' : 'h2'
  return (
    <section className={end ? styles.end : styles.page} aria-labelledby={id}>
      <Heading id={id} className={end ? styles.endTitle : styles.pageTitle}>
        Related Concepts
      </Heading>
      <ul className={styles.list}>
        {concepts.map((concept) => (
          <li key={concept.slug}>
            <Link
              href={hrefFor({ kind: 'concept', id: concept.slug })}
              transitionTypes={turnForward}
            >
              <span lang={concept.lang}>{concept.name}</span>
              {concept.gloss ? <> · {concept.gloss}</> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
