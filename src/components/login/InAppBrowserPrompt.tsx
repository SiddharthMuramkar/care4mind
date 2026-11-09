'use client'

import { useSyncExternalStore } from 'react'

import styles from './EmailCodeForm.module.css'
import { isInAppBrowser } from './in-app-browser'

const never = () => () => {}

/** Shown on Sign up and Log in inside another app's browser; the emailed code still works there. */
export function InAppBrowserPrompt() {
  const inApp = useSyncExternalStore(
    never,
    () => isInAppBrowser(navigator.userAgent),
    () => false,
  )
  if (!inApp) return null
  return (
    <p className={styles.prompt}>
      You’re reading this inside another app. For the smoothest sign-in, open this page in Chrome or
      Safari: look for Open in browser in the app’s menu. You can also carry on here with an emailed
      code.
    </p>
  )
}
