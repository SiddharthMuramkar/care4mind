'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ComponentProps, useLayoutEffect, useRef } from 'react'

import { currentFor } from './current'

type Props = Omit<ComponentProps<typeof Link>, 'href' | 'aria-current' | 'ref'> & {
  href: Route
  /** Paths below this link's page, where it reads as current too (`aria-current="true"`). */
  within?: readonly string[]
}

/**
 * A link that says whether you are on its page (`aria-current="page"`) or below it ("true"),
 * from the address, so it stays right as the layout persists across page changes.
 */
export function CurrentLink({ href, within, ...props }: Props) {
  const current = currentFor(usePathname(), href, within)
  const link = useRef<HTMLAnchorElement>(null)
  // A missing page is sent as the one prerendered 404, whatever its address, and hydrating keeps
  // the attributes the server sent: mark the section that address is in all the same.
  useLayoutEffect(() => {
    const element = link.current
    if (!element || element.getAttribute('aria-current') === (current ?? null)) return
    if (current) element.setAttribute('aria-current', current)
    else element.removeAttribute('aria-current')
  }, [current])
  return <Link ref={link} href={href} aria-current={current} {...props} />
}
