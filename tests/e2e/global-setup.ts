import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { request } from '@playwright/test'

import { readFeatures } from '@/config/features'

import { DUMMY_BOT_CHECK_TOKEN, emailedCode, LOGGED_IN } from './login'

const EMAIL = 'logged-in-user@example.test'

/**
 * Sign one user up through the real auth route, once, and save the cookies it gets: any spec
 * that opens a take page starts from them. With the login switch off there is nothing to log
 * in to, and a deployed site has no stand-ins to log in with, so it saves no cookies at all.
 */
export default async function globalSetup() {
  mkdirSync(dirname(LOGGED_IN), { recursive: true })
  if (process.env.PLAYWRIGHT_BASE_URL || !readFeatures(process.env).login) {
    writeFileSync(LOGGED_IN, JSON.stringify({ cookies: [], origins: [] }))
    return
  }

  const baseURL = `http://localhost:${process.env.E2E_PORT || 3100}`
  const api = await request.newContext({ baseURL, extraHTTPHeaders: { Origin: baseURL } })
  const sent = await api.post('/api/auth/email-otp/send-verification-otp/', {
    data: { email: EMAIL, type: 'sign-in' },
    headers: { 'x-captcha-response': DUMMY_BOT_CHECK_TOKEN, 'x-login-intent': 'sign-up' },
  })
  if (!sent.ok()) throw new Error(`Sending the emailed code answered ${sent.status()}.`)
  const code = await emailedCode(EMAIL)
  const redeemed = await api.post('/api/auth/sign-in/email-otp/', {
    data: { email: EMAIL, otp: code, name: 'Logged-in User' },
  })
  if (!redeemed.ok()) throw new Error(`Redeeming the code answered ${redeemed.status()}.`)
  await api.storageState({ path: LOGGED_IN })
  await api.dispose()
}
