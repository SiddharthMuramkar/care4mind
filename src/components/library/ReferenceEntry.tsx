import type { Route } from 'next'
import Link from 'next/link'

import { Citation } from '@/components/references/Citation'
import { turnForward } from '@/components/page-turn/PageTurn'
import { LinkPreview, type PreviewPayload } from '@/components/preview/LinkPreview'
import type { RecordRef, ReferenceView } from '@/content'

import { TYPE_NAMES } from './catalogue'
import { CopyCitation } from './CopyCitation'
import styles from './references.module.css'
import { SourceLink } from './SourceLink'

/** What a "cited in" chip knows of a Concept: its preview, and the topic whose hue marks it. */
export interface CitingConcept {
  preview: PreviewPayload
  topic: string
}

/** A record citing a Reference, as a chip: a Concept's shows its preview. */
function CitedChip({ record, concept }: { record: RecordRef; concept?: CitingConcept }) {
  const link = (
    // The record's path, made by hrefFor() in the content module.
    <Link
      href={record.href as Route}
      className={styles.chip}
      // A fresh array: one shared by every chip is sent as a long path to its first use.
      transitionTypes={[...turnForward]}
      {...(concept ? { 'data-topic': concept.topic } : {})}
    >
      <span {...(record.lang ? { lang: record.lang } : {})}>{record.title}</span>
    </Link>
  )
  return concept ? <LinkPreview preview={concept.preview}>{link}</LinkPreview> : link
}

/**
 * One Reference on the References page: its citation in the Concept pages' style, its DOI or
 * address (or why it has none), what kind of source it is, every record citing it, and "Copy
 * citation". It carries its anchor (`ref-<id>`) and what the filters pick it out by: its type, topics and
 * citing Concepts.
 */
export function ReferenceEntry({
  reference,
  topics,
  citing,
}: {
  reference: ReferenceView
  topics: readonly string[]
  /** The Concepts citing it, by slug. */
  citing: ReadonlyMap<string, CitingConcept>
}) {
  // The citation's words: its link follows, saying it leaves the site.
  const words = { ...reference, doi: undefined, url: undefined }
  const concepts = reference.citedIn.filter(({ kind }) => kind === 'concept').map(({ id }) => id)
  return (
    <li
      id={reference.anchor}
      className={styles.entry}
      data-entry
      data-kind={reference.type}
      {...(topics.length > 0 ? { 'data-topics': topics.join(' ') } : {})}
      {...(concepts.length > 0 ? { 'data-concepts': concepts.join(' ') } : {})}
    >
      <p className={styles.citation}>
        <span data-citation>
          <Citation reference={words} />
        </span>{' '}
        <SourceLink reference={reference} />
      </p>
      <div className={styles.foot}>
        <span className={styles.type}>{TYPE_NAMES[reference.type].one}</span>
        {reference.citedIn.length > 0 ? (
          <div className={styles.cited} data-cited-in>
            <span className={styles.citedLabel}>Cited in</span>
            <ul className={styles.chips}>
              {reference.citedIn.map((record) => {
                const concept = record.kind === 'concept' ? citing.get(record.id) : undefined
                return (
                  <li key={`${record.kind}/${record.id}`}>
                    <CitedChip record={record} {...(concept ? { concept } : {})} />
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
        <CopyCitation label={reference.label} />
      </div>
    </li>
  )
}
