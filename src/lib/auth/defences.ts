/**
 * The defences behind the bot check: BotID, throwaway emails, the limits per email and the cap
 * on new accounts, and the spike alert. Until the trial they only record; a setting turns each
 * to blocking. A record never names the email, so the logs hold nothing about a person.
 */
import 'server-only'

import { createHash } from 'node:crypto'

import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware, getSessionFromCtx } from 'better-auth/api'
import { disposableEmailBlocklistSet } from 'disposable-email-domains-js'

import type { SendEmail } from './email'
import type { LoginSettings } from './settings'
import { LOGIN_INTENT_HEADER } from './shared'

/** What the defences note for the trial to read. */
export type DefenceRecord =
  | { defence: 'botid'; action: 'recorded' | 'blocked' | 'check-failed' }
  | {
      defence: 'email-limit' | 'delete-link-limit' | 'new-account-cap'
      action: 'recorded' | 'blocked'
      count: number
      limit: number
    }
  | { defence: 'spike-alert'; action: 'send-failed' }

export type RecordDefence = (record: DefenceRecord) => void

/** One line a log search can find. */
export const logDefence: RecordDefence = (record) => {
  console.warn(JSON.stringify({ event: 'login-defence', ...record }))
}

/** BotID's verdict on the current request, as `botid/server` gives it. */
export type CheckBotId = () => Promise<{ isBot: boolean }>

/**
 * How long BotID gets before its check counts as failed. Under the 10 seconds Better Auth allows
 * it, because when that runs out the request is refused with a 500 and nothing here finds out.
 */
export const BOT_ID_TIMEOUT_MS = 5_000

/** Reject once the time is up: BotID's call takes no abort signal, so racing it is all there is. */
function withinTime<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('BotID took too long to answer')), timeoutMs)
  })
  return Promise.race([work, late]).finally(() => clearTimeout(timer))
}

/** The BotID half of a `captcha()` plugin: only record, until the setting turns it to blocking. */
export function botIdCheck({
  blocking,
  checkBotId,
  record,
  timeoutMs,
}: {
  blocking: boolean
  checkBotId: CheckBotId
  record: RecordDefence
  timeoutMs: number
}) {
  return {
    checkBotId: async () => {
      try {
        const verdict = await withinTime(checkBotId(), timeoutMs)
        // BotID hands back whatever JSON its service sent, so an error body arrives with no verdict.
        if (typeof verdict.isBot !== 'boolean') throw new Error('BotID gave no verdict')
        return verdict
      } catch (error) {
        record({ defence: 'botid', action: 'check-failed' })
        // Record-only must never lock anyone out, so a failed check counts as a pass here.
        if (blocking) throw error
        return { isBot: false }
      }
    },
    validateRequest: ({ verification }: { verification: { isBot: boolean } }) => {
      if (!verification.isBot) return true
      record({ defence: 'botid', action: blocking ? 'blocked' : 'recorded' })
      return !blocking
    },
  }
}

/** The list the project chose, built once: the lookup the package offers rebuilds it on every call. */
const THROWAWAY_DOMAINS = disposableEmailBlocklistSet()

/**
 * Addresses a real person hides behind, which block lists keep catching by mistake: DuckDuckGo,
 * Firefox Relay, Apple's Hide My Email, SimpleLogin, Proton Pass and Addy.
 */
const PRIVACY_RELAYS: ReadonlySet<string> = new Set([
  'duck.com',
  'mozmail.com',
  'relay.firefox.com',
  'privaterelay.appleid.com',
  'icloud.com',
  'simplelogin.com',
  'simplelogin.fr',
  'simplelogin.co',
  'aleeas.com',
  'slmail.me',
  'dralias.com',
  '8shield.net',
  'passmail.net',
  'passmail.com',
  'passinbox.com',
  'anonaddy.com',
  'anonaddy.me',
  'addy.io',
])

/** A domain and each domain above it, so `x@sub.listed.com` counts as `listed.com`. */
function domainAndParents(domain: string): string[] {
  const labels = domain.split('.')
  return labels.slice(0, -1).map((_, start) => labels.slice(start).join('.'))
}

