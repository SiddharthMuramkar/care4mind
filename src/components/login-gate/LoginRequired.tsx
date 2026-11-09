import type { ReactNode } from 'react'

import { features } from '@/config/features'
import { hrefFor } from '@/content'

import { LoginGate } from './LoginGate'

/**
 * Sets a page's content behind Log in while the login switch is on, and leaves it exactly as it
 * was while the switch is off. The one place a page asks about the switch.
 */
export function LoginRequired({ children }: { children: ReactNode }) {
  if (!features.login) return children
  return <LoginGate logIn={hrefFor({ page: 'log-in' })}>{children}</LoginGate>
}
