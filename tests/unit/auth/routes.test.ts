import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { BOT_CHECKED_PATHS, DISABLED_PATHS } from '@/lib/auth/create-auth'

import { loginHarness } from './harness'

let login: Awaited<ReturnType<typeof loginHarness>>

beforeAll(async () => {
  login = await loginHarness()
})
beforeEach(() => login.reset())
afterAll(() => login.close())

/** Routes that can't start a sign-in on their own, each read and reviewed by hand. */
const REVIEWED_PATHS: readonly string[] = [
  // Redeems an emailed code, which only a bot-checked request can have asked for.
  '/sign-in/email-otp',
  // Finishes a sign-in the bot-checked route already began.
  '/callback/:id',
  // Reads a user-session; ends one.
  '/get-session',
  '/sign-out',
  // Answer without touching an account.
  '/ok',
  '/error',
  // Only redirects to the app; with the password routes off, it can't reset anything.
  '/reset-password/:token',
  // Answers 404 without a live user-session, so a link scanner can't delete an account.
  '/delete-user/callback',
]

/** The routes Better Auth serves for this configuration, as their paths. */
function listedRoutes() {
  return Object.values(login.auth.api)
    .map(
      (endpoint) =>
        endpoint as unknown as {
          path?: string
          options?: { method?: string | string[]; metadata?: { SERVER_ONLY?: boolean } }
        },
    )
    .filter((endpoint) => endpoint.path && !endpoint.options?.metadata?.SERVER_ONLY)
    .map((endpoint) => ({
      path: endpoint.path as string,
      method:
        (Array.isArray(endpoint.options?.method)
          ? endpoint.options.method[0]
          : endpoint.options?.method) ?? 'POST',
    }))
}

/** A concrete path for a route that has parameters. */
const fill = (path: string) => path.replace(/:\w+/g, 'x')

/**
 * The fields some routes check before they look for a user-session: a body that passes those
 * checks, so the answer is about the session and not about a missing field.
 */
const VALID_BODIES: Readonly<Record<string, Record<string, unknown>>> = {
  '/verify-password': { password: 'a-long-enough-password' },
  '/change-email': { newEmail: 'new@example.test' },
  '/change-password': {
    newPassword: 'a-long-enough-password',
    currentPassword: 'a-long-enough-password',
  },
  '/revoke-session': { token: 'x' },
  '/link-social': { provider: 'google' },
  '/unlink-account': { accountId: 'x' },
  '/refresh-token': { accountId: 'x' },
  '/get-access-token': { accountId: 'x' },
}

/** A concrete address for a route, with any query string it needs. */
const address = (path: string) => (path === '/account-info' ? `${path}/?accountId=x` : fill(path))

describe('every auth route', () => {
  it('finds the routes it says exist', () => {
    const paths = listedRoutes().map(({ path }) => path)
    expect(paths).toEqual(
      expect.arrayContaining(['/sign-in/email-otp', '/get-session', '/sign-up/email']),
    )
  })

  it('is bot-checked, switched off, needs a user-session, or is reviewed', async () => {
    const ungated: string[] = []
    for (const { path, method } of listedRoutes()) {
      if (DISABLED_PATHS.includes(path)) continue
      if (BOT_CHECKED_PATHS.includes(path)) continue
      if (REVIEWED_PATHS.includes(path)) continue
      const response = await login.request(method as 'GET' | 'POST', address(path), {
        body: VALID_BODIES[path] ?? {},
      })
      if (response.status !== 401) ungated.push(`${method} ${path} answered ${response.status}`)
    }
    expect(ungated, 'routes with no gate: bot-check, switch off, or review them').toEqual([])
  })

  it.each([
    ['POST', '/sign-up/email'],
    ['POST', '/sign-in/email'],
    ['POST', '/request-password-reset'],
    ['POST', '/reset-password'],
    ['POST', '/send-verification-email'],
    ['POST', '/email-otp/request-password-reset'],
    ['POST', '/forget-password/email-otp'],
    ['POST', '/email-otp/reset-password'],
    ['POST', '/email-otp/check-verification-otp'],
    ['POST', '/email-otp/request-email-change'],
    ['POST', '/email-otp/change-email'],
    ['POST', '/email-otp/verify-email'],
    ['GET', '/verify-email'],
  ] as const)('is switched off: %s %s', async (method, path) => {
    expect((await login.request(method, path)).status).toBe(404)
  })

  it.each(['/email-otp/send-verification-otp', '/sign-in/social'])(
    'refuses %s with no bot check token',
    async (path) => {
      const response = await login.request('POST', path, {
        body: { email: 'asha@example.test', type: 'sign-in', provider: 'google' },
      })
      expect(response.status).toBe(400)
      expect(await response.json()).toMatchObject({ code: 'MISSING_RESPONSE' })
    },
  )

  it('keeps the reviewed list real: nothing on it has gone away', () => {
    const paths = listedRoutes().map(({ path }) => path)
    for (const path of REVIEWED_PATHS) expect(paths, path).toContain(path)
  })
})

describe('the limits', () => {
  const IP = { 'x-forwarded-for': '203.0.113.50' }

  it('lets the fourth request from one connection through, so one Wi-Fi isn’t blocked', async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const response = await login.request('POST', '/email-otp/send-verification-otp', {
        body: { email: `user${attempt}@example.test`, type: 'sign-in' },
        headers: { 'x-captcha-response': 'a-token', 'x-login-intent': 'sign-up', ...IP },
      })
      expect(response.status, `attempt ${attempt}`).toBe(200)
    }
  })

  it('raises the routes that redeem an emailed code and start Google the same way', async () => {
    for (const path of ['/sign-in/email-otp', '/sign-in/social']) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const response = await login.request('POST', path, {
          body: { email: 'x@example.test', otp: '000000', provider: 'google' },
          headers: { 'x-captcha-response': 'a-token', ...IP },
        })
        expect(response.status, `${path} attempt ${attempt}`).not.toBe(429)
      }
    }
  })

  it('raises the global limit past Better Auth’s 100 per 10 seconds', async () => {
    for (let attempt = 0; attempt < 120; attempt++) {
      const response = await login.request('GET', '/get-session', { headers: IP })
      expect(response.status, `attempt ${attempt}`).toBe(200)
    }
  })

  it('keeps counts in the database', async () => {
    await login.request('GET', '/get-session', { headers: IP })
    expect(await login.count('rateLimit')).toBeGreaterThan(0)
  })
})

describe('the settings the limits read', () => {
  it('blocks past the set number', async () => {
    const strict = await loginHarness({
      settings: { limits: { routePerMinute: 3, globalPerTenSeconds: 1000 } },
    })
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await strict.sendCode(`user${attempt}@example.test`, 'sign-up')
        expect(response.status).toBe(200)
      }
      expect((await strict.sendCode('fourth@example.test', 'sign-up')).status).toBe(429)
    } finally {
      await strict.close()
    }
  })
})
