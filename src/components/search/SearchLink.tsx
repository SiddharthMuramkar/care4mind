'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { type MouseEvent, type ReactNode, useSyncExternalStore } from 'react'

import { CurrentLink } from '@/components/nav/CurrentLink'

import { isApple, openPalette, prepareSearch } from './palette'
import { HEADER_TRIGGER, PaletteHost } from './PaletteHost'
import styles from './SearchTrigger.module.css'

interface Props {
  href: Route
  /** The results page's own path. */
  searchPath: Route
  placement: 'header' | 'drawer' | 'page'
  initialQuery?: string
  className?: string
  children: ReactNode
}

const never = () => () => {}

/** The shortcut as the visitor's keyboard writes it, once the page is interactive. */
function useShortcut() {
  return useSyncExternalStore(
    never,
    () => (isApple() ? '⌘K' : 'Ctrl K'),
    () => undefined,
  )
}

/**
 * Runs something once the Menu's Drawer has closed: it closes as its links are followed and then
 * gives focus back to Menu, so the palette opens after, from Menu, and keeps focus in its field.
 */
function afterClosing(sheet: Element, then: () => void) {
  const started = performance.now()
  const check = () => {
    if (sheet.isConnected && performance.now() - started < 2000) requestAnimationFrame(check)
    else requestAnimationFrame(then)
  }
  requestAnimationFrame(check)
}

/**
 * Search's link, which opens the palette once the page is interactive. A press with a modifier
 * (a new tab or window) is left to the browser, and without JavaScript it is the plain link.
 */
export function SearchLink({
  href,
  searchPath,
  placement,
  initialQuery,
  className,
  children,
}: Props) {
  const shortcut = useShortcut()
  const header = placement === 'header'

  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    const query = initialQuery ?? ''
    const sheet = placement === 'drawer' ? event.currentTarget.closest('[role="dialog"]') : null
    if (sheet) afterClosing(sheet, () => openPalette(query))
    else openPalette(query, event.currentTarget)
  }

  const props = {
    href,
    className: `${className ?? ''} ${header ? styles.shortcut : ''}`.trim() || undefined,
    onClick: open,
    onPointerEnter: prepareSearch,
    onFocus: prepareSearch,
    // The header's Search draws its shortcut where the ink would spread.
    'data-ink': header ? undefined : true,
    'aria-haspopup': shortcut ? ('dialog' as const) : undefined,
    'aria-keyshortcuts':
      header && shortcut ? (shortcut === '⌘K' ? 'Meta+K' : 'Control+K') : undefined,
    // The hint beside Search in the header; its box is kept before the page is interactive.
    'data-shortcut': header ? shortcut : undefined,
    ...(header ? { [HEADER_TRIGGER]: '' } : {}),
  }

  if (placement === 'page') return <Link {...props}>{children}</Link>
  return (
    <>
      <CurrentLink {...props}>{children}</CurrentLink>
      {header ? <PaletteHost searchPath={searchPath} /> : null}
    </>
  )
}
