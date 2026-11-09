import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SESSION_HINT_COOKIE } from '@/lib/auth/shared'

// A browser with the logged-in hint set: what a check of the user-session does to it.

const HINT = `${SESSION_HINT_COOKIE}=1`

let cookies: string

beforeEach(() => {
  cookies = HINT
  vi.stubGlobal('document', {
    get cookie() {
      return cookies
    },
    set cookie(value: string) {
      if (/Max-Age=0/.test(value)) cookies = ''
    },
  })
  vi.resetModules()
})

afterEach(() => vi.unstubAllGlobals())

const answer = async (response: Response) => {
  vi.stubGlobal('fetch', async () => response)
  const { isLoggedIn } = await import('@/components/login-slot')
  return isLoggedIn()
}

describe('asking the server whether a browser is logged in', () => {
  it('clears the hint when the server says there is no user-session', async () => {
    expect(await answer(Response.json(null))).toBe(false)
    expect(cookies).toBe('')
  })

  it('keeps the hint and answers yes when there is a user', async () => {
    expect(await answer(Response.json({ user: { id: 'a' } }))).toBe(true)
    expect(cookies).toBe(HINT)
  })

  it.each([500, 503, 429])('keeps the hint when the check itself fails with %i', async (status) => {
    expect(await answer(new Response('oops', { status }))).toBe(false)
    expect(cookies).toBe(HINT)
  })

  it('keeps the hint when the server can’t be reached', async () => {
    vi.stubGlobal('fetch', async () => Promise.reject(new TypeError('offline')))
    const { isLoggedIn } = await import('@/components/login-slot')
    expect(await isLoggedIn()).toBe(false)
    expect(cookies).toBe(HINT)
  })
})
