'use client'

import { type ComponentType, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { ChevronGlyph } from './glyphs'
import { CurrentLink } from './CurrentLink'
import { panelOf, useHydrated, WIDE, whenIdle } from './current'
import styles from './nav.module.css'
import type { NavPanelsProps, Slots } from './NavPanels'
import type { PanelId, SiteNav } from './types'

let panels: Promise<ComponentType<NavPanelsProps>> | undefined
const loadPanels = () => (panels ??= import('./NavPanels').then((module) => module.NavPanels))

interface Enhanced {
  Panels: ComponentType<NavPanelsProps>
  slots: Slots
  open?: PanelId
  focus?: PanelId
}

/**
 * The header's four sections as server-rendered links, each marked when you are in it. On a
 * computer, Concepts and Library also open panels: Base UI's NavigationMenu loads when the
 * browser is idle, or as soon as a pointer or focus comes near, and puts its toggles in place of
 * these. The links themselves stay as they are. A toggle pressed before then opens its panel as
 * it arrives.
 */
export function SectionNav({ nav, mapNote }: { nav: SiteNav; mapNote?: ReactNode }) {
  const hydrated = useHydrated()
  const list = useRef<HTMLUListElement>(null)
  const [enhanced, setEnhanced] = useState<Enhanced>()

  const upgrade = useCallback((open?: PanelId) => {
    void loadPanels().then((Panels) => {
      const slots: Slots = {}
      for (const slot of list.current?.querySelectorAll<HTMLElement>('[data-panel]') ?? []) {
        const panel = panelOf(slot.dataset.panel ?? '')
        if (panel) slots[panel] = slot
      }
      // A toggle with focus is about to be replaced: hand focus on to the new one.
      const holder = document.activeElement?.closest<HTMLElement>('[data-panel]')
      const focus = holder?.dataset.panel ? panelOf(holder.dataset.panel) : undefined
      setEnhanced((current) => ({
        Panels,
        slots: current?.slots ?? slots,
        open: current?.open ?? open,
        focus: current?.focus ?? focus,
      }))
    })
  }, [])

  useEffect(() => {
    if (!matchMedia(WIDE).matches) return
    return whenIdle(() => upgrade())
  }, [upgrade])

  return (
    <>
      <ul
        ref={list}
        className={styles.sections}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') upgrade()
        }}
        onFocus={() => upgrade()}
      >
        {nav.sections.map((section) => {
          const panel = panelOf(section.id)
          return (
            <li key={section.id} className={styles.section}>
              <CurrentLink
                href={section.href}
                within={section.within}
                className={styles.link}
                data-nav={section.id}
              >
                {section.label}
              </CurrentLink>
              {panel ? (
                // The NavigationMenu puts its own toggle here once it arrives.
                <span className={styles.slot} data-panel={panel}>
                  {enhanced ? null : (
                    <button
                      type="button"
                      className={styles.toggle}
                      aria-label={`More in ${section.label}`}
                      aria-expanded={false}
                      // Shown once it works: without JavaScript there is no panel, only the link.
                      data-ready={hydrated || undefined}
                      onClick={() => upgrade(panel)}
                      onKeyDown={(event) => {
                        // As the NavigationMenu's toggles do.
                        if (event.key === 'ArrowDown') {
                          event.preventDefault()
                          upgrade(panel)
                        }
                      }}
                    >
                      <ChevronGlyph className={styles.chevron} />
                    </button>
                  )}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
      {enhanced ? (
        <enhanced.Panels
          nav={nav}
          slots={enhanced.slots}
          mapNote={mapNote}
          initialOpen={enhanced.open}
          initialFocus={enhanced.focus}
        />
      ) : null}
    </>
  )
}
