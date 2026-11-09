/** The auth route's GET and POST, which answer as if they didn't exist while login is off. */
import 'server-only'

import type { Features } from '@/config/features'

import type { Auth } from './create-auth'
import { SESSION_HINT_COOKIE } from './shared'

const SESSION_COOKIE = /^(?:__Secure-)?better-auth\.session_token=/
const WEEK = 60 * 60 * 24 * 7

/**
 * A second, readable cookie beside the user-session's own, which pages can't read: it lets a
 * page that is static and has no user-session of its own skip asking the server anything for the
 * many visitors who aren't logged in.
 */
function withSessionHint(response: Response, request: Request): Response {
  const session = response.headers.getSetCookie().find((cookie) => SESSION_COOKIE.test(cookie))
  if (!session) return response
  const ended = /^[^=]+=;/.test(session) || /max-age=0\b/i.test(session)
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  const hint = ended
    ? `${SESSION_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
    : `${SESSION_HINT_COOKIE}=1; Path=/; Max-Age=${WEEK}; SameSite=Lax${secure}`
  const headers = new Headers(response.headers)
  headers.append('set-cookie', hint)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * The only addresses passed on to Better Auth. Its limiter runs before it looks for a route and
 * counts each path separately, so anything else would be an unlimited stream of database writes.
 */
const SERVED_PATHS: ReadonlySet<string> = new Set([
  '/get-session',
  '/sign-in/social',
  '/callback/google',
  '/email-otp/send-verification-otp',
  '/sign-in/email-otp',
  '/sign-out',
  '/delete-user',
  '/delete-user/callback',
  // Better Auth sends a failed Google return here when it can't tell which screen it came from.
  '/error',
  // Asks only whether the route is up.
  '/ok',
])

const isServed = (request: Request) =>
  SERVED_PATHS.has(new URL(request.url).pathname.replace(/^\/api\/auth/, '').replace(/\/+$/, ''))

interface AuthRouteDeps {
  features: Pick<Features, 'login'>
  getAuth: () => Pick<Auth, 'handler'>
}

export function authRoute({ features, getAuth }: AuthRouteDeps) {
  const handle = async (request: Request): Promise<Response> => {
    if (!features.login || !isServed(request)) return new Response(null, { status: 404 })
    return withSessionHint(await getAuth().handler(request), request)
  }
  return { GET: handle, POST: handle }
}
