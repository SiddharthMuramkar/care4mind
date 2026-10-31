import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ConceptCard } from '@/components/ConceptCard'
import { Folio } from '@/components/Folio'
import { HelpLine } from '@/components/HelpLine'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { ProposalNote } from '@/components/proposals/ProposalNote'
import { startHere } from '@/components/start/start-here'
import { features } from '@/config/features'
import { concepts, hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'start' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * Start here (Proposal, D20): for a first-time reader, what Indian psychology is, how the site is
 * organised, how to read Sanskrit names, three Concepts to read first, and the help line.
 */
export default async function StartHerePage() {
  if (!features.startHere) notFound()
  const allConcepts = await concepts.list()
  const firstReads = startHere.firstReads.map((slug) => {
    const concept = allConcepts.find((candidate) => candidate.slug === slug)
    if (!concept) throw new Error(`Start here names a Concept with no record: ${slug}.`)
    return concept
  })

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="start-title">
          <header className={reading.titlePage}>
            <ProposalNote>Awaiting the Project owner’s decision</ProposalNote>
            <h1 id="start-title" className={reading.title}>
              Start here
            </h1>
          </header>

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
        </Folio>
      </main>
    </PageTurn>
  )
}
