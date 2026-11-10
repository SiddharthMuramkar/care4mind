'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { useHydrated } from '../browser'
import { isLoggedIn } from '../login-slot'
import styles from './LoginGate.module.css'

/**
 * What only a logged-in user may reach: a static page, so the check happens in the browser,
 * after hydration, and nothing about the page itself becomes dynamic. A visitor who isn't
 * logged in is sent to Log in and brought back here afterwards.
 */
export function LoginGate({ logIn, children }: { logIn: Route; children: ReactNode }) {
  const hydrated = useHydrated()
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()
  // A plain string: the old-address redirects make Route too long a union for a dependency array.
  const logInPath: string = logIn

  useEffect(() => {
    void isLoggedIn().then((answer) => {
      if (answer) setLoggedIn(true)
      else {
        router.replace(`${logInPath}?next=${encodeURIComponent(window.location.pathname)}` as Route)
      }
    })
  }, [logInPath, router])

  if (loggedIn) return children
  // Before hydration there is nothing to say: this page already explains that it needs JavaScript.
  if (!hydrated) return null
  return (
    <p className={styles.checking} role="status">
      Checking that you’re logged in…
    </p>
  )
}
