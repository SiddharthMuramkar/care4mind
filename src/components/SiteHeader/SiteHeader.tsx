import Link from 'next/link'

import { SearchGlyph } from '@/components/glyphs'
import { CurrentLink } from '@/components/nav'
import { LoginSlot } from '@/components/login-slot'
import { MenuButton } from '@/components/nav'
import { SectionNav } from '@/components/nav'
import { siteNav } from '@/components/nav'
import { ProposalNote } from '@/components/proposals'
import { SearchTrigger } from '@/components/search'
import { cx } from '@/lib/cx'

import { LotusMark } from '../Fleuron'
import { HelpLine } from '../HelpLine'
import { Logo } from '../Logo'
import styles from './SiteHeader.module.css'

/**
 * The header every page shares, stuck to the top of the screen: the lotus and the wordmark,
 * leading home, then the section links and Search, each a server-rendered link that works
 * without JavaScript. From 48rem the sections stand in the header as links; from 64rem Concepts
 * and Library also open panels. On a phone the sections move into the Menu's Drawer, which ends
 * with the help line, and Search stays. While its proposal is on, Start here follows the
 * wordmark wherever the strip has room for it (30 to 48rem, and from 80rem), and the Drawer
 * lists it. While the login switch is on, Log in sits beside Search, and Log out in its place for
 * a user who is in.
 */
export async function SiteHeader() {
  const nav = await siteNav()
  const mapNote = nav.concepts.map ? <ProposalNote /> : null
  return (
    // Its own transition name keeps it still while the page turns (globals.css).
    <header className={styles.header} style={{ viewTransitionName: 'site-header' }}>
      <div className={styles.strip}>
        <Link href={nav.home.href} className={styles.home} aria-label="Care4Mind home">
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
          {nav.login ? <LoginSlot href={nav.login.href} className={styles.login} /> : null}
        </nav>
        <MenuButton
          nav={nav}
          search={
            <SearchTrigger placement="drawer" className={styles.drawerSearch}>
              <SearchGlyph className={styles.searchGlyph} />
              Search
            </SearchTrigger>
          }
          login={
            nav.login ? <LoginSlot href={nav.login.href} className={styles.drawerLogin} /> : null
          }
          mapNote={mapNote}
          help={<HelpLine className={styles.drawerHelp} />}
        />
      </div>
    </header>
  )
}
