import { randomUUID } from 'node:crypto'

import { expect, type Page, type TestInfo } from '@playwright/test'

/** The saved cookies a spec that opens a take page starts from (global-setup.ts writes them). */
export const LOGGED_IN = 'playwright/.cache/logged-in.json'

/** Cloudflare's test widget hands out this token, and its test secret accepts only it. */
export const DUMMY_BOT_CHECK_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX'

const standIn = () => `http://127.0.0.1:${Number(process.env.E2E_PORT || 3100) + 1}`

/** An address no other test run has used, named after the test for a readable failure. */
export function freshEmail(info: TestInfo): string {
  const slug = info.title.replace(/\W+/g, '-').slice(0, 30).toLowerCase()
  return `${slug}-${randomUUID().slice(0, 8)}@example.test`
}

/** Every email the stand-in for Brevo has been sent for this address, oldest first. */
export async function inbox(email: string): Promise<{ subject: string; text: string }[]> {
  const response = await fetch(`${standIn()}/inbox?to=${encodeURIComponent(email)}`)
  return (await response.json()) as { subject: string; text: string }[]
}

/** The newest emailed code sent to this address, waiting for it to arrive. */
export async function emailedCode(email: string): Promise<string> {
  await expect
    .poll(async () => (await inbox(email)).length, { message: `an email to ${email}` })
    .toBeGreaterThan(0)
  const code = (await inbox(email)).at(-1)?.text.match(/\b\d{6}\b/)?.[0]
  if (!code) throw new Error(`The email to ${email} held no code.`)
  return code
}

/** Wait until the bot check widget has its token, so the next press can send it. */
export async function waitForBotCheck(page: Page) {
  const response = page.locator('input[name="cf-turnstile-response"]')
  await expect(response, 'the bot check has passed').toHaveValue(/./, { timeout: 20_000 })
}
