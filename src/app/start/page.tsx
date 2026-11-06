import type { Metadata } from 'next'
import Link from 'next/link'

import { ConceptCard } from '@/components/ConceptCard'
import { HelpLine } from '@/components/HelpLine'
import { turnForward } from '@/components/PageTurn'
import { ReadingPage } from '@/components/ReadingPage'
import { ProposalNote } from '@/components/proposals'
import { startHere } from '@/components/start'
import { concepts, hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '@/styles/reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'start' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * Start here, behind a flag until the Project owner approves it: for a first-time reader, what Indian psychology is, how the site is
 * organised, how to read Sanskrit names, three Concepts to read first, and the help line.
 */
export default async function StartHerePage() {
  const allConcepts = await concepts.list()
  const firstReads = startHere.firstReads.map((slug) => {
    const concept = allConcepts.find((candidate) => candidate.slug === slug)
    if (!concept) throw new Error(`Start here names a Concept with no record: ${slug}.`)
    return concept
  })

  return (
    <ReadingPage
      path={PATH}
      titleId="start-title"
      beforeTitle={<ProposalNote>Awaiting the Project owner’s decision</ProposalNote>}
      title="Start here"
    >
      <section className={reading.section} aria-labelledby="about-title">
        <h2 id="about-title" className={reading.sectionTitle}>
          What Indian psychology is
        </h2>
        <p>{startHere.about.join(' ')}</p>
      </section>

      <section className={reading.section} aria-labelledby="organised-title">
        <h2 id="organised-title" className={reading.sectionTitle}>
          How the site is organised
        </h2>
        <ul className={styles.cards}>
          {startHere.organised.map((card) => (
            <li key={card.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p>{card.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={reading.section} aria-labelledby="sounds-title">
        <h2 id="sounds-title" className={reading.sectionTitle}>
          How to read Sanskrit names
        </h2>
        <dl className={styles.sounds}>
          {startHere.sounds.map((sound) => (
            <div key={sound.letters}>
              <dt lang="sa-Latn">{sound.letters}</dt>
              <dd>{sound.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={reading.section} aria-labelledby="first-title">
        <h2 id="first-title" className={reading.sectionTitle}>
          Three first reads
        </h2>
        <ul className={styles.reads}>
          {firstReads.map((concept) => (
            <li key={concept.slug}>
              <ConceptCard
                concept={concept}
                action={
                  <Link
                    href={hrefFor({ kind: 'concept', id: concept.slug })}
                    transitionTypes={turnForward}
                  >
                    Read about&nbsp;<span lang={concept.lang}>{concept.name}</span>
                  </Link>
                }
              />
            </li>
          ))}
        </ul>
      </section>

      <section className={reading.section} aria-labelledby="help-title">
        <h2 id="help-title" className={reading.sectionTitle}>
          If you need help
        </h2>
        <HelpLine />
      </section>
    </ReadingPage>
  )
}
