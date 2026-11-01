'use client'

import { Drawer } from '@base-ui/react/drawer'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react'

import { CloseGlyph } from '@/components/glyphs'
import { Fleuron } from '@/components/ornaments'
import { toDevanagariDigits } from '@/lib/text'

import { currentFor, panelOf } from './current'
import styles from './MenuDrawer.module.css'
import type { SiteNav } from './types'

export interface MenuDrawerProps {
  nav: SiteNav
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The Menu control, where focus goes back to as the Drawer closes. */
  returnFocus: RefObject<HTMLElement | null>
  search?: ReactNode
  script?: ReactNode
  lotus?: ReactNode
  mapNote?: ReactNode
}

/**
 * The Drawer (Base UI): a leaf of paper that slides in from the right with the whole navigation,
 * set like a book's contents. It keeps focus inside while open; Escape, Close or a swipe to the
 * right puts it away, and following a link closes it as the next page opens.
 */
export function MenuDrawer({
  nav,
  open,
  onOpenChange,
  returnFocus,
  search,
  script,
  lotus,
  mapNote,
}: MenuDrawerProps) {
  const pathname = usePathname()
  const closeOnLink = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('a[href]')) onOpenChange(false)
  }

  return (
    <Drawer.Root open={open} onOpenChange={(next) => onOpenChange(next)} swipeDirection="right">
      <Drawer.Portal>
        <Drawer.Backdrop className={styles.backdrop} />
        <Drawer.Viewport className={styles.viewport}>
          <Drawer.Popup className={styles.sheet} finalFocus={returnFocus}>
            {/* A link's click closes the Drawer; the link itself is the keyboard's way in. */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className={styles.body} onClick={closeOnLink}>
              <div className={styles.head}>
                <Drawer.Title className={styles.title}>Menu</Drawer.Title>
                <Drawer.Close className={styles.close}>
                  <CloseGlyph className={styles.closeGlyph} />
                  Close
                </Drawer.Close>
              </div>

              {search || script || lotus ? (
                <div className={styles.tools}>
                  {search}
                  {script}
                  {lotus}
                </div>
              ) : null}

              <nav aria-label="Main" className={styles.contents}>
                <ol className={styles.sections}>
                  {nav.sections.map((section, index) => {
                    const panel = panelOf(section.id)
                    return (
                      <li
                        key={section.id}
                        className={styles.section}
                        style={{ '--index': index } as CSSProperties}
                      >
                        <span lang="sa-Deva" className={styles.numeral} aria-hidden>
                          {toDevanagariDigits(String(index + 1))}
                        </span>
                        <Link
                          href={section.href}
                          className={styles.sectionLink}
                          aria-current={currentFor(pathname, section.href, section.within)}
                        >
                          {section.label}
                        </Link>
                        {panel === 'concepts' ? (
                          <ConceptsList nav={nav} pathname={pathname} mapNote={mapNote} />
                        ) : null}
                        {panel === 'library' ? <LibraryList nav={nav} pathname={pathname} /> : null}
                      </li>
                    )
                  })}
                </ol>
              </nav>
              <Fleuron className={styles.fleuron} />
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

interface ListProps {
  nav: SiteNav
  pathname: string
}

/** Under Concepts: the A–Z, each topic with its hue, a leader and its Concept count, and the map. */
function ConceptsList({ nav, pathname, mapNote }: ListProps & { mapNote?: ReactNode }) {
  const { index, topics, map } = nav.concepts
  return (
    <ul className={styles.pages}>
      <li>
        <Link
          href={index.href}
          className={styles.page}
          aria-current={currentFor(pathname, index.href)}
        >
          {index.label}
        </Link>
      </li>
      {topics.map((topic) => (
        <li key={topic.slug} data-topic={topic.slug}>
          <Link
            href={topic.href}
            className={styles.page}
            aria-current={currentFor(pathname, topic.href)}
          >
            <span className={styles.name}>
              <span className={styles.lozenge} aria-hidden />
              {topic.label}
            </span>
            <span className={styles.leader} aria-hidden />
            <span className={styles.count}>
              {topic.count}
              <span className="sr-only"> {topic.count === 1 ? 'Concept' : 'Concepts'}</span>
            </span>
          </Link>
        </li>
      ))}
      {map ? (
        <li className={styles.proposal}>
          <Link
            href={map.href}
            className={styles.page}
            aria-current={currentFor(pathname, map.href)}
          >
            {map.label}
          </Link>
          {mapNote}
        </li>
      ) : null}
    </ul>
  )
}

/** Under Library: its five pages, each with a leader to what it holds. */
function LibraryList({ nav, pathname }: ListProps) {
  return (
    <ul className={styles.pages}>
      {nav.library.pages.map((page) => (
        <li key={page.slug}>
          <Link
            href={page.href}
            className={styles.page}
            aria-current={currentFor(pathname, page.href)}
          >
            <span className={styles.name}>{page.label}</span>
            {page.holds ? (
              <>
                <span className={styles.leader} aria-hidden />
                <span className={styles.count}>
                  {page.holds.count}
                  <span className="sr-only">
                    {' '}
                    {page.holds.count === 1 ? page.holds.one : page.holds.many}
                  </span>
                </span>
              </>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
