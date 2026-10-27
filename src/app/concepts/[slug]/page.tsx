import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { OrnamentRule } from '@/components/OrnamentRule'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { ReadingThread } from '@/components/ReadingThread'
import { ReferenceList } from '@/components/ReferenceList'
import { SanskritTerm } from '@/components/SanskritTerm'
import { ScriptChoice, ScriptSwitch, TermSpellings } from '@/components/ScriptChoice'
import { Shloka } from '@/components/Shloka'
import { SpellingsPopover } from '@/components/SpellingsPopover'
import { asciiSpellings, getConcept, getQuestionnaire, listConcepts } from '@/content'
import { capitalise } from '@/lib/text'

import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await listConcepts()).map((concept) => ({ slug: concept.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/concepts/[slug]'>): Promise<Metadata> {
  const concept = await getConcept((await params).slug)
  if (!concept) return {}
  return {
    title: `${capitalise(concept.term.iast)} (${concept.gloss})`,
    description: concept.summary,
  }
}

export default async function ConceptPage({ params }: PageProps<'/concepts/[slug]'>) {
  const concept = await getConcept((await params).slug)
  if (!concept) notFound()

  const questionnaires = (
    await Promise.all(concept.relatedQuestionnaires.map((slug) => getQuestionnaire(slug)))
  ).filter((questionnaire) => questionnaire !== null)
  const name = capitalise(concept.term.iast)

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <ReadingThread />
        <Breadcrumbs
          trail={[
            { label: 'Home', href: '/' },
            { label: 'Concepts', href: '/#concepts' },
            { label: <span lang="sa-Latn">{name}</span> },
          ]}
        />
        <Folio as="article" className={reading.article} aria-labelledby="concept-title">
          <ScriptChoice>
            <header className={reading.titlePage}>
              <p className={reading.kicker}>Concept</p>
              <h1 id="concept-title" className={reading.title}>
                {/* A Concept card's title flies into the IAST spelling (ConceptCard). */}
                <TermSpellings
                  term={concept.term}
                  capitalised
                  name={`concept-title-${concept.slug}`}
                />
              </h1>
              <p className={reading.gloss}>{concept.gloss}</p>
              <div className={styles.spellingTools}>
                <SpellingsPopover
                  iast={concept.term.iast}
                  spellings={asciiSpellings(concept.term)}
                />
                {concept.term.devanagari ? <ScriptSwitch /> : null}
              </div>
              <p className={reading.summary}>{concept.summary}</p>
            </header>
          </ScriptChoice>

          {concept.shlokas.map((shloka) => (
            <Shloka key={shloka.source} shloka={shloka} className={styles.shloka} />
          ))}

          <OrnamentRule className={styles.rule} />

          {concept.sections.map((section) => (
            <section key={section.heading} className={reading.section}>
              <h2 className={reading.sectionTitle}>{section.heading}</h2>
              {section.blocks.map((block, index) =>
                block.kind === 'paragraph' ? (
                  <p key={index}>{block.text}</p>
                ) : (
                  <div key={block.term.iast} className={styles.term}>
                    <h3 className={styles.termTitle}>
                      <SanskritTerm term={block.term} gloss={block.gloss} capitalised />
                    </h3>
                    {block.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                ),
              )}
            </section>
          ))}

          {concept.comparison ? (
            <figure className={styles.comparison}>
              <div
                className={styles.tableScroll}
                role="region"
                aria-labelledby="comparison-caption"
                tabIndex={0}
              >
                <table className={styles.table}>
                  <caption id="comparison-caption" className={styles.caption}>
                    {concept.comparison.caption}
                  </caption>
                  <thead>
                    <tr>
                      {concept.comparison.columns.map((column) => (
                        <th key={column} scope="col">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {concept.comparison.rows.map((row) => (
                      <tr key={row.term.iast}>
                        <th scope="row">
                          <SanskritTerm
                            term={row.term}
                            gloss={row.gloss}
                            devanagari={false}
                            capitalised
                          />
                        </th>
                        {row.cells.map((cell, index) => (
                          <td key={index}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          ) : null}

          {questionnaires.length > 0 ? (
            <section className={reading.section} aria-labelledby="related-title">
              <h2 id="related-title" className={reading.sectionTitle}>
                Related Questionnaires
              </h2>
              <ul className={styles.related}>
                {questionnaires.map((questionnaire) => (
                  <li key={questionnaire.slug}>
                    <Link
                      href={`/questionnaires/${questionnaire.slug}`}
                      transitionTypes={turnForward}
                    >
                      {questionnaire.title}
                    </Link>
                    <span className={styles.relatedNote}>{questionnaire.summary}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <ReferenceList references={concept.references} />

          <p className={reading.provenance}>
            Carried over from the current site’s page{' '}
            <a href={concept.provenance.url}>{concept.provenance.url.replace('https://', '')}</a>,
            read on {concept.provenance.retrieved}. Not yet reviewed by the Research editor.
          </p>
        </Folio>
      </main>
    </PageTurn>
  )
}
