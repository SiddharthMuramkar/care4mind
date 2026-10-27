import Link from 'next/link'

import { ConceptCard } from '@/components/ConceptCard'
import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'
import { Kolam } from '@/components/Kolam'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { QuestionnaireCard } from '@/components/QuestionnaireCard'
import { getHomepage, listConcepts, listQuestionnaires } from '@/content'
import { capitalise, toDevanagariDigits } from '@/lib/text'

import cta from './cta.module.css'
import styles from './page.module.css'

export default async function HomePage() {
  const [home, concepts, questionnaires] = await Promise.all([
    getHomepage(),
    listConcepts(),
    listQuestionnaires(),
  ])

  return (
    <PageTurn>
      <main id="main" className={styles.main}>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.stage}>
            <div className={styles.frame}>
              <Kolam columns={9} rows={7} behaviour="draw-on-load" className={styles.frameKolam} />
            </div>
            <Folio className={styles.heroFolio}>
              <p className={styles.kicker}>A portal for Indian psychology</p>
              <h1 id="home-title" className={styles.heroTitle}>
                <span lang="sa-Deva" className={styles.heroDeva}>
                  {home.shloka.devanagari}
                </span>
                <span lang="sa-Latn" className={styles.heroIast}>
                  {home.shloka.iast}
                </span>
              </h1>
              <p className={styles.translation}>{home.shloka.translation}</p>
              <Fleuron className={styles.heroFleuron} />
              <p className={styles.intro}>{home.intro}</p>
              <p className={styles.ctas}>
                <a href="#concepts" className={cta.primary} data-ink>
                  Explore Concepts
                </a>
                <a href="#questionnaires" className={cta.secondary} data-ink>
                  Questionnaires
                </a>
              </p>
            </Folio>
          </div>
        </section>

        <section id="contents" className={styles.section} aria-labelledby="contents-title">
          <h2 id="contents-title" className={styles.sectionTitle}>
            Contents
          </h2>
          <ol className={styles.contents}>
            {home.areas.map((area, index) => (
              <li key={area.title} className={styles.entry}>
                <span lang="sa-Deva" className={styles.entryNumber} aria-hidden>
                  <Kolam columns={1} rows={1} behaviour="draw-on-scroll" className={styles.knot} />
                  {toDevanagariDigits(String(index + 1))}
                </span>
                <span className={styles.entryTitle}>
                  {area.href ? <a href={area.href}>{area.title}</a> : area.title}
                </span>
                <span className={styles.entryLeader} aria-hidden />
                <span className={styles.entryStatus}>{area.href ? 'Below' : 'In preparation'}</span>
                <span className={styles.entryText}>{area.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <Kolam columns={9} rows={2} behaviour="draw-on-scroll" className={styles.band} />

        <section id="concepts" className={styles.section} aria-labelledby="concepts-title">
          <h2 id="concepts-title" className={styles.sectionTitle}>
            Concepts
          </h2>
          <p className={styles.sectionIntro}>
            Each Concept is a single idea from Indian psychology, named by its Sanskrit term.
          </p>
          <ul className={styles.cards}>
            {concepts.map((concept) => (
              <li key={concept.slug}>
                <ConceptCard
                  concept={concept}
                  action={
                    <Link href={`/concepts/${concept.slug}`} transitionTypes={turnForward}>
                      Read about&nbsp;<span lang="sa-Latn">{capitalise(concept.term.iast)}</span>
                    </Link>
                  }
                />
              </li>
            ))}
          </ul>
        </section>

        <Kolam columns={9} rows={2} behaviour="draw-on-scroll" className={styles.band} />

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
            {questionnaires.map((questionnaire) => (
              <li key={questionnaire.slug}>
                <QuestionnaireCard questionnaire={questionnaire} />
              </li>
            ))}
          </ul>
          <p className={styles.note}>{home.questionnairesNote}</p>
        </section>

        <p className={styles.closing}>{home.closing}</p>
      </main>
    </PageTurn>
  )
}
