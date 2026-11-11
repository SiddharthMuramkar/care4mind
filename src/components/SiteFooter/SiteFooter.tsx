import Link from 'next/link'
import type { ReactNode } from 'react'

import { siteNav } from '@/components/nav'
import { ProposalNote } from '@/components/proposals'
import { home } from '@/content'

import { Emblem } from '../Emblem'
import { Fleuron } from '../Fleuron'
import { ChevronGlyph } from '../glyphs'
import { HelpLine } from '../HelpLine'
import { Logo } from '../Logo'
import styles from './SiteFooter.module.css'

/**
 * A long list under its column's heading. On a phone it folds shut, opened by the chevron at the
 * end of the heading's line, with or without JavaScript; from 48rem it stands open, unfolded.
 */
function Fold({ section, children }: { section: string; children: ReactNode }) {
  return (
    <details className={styles.fold}>
      <summary className={styles.toggle}>
        <ChevronGlyph className={styles.chevron} />
        <span className="sr-only">{`More in ${section}`}</span>
      </summary>
      {children}
    </details>
  )
}

/**
 * The colophon every page ends with: the Emblem beside the wordmark with the motto under them,
 * the tagline, the full navigation in three headed columns (Concepts with the topics, Library
 * with its pages, and More: Traditional texts, Questionnaires, Search, Privacy while it exists,
 * the Picture credits), the proposals while one is on, the help line, always open, the credit and
 * the preview notice. Without JavaScript, the header's Menu leads here.
 */
export async function SiteFooter() {
  const [nav, { tagline, shloka }] = await Promise.all([siteNav(), home.get()])
  const section = (id: string) => nav.sections.find((entry) => entry.id === id)
  const concepts = section('concepts')
  const texts = section('texts')
  const library = section('library')
  return (
    // Its own transition name keeps it still while the page turns (globals.css).
    <footer className={styles.footer} style={{ viewTransitionName: 'site-footer' }}>
      <Fleuron className={styles.fleuron} />
      <div className={styles.inner}>
        <div className={styles.colophon}>
          <div className={styles.signature}>
            <Emblem variant="ring" size={72} />
            <Logo />
            <p lang="sa-Deva" className={styles.motto}>
              {shloka.devanagari}
            </p>
          </div>
          <p className={styles.tagline}>{tagline}</p>
        </div>
        <nav id="site-nav" aria-label="All sections">
          <ul className={styles.groups}>
            {concepts ? (
              <li className={styles.group}>
                <h2 className={styles.heading}>
                  <Link href={concepts.href} className={styles.head}>
                    {concepts.label}
                  </Link>
                </h2>
                <Fold section={concepts.label}>
                  <ul className={styles.pages}>
                    {nav.concepts.topics.map((topic) => (
                      <li key={topic.slug} className={styles.topic} data-topic={topic.slug}>
                        <Link href={topic.href} className={styles.link}>
                          {topic.label}
                        </Link>
                      </li>
                    ))}
                    {nav.concepts.map ? (
                      <li className={styles.proposal}>
                        <Link href={nav.concepts.map.href} className={styles.link}>
                          {nav.concepts.map.label}
                        </Link>
                        <ProposalNote />
                      </li>
                    ) : null}
                  </ul>
                </Fold>
              </li>
            ) : null}
            {library ? (
              <li className={styles.group}>
                <h2 className={styles.heading}>
                  <Link href={library.href} className={styles.head}>
                    {library.label}
                  </Link>
                </h2>
                <Fold section={library.label}>
                  <ul className={styles.pages}>
                    {nav.library.pages.map((page) => (
                      <li key={page.slug}>
                        <Link href={page.href} className={styles.link}>
                          {page.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Fold>
              </li>
            ) : null}
            <li className={styles.group}>
              <h2 className={styles.heading}>More</h2>
              <ul className={styles.pages}>
                {texts ? (
                  <li>
                    <Link href={texts.href} className={styles.link}>
                      {texts.label}
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href={nav.questionnaires.href} className={styles.link}>
                    {nav.questionnaires.label}
                  </Link>
                </li>
                <li>
                  <Link href={nav.search.href} className={styles.link}>
                    {nav.search.label}
                  </Link>
                </li>
                {nav.privacy ? (
                  <li>
                    <Link href={nav.privacy.href} className={styles.link}>
                      {nav.privacy.label}
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href={nav.credits.href} className={styles.link}>
                    {nav.credits.label}
                  </Link>
                </li>
              </ul>
            </li>
            {nav.proposals ? (
              <li className={styles.group}>
                <Link href={nav.proposals.href} className={styles.head}>
                  {nav.proposals.label}
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
      <div className={styles.imprint}>
        <HelpLine className={styles.help} />
        <p className={styles.credit}>Powered by IIT Bombay-SJMSOM &amp; HUA</p>
        <p className={styles.preview}>
          A preview of the new site, not yet public. Content carried over from the current site has
          not been reviewed yet.
        </p>
      </div>
    </footer>
  )
}
