'use client'

import { NavigationMenu } from '@base-ui/react/navigation-menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type CSSProperties, type ReactNode, useCallback, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { kolam } from '@/lib/kolam'

import { currentFor, panelOf } from './current'
import { ArrowGlyph, ChevronGlyph } from './glyphs'
import nav from './nav.module.css'
import styles from './NavPanels.module.css'
import type { PanelId, SiteNav } from './types'

export interface NavPanelsProps {
  nav: SiteNav
  /** Where each panel's toggle stands in the header's list of sections (`[data-panel]`). */
  slots: Slots
  /** The Proposal label beside the Concept map, rendered on the server. */
  mapNote?: ReactNode
  /** A panel whose toggle was pressed before this loaded. */
  initialOpen?: PanelId
  /** The panel whose toggle had focus as this arrived. */
  initialFocus?: PanelId
}

export type Slots = Partial<Record<PanelId, HTMLElement>>

/**
 * Base UI's NavigationMenu (design C1) behind the header's sections: its toggles stand in the
 * list beside Concepts and Library, and open their panels on hover, press or ArrowDown. Escape
 * closes a panel and gives focus back to its toggle; Tab runs through a panel and on, never
 * trapped; a new page closes it. The section links are the server's own and are never replaced.
 */
export function NavPanels({
  nav: site,
  slots,
  mapNote,
  initialOpen,
  initialFocus,
}: NavPanelsProps) {
  const pathname = usePathname()
  const [value, setValue] = useState<PanelId | null>(initialOpen ?? null)
  const [shownOn, setShownOn] = useState(pathname)
  if (shownOn !== pathname) {
    setShownOn(pathname)
    setValue(null)
  }

  // Focus that was on a toggle moves to the toggle that took its place.
  useLayoutEffect(() => {
    if (initialFocus) slots[initialFocus]?.querySelector('button')?.focus({ preventScroll: true })
  }, [initialFocus, slots])

  // A panel hangs from its whole item, label and toggle, not the toggle alone.
  const anchor = useCallback(
    () => (value ? (slots[value]?.closest('li') ?? null) : null),
    [slots, value],
  )

  return (
    <NavigationMenu.Root
      render={<div className={nav.menu} />}
      value={value}
      onValueChange={(next, details) => {
        // The toggles stand in the header's list, outside this menu's own element: focus moving
        // between a toggle and its panel isn't leaving the menu, so the panel stays open.
        if (next == null && details.reason === 'focus-out') {
          const to = (details.event as FocusEvent).relatedTarget
          if (to instanceof Node && Object.values(slots).some((slot) => slot?.contains(to))) {
            details.cancel()
            return
          }
        }
        setValue(panelOf(String(next)) ?? null)
      }}
      delay={120}
      closeDelay={240}
    >
      <NavigationMenu.List render={<div className={nav.menu} />}>
        {site.sections.map((section) => {
          const panel = panelOf(section.id)
          const slot = panel ? slots[panel] : undefined
          if (!panel || !slot) return null
          return (
            <NavigationMenu.Item key={panel} value={panel} render={<div className={nav.menu} />}>
              {createPortal(
                <NavigationMenu.Trigger
                  className={nav.toggle}
                  aria-label={`More in ${section.label}`}
                  data-ready
                >
                  <ChevronGlyph className={nav.chevron} />
                </NavigationMenu.Trigger>,
                slot,
              )}
              <NavigationMenu.Content className={styles.content}>
                {panel === 'concepts' ? (
                  <ConceptsPanel site={site} pathname={pathname} mapNote={mapNote} />
                ) : (
                  <LibraryPanel site={site} pathname={pathname} />
                )}
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          )
        })}
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          className={styles.positioner}
          anchor={anchor}
          align="start"
          sideOffset={14}
          collisionPadding={16}
        >
          <NavigationMenu.Popup
            className={styles.popup}
            aria-label={site.sections.find((section) => section.id === value)?.label}
          >
            <NavigationMenu.Arrow className={styles.arrow} />
            <NavigationMenu.Viewport className={styles.viewport} />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  )
}

