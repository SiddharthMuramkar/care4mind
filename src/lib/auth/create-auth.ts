/**
 * The one place Better Auth is configured. Everything that differs between a test and the real
 * site comes in through `AuthDeps`, so the tests send real requests through this configuration.
 */
import 'server-only'

import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { APIError } from 'better-auth/api'
import { captcha } from 'better-auth/plugins/captcha'
import { emailOTP } from 'better-auth/plugins/email-otp'

import { emailedCodeMessage, type SendEmail } from './email'
import { BOT_CHECK_HOSTNAMES, type LoginSettings } from './settings'
import { BOT_CHECK_ACTION, LOGIN_INTENT_HEADER } from './shared'

export interface AuthDeps {
  settings: LoginSettings
  database: BetterAuthOptions['database']
  sendEmail: SendEmail
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
]

/** The routes every request to must carry a bot check token the server has verified. */
export const BOT_CHECKED_PATHS: readonly string[] = [
  '/email-otp/send-verification-otp',
  '/sign-in/social',
]

/** What a sign-up that sent no name, or one too long, is told. */
const NAME_NEEDED = { code: 'NAME_NEEDED', message: 'A name of up to 100 characters is needed.' }

/** The longest name a user may give. */
const NAME_MAX = 100

export function createAuth({ settings, database, sendEmail, backgroundTask }: AuthDeps) {
  const { routePerMinute, globalPerTenSeconds } = settings.limits
  const perRoute = { window: 60, max: routePerMinute }
  return betterAuth({
    appName: 'Care4Mind',
    baseURL: settings.baseURL,
    secret: settings.secret,
    database,
    telemetry: { enabled: false },
    disabledPaths: [...DISABLED_PATHS],
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 10,
      max: globalPerTenSeconds,
      customRules: {
        '/email-otp/send-verification-otp': perRoute,
        '/sign-in/email-otp': perRoute,
        '/sign-in/social': perRoute,
      },
    },
    advanced: {
      skipTrailingSlashes: true,
      ...(backgroundTask ? { backgroundTasks: { handler: backgroundTask } } : {}),
    },
    databaseHooks: {
      user: {
        create: {
          // After the emailed code is confirmed, so the answer can't reveal who has an account.
          before: async (user) => {
            const name = user.name.trim()
            if (!name || name.length > NAME_MAX) throw new APIError('BAD_REQUEST', NAME_NEEDED)
            return { data: { ...user, name } }
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
