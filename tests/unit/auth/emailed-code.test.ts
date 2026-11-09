import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { loginHarness } from './harness'

let login: Awaited<ReturnType<typeof loginHarness>>

beforeAll(async () => {
  login = await loginHarness()
})
beforeEach(() => login.reset())
afterEach(() => vi.useRealTimers())
afterAll(() => login.close())

const EMAIL = 'asha@example.test'
const json = (response: Response) => response.json() as Promise<Record<string, unknown>>

describe('the bot check', () => {
  it('refuses to send a code with no token, and sends nothing', async () => {
    const response = await login.request('POST', '/email-otp/send-verification-otp', {
      body: { email: EMAIL, type: 'sign-in' },
      headers: { 'x-login-intent': 'sign-up' },
    })
    expect(response.status).toBe(400)
    expect(login.outbox).toEqual([])
  })

  it('refuses a token Cloudflare doesn’t accept', async () => {
    login.setVerdict({ success: false })
    expect((await login.sendCode(EMAIL, 'sign-up')).status).toBe(403)
    expect(login.outbox).toEqual([])
  })

  it('refuses a token issued for another hostname', async () => {
    login.setVerdict({ success: true, hostname: 'bot-farm.example', action: 'login' })
    expect((await login.sendCode(EMAIL, 'sign-up')).status).toBe(403)
    expect(login.outbox).toEqual([])
  })

  it('refuses a token issued for another action', async () => {
    login.setVerdict({ success: true, hostname: 'www.care4mind.xyz', action: 'newsletter' })
    expect((await login.sendCode(EMAIL, 'sign-up')).status).toBe(403)
    expect(login.outbox).toEqual([])
  })

  it('refuses everyone while Cloudflare can’t be reached', async () => {
    login.setVerdict('unreachable')
    expect((await login.sendCode(EMAIL, 'sign-up')).status).toBe(500)
    expect(login.outbox).toEqual([])
  })

  it('sends the token to be verified, once per request, and sends a code once it passes', async () => {
    expect((await login.sendCode(EMAIL, 'sign-up')).status).toBe(200)
    expect(login.verified).toHaveLength(1)
    expect(login.verified[0]).toContain('a-token')
    expect(login.outbox).toHaveLength(1)
  })
})

describe('with Cloudflare’s test keys', () => {
  it('sets aside the hostname and action checks, whose answers test keys can’t give', async () => {
    const withTestKeys = await loginHarness({
      settings: {
        botCheck: {
          secretKey: '1x0000000000000000000000000000000AA',
          testKeys: true,
          verifyUrl: 'https://bot-check.test/siteverify',
        },
      },
    })
    try {
      withTestKeys.setVerdict({ success: true, hostname: 'example.com' })
      expect((await withTestKeys.sendCode(EMAIL, 'sign-up')).status).toBe(200)
      expect(withTestKeys.outbox).toHaveLength(1)
    } finally {
      await withTestKeys.close()
    }
  })
})

