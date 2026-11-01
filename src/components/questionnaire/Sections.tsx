import Link from 'next/link'
import type { ReactNode } from 'react'

import { Citation } from '@/components/Citation'
import { turnForward } from '@/components/PageTurn'
import { Text } from '@/components/prose'
import { hrefFor, type ConceptCard, type QuestionnaireView, type ReferenceView } from '@/content'

import styles from './Sections.module.css'

/** Where a section sits: its heading's id and level, and the classes of the page it sits on. */
interface Placement {
  id: string
  level: 2 | 3
  className?: string
  headingClassName?: string
}

function Section({
  id,
  level,
  className,
  headingClassName,
  title,
  children,
}: Placement & { title: string; children: ReactNode }) {
  const Heading = level === 2 ? 'h2' : 'h3'
  return (
    <section className={className} aria-labelledby={id}>
      <Heading id={id} className={headingClassName}>
        {title}
      </Heading>
      {children}
    </section>
  )
}

/** A Questionnaire's limitations, marked as a draft until the Psychology expert approves them. */
export function Limitations({
  limitations,
  title,
  ...placement
}: Placement & { limitations: QuestionnaireView['limitations']; title: string }) {
  if (!limitations) return null
  return (
    <Section {...placement} title={title}>
      {limitations.status === 'draft-pending-psychology-expert' ? (
        <p className={styles.draft}>
          Draft wording. The Psychology expert has not reviewed these limitations yet.
        </p>
      ) : null}
      <ul className={styles.list}>
        {limitations.items.map((item) => (
          <li key={item}>
            <Text text={item} />
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** The published source of a Questionnaire's items. */
export function Source({
  reference,
  ...placement
}: Placement & { reference: ReferenceView | undefined }) {
  if (!reference) return null
  return (
    <Section {...placement} title="Source">
      <p>
        <Citation reference={reference} />
      </p>
    </Section>
  )
}

/** A Questionnaire's Concepts, each a link to its page with its English gloss. */
export function RelatedConcepts({
  concepts,
  ...placement
}: Placement & { concepts: readonly ConceptCard[] }) {
  if (concepts.length === 0) return null
  return (
    <Section {...placement} title="Related Concepts">
      <ul className={styles.list}>
        {concepts.map((concept) => (
          <li key={concept.slug}>
            <Link
              href={hrefFor({ kind: 'concept', id: concept.slug })}
              transitionTypes={turnForward}
            >
              <span lang={concept.lang}>{concept.name}</span>
              {concept.term && concept.english ? ` (${concept.english})` : null}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
