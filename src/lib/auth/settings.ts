/**
 * The login settings, read from the environment when the first auth request arrives, never at
 * build: the site must build with none of them present, as CI does. A setting that is missing
 * or wrong stops login with a message that names it, instead of half working.
 */
import 'server-only'

import { features } from '@/config/features'

type Environment = Readonly<Record<string, string | undefined>>

/** Cloudflare's published test secrets: pass, fail, and token already spent. */
const TEST_SECRETS: readonly string[] = [
  '1x0000000000000000000000000000000AA',
  '2x0000000000000000000000000000000AA',
  '3x0000000000000000000000000000000AA',
]

/** Cloudflare's published site key that always passes, on any host and in any browser. */
const TEST_SITE_KEY = '1x00000000000000000000AA'
const TEST_SITE_KEYS: readonly string[] = [
  TEST_SITE_KEY,
  '2x00000000000000000000AB',
  '3x00000000000000000000FF',
]

export interface LoginSettings {
  /** The site's own address, which cookies and the origin check are built from. */
  baseURL: string
  secret: string
  databaseUrl: string
  botCheck: {
    secretKey: string
    /** A test secret: Cloudflare answers with hostname example.com and no action, so neither is checked. */
    testKeys: boolean
    /** A stand-in for Cloudflare's token check, for a local run only; never set on Vercel. */
    verifyUrl?: string
  }
  google: {
    clientId: string
    clientSecret: string
  }
  email: {
    apiKey: string
    /** The address emails come from. */
    from: string
    /** A stand-in for Brevo, for a local run only; never set on Vercel. */
    apiUrl?: string
  }
  limits: {
    /** Requests one address may make to a route that sends or redeems an emailed code, per minute. */
    routePerMinute: number
    /** Requests one address may make to any other auth route, per 10 seconds. */
    globalPerTenSeconds: number
    /** Whether the limits per email and the new-account cap refuse, or only record. */
    blocking: boolean
    /** Emailed codes one address may be sent, per hour. */
    codesPerEmailPerHour: number
    /** New accounts the whole site may take, per hour. */
    newAccountsPerHour: number
  }
  /** BotID only records until `blocking` is on. */
  botId: { blocking: boolean }
  /** New accounts in one hour past `newAccountsPerHour` email the developer at `to`, once. */
  spikeAlert: { newAccountsPerHour: number; to: string }
}

/** A whole number from the environment, or its default while it is unset. */
function wholeNumber(env: Environment, name: string, byDefault: number): number {
  const value = env[name]
  if (value === undefined || value === '') return byDefault
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`${name} must be a whole number above 0, not “${value}”.`)
  }
  return Number(value)
}

/** A switch from the environment: 1 on, 0 or unset off. */
function onOff(env: Environment, name: string): boolean {
  const value = env[name]
  if (value === undefined || value === '' || value === '0') return false
  if (value === '1') return true
  throw new Error(`${name} must be 1 (on) or 0 (off), not “${value}”.`)
}

/** A browser test run's local stand-in for an outside service: refused on Vercel, production or not. */
function standIn(env: Environment, name: string): string | undefined {
  const value = env[name] || undefined
  if (value && env.VERCEL) throw new Error(`${name} points at a stand-in, refused on Vercel.`)
  return value
}

/** The settings login runs on, or an error naming what is missing or refused. */
export function readLoginSettings(env: Environment): LoginSettings {
  const missing: string[] = []
  const required = (name: string) => {
    const value = env[name]
    if (!value) missing.push(name)
    return value ?? ''
  }
  const baseURL = required('BETTER_AUTH_URL')
  const secret = required('BETTER_AUTH_SECRET')
  const databaseUrl = required('DATABASE_URL')
  const secretKey = required('TURNSTILE_SECRET_KEY')
  const clientId = required('GOOGLE_CLIENT_ID')
  const clientSecret = required('GOOGLE_CLIENT_SECRET')
  const apiKey = required('BREVO_API_KEY')
  const from = required('LOGIN_EMAIL_FROM')
  const alertTo = required('LOGIN_ALERT_EMAIL')
  if (missing.length > 0) {
    throw new Error(`Login needs ${missing.join(', ')}, which .env.example explains.`)
  }

  const testKeys = TEST_SECRETS.includes(secretKey)
  if (testKeys && env.VERCEL_ENV === 'production') {
    throw new Error(
      'TURNSTILE_SECRET_KEY is one of Cloudflare’s test secrets, refused in production.',
    )
  }
  const apiUrl = standIn(env, 'BREVO_API_URL')
  const verifyUrl = standIn(env, 'TURNSTILE_VERIFY_URL')

  return {
    baseURL,
    secret,
    databaseUrl,
    botCheck: { secretKey, testKeys, ...(verifyUrl ? { verifyUrl } : {}) },
    google: { clientId, clientSecret },
    email: { apiKey, from, ...(apiUrl ? { apiUrl } : {}) },
    limits: {
      routePerMinute: wholeNumber(env, 'LOGIN_ROUTE_LIMIT_PER_MINUTE', 600),
      globalPerTenSeconds: wholeNumber(env, 'LOGIN_GLOBAL_LIMIT_PER_10_SECONDS', 1000),
      // Provisional: the trial sets the real numbers.
      blocking: onOff(env, 'LOGIN_LIMITS_BLOCKING'),
      codesPerEmailPerHour: wholeNumber(env, 'LOGIN_CODES_PER_EMAIL_PER_HOUR', 10),
      newAccountsPerHour: wholeNumber(env, 'LOGIN_NEW_ACCOUNTS_PER_HOUR', 500),
    },
    botId: { blocking: onOff(env, 'LOGIN_BOTID_BLOCKING') },
    spikeAlert: {
      newAccountsPerHour: wholeNumber(env, 'LOGIN_SPIKE_NEW_ACCOUNTS_PER_HOUR', 100),
      to: alertTo,
    },
  }
}

/**
 * The site key built into the login forms. Cloudflare's test key outside production, so `pnpm
 * check` needs no settings; in production, with login on, the real one or a failed build.
 */
export function turnstileSiteKey(
  env: Environment = process.env,
  login: boolean = features.login,
): string {
  const key = env.TURNSTILE_SITE_KEY || undefined
  if (env.VERCEL_ENV !== 'production') return key ?? TEST_SITE_KEY
  if (!login) return ''
  if (!key || TEST_SITE_KEYS.includes(key)) {
    throw new Error('Login is on, so TURNSTILE_SITE_KEY must be set to a real site key.')
  }
  return key
}
