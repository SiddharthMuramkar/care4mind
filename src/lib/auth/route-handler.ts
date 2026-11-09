/** The auth route's GET and POST, which answer as if they didn't exist while login is off. */
import 'server-only'

import type { Features } from '@/config/features'

import type { Auth } from './create-auth'
import { SESSION_HINT_COOKIE } from './shared'

const SESSION_COOKIE = /^(?:__Secure-)?better-auth\.session_token=/
const WEEK = 60 * 60 * 24 * 7

/**
 * A second, readable cookie beside the user-session's own, which pages can't read: it lets a
 * page that is static and has no session of its own skip asking the server anything for the
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

interface AuthRouteDeps {
  features: Pick<Features, 'login'>
  getAuth: () => Pick<Auth, 'handler'>
}

export function authRoute({ features, getAuth }: AuthRouteDeps) {
  const handle = async (request: Request): Promise<Response> => {
    if (!features.login) return new Response(null, { status: 404 })
    return withSessionHint(await getAuth().handler(request), request)
  }
  return { GET: handle, POST: handle }
}
