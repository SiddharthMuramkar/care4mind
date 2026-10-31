import Link from 'next/link'

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
import styles from './SiteHeader.module.css'

/**
 * The header every page shares, stuck to the top of the screen: the lotus and the wordmark,
 * leading home, then Concepts · Texts · Questionnaires · Library · Search, each a server-rendered
 * link that works without JavaScript. On a computer Concepts and Library open panels; on a narrow
 * screen the sections move into the Menu's Drawer, and Search stays.
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
        <MenuButton
          nav={nav}
          search={
            <SearchTrigger placement="drawer" className={styles.drawerSearch}>
              <SearchGlyph className={styles.searchGlyph} />
              Search
            </SearchTrigger>
          }
          script={features.devanagariFirst ? <ScriptPreference placement="drawer" /> : null}
          mapNote={mapNote}
        />
      </div>
    </header>
  )
}
