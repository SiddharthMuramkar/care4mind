'use client'

import { usePathname } from 'next/navigation'
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

import { cx } from '@/lib/cx'

import { MenuGlyph } from '../glyphs'
import { whenIdle } from '../browser'
import { TABLET } from './current'
import styles from './MenuButton.module.css'
import type { MenuDrawerProps } from './MenuDrawer'
import type { SiteNav } from './types'

let drawer: Promise<ComponentType<MenuDrawerProps>> | undefined
const loadDrawer = () => (drawer ??= import('./MenuDrawer').then((module) => module.MenuDrawer))

interface Props {
  nav: SiteNav
  /** The Search slot the Drawer holds, rendered on the server. */
  search?: ReactNode
  /** The Log in slot the Drawer holds, rendered on the server. */
  login?: ReactNode
  /** The Proposal label beside the Concept map. */
  mapNote?: ReactNode
  /** The help line the Drawer ends with, rendered on the server. */
  help?: ReactNode
}

/**
 * The phone's Menu. Until the Drawer's code is in the page it is what it is without JavaScript, a
 * link to the full navigation in the footer, so a press never goes unanswered while the page is
 * still starting. Once the code is in, it is a button that opens the Drawer at once. The code
 * loads when the browser is idle, or as soon as a pointer, focus or press comes to the Menu, never
 * with the page. A new page closes the Drawer, however it came: a link in it, Back, or anything
 * else.
 */
export function MenuButton({ nav, search, login, mapNote, help }: Props) {
  const button = useRef<HTMLAnchorElement>(null)
  const [open, setOpen] = useState(false)
  const [Drawer, setDrawer] = useState<ComponentType<MenuDrawerProps>>()

  const pathname = usePathname()
  const [shownOn, setShownOn] = useState(pathname)
  if (shownOn !== pathname) {
    setShownOn(pathname)
    setOpen(false)
  }

  const load = useCallback(
    () =>
      loadDrawer().then((component) => {
        setDrawer(() => component)
      }),
    [],
  )

  useEffect(() => {
    if (matchMedia(TABLET).matches) return
    return whenIdle(() => void load())
  }, [load])

  const press = (event: MouseEvent | KeyboardEvent) => {
    // Not here yet: the link goes to the footer's navigation, as it does without JavaScript.
    if (!Drawer) return
    event.preventDefault()
    setOpen(true)
  }

  // From 48rem the Menu link is display:none and can't take focus back.
  useEffect(() => {
    if (!open) return
    const tablet = matchMedia(TABLET)
    const close = () => {
      if (tablet.matches) setOpen(false)
    }
    tablet.addEventListener('change', close)
    return () => tablet.removeEventListener('change', close)
  }, [open])

  return (
    <>
      <a
        ref={button}
        href="#site-nav"
        className={styles.menu}
        // Once the Drawer's code is in, the link is a button that opens a dialog.
        role={Drawer ? 'button' : undefined}
        aria-haspopup={Drawer ? 'dialog' : undefined}
        aria-expanded={Drawer ? open : undefined}
        data-ink
        onPointerEnter={() => void load()}
        onFocus={() => void load()}
        onPointerDown={() => void load()}
        onClick={press}
        onKeyDown={(event) => {
          if (event.key === ' ') press(event)
        }}
      >
        <MenuGlyph className={cx(styles.glyph, nav.login && styles.glyphBesideLogIn)} />
        Menu
      </a>
      {Drawer ? (
        <Drawer
          nav={nav}
          open={open}
          onOpenChange={setOpen}
          returnFocus={button}
          search={search}
          login={login}
          mapNote={mapNote}
          help={help}
        />
      ) : null}
    </>
  )
}