describe('the emailed code', () => {
  it('is six digits and creates no account until it is confirmed', async () => {
    await login.sendCode(EMAIL, 'sign-up')
    expect(login.codeFor(EMAIL)).toMatch(/^\d{6}$/)
    expect(await login.count('user')).toBe(0)
    expect(await login.count('session')).toBe(0)

    const response = await login.redeemCode(EMAIL, login.codeFor(EMAIL), 'Asha')
    expect(response.status).toBe(200)
    expect(await login.users()).toEqual([{ email: EMAIL, name: 'Asha', emailVerified: true }])
    expect(response.headers.get('set-cookie')).toMatch(/session_token=/)
  })

  // An account is needed: for an address with none, Better Auth stops before calling the sender.
  it.each(['email-verification', 'forget-password'])(
    'is never sent for %s, even to a real account',
    async (type) => {
      await login.signUp(EMAIL, 'Asha')
      login.outbox.length = 0
      const response = await login.request('POST', '/email-otp/send-verification-otp', {
        body: { email: EMAIL, type },
        headers: { 'x-captcha-response': 'a-token' },
      })
      expect(response.status).toBe(200)
      expect(login.outbox).toEqual([])
    },
  )

  it('works for 10 minutes and no longer', async () => {
    const start = new Date('2026-11-09T10:00:00Z')
    vi.useFakeTimers({ now: start, toFake: ['Date'] })
    await login.sendCode(EMAIL, 'sign-up')
    const code = login.codeFor(EMAIL)

    vi.setSystemTime(new Date(start.getTime() + 10 * 60_000 + 1000))
    const late = await login.redeemCode(EMAIL, code, 'Asha')
    expect(late.status).toBe(400)
    expect(await login.count('user')).toBe(0)

    await login.sendCode(EMAIL, 'sign-up')
    const fresh = login.codeFor(EMAIL)
    vi.setSystemTime(new Date(start.getTime() + 19 * 60_000))
    expect((await login.redeemCode(EMAIL, fresh, 'Asha')).status).toBe(200)
  })

  it('takes five wrong tries and still works', async () => {
    await login.sendCode(EMAIL, 'sign-up')
    const code = login.codeFor(EMAIL)
    const wrong = code === '000000' ? '000001' : '000000'
    for (let attempt = 0; attempt < 4; attempt++) {
      expect((await login.redeemCode(EMAIL, wrong, 'Asha')).status).toBe(400)
    }
    expect((await login.redeemCode(EMAIL, code, 'Asha')).status).toBe(200)
  })

  it('stops working after the fifth wrong try, even for the right code', async () => {
    await login.sendCode(EMAIL, 'sign-up')
    const code = login.codeFor(EMAIL)
    const wrong = code === '000000' ? '000001' : '000000'
    for (let attempt = 0; attempt < 5; attempt++) {
      await login.redeemCode(EMAIL, wrong, 'Asha')
    }
    const after = await login.redeemCode(EMAIL, code, 'Asha')
    expect(after.status).toBe(403)
    expect(await login.count('user')).toBe(0)
  })
})

describe('Sign up', () => {
  it('needs a name, and refuses a tampered client with no account made', async () => {
    await login.sendCode(EMAIL, 'sign-up')
    const response = await login.redeemCode(EMAIL, login.codeFor(EMAIL), '   ')
    expect(response.status).toBe(400)
    expect(await json(response)).toMatchObject({ code: 'NAME_NEEDED' })
    expect(await login.count('user')).toBe(0)
  })

  it('refuses a name longer than 100 characters', async () => {
    await login.sendCode(EMAIL, 'sign-up')
    const response = await login.redeemCode(EMAIL, login.codeFor(EMAIL), 'a'.repeat(101))
    expect(response.status).toBe(400)
    expect(await login.count('user')).toBe(0)
  })

  it('trims the name it keeps', async () => {
    await login.sendCode(EMAIL, 'sign-up')
    await login.redeemCode(EMAIL, login.codeFor(EMAIL), '  Asha K  ')
    expect(await login.users()).toEqual([{ email: EMAIL, name: 'Asha K', emailVerified: true }])
  })

  it('logs in an email that already has an account, leaving its name alone', async () => {
    await login.signUp(EMAIL, 'Asha')
    await login.sendCode(EMAIL, 'sign-up')
    const response = await login.redeemCode(EMAIL, login.codeFor(EMAIL), 'Someone Else')
    expect(response.status).toBe(200)
    expect(await login.users()).toEqual([{ email: EMAIL, name: 'Asha', emailVerified: true }])
  })
})

describe('Log in', () => {
  it('answers the same for a known email and an unknown one', async () => {
    await login.signUp(EMAIL, 'Asha')
    login.outbox.length = 0

    const known = await login.sendCode(EMAIL, 'log-in')
    const unknown = await login.sendCode('nobody@example.test', 'log-in')
    expect(unknown.status).toBe(known.status)
    expect(await json(unknown)).toEqual(await json(known))
    expect(login.outbox.map(({ to }) => to)).toEqual([EMAIL])
    expect(await login.count('user')).toBe(1)
  })

  it('sends a code to a known email and logs in with it, name unchanged', async () => {
    await login.signUp(EMAIL, 'Asha')
    login.outbox.length = 0
    await login.sendCode(EMAIL, 'log-in')
    const response = await login.redeemCode(EMAIL, login.codeFor(EMAIL))
    expect(response.status).toBe(200)
    expect(await login.users()).toEqual([{ email: EMAIL, name: 'Asha', emailVerified: true }])
  })

  it('asks a request that names no screen for an account, as Log in does', async () => {
    const response = await login.request('POST', '/email-otp/send-verification-otp', {
      body: { email: 'nobody@example.test', type: 'sign-in' },
      headers: { 'x-captcha-response': 'a-token' },
    })
    expect(response.status).toBe(200)
    expect(login.outbox).toEqual([])
  })

  it('makes no account when an unknown email redeems a code', async () => {
    await login.sendCode('nobody@example.test', 'log-in')
    const response = await login.redeemCode('nobody@example.test', '123456')
    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(await login.count('user')).toBe(0)
  })
})

