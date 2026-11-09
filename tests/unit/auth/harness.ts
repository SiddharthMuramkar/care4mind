import { readFileSync } from 'node:fs'

import { PGlite } from '@electric-sql/pglite'
import { Kysely, PGliteDialect } from 'kysely'
import { vi } from 'vitest'

import { createAuth, type AuthDeps } from '@/lib/auth/create-auth'
import type { OutgoingEmail } from '@/lib/auth/email'
import { authRoute } from '@/lib/auth/route-handler'
import type { LoginSettings } from '@/lib/auth/settings'

import { flagsOn } from '../../flags'

// Seam one: real requests through the real auth route handler, on a real (in-process) Postgres
// built from the committed migration. Only the bot check's verifier and the email sender are
// stand-ins, so a test reads what a user or a bot would see.

const ORIGIN = 'http://localhost:3000'

/** What Cloudflare answers for a token. */
export interface BotCheckVerdict {
  success: boolean
  hostname?: string
  action?: string
}

/** Who passes the bot check by default: a real person on the real site. */
const PASSING: BotCheckVerdict = { success: true, hostname: 'www.care4mind.xyz', action: 'login' }

export const TEST_SETTINGS: LoginSettings = {
  baseURL: ORIGIN,
  secret: 'test-only-this-signs-nothing-outside-a-unit-test',
  databaseUrl: 'postgres://unused',
  botCheck: {
    secretKey: 'not-a-cloudflare-test-secret',
    testKeys: false,
    verifyUrl: 'https://bot-check.test/siteverify',
  },
  email: { apiKey: 'unused', from: 'login@care4mind.test' },
  limits: { routePerMinute: 600, globalPerTenSeconds: 1000 },
}

const VERIFY_URL = TEST_SETTINGS.botCheck.verifyUrl

interface HarnessOptions {
  settings?: Partial<LoginSettings>
  deps?: Partial<AuthDeps>
}

/** A fresh database and a fresh auth route for one test file. */
export async function loginHarness({ settings, deps }: HarnessOptions = {}) {
  const pglite = new PGlite()
  await pglite.exec(readFileSync('migrations/0001_auth.sql', 'utf8'))
  const database = { dialect: new PGliteDialect({ pglite }), type: 'postgres' } as const

  let verdict: BotCheckVerdict | 'unreachable' = PASSING
  const verified: string[] = []
  const realFetch = globalThis.fetch
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input)
    if (url !== VERIFY_URL) throw new Error(`A unit test tried to reach ${url}.`)
    if (verdict === 'unreachable') throw new Error('connection refused')
    verified.push(String(init?.body))
    return Response.json(verdict)
  })

  const outbox: OutgoingEmail[] = []
  const auth = createAuth({
    settings: { ...TEST_SETTINGS, ...settings },
    database,
    sendEmail: async (email) => {
      outbox.push(email)
    },
    ...deps,
  })
  const route = authRoute({ features: flagsOn(), getAuth: () => auth })
  const kysely = new Kysely<Record<string, Record<string, unknown>>>({
    dialect: new PGliteDialect({ pglite }),
  })

  /** A request through the route, as the browser sends it: slash on the end, Origin set. */
  function request(
    method: 'GET' | 'POST',
    path: string,
    options: { body?: unknown; headers?: Record<string, string> } = {},
  ) {
    const url = `${ORIGIN}/api/auth${/[/?]/.test(path.slice(-1)) || path.includes('?') ? path : `${path}/`}`
    const headers = { origin: ORIGIN, 'x-forwarded-for': '203.0.113.7', ...options.headers }
    const init: RequestInit =
      method === 'POST'
        ? {
            method,
            headers: { 'content-type': 'application/json', ...headers },
            body: JSON.stringify(options.body ?? {}),
          }
        : { method, headers }
    return method === 'POST'
      ? route.POST(new Request(url, init))
      : route.GET(new Request(url, init))
  }

  /** The emailed code in the newest email to this address. */
  function codeFor(email: string): string {
    const message = outbox.filter(({ to }) => to === email).at(-1)
    const code = message?.text.match(/\b\d{6}\b/)?.[0]
    if (!code) throw new Error(`No emailed code was sent to ${email}.`)
    return code
  }

  const sendCode = (
    email: string,
    intent: 'sign-up' | 'log-in',
    headers: Record<string, string> = {},
  ) =>
    request('POST', '/email-otp/send-verification-otp', {
      body: { email, type: 'sign-in' },
      headers: { 'x-captcha-response': 'a-token', 'x-login-intent': intent, ...headers },
    })

  const redeemCode = (email: string, otp: string, name?: string) =>
    request('POST', '/sign-in/email-otp', {
      body: { email, otp, ...(name === undefined ? {} : { name }) },
    })

  /** Run a whole sign-up: a code to the address, then its redemption with a name. */
  async function signUp(email: string, name = 'A User') {
    await sendCode(email, 'sign-up')
    return redeemCode(email, codeFor(email), name)
  }

  return {
    auth,
    request,
    sendCode,
    redeemCode,
    signUp,
    codeFor,
    outbox,
    verified,
    setVerdict: (next: BotCheckVerdict | 'unreachable') => {
      verdict = next
    },
    /** The users in the database, however they got there. */
    users: async () => {
      const rows = await kysely
        .selectFrom('user')
        .select(['email', 'name', 'emailVerified'])
        .execute()
      return rows as { email: string; name: string; emailVerified: boolean }[]
    },
    /** How many rows a table holds. */
    count: async (table: string) => (await kysely.selectFrom(table).selectAll().execute()).length,
    /** Between tests: every table empty, the outbox empty, the verdict passing. */
    reset: async () => {
      await pglite.exec(
        'truncate "user", "session", "account", "verification", "rateLimit" cascade;',
      )
      outbox.length = 0
      verified.length = 0
      verdict = PASSING
    },
    close: async () => {
      vi.stubGlobal('fetch', realFetch)
      // Destroying the Kysely instance also closes the database it was handed.
      await kysely.destroy()
    },
  }
}
