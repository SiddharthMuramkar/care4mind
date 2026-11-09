/**
 * The one place Better Auth is configured. Everything that differs between a test and the real
 * site comes in through `AuthDeps`, so the tests send real requests through this configuration.
 */
import 'server-only'

import { betterAuth, getCurrentAdapter, type BetterAuthOptions } from 'better-auth'
import { APIError, getOAuthState } from 'better-auth/api'
import { captcha } from 'better-auth/plugins/captcha'
import { emailOTP } from 'better-auth/plugins/email-otp'

import {
  alertOnSpike,
  BOT_ID_TIMEOUT_MS,
  botIdCheck,
  capNewAccounts,
  type CheckBotId,
  defences,
  isThrowawayEmail,
  type RecordDefence,
  THROWAWAY_EMAIL,
} from './defences'
import {
  DELETE_LINK_HOURS,
  deleteAccountMessage,
  emailedCodeMessage,
  type SendEmail,
} from './email'
import type { LoginSettings } from './settings'
import {
  BOT_CHECK_ACTION,
  BOT_CHECK_HOSTNAMES,
  BOT_CHECKED_PATHS,
  DELETE_ACCOUNT_PARAM,
  LOGIN_INTENT_HEADER,
  PRIVACY_PATH,
} from './shared'

export { BOT_CHECKED_PATHS } from './shared'

export interface AuthDeps {
  settings: LoginSettings
  database: BetterAuthOptions['database']
  sendEmail: SendEmail
  /** BotID's verdict on the current request. */
  checkBotId: CheckBotId
  /** How long that verdict may take before the check counts as failed. */
  botIdTimeoutMs?: number
  /** Where the defences note what they saw, for the trial to read. */
  recordDefence: RecordDefence
  /** Keep work going after the response; without it, background work is awaited. */
  backgroundTask?: (work: Promise<unknown>) => void
}

/** Better Auth's routes that are off: the ones that send or redeem a password or an unchecked email. */
export const DISABLED_PATHS: readonly string[] = [
  '/sign-up/email',
  '/sign-in/email',
  '/request-password-reset',
  '/reset-password',
  '/send-verification-email',
  '/email-otp/request-password-reset',
  '/forget-password/email-otp',
  '/email-otp/reset-password',
  '/email-otp/check-verification-otp',
  '/email-otp/request-email-change',
  '/email-otp/change-email',
  '/email-otp/verify-email',
  '/verify-email',
  // Nothing on the site edits a name, and this route would skip every rule Sign up sets on one.
  '/update-user',
]

/** What a sign-up that sent no name, or one too long, is told. */
const NAME_NEEDED = { code: 'NAME_NEEDED', message: 'A name of up to 100 characters is needed.' }

/** The longest name a user may give. */
const NAME_MAX = 100

/** What a sign-up without the tick box ticked is told; only a tampered client gets this far. */
const TICK_BOX_NEEDED = {
  code: 'TICK_BOX_NEEDED',
  message: 'The tick box must be ticked before an account can be made.',
}

/** What a Google sign-up is told while Google hasn't confirmed the address belongs to its owner. */
const EMAIL_NOT_CONFIRMED = {
  code: 'EMAIL_NOT_CONFIRMED',
  message: 'Google hasn’t confirmed this email address.',
}

