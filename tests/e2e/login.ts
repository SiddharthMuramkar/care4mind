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

/**
 * Google's sign-in page, answered as this person agreeing: straight back to the site's callback
 * with a code that says who they are, for the server's own fake token endpoint (google-stand-in.mjs).
 */
export async function fakeGoogle(
  page: Page,
  profile: { email: string; name: string; email_verified?: boolean },
) {
  await page.route('https://accounts.google.com/**', async (route) => {
    const google = new URL(route.request().url())
    const code = Buffer.from(
      JSON.stringify({ sub: `google-${profile.email}`, email_verified: true, ...profile }),
    ).toString('base64url')
    const back = new URL(google.searchParams.get('redirect_uri') ?? '')
    back.search = new URLSearchParams({
      code,
      state: google.searchParams.get('state') ?? '',
    }).toString()
    await route.fulfill({ status: 302, headers: { location: back.toString() } })
  })
}

/** Wait until the bot check widget has its token, so the next press can send it. */
export async function waitForBotCheck(page: Page) {
  const response = page.locator('input[name="cf-turnstile-response"]')
  await expect(response, 'the bot check has passed').toHaveValue(/./, { timeout: 20_000 })
}

/** Sign a new user up through the Sign up screen, ending logged in. */
export async function signUpInBrowser(page: Page, email: string) {
  await page.goto('/sign-up/')
  await page.getByLabel('Your name').fill('Asha Rao')
  await page.getByRole('checkbox', { name: /18 or over/ }).check()
  await page.getByLabel('Your email').fill(email)
  await waitForBotCheck(page)
  await page.getByRole('button', { name: 'Email me a code' }).click()
  await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('banner').getByRole('button', { name: 'Log out' })).toBeVisible()
}
