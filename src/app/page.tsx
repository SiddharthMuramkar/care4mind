import type { Metadata } from 'next'
import Link from 'next/link'

import { art, heroPlates } from '@/art'
import { PlateViewer } from '@/components/art'
import { ConceptCard } from '@/components/ConceptCard'
import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'
import { OrnamentRule } from '@/components/OrnamentRule'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { Text } from '@/components/prose'
import { TopicCard } from '@/components/topics'
import { home, hrefFor, site, topics } from '@/content'
import { heroLinks } from './hero-links'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import cta from '@/components/Cta'
import styles from './page.module.css'

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(hrefFor({ page: 'home' }))
}

export default async function HomePage() {
  const [page, topicCards, routes] = await Promise.all([home.get(), topics.list(), site.routes()])
  const startHereListed = routes.some((route) => route.kind === 'start')
  const closingLink = heroLinks(page.hero, startHereListed)[0]
  const plates = heroPlates.map((id) => {
    const { src, width, height, alt, caption } = art(id)
    return { src, width, height, alt, caption }
  })

  return (
    <PageTurn>
      <main id="main" className={styles.main}>
        <section className={styles.hero} aria-labelledby="home-title">
          <Folio className={styles.heroFolio}>
            <PlateViewer plates={plates} className={styles.heroPlate} />
            <p className={styles.motto}>
              <span lang="sa-Deva" className={styles.heroDeva}>
                {page.shloka.devanagari}
              </span>
              <span lang="sa-Latn" className={styles.heroIast}>
                {page.shloka.iast}
              </span>
              <span className={styles.translation}>{page.shloka.translation}</span>
            </p>
            <h1 id="home-title" className={styles.heroTitle}>
              {page.hero.promise}
            </h1>
            <p className={styles.subhead}>{page.hero.subhead}</p>
            <p className={styles.ctas}>
              {heroLinks(page.hero, startHereListed).map((link, i) =>
                i === 0 ? (
                  <Link key={link.href} href={link.href} className={cta.primary} data-ink>
                    {link.label}
                  </Link>
                ) : (
                  <Link key={link.href} href={link.href} className={styles.textLink}>
                    {link.label}
                  </Link>
                ),
              )}
            </p>
            <Fleuron draw className={styles.heroFleuron} />
            <p className={styles.intro}>
              <Text text={page.intro} />
            </p>
          </Folio>
        </section>

        {page.onYourMind.length > 0 ? (
          <>
            <section
              id="on-your-mind"
              className={styles.section}
              aria-labelledby="on-your-mind-title"
            >
              <h2 id="on-your-mind-title" className={styles.sectionTitle}>
                What’s on your mind?
              </h2>
              <ul className={styles.mindChips}>
                {page.onYourMind.map(({ label, concept }) => (
                  <li key={label}>
                    <Link
                      href={hrefFor({ kind: 'concept', id: concept.slug })}
                      transitionTypes={turnForward}
                      className={styles.mindChip}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <OrnamentRule className={styles.rule} />
          </>
        ) : (
          <section id="on-your-mind" className={styles.slot} />
        )}

        <section id="topics" className={styles.section} aria-labelledby="topics-title">
          <h2 id="topics-title" className={styles.sectionTitle}>
            Explore by topic
          </h2>
          <ul className={styles.topics}>
            {topicCards.map((topic) => (
              <li key={topic.slug}>
                <TopicCard topic={topic} />
              </li>
            ))}
          </ul>
        </section>

        <OrnamentRule className={styles.rule} />

        <section id="featured" className={styles.section} aria-labelledby="featured-title">
          <h2 id="featured-title" className={styles.sectionTitle}>
            Start with these
          </h2>
          <ul className={styles.cards}>
            {page.featured.map((concept) => (
              <li key={concept.slug}>
                <ConceptCard
                  featured
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

        <OrnamentRule className={styles.rule} />

        <section id="how-it-works" className={styles.section} aria-labelledby="how-it-works-title">
          <h2 id="how-it-works-title" className={styles.sectionTitle}>
            How it works
          </h2>
          <p className={styles.sectionIntro}>
            <Text text={page.howItWorks} />
          </p>
        </section>

        <OrnamentRule className={styles.rule} />

        <section id="who-behind" className={styles.section} aria-labelledby="who-behind-title">
          <h2 id="who-behind-title" className={styles.sectionTitle}>
            Who’s behind this
          </h2>
          <p className={styles.sectionIntro}>
            <Text text={page.whoBehind} />
          </p>
        </section>

        <section className={styles.closingSection} aria-label="Closing">
          <p className={styles.closing}>
            <Text text={page.closing} />
          </p>
          {closingLink ? (
            <p className={styles.closingCta}>
              <Link
                href={closingLink.href}
                className={cx(cta.primary, styles.closingButton)}
                data-ink
              >
                {closingLink.label}
              </Link>
            </p>
          ) : null}
        </section>
      </main>
    </PageTurn>
  )
}