interface PanelProps {
  site: SiteNav
  pathname: string
}

/** A link in a panel: Next's Link, closing the panel as it is followed. */
function PanelLink({
  href,
  pathname,
  className,
  children,
}: {
  href: SiteNav['search']['href']
  pathname: string
  className?: string
  children: ReactNode
}) {
  return (
    <NavigationMenu.Link
      render={<Link href={href} />}
      className={className}
      aria-current={currentFor(pathname, href)}
      closeOnClick
    >
      {children}
    </NavigationMenu.Link>
  )
}

/**
 * The five topics on one unbroken kolam line, a dot in each topic's hue, with their Concept
 * counts; then the A–Z and, while it is on, the Concept map. The line draws as the panel opens.
 */
function ConceptsPanel({ site, pathname, mapNote }: PanelProps & { mapNote?: ReactNode }) {
  const { topics, index, map } = site.concepts
  const thread = kolam(1, Math.max(1, topics.length))
  return (
    <div className={styles.concepts}>
      <p className={styles.kicker}>Concepts by topic</p>
      <div className={styles.topics}>
        <svg
          className={styles.thread}
          viewBox={`0 0 ${thread.width} ${thread.height}`}
          width={thread.width}
          height={thread.height}
          aria-hidden
          focusable="false"
        >
          <path d={thread.d} pathLength={1} />
        </svg>
        <ul className={styles.topicList}>
          {topics.map((topic, index) => (
            <li
              key={topic.slug}
              data-topic={topic.slug}
              style={{ '--index': index } as CSSProperties}
            >
              <PanelLink href={topic.href} pathname={pathname} className={styles.topic}>
                <span className={styles.dot} aria-hidden />
                <span className={styles.topicName}>
                  {topic.label}
                  {topic.term ? (
                    <span lang="sa-Latn" className={styles.term}>
                      {topic.term}
                    </span>
                  ) : null}
                </span>
                <span className={styles.count}>
                  {topic.count} {topic.count === 1 ? 'Concept' : 'Concepts'}
                </span>
              </PanelLink>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.more}>
        <PanelLink href={index.href} pathname={pathname} className={styles.onward}>
          {index.label}
          <ArrowGlyph className={styles.arrowGlyph} />
        </PanelLink>
        {map ? (
          <span className={styles.proposal}>
            <PanelLink href={map.href} pathname={pathname} className={styles.onward}>
              {map.label}
              <ArrowGlyph className={styles.arrowGlyph} />
            </PanelLink>
            {mapNote}
          </span>
        ) : null}
      </div>
    </div>
  )
}

// Each page of the Library is a book in a pile, bound in its own cloth.
const CLOTHS = ['indigo', 'madder', 'turmeric', 'neem', 'teak'] as const

/** The Library's pages as a pile of books, set in type: References first, as the heaviest. */
function LibraryPanel({ site, pathname }: PanelProps) {
  const { pages, index } = site.library
  return (
    <div className={styles.library}>
      <p className={styles.kicker}>The Library</p>
      <ul className={styles.pile}>
        {pages.map((page, position) => {
          const cloth = CLOTHS[position % CLOTHS.length]
          return (
            <li
              key={page.slug}
              className={styles.book}
              data-cloth={cloth}
              style={{ '--index': position } as CSSProperties}
            >
              <PanelLink href={page.href} pathname={pathname} className={styles.spine}>
                <span className={styles.title}>{page.label}</span>
                {page.count === undefined ? null : (
                  <span className={styles.volume}>
                    {page.count} {page.count === 1 ? 'entry' : 'entries'}
                  </span>
                )}
              </PanelLink>
            </li>
          )
        })}
      </ul>
      <div className={styles.more}>
        <PanelLink href={index.href} pathname={pathname} className={styles.onward}>
          The whole Library
          <ArrowGlyph className={styles.arrowGlyph} />
        </PanelLink>
      </div>
    </div>
  )
}