describe('a user-session', () => {
  const start = new Date('2026-11-09T10:00:00Z')
  const days = (n: number) => new Date(start.getTime() + n * 24 * 60 * 60_000)

  /** Log in at `start` and return the cookie header to send as this user. */
  async function logIn(): Promise<string> {
    vi.useFakeTimers({ now: start, toFake: ['Date'] })
    const response = await login.signUp(EMAIL, 'Asha')
    const cookies = response.headers.getSetCookie()
    return cookies.map((cookie) => cookie.split(';')[0]).join('; ')
  }

  const sessionFor = async (cookie: string) => {
    const response = await login.request('GET', '/get-session', { headers: { cookie } })
    return (await response.json()) as { user?: { email: string } } | null
  }

  it('lasts 7 days without use, and ends then', async () => {
    const cookie = await logIn()
    vi.setSystemTime(days(7.1))
    expect(await sessionFor(cookie)).toBeNull()
  })

  it('still answers on the day before it ends', async () => {
    const cookie = await logIn()
    vi.setSystemTime(days(6.9))
    expect((await sessionFor(cookie))?.user?.email).toBe(EMAIL)
  })

  it('does not renew within a day of its last renewal', async () => {
    const cookie = await logIn()
    vi.setSystemTime(days(0.9))
    expect((await sessionFor(cookie))?.user?.email).toBe(EMAIL)
    vi.setSystemTime(days(7.1))
    expect(await sessionFor(cookie)).toBeNull()
  })

  it('renews when used, at most once a day', async () => {
    const cookie = await logIn()
    vi.setSystemTime(days(3))
    expect((await sessionFor(cookie))?.user?.email).toBe(EMAIL)
    vi.setSystemTime(days(9))
    expect((await sessionFor(cookie))?.user?.email).toBe(EMAIL)
    vi.setSystemTime(days(16.5))
    expect(await sessionFor(cookie)).toBeNull()
  })

  it('ends at Log out', async () => {
    const cookie = await logIn()
    const response = await login.request('POST', '/sign-out', { headers: { cookie } })
    expect(response.status).toBe(200)
    expect(await sessionFor(cookie)).toBeNull()
  })
})

describe('the logged-in hint a static page reads', () => {
  it('is set when a user-session starts, and cleared at Log out', async () => {
    const started = await login.signUp(EMAIL, 'Asha')
    const set = started.headers.getSetCookie()
    expect(set.find((cookie) => cookie.startsWith('c4m-logged-in=1'))).toMatch(/Max-Age=604800/)
    expect(set.find((cookie) => cookie.startsWith('c4m-logged-in='))).not.toMatch(/HttpOnly/i)

    const cookie = set.map((value) => value.split(';')[0]).join('; ')
    const ended = await login.request('POST', '/sign-out', { headers: { cookie } })
    expect(
      ended.headers.getSetCookie().find((value) => value.startsWith('c4m-logged-in=')),
    ).toMatch(/^c4m-logged-in=;.*Max-Age=0/)
  })

  it('is absent from answers that touch no user-session', async () => {
    const response = await login.request('GET', '/get-session')
    expect(response.headers.getSetCookie().filter((cookie) => cookie.startsWith('c4m'))).toEqual([])
  })
})

describe('the auth route’s addresses', () => {
  it('answers with the site’s trailing slash, and without one', async () => {
    const slashed = await login.request('GET', '/get-session/')
    expect(slashed.status).toBe(200)
    const slashless = await login.request('GET', '/ok', { exactPath: true })
    expect(slashless.status).toBe(200)
  })
})
