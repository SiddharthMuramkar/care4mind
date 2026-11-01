import Link from 'next/link'

import { CurrentLink } from '@/components/nav/CurrentLink'
import { MenuButton } from '@/components/nav/MenuButton'
import { SearchGlyph } from '@/components/nav/glyphs'
import { SectionNav } from '@/components/nav/SectionNav'
import { siteNav } from '@/components/nav/site-nav'
import { ProposalNote } from '@/components/proposals/ProposalNote'
import { ScriptPreference } from '@/components/script/ScriptPreference'
import { SearchTrigger } from '@/components/search/SearchTrigger'
import { features } from '@/config/features'

import { LotusMark } from './Fleuron'
import { Logo } from './Logo'
import { LotusPause } from './LotusPause'
import styles from './SiteHeader.module.css'

/**
 * The header every page shares, stuck to the top of the screen: the lotus and the wordmark,
 * leading home, then Concepts · Texts · Questionnaires · Library · Search, each a server-rendered
 * link that works without JavaScript. On a computer Concepts and Library open panels, and "Pause
 * the lotus" ends the strip; on a narrow screen the sections and the pause move into the Menu's
 * Drawer, and Search stays. While its proposal is on, Start here follows the wordmark from 30rem
 * up, and below that it heads the Drawer's list.
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
            <span className={styles.searchLabel}>Search</span>
          </SearchTrigger>
        </nav>
        {features.devanagariFirst ? (
          <div className={styles.script}>
            <ScriptPreference placement="header" />
          </div>
        ) : null}
        <div className={styles.lotus}>
          <LotusPause placement="header" />
        </div>
        <MenuButton
          nav={nav}
          search={
            <SearchTrigger placement="drawer" className={styles.drawerSearch}>
              <SearchGlyph className={styles.searchGlyph} />
              Search
            </SearchTrigger>
          }
          script={features.devanagariFirst ? <ScriptPreference placement="drawer" /> : null}
          lotus={<LotusPause placement="drawer" />}
          mapNote={mapNote}
        />
      </div>
    </header>
  )
}
