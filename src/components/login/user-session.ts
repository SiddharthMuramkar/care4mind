import { authAddress, SESSION_HINT_COOKIE } from '@/lib/auth/shared'

/** The auth route's user-session cookie is HTTP-only: this is the hint set beside it. */
export function hasSessionHint(): boolean {
  return document.cookie.split('; ').includes(`${SESSION_HINT_COOKIE}=1`)
}

function clearSessionHint() {
  document.cookie = `${SESSION_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

let check: Promise<boolean> | undefined

/**
 * Whether this browser is logged in, asked of the server only when the hint says so, and once
 * per page load. A visitor who isn't logged in costs the site nothing on the server, which
 * is most page views of a site that stays statically rendered.
 */
export function isLoggedIn(): Promise<boolean> {
  check ??= hasSessionHint() ? askServer() : Promise.resolve(false)
  return check
}

async function askServer(): Promise<boolean> {
  try {
    const response = await fetch(authAddress('/get-session'))
    const session: unknown = response.ok ? await response.json() : null
    const loggedIn = typeof session === 'object' && session !== null && 'user' in session
    if (!loggedIn) clearSessionHint()
    return loggedIn
  } catch {
    return false
  }
}

/** End the user-session on the server; the reload that follows shows the logged-out page. */
export async function logOut(): Promise<void> {
  await fetch(authAddress('/sign-out'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
}
