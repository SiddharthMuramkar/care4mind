'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import cta from '@/components/Cta'
import { authAddress, DELETE_ACCOUNT_PARAM, PRIVACY_PATH } from '@/lib/auth/shared'

import styles from './DeleteAccount.module.css'
import { isLoggedIn } from '../login-slot'

const never = () => () => {}

/** On the Privacy page's address once an account is gone, so the page can say so after reloading. */
const DELETED_PARAM = 'account-deleted'

/**
 * Delete my account: a logged-in user asks for an emailed link, and the link brings them back
 * here to press once more. The page is static, so everything here is decided in the browser.
 */
export function DeleteAccount({ logIn }: { logIn: Route }) {
  const search = useSyncExternalStore(
    never,
    () => window.location.search,
    () => '',
  )
  const params = new URLSearchParams(search)
  const token = params.get(DELETE_ACCOUNT_PARAM)

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [sent, setSent] = useState(false)
  const [linkRefused, setLinkRefused] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const said = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    void isLoggedIn().then(setLoggedIn)
  }, [])

  // The button that was pressed is gone, so keyboard users are moved to what happened instead.
  useEffect(() => {
    if (sent) said.current?.focus()
  }, [sent])

  async function askForLink() {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(authAddress('/delete-user'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
      if (response.ok) setSent(true)
      else setError('We couldn’t send the email. Please try again in a minute.')
    } catch {
      setError('We couldn’t reach the site. Please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function confirm() {
    if (!token) return
    setBusy(true)
    setError('')
    try {
      // The callback route, not POST /delete-user with the token: only the callback's answer
      // ends the user-session's cookies in the browser (delete-account.test.ts holds this).
      const response = await fetch(
        `${authAddress('/delete-user/callback')}?token=${encodeURIComponent(token)}`,
      )
      if (response.ok) {
        // A fresh load, so the header stops saying Log out and the spent link leaves the address.
        window.location.replace(`${PRIVACY_PATH}?${DELETED_PARAM}=1`)
        return
      }
      setLinkRefused(true)
      setError(
        'That link has run out, has been used, or belongs to another account. You can ask for a new one.',
      )
    } catch {
      setError('We couldn’t reach the site. Please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (params.has(DELETED_PARAM)) {
    return (
      <p className={styles.message} role="status">
        Your account has been deleted.
      </p>
    )
  }

  // Nothing to show until the browser knows, and nothing at all for a visitor with no link.
  if (loggedIn === null || (!loggedIn && !token)) return null

  if (!loggedIn) {
    const here = `${PRIVACY_PATH}?${DELETE_ACCOUNT_PARAM}=${encodeURIComponent(token ?? '')}`
    return (
      <div className={styles.account}>
        <p className={styles.message}>
          This link only works in a browser where you’re logged in. Log in here to carry on, or open
          the link in the browser you use for Care4Mind.
        </p>
        <Link href={`${logIn}?next=${encodeURIComponent(here)}` as Route} className={cta.secondary}>
          Log in
        </Link>
      </div>
    )
  }

  if (token && !linkRefused) {
    return (
      <div className={styles.account}>
        <p className={styles.message}>Press this to delete your account now. It can’t be undone.</p>
        <button
          type="button"
          className={cta.primary}
          disabled={busy}
          onClick={() => void confirm()}
        >
          Yes, delete my account
        </button>
        <p className={styles.error} role="alert">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className={styles.account}>
      {sent ? (
        <p ref={said} className={styles.message} role="status" tabIndex={-1}>
          We’ve emailed you a link. Open it and press the button there to finish. It works for 24
          hours.
        </p>
      ) : (
        <button
          type="button"
          className={cta.secondary}
          disabled={busy}
          onClick={() => void askForLink()}
        >
          Delete my account
        </button>
      )}
      <p className={styles.error} role="alert">
        {error}
      </p>
    </div>
  )
}
