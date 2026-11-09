import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { readLoginSettings, turnstileSiteKey } from '@/lib/auth/settings'

const REQUIRED = {
  BETTER_AUTH_URL: 'https://www.care4mind.xyz',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  DATABASE_URL: 'postgres://user:pass@db.example.test/care4mind',
  TURNSTILE_SECRET_KEY: 'a-real-secret',
  GOOGLE_CLIENT_ID: 'a-real-client-id',
  GOOGLE_CLIENT_SECRET: 'a-real-client-secret',
  BREVO_API_KEY: 'a-real-key',
  LOGIN_EMAIL_FROM: 'login@care4mind.org',
}

const PRODUCTION = { VERCEL: '1', VERCEL_ENV: 'production' }

describe('.env.example', () => {
  /** The settings login reads: every name the settings file quotes or takes from `env`. */
  const settingsRead = () => {
    const source = readFileSync('src/lib/auth/settings.ts', 'utf8')
    const names = [...source.matchAll(/(?:'|env\.)([A-Z][A-Z0-9_]{3,})\b/g)].map(
      (match) => match[1] ?? '',
    )
    return [...new Set(names)].filter((name) => !name.startsWith('VERCEL'))
  }

  it('finds the settings it checks', () => {
    expect(settingsRead()).toEqual(
      expect.arrayContaining(['BETTER_AUTH_SECRET', 'TURNSTILE_SITE_KEY', 'BREVO_API_URL']),
    )
  })

  it('lists the login switch and every setting, each under a one-line comment', () => {
    const lines = readFileSync('.env.example', 'utf8').split('\n')
    for (const name of ['FEATURE_LOGIN', ...settingsRead()]) {
      const at = lines.indexOf(`${name}=`)
      expect(at, `${name} is in .env.example`).toBeGreaterThan(0)
      expect(lines[at - 1], `${name} has a comment above it`).toMatch(/^# \S/)
    }
  })
})

describe('the login settings', () => {
  it('names every missing setting', () => {
    expect(() => readLoginSettings({})).toThrow(
      /BETTER_AUTH_URL.*BETTER_AUTH_SECRET.*DATABASE_URL.*TURNSTILE_SECRET_KEY.*GOOGLE_CLIENT_ID.*GOOGLE_CLIENT_SECRET.*BREVO_API_KEY.*LOGIN_EMAIL_FROM/,
    )
  })

  it('reads the limits, with raised defaults that leave one Wi-Fi unblocked', () => {
    expect(readLoginSettings(REQUIRED).limits).toEqual({
      routePerMinute: 600,
      globalPerTenSeconds: 1000,
    })
    expect(
      readLoginSettings({
        ...REQUIRED,
        LOGIN_ROUTE_LIMIT_PER_MINUTE: '40',
        LOGIN_GLOBAL_LIMIT_PER_10_SECONDS: '50',
      }).limits,
    ).toEqual({ routePerMinute: 40, globalPerTenSeconds: 50 })
  })

  it('refuses a limit that isn’t a whole number', () => {
    expect(() => readLoginSettings({ ...REQUIRED, LOGIN_ROUTE_LIMIT_PER_MINUTE: 'lots' })).toThrow(
      'LOGIN_ROUTE_LIMIT_PER_MINUTE',
    )
  })

  describe('Cloudflare’s test secrets', () => {
    const test = '1x0000000000000000000000000000000AA'

    it('are noticed, so the hostname and action checks can be set aside', () => {
      expect(readLoginSettings({ ...REQUIRED, TURNSTILE_SECRET_KEY: test }).botCheck.testKeys).toBe(
        true,
      )
      expect(readLoginSettings(REQUIRED).botCheck.testKeys).toBe(false)
    })

    it('are refused in production', () => {
      expect(() =>
        readLoginSettings({ ...REQUIRED, ...PRODUCTION, TURNSTILE_SECRET_KEY: test }),
      ).toThrow(/production/)
    })
  })

  describe('the bot check’s stand-in', () => {
    it('is read for a local run', () => {
      expect(
        readLoginSettings({ ...REQUIRED, TURNSTILE_VERIFY_URL: 'http://localhost:3112/check' })
          .botCheck.verifyUrl,
      ).toBe('http://localhost:3112/check')
    })

    it('is refused on Vercel, production or not', () => {
      expect(() =>
        readLoginSettings({ ...REQUIRED, TURNSTILE_VERIFY_URL: 'https://x.test', VERCEL: '1' }),
      ).toThrow(/Vercel/)
    })
  })

  describe('the email sender’s stand-in', () => {
    it('is read for a local run', () => {
      expect(
        readLoginSettings({ ...REQUIRED, BREVO_API_URL: 'http://localhost:3112/email' }).email
          .apiUrl,
      ).toBe('http://localhost:3112/email')
    })

    it('is refused on Vercel, production or not', () => {
      expect(() =>
        readLoginSettings({ ...REQUIRED, BREVO_API_URL: 'https://x.test', VERCEL: '1' }),
      ).toThrow(/Vercel/)
    })
  })
})

describe('the site key built into the forms', () => {
  it('falls back to Cloudflare’s test key outside production, so a build needs no settings', () => {
    expect(turnstileSiteKey({}, true)).toBe('1x00000000000000000000AA')
    expect(turnstileSiteKey({ VERCEL_ENV: 'preview' }, true)).toBe('1x00000000000000000000AA')
    expect(turnstileSiteKey({ TURNSTILE_SITE_KEY: 'real' }, true)).toBe('real')
  })

  it('is required in production with login on, and a test key is refused', () => {
    expect(() => turnstileSiteKey({ VERCEL_ENV: 'production' }, true)).toThrow(/TURNSTILE_SITE_KEY/)
    expect(() =>
      turnstileSiteKey(
        { VERCEL_ENV: 'production', TURNSTILE_SITE_KEY: '1x00000000000000000000AA' },
        true,
      ),
    ).toThrow(/TURNSTILE_SITE_KEY/)
    expect(turnstileSiteKey({ VERCEL_ENV: 'production', TURNSTILE_SITE_KEY: 'real' }, true)).toBe(
      'real',
    )
  })

  it('asks for nothing in production while login is off', () => {
    expect(turnstileSiteKey({ VERCEL_ENV: 'production' }, false)).toBe('')
  })
})
