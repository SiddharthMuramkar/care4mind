'use client'

import { NavigationMenu } from '@base-ui/react/navigation-menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { toDevanagariDigits } from '@/lib/text'

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
  /** The panel whose toggle a mouse came onto before this arrived. */
  initialHover?: PanelId
}

// How long a pointer rests on a toggle before its panel opens, and leaves before it closes.
const OPEN_DELAY = 120
const CLOSE_DELAY = 240

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
  initialHover,
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

  // A mouse that came onto a toggle before this arrived, and rests there, opens its panel as
  // moving onto it would have: a pointer that stays still gets no new event to open it with.
  useEffect(() => {
    if (!initialHover) return
    const timer = setTimeout(() => {
      if (slots[initialHover]?.matches(':hover')) setValue((open) => open ?? initialHover)
    }, OPEN_DELAY)
    return () => clearTimeout(timer)
  }, [initialHover, slots])

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
      delay={OPEN_DELAY}
      closeDelay={CLOSE_DELAY}
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
 * The five topics set like a book's contents: a Devanagari numeral, the topic and its term, a
 * dotted leader and its Concept count where the page number would be. Then the A–Z and, while it
 * is on, the Concept map. As the panel opens the rows rise in turn and their leaders ink in.
 */
function ConceptsPanel({ site, pathname, mapNote }: PanelProps & { mapNote?: ReactNode }) {
  const { topics, index, map } = site.concepts
  return (
    <div className={styles.concepts}>
      <PanelHead>Concepts by topic</PanelHead>
      <ol className={styles.contents}>
        {topics.map((topic, position) => (
          <li
            key={topic.slug}
            data-topic={topic.slug}
            style={{ '--index': position } as CSSProperties}
          >
            <PanelLink href={topic.href} pathname={pathname} className={styles.entry}>
              <span lang="sa-Deva" className={styles.numeral} aria-hidden>
                {toDevanagariDigits(String(position + 1))}
              </span>
              <span className={styles.name}>
                {topic.label}
                {topic.term ? (
                  <span lang="sa-Latn" className={styles.term}>
                    {topic.term}
                  </span>
                ) : null}
              </span>
              <span className={styles.leader} aria-hidden />
              <span className={styles.count}>
                {topic.count} {topic.count === 1 ? 'Concept' : 'Concepts'}
              </span>
            </PanelLink>
          </li>
        ))}
      </ol>
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

/** The Library's pages as a catalogue: References first, then the reading lists, each with its count. */
function LibraryPanel({ site, pathname }: PanelProps) {
  const { pages, index } = site.library
  return (
    <div className={styles.library}>
      <PanelHead>The Library</PanelHead>
      <ul className={styles.contents}>
        {pages.map((page, position) => (
          <li key={page.slug} style={{ '--index': position } as CSSProperties}>
            <PanelLink href={page.href} pathname={pathname} className={styles.entry}>
              <span className={styles.name}>{page.label}</span>
              {page.count === undefined ? null : (
                <>
                  <span className={styles.leader} aria-hidden />
                  <span className={styles.count}>
                    {page.count} {page.count === 1 ? 'entry' : 'entries'}
                  </span>
                </>
              )}
            </PanelLink>
          </li>
        ))}
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

/** A panel's running head in small capitals, over a printer's double rule that inks in from the centre. */
function PanelHead({ children }: { children: ReactNode }) {
  return (
    <div className={styles.head}>
      <p className={styles.kicker}>{children}</p>
      <span className={styles.headRule} aria-hidden />
    </div>
  )
}
