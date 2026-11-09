'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { useHydrated } from '../browser'
import { isLoggedIn } from './user-session'
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

  useEffect(() => {
    void isLoggedIn().then((answer) => {
      if (answer) setLoggedIn(true)
      else {
        router.replace(`${logIn}?next=${encodeURIComponent(window.location.pathname)}` as Route)
      }
    })
  }, [logIn, router])

  if (loggedIn) return children
  // Before hydration there is nothing to say: this page already explains that it needs JavaScript.
  if (!hydrated) return null
  return (
    <p className={styles.checking} role="status">
      Checking that you’re logged in…
    </p>
  )
}
