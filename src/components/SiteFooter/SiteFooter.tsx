import Link from 'next/link'

import { siteNav } from '@/components/nav'
import { ProposalNote } from '@/components/proposals'
import { home } from '@/content'

import { Emblem } from '../Emblem'
import { Fleuron } from '../Fleuron'
import { HelpLine } from '../HelpLine'
import { Logo } from '../Logo'
import styles from './SiteFooter.module.css'

/**
 * The colophon every page ends with: the Emblem beside the wordmark with the motto under them,
 * the tagline, the full navigation (every section, Questionnaires, the topics, every Library
 * page, the Picture credits and the proposals while one is on), the credit and the preview
 * notice. Without JavaScript, the header's Menu leads here.
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
                <Link href={concepts.href} className={styles.head}>
                  {concepts.label}
                </Link>
                <ul className={styles.pages}>
                  {nav.concepts.topics.map((topic) => (
                    <li key={topic.slug} className={styles.topic} data-topic={topic.slug}>
                      <Link href={topic.href}>{topic.label}</Link>
                    </li>
                  ))}
                  {nav.concepts.map ? (
                    <li className={styles.proposal}>
                      <Link href={nav.concepts.map.href}>{nav.concepts.map.label}</Link>
                      <ProposalNote />
                    </li>
                  ) : null}
                </ul>
              </li>
            ) : null}
            {library ? (
              <li className={styles.group}>
                <Link href={library.href} className={styles.head}>
                  {library.label}
                </Link>
                <ul className={styles.pages}>
                  {nav.library.pages.map((page) => (
                    <li key={page.slug}>
                      <Link href={page.href}>{page.label}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}
            <li className={styles.group}>
              <ul className={styles.pages}>
                {texts ? (
                  <li>
                    <Link href={texts.href}>{texts.label}</Link>
                  </li>
                ) : null}
                <li>
                  <Link href={nav.questionnaires.href}>{nav.questionnaires.label}</Link>
                </li>
                <li>
                  <Link href={nav.search.href}>{nav.search.label}</Link>
                </li>
                <li>
                  <Link href={nav.credits.href}>{nav.credits.label}</Link>
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
