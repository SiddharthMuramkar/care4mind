import type { Route } from 'next'
import Link from 'next/link'
import { ViewTransition, type CSSProperties, type ReactNode } from 'react'

import { hrefFor, type ConceptView, type VerseView } from '@/content'

import { turnForward } from '../PageTurn'
import { LinkPreview } from '../preview/LinkPreview'
import { statusWords } from '../StatusBadge'
import { Text } from '../prose'
import { conceptPreview, passagePreview } from './previews'
import styles from './LinkedKnowledge.module.css'

/** A dotted leader joining an entry to what it says about it, inked in as it scrolls into view. */
function Leader() {
  return (
    <span className={styles.leader} aria-hidden>
      <span className={styles.ink} />
    </span>
  )
}

/** One group of the panel, headed like a line of a book's contents: its name and its count. */
function Group({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>
        <span>{title}</span>
        <Leader />
        <span className={styles.count}>{count}</span>
      </h3>
      {children}
    </div>
  )
}

const ROLES = { applications: 'Applications', comparison: 'Comparison' } as const

/**
 * Linked knowledge (FR-01): everything a Concept connects to, each one link away. Related
 * Concepts with the fact that relates them (D06), the passages it quotes, its applications and
 * comparison sections, its References and its Questionnaire with its status in words (its title
 * flies into its page's heading as it is followed). An empty group is left out. The entries are
 * joined to their notes by cross-reference rules (D21), dotted leaders that ink in as they come
 * into view, finished and still in print and where motion is reduced.
 */
export function LinkedKnowledge({
  concept,
  verses,
}: {
  concept: ConceptView
  /** The verses the page quotes, by passage, for their previews. */
  verses: ReadonlyMap<string, VerseView>
}) {
  const { related, works, sections, questionnaires } = concept.linked
  const { references } = concept
  return (
    <section
      id="linked-knowledge"
      className={styles.panel}
      aria-labelledby="linked-knowledge-title"
      style={{ '--timeline': '--section-linked-knowledge' } as CSSProperties}
    >
      <h2 id="linked-knowledge-title" className={styles.title}>
        Linked knowledge
      </h2>

      {related.length > 0 ? (
        <Group title="Related Concepts" count={related.length}>
          <ul className={styles.rows}>
            {related.map((other) => (
              <li key={other.slug} className={styles.row}>
                <LinkPreview preview={conceptPreview(other)}>
                  {/* The Concept's path, made by hrefFor() in the content module. */}
                  <Link
                    href={other.href as Route}
                    transitionTypes={turnForward}
                    {...(other.lang ? { lang: other.lang } : {})}
                  >
                    {other.name}
                  </Link>
                </LinkPreview>
                <Leader />
                <span className={styles.note}>
                  {other.reasons.map((reason) => reason.text).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {works.length > 0 ? (
        <Group title="Texts it quotes" count={works.length}>
          <ul className={styles.rows}>
            {works.map((work) => (
              <li key={work.slug} className={styles.row}>
                {/* The work's path, made by hrefFor() in the content module. */}
                <Link href={work.href as Route} transitionTypes={turnForward} lang={work.lang}>
                  {work.title}
                </Link>
                <Leader />
                <span className={styles.note}>
                  {work.passages.map((passage, index) => {
                    return (
                      <span key={passage.id}>
                        {index > 0 ? ', ' : null}
                        <LinkPreview
                          preview={passagePreview(passage.label, work.lang, verses.get(passage.id))}
                        >
                          {/* The passage's anchor, made by hrefFor() in the content module. */}
                          <Link
                            href={passage.href as Route}
                            transitionTypes={turnForward}
                            aria-label={passage.label}
                            lang={work.lang}
                          >
                            {passage.locator}
                          </Link>
                        </LinkPreview>
                      </span>
                    )
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {sections.length > 0 ? (
        <Group title="On this page" count={sections.length}>
          <ul className={styles.rows}>
            {sections.map((section) => (
              <li key={section.id} className={styles.row}>
                <a href={`#${section.id}`}>
                  <Text text={section.heading} />
                </a>
                <Leader />
                <span className={styles.note}>{ROLES[section.role]}</span>
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {references.length > 0 ? (
        <Group title="References" count={references.length}>
          <ul className={styles.references}>
            {references.map((reference) => (
              <li key={reference.id}>
                <a href={`#${reference.anchor}`}>{reference.label}</a>
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {questionnaires.length > 0 ? (
        <Group
          title={questionnaires.length === 1 ? 'Questionnaire' : 'Questionnaires'}
          count={questionnaires.length}
        >
          <ul className={styles.rows}>
            {questionnaires.map(({ slug, title, status, shownStatus }) => (
              <li key={slug} className={styles.row}>
                <Link
                  href={hrefFor({ kind: 'questionnaire', id: slug, status })}
                  transitionTypes={turnForward}
                >
                  <ViewTransition name={`questionnaire-title-${slug}`} share="morph" default="none">
                    <span>{title}</span>
                  </ViewTransition>
                </Link>
                <Leader />
                <span className={styles.note}>{statusWords(shownStatus)}</span>
              </li>
            ))}
          </ul>
        </Group>
      ) : null}
    </section>
  )
}
