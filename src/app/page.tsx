import type { Metadata, Route } from 'next'
import Link from 'next/link'

import { ConceptCard } from '@/components/ConceptCard'
import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'
import { OrnamentRule } from '@/components/OrnamentRule'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { Text } from '@/components/prose'
import { QuestionnaireCard } from '@/components/QuestionnaireCard'
import { concepts, home, hrefFor, questionnaires, site } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { toDevanagariDigits } from '@/lib/text'

import cta from './cta.module.css'
import styles from './page.module.css'

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(hrefFor({ page: 'home' }))
}

/** Where an area's link leads, as the site map names it: "Library › Methods". */
async function placeOf(href: string): Promise<string> {
  return (await site.trail(href))
    .slice(1)
    .map((crumb) => crumb.label)
    .join(' › ')
}

export default async function HomePage() {
  const [page, allConcepts, allQuestionnaires] = await Promise.all([
    home.get(),
    concepts.list(),
    questionnaires.list(),
  ])
  // The homepage features the Questionnaires with pages of their own, and the Concepts they draw
  // on; the A–Z and the Questionnaires page hold the rest.
  const featured = allQuestionnaires.filter(({ status }) => status !== 'coming-later')
  const later = allQuestionnaires.length - featured.length
  const drawnOn = new Set(
    featured.flatMap((questionnaire) => questionnaire.concepts.map((c) => c.slug)),
  )
  const featuredConcepts = allConcepts.filter(({ slug }) => drawnOn.has(slug))
  const areas = await Promise.all(
    page.areas.map(async (area) => ({ ...area, place: area.href && (await placeOf(area.href)) })),
  )

  return (
    <PageTurn>
      <main id="main" className={styles.main}>
        <section className={styles.hero} aria-labelledby="home-title">
          <Folio className={styles.heroFolio}>
            <p className={styles.kicker}>A portal for Indian psychology</p>
            <h1 id="home-title" className={styles.heroTitle}>
              <span lang="sa-Deva" className={styles.heroDeva}>
                {page.shloka.devanagari}
              </span>
              <span lang="sa-Latn" className={styles.heroIast}>
                {page.shloka.iast}
              </span>
            </h1>
            <p className={styles.translation}>{page.shloka.translation}</p>
            <Fleuron draw className={styles.heroFleuron} />
            <p className={styles.intro}>
              <Text text={page.intro} />
            </p>
            <p className={styles.ctas}>
              <a href="#concepts" className={cta.primary} data-ink>
                Explore Concepts
              </a>
              <a href="#questionnaires" className={cta.secondary} data-ink>
                Questionnaires
              </a>
            </p>
          </Folio>
        </section>

        <section id="contents" className={styles.section} aria-labelledby="contents-title">
          <h2 id="contents-title" className={styles.sectionTitle}>
            Contents
          </h2>
          <ol className={styles.contents}>
            {areas.map((area, index) => (
              <li key={area.title} className={styles.entry}>
                <span lang="sa-Deva" className={styles.entryNumber} aria-hidden>
                  {toDevanagariDigits(String(index + 1))}
                </span>
                <span className={styles.entryTitle}>
                  {area.href ? (
                    // The homepage's areas lead to the pages the content module gives them.
                    <Link href={area.href as Route} transitionTypes={turnForward}>
                      {area.title}
                    </Link>
                  ) : (
                    area.title
                  )}
                </span>
                <span className={styles.entryLeader} aria-hidden />
                <span className={styles.entryStatus}>{area.place || 'In preparation'}</span>
                <span className={styles.entryText}>
                  <Text text={area.text} />
                </span>
              </li>
            ))}
          </ol>
        </section>

        <OrnamentRule className={styles.rule} />

        <section id="concepts" className={styles.section} aria-labelledby="concepts-title">
          <h2 id="concepts-title" className={styles.sectionTitle}>
            Concepts
          </h2>
          <p className={styles.sectionIntro}>
            Each Concept is a single idea from Indian psychology, named by its Sanskrit term.
          </p>
          <ul className={styles.cards}>
            {featuredConcepts.map((concept) => (
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
          <p className={styles.note}>
            <Link href={hrefFor({ page: 'concepts' })} transitionTypes={turnForward}>
              All {allConcepts.length} Concepts, from A to Z
            </Link>
          </p>
        </section>

        <OrnamentRule className={styles.rule} />

        <section
          id="questionnaires"
          className={styles.section}
          aria-labelledby="questionnaires-title"
        >
          <h2 id="questionnaires-title" className={styles.sectionTitle}>
            Questionnaires
          </h2>
          <p className={styles.sectionIntro}>
            A Questionnaire gives you a result from documented scoring rules. Each one sets out its
            purpose and limitations before you start.
          </p>
          <ul className={styles.cards}>
            {featured.map((questionnaire) => (
              <li key={questionnaire.slug}>
                <QuestionnaireCard questionnaire={questionnaire} />
              </li>
            ))}
          </ul>
          {later > 0 ? (
            <p className={styles.note}>
              <Link href={hrefFor({ page: 'questionnaires' })} transitionTypes={turnForward}>
                {later} more Questionnaires from the current site, coming later
              </Link>
            </p>
          ) : null}
        </section>

        <p className={styles.closing}>
          <Text text={page.closing} />
        </p>
      </main>
    </PageTurn>
  )
}