/** What a sign-up at a throwaway domain is told, by whichever way it came in. */
export const THROWAWAY_EMAIL = {
  code: 'THROWAWAY_EMAIL',
  message: 'Throwaway email addresses can’t be used.',
}

/** Whether an address is at a throwaway domain, unless it is a privacy relay. */
export function isThrowawayEmail(email: string, list: ReadonlySet<string> = THROWAWAY_DOMAINS) {
  const domains = domainAndParents(email.toLowerCase().split('@').pop() ?? '')
  if (domains.some((domain) => PRIVACY_RELAYS.has(domain))) return false
  return domains.some((domain) => list.has(domain))
}

/** The table the defences count in: Better Auth prunes its own `rateLimit` rows within a minute. */
const DEFENCE_COUNT = 'defenceCount'

const HOUR = 60 * 60_000

/** Better Auth's database adapter, as a hook is handed it. */
type Adapter = Parameters<
  NonNullable<Parameters<typeof createAuthMiddleware>[0]>
>[0]['context']['adapter']

/**
 * Add one to a counter that restarts each hour and return its new value. Each step is a single
 * guarded write, so requests at the same moment can't both see the same count.
 */
async function countUp(adapter: Adapter, key: string): Promise<number> {
  const now = Date.now()
  const stale = now - HOUR
  const live = await adapter.incrementOne<{ count: number }>({
    model: DEFENCE_COUNT,
    where: [
      { field: 'key', value: key },
      { field: 'windowStart', operator: 'gt', value: stale },
    ],
    increment: { count: 1 },
  })
  if (live) return Number(live.count)

  // No live row: restart an hour-old one, or start one. Whoever loses either race counts again.
  const restarted = await adapter.incrementOne({
    model: DEFENCE_COUNT,
    where: [
      { field: 'key', value: key },
      { field: 'windowStart', operator: 'lte', value: stale },
    ],
    increment: {},
    set: { count: 1, windowStart: now },
  })
  if (restarted) return 1
  try {
    await adapter.create({ model: DEFENCE_COUNT, data: { key, count: 1, windowStart: now } })
  } catch {
    return countUp(adapter, key)
  }
  // Addresses come and go, so each new row clears the ones whose hour has passed.
  await adapter.deleteMany({
    model: DEFENCE_COUNT,
    where: [{ field: 'windowStart', operator: 'lt', value: stale }],
  })
  return 1
}

/** A count that can't be read back to an address, since a row outlives the code it counted. */
const emailKey = (email: string) =>
  `codes:${createHash('sha256').update(email.toLowerCase()).digest('hex')}`

/** The same for the links an account has asked for, keyed by account so it can't be read back. */
const deleteLinkKey = (userId: string) =>
  `delete-links:${createHash('sha256').update(userId).digest('hex')}`

type LimitSettings = LoginSettings['limits']

interface DefenceDeps {
  limits: LimitSettings
  record: RecordDefence
}

