'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useSyncExternalStore } from 'react'

import { useHydrated } from '../browser'
import { hasSessionHint, isLoggedIn, logOut } from './user-session'

const never = () => () => {}

/** The screens that get a user in: Log in from one of them returns nowhere new. */
const LOGIN_SCREENS = /^\/(?:log-in|sign-up)\//

interface LinkProps {
  href: Route
  className?: string | undefined
}

/** Log in, carrying the whole address of this page, its query too, to land back on. */
function LogInLink({ href, className }: LinkProps) {
  const hydrated = useHydrated()
  const pathname = usePathname()
  const query = useSearchParams().toString()
  // Only once the page is interactive: a static page was built without a real address to return to.
  const here =
    hydrated && !LOGIN_SCREENS.test(pathname)
      ? `?next=${encodeURIComponent(query ? `${pathname}?${query}` : pathname)}`
      : ''
  return (
    <Link href={`${href}${here}` as Route} className={className}>
      Log in
    </Link>
  )
}

/**
 * Log in beside Search, and Log out in its place once a user is in. It reads only a cookie set
 * beside the user-session, never the server, so the page around it stays static; the server is
 * asked only for a browser that says it is logged in, and the answer corrects the first guess.
 */
export function LoginSlot({ href, className }: LinkProps) {
  const hinted = useSyncExternalStore(never, hasSessionHint, () => false)
  const [verified, setVerified] = useState<boolean | null>(null)

  useEffect(() => {
    void isLoggedIn().then(setVerified)
  }, [])

  if (verified ?? hinted) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => void logOut().then(() => window.location.reload())}
      >
        Log out
      </button>
    )
  }
  // The boundary keeps the page static: reading the query is left to the browser.
  return (
    <Suspense
      fallback={
        <Link href={href} className={className}>
          Log in
        </Link>
      }
    >
      <LogInLink href={href} className={className} />
    </Suspense>
  )
}
