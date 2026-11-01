import Link from 'next/link'

import { CurrentLink } from '@/components/nav/CurrentLink'
import { MenuButton } from '@/components/nav/MenuButton'
import { SearchGlyph } from '@/components/nav/glyphs'
import { SectionNav } from '@/components/nav/SectionNav'
import { siteNav } from '@/components/nav/site-nav'
import { ProposalNote } from '@/components/proposals/ProposalNote'
import { SearchTrigger } from '@/components/search/SearchTrigger'
import { cx } from '@/lib/cx'

import { LotusMark } from './Fleuron'
import { Logo } from './Logo'
import styles from './SiteHeader.module.css'

/**
 * The header every page shares, stuck to the top of the screen: the lotus and the wordmark,
 * leading home, then the section links and Search, each a server-rendered
 * link that works without JavaScript. On a computer Concepts and Library open panels; on a
 * narrow screen the sections move into the Menu's Drawer, and Search stays. While its proposal
 * is on, Start here follows the wordmark from 30rem up, and below that it heads the Drawer's list.
 */
export async function SiteHeader() {
  const nav = await siteNav()
  const mapNote = nav.concepts.map ? <ProposalNote /> : null
  return (
    // Its own transition name keeps it still while the page turns (globals.css).
    <header className={styles.header} style={{ viewTransitionName: 'site-header' }}>
      <div className={styles.strip}>
        <Link href={nav.home} className={styles.home} aria-label="Care4Mind home">
          <LotusMark className={styles.mark} />
          <Logo />
        </Link>
        {nav.start ? (
          <CurrentLink href={nav.start.href} className={styles.start}>
            {nav.start.label}
          </CurrentLink>
        ) : null}
        <nav aria-label="Main" className={styles.nav}>
          <SectionNav nav={nav} mapNote={mapNote} />
          <SearchTrigger placement="header" className={styles.search}>
            <SearchGlyph className={styles.searchGlyph} />
            <span className={cx('sr-only', styles.searchLabel)}>Search</span>
          </SearchTrigger>
        </nav>
        <MenuButton
          nav={nav}
          search={
            <SearchTrigger placement="drawer" className={styles.drawerSearch}>
              <SearchGlyph className={styles.searchGlyph} />
              Search
            </SearchTrigger>
          }
          mapNote={mapNote}
        />
      </div>
    </header>
  )
}