/** Refuse throwaway sign-ups, and count every code an address and every link an account asks for. */
export function defences({ limits, record }: DefenceDeps): BetterAuthPlugin {
  return {
    id: 'defences',
    schema: {
      [DEFENCE_COUNT]: {
        fields: {
          key: { type: 'string', required: true, unique: true },
          count: { type: 'number', required: true },
          windowStart: { type: 'number', required: true, bigint: true },
        },
      },
    },
    hooks: {
      before: [
        {
          matcher: (ctx) => ctx.path === '/email-otp/send-verification-otp',
          handler: createAuthMiddleware(async (ctx) => {
            const email: unknown = ctx.body?.email
            if (typeof email !== 'string') return
            // Only a new account: anyone with one already must be able to get in, however they
            // pressed, or a domain the list later adds would lock them out.
            if (
              ctx.headers?.get(LOGIN_INTENT_HEADER) === 'sign-up' &&
              isThrowawayEmail(email) &&
              !(await ctx.context.internalAdapter.findUserByEmail(email))
            ) {
              throw new APIError('BAD_REQUEST', THROWAWAY_EMAIL)
            }
            const count = await countUp(ctx.context.adapter, emailKey(email))
            if (count <= limits.codesPerEmailPerHour) return
            record({
              defence: 'email-limit',
              action: limits.blocking ? 'blocked' : 'recorded',
              count,
              limit: limits.codesPerEmailPerHour,
            })
            if (limits.blocking) {
              throw new APIError('TOO_MANY_REQUESTS', {
                code: 'EMAIL_LIMIT',
                message: 'Too many codes for this email just now.',
              })
            }
          }),
        },
        {
          // Every ask emails the account's owner, on the same daily allowance as the emailed codes.
          // A token means a link is being used, which sends nothing.
          matcher: (ctx) => ctx.path === '/delete-user' && !ctx.body?.token,
          handler: createAuthMiddleware(async (ctx) => {
            // Here, not in the sender: a sender that throws has already been answered for.
            const session = await getSessionFromCtx(ctx)
            if (!session) return
            const count = await countUp(ctx.context.adapter, deleteLinkKey(session.user.id))
            if (count <= limits.deleteLinksPerAccountPerHour) return
            record({
              defence: 'delete-link-limit',
              action: limits.blocking ? 'blocked' : 'recorded',
              count,
              limit: limits.deleteLinksPerAccountPerHour,
            })
            if (limits.blocking) {
              throw new APIError('TOO_MANY_REQUESTS', {
                code: 'DELETE_LINK_LIMIT',
                message: 'Too many links for this account just now.',
              })
            }
          }),
        },
      ],
    },
  }
}

/** Where the new-account check and the spike alert count: this hour's new accounts. */
const newAccountsLastHour = (adapter: Pick<Adapter, 'count'>) =>
  adapter.count({
    model: 'user',
    where: [{ field: 'createdAt', operator: 'gte', value: new Date(Date.now() - HOUR) }],
  })

/** Record, and when blocking refuse, an account past the hourly cap. Soft by a request or two at most. */
export async function capNewAccounts(
  adapter: Pick<Adapter, 'count'>,
  { limits, record }: DefenceDeps,
) {
  const count = (await newAccountsLastHour(adapter)) + 1
  if (count <= limits.newAccountsPerHour) return
  record({
    defence: 'new-account-cap',
    action: limits.blocking ? 'blocked' : 'recorded',
    count,
    limit: limits.newAccountsPerHour,
  })
  if (limits.blocking) {
    throw new APIError('TOO_MANY_REQUESTS', {
      code: 'NEW_ACCOUNT_CAP',
      message: 'Too many new accounts just now.',
    })
  }
}

interface SpikeDeps {
  spikeAlert: LoginSettings['spikeAlert']
  sendEmail: SendEmail
  record: RecordDefence
}

const SPIKE_KEY = 'spike-alert'

/**
 * Email the developer once when new accounts in the last hour pass the set number. The claim is
 * taken first, so requests at the same moment can't both send; a send that fails gives it back.
 * Nothing here can fail a sign-up: the account already exists by the time it runs.
 */
export async function alertOnSpike(adapter: Adapter, { spikeAlert, sendEmail, record }: SpikeDeps) {
  let claimed = false
  try {
    const count = await newAccountsLastHour(adapter)
    if (count <= spikeAlert.newAccountsPerHour) return
    claimed = (await countUp(adapter, SPIKE_KEY)) === 1
    if (!claimed) return
    const text = `Care4Mind has had ${count} new accounts in the last hour, past the alert number of ${spikeAlert.newAccountsPerHour}. If this looks like an attack, switch on Attack Mode in Vercel.`
    await sendEmail({
      to: spikeAlert.to,
      subject: 'Care4Mind: sign-ups are spiking',
      text,
      html: `<p>${text}</p>`,
    })
  } catch {
    record({ defence: 'spike-alert', action: 'send-failed' })
    if (claimed) {
      await adapter
        .deleteMany({ model: DEFENCE_COUNT, where: [{ field: 'key', value: SPIKE_KEY }] })
        .catch(() => undefined)
    }
  }
}