export function createAuth({
  settings,
  database,
  sendEmail,
  checkBotId,
  botIdTimeoutMs = BOT_ID_TIMEOUT_MS,
  recordDefence,
  backgroundTask,
}: AuthDeps) {
  const { routeBurst, globalBurst } = settings.limits
  const perRoute = { window: 60, max: routeBurst }
  return betterAuth({
    appName: 'Care4Mind',
    baseURL: settings.baseURL,
    secret: settings.secret,
    database,
    telemetry: { enabled: false },
    disabledPaths: [...DISABLED_PATHS],
    socialProviders: {
      google: {
        clientId: settings.google.clientId,
        clientSecret: settings.google.clientSecret,
        // A new Google user needs the tick box, which only Sign up shows: Log in sends them there.
        disableImplicitSignUp: true,
        // Exactly the address registered with Google, which follows the site's trailing slash.
        redirectURI: new URL('/api/auth/callback/google/', settings.baseURL).href,
        // Nothing here sends an id token, and that route can't carry the tick box.
        disableIdTokenSignIn: true,
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 10,
      max: globalBurst,
      customRules: {
        '/email-otp/send-verification-otp': perRoute,
        '/sign-in/email-otp': perRoute,
        '/sign-in/social': perRoute,
        // Each ask emails the user, so it counts as a route that sends.
        '/delete-user': perRoute,
        // Every page load of a logged-in user asks this and it sends nothing, so one Wi-Fi's
        // phones never run out of it; Vercel's firewall guards it against a flood.
        '/get-session': false,
      },
    },
    advanced: {
      skipTrailingSlashes: true,
      ...(backgroundTask ? { backgroundTasks: { handler: backgroundTask } } : {}),
    },
    user: {
      deleteUser: {
        enabled: true,
        deleteTokenExpiresIn: DELETE_LINK_HOURS * 60 * 60,
        // The link opens our own page, which asks for one more press: the library's own link
        // deletes on opening, and answers 404 in a mail app's browser that isn't logged in.
        sendDeleteAccountVerification: async ({ user, token }) => {
          const link = `${settings.baseURL}${PRIVACY_PATH}?${DELETE_ACCOUNT_PARAM}=${token}`
          await sendEmail(deleteAccountMessage(user.email, link))
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          // After the emailed code or Google has confirmed the address, so the answer can't reveal
          // who has an account. The tick box comes through the OAuth state on the way back from
          // Google, and in the body with the code; only a real `true` counts, whichever it is.
          before: async (user, ctx) => {
            if (!user.emailVerified) throw new APIError('BAD_REQUEST', EMAIL_NOT_CONFIRMED)
            // Here as well as before a code is sent, because Google sign-ups reach only this.
            if (isThrowawayEmail(user.email)) throw new APIError('BAD_REQUEST', THROWAWAY_EMAIL)
            const state = (await getOAuthState()) as { agreed?: unknown } | null
            const agreed = (state ?? (ctx?.body as { agreed?: unknown } | undefined))?.agreed
            if (agreed !== true) throw new APIError('BAD_REQUEST', TICK_BOX_NEEDED)
            const name = user.name.trim()
            if (!name || name.length > NAME_MAX) throw new APIError('BAD_REQUEST', NAME_NEEDED)
            if (ctx) {
              // A Google sign-up holds a connection for its transaction: count on that one.
              await capNewAccounts(await getCurrentAdapter(ctx.context.adapter), {
                limits: settings.limits,
                record: recordDefence,
              })
            }
            return { data: { ...user, name } }
          },
          after: async (_user, ctx) => {
            // Never waits on the sender, so a slow or failing Brevo can't slow a sign-up.
            await ctx?.context.runInBackgroundOrAwait(
              alertOnSpike(ctx.context.adapter, {
                spikeAlert: settings.spikeAlert,
                sendEmail,
                record: recordDefence,
              }),
            )
          },
        },
      },
    },
    plugins: [
      captcha({
        provider: 'cloudflare-turnstile',
        secretKey: settings.botCheck.secretKey,
        endpoints: [...BOT_CHECKED_PATHS],
        ...(settings.botCheck.verifyUrl
          ? { siteVerifyURLOverride: settings.botCheck.verifyUrl }
          : {}),
        // Test secrets answer with hostname example.com and no action, so neither can be checked.
        ...(settings.botCheck.testKeys
          ? {}
          : { allowedHostnames: BOT_CHECK_HOSTNAMES, expectedAction: BOT_CHECK_ACTION }),
      }),
      // After Turnstile, so a request it refuses never reaches BotID.
      captcha({
        provider: 'vercel-botid',
        endpoints: [...BOT_CHECKED_PATHS],
        ...botIdCheck({
          blocking: settings.botId.blocking,
          checkBotId,
          record: recordDefence,
          timeoutMs: botIdTimeoutMs,
        }),
      }),
      defences({ limits: settings.limits, record: recordDefence }),
      emailOTP({
        otpLength: 6,
        expiresIn: 600,
        allowedAttempts: 5,
        storeOTP: 'hashed',
        sendVerificationOTP: async ({ email, otp, type }, ctx) => {
          // The one route the plugin sends from also takes other purposes; only sign-in is ours.
          if (type !== 'sign-in') return
          const known = await ctx?.context.internalAdapter.findUserByEmail(email)
          if (!known && ctx?.headers?.get(LOGIN_INTENT_HEADER) !== 'sign-up') return
          await sendEmail(emailedCodeMessage(email, otp))
        },
      }),
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
