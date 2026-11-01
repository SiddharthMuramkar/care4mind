'use client'

import {
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { MenuGlyph } from './glyphs'
import { useHydrated, WIDE, whenIdle } from './current'
import styles from './MenuButton.module.css'
import type { MenuDrawerProps } from './MenuDrawer'
import type { SiteNav } from './types'

let drawer: Promise<ComponentType<MenuDrawerProps>> | undefined
const loadDrawer = () => (drawer ??= import('./MenuDrawer').then((module) => module.MenuDrawer))

interface Props {
  nav: SiteNav
  /** The slot the Drawer holds, rendered on the server: SearchTrigger. */
  search?: ReactNode
  /** The Proposal label beside the Concept map. */
  mapNote?: ReactNode
}

/**
 * The narrow screen's Menu. Without JavaScript it is a link to the full navigation in the
 * footer; with it, a button that opens the Drawer. The Drawer's code loads when the browser is
 * idle or on the first press, never with the page.
 */
export function MenuButton({ nav, search, mapNote }: Props) {
  const hydrated = useHydrated()
  const button = useRef<HTMLAnchorElement>(null)
  const [open, setOpen] = useState(false)
  const [Drawer, setDrawer] = useState<ComponentType<MenuDrawerProps>>()

  const load = useCallback(
    () =>
      loadDrawer().then((component) => {
        setDrawer(() => component)
      }),
    [],
  )

  useEffect(() => {
    if (matchMedia(WIDE).matches) return
    return whenIdle(() => void load())
  }, [load])

  // A tablet turned to landscape, or a window widened, shows the full header: the Drawer goes.
  useEffect(() => {
    if (!open) return
    const wide = matchMedia(WIDE)
    const close = () => {
      if (wide.matches) setOpen(false)
    }
    wide.addEventListener('change', close)
    return () => wide.removeEventListener('change', close)
  }, [open])

  const press = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault()
    void load().then(() => setOpen(true))
  }

  return (
    <>
      <a
        ref={button}
        href="#site-nav"
        className={styles.menu}
        // Once the page is interactive the link is a button that opens a dialog.
        role={hydrated ? 'button' : undefined}
        aria-haspopup={hydrated ? 'dialog' : undefined}
        aria-expanded={hydrated ? open : undefined}
        data-ink
        onPointerDown={() => void load()}
        onClick={press}
        onKeyDown={(event) => {
          if (event.key === ' ') press(event)
        }}
      >
        <MenuGlyph className={styles.glyph} />
        Menu
      </a>
      {Drawer ? (
        <Drawer
          nav={nav}
          open={open}
          onOpenChange={setOpen}
          returnFocus={button}
          search={search}
          mapNote={mapNote}
        />
      ) : null}
    </>
  )
}
