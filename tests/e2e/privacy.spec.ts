import type { Page } from '@playwright/test'

import { hrefFor } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'
import { freshEmail, inbox, signUpInBrowser } from './login'
import { ROUTES } from './routes'

// The Privacy page and Delete my account, as a user meets them in a browser. The server's rules
// are tested request by request in tests/unit/auth/delete-account.test.ts.

const LOGIN_ON = ROUTES.some(({ path }) => path === hrefFor({ page: 'privacy' }))
const PRIVACY = '/privacy/'

test.skip(!LOGIN_ON, 'the login switch is off in this build')
test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), 'a deployed site has no local stand-ins')

const header = (page: Page) => page.getByRole('banner')
const askButton = (page: Page) =>
  page.getByRole('button', { name: 'Delete my account', exact: true })
const confirmButton = (page: Page) => page.getByRole('button', { name: 'Yes, delete my account' })
const linkSent = (page: Page) => page.getByRole('status').filter({ hasText: /emailed you a link/ })

async function userSession(page: Page) {
  const response = await page.request.get('/api/auth/get-session/')
  return (await response.json()) as { user: { email: string } } | null
}

/** The Delete my account link in the newest email to this address, as a path on this server. */
async function deleteLink(email: string): Promise<string> {
  await expect
    .poll(async () => (await inbox(email)).at(-1)?.subject, { message: `an email to ${email}` })
    .toMatch(/delete/i)
  const link = (await inbox(email)).at(-1)?.text.match(/https?:\/\/\S+/)?.[0]
  if (!link) throw new Error(`The email to ${email} held no link.`)
  const { pathname, search } = new URL(link)
  return `${pathname}${search}`
}

test.describe('the Privacy page', { tag: '@one-width' }, () => {
  test('is linked from the footer', async ({ page }) => {
    await gotoReady(page, '/')
    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click()
    await expect(page).toHaveURL(PRIVACY)
    await expect(page.getByRole('heading', { name: 'Privacy', level: 1 })).toBeVisible()
  })

  test('says what the site keeps, and marks the contact address it still needs', async ({
    page,
  }) => {
    await gotoReady(page, PRIVACY)
    await expect(page.getByRole('heading', { name: 'What we keep' })).toBeVisible()
    await expect(page.getByText('[CONTACT ADDRESS TO BE ADDED]')).toBeVisible()
  })

  test('offers Delete my account to nobody who isn’t logged in', async ({ page }) => {
    await gotoReady(page, PRIVACY)
    await expect(askButton(page)).toHaveCount(0)
  })
})

test.describe('Delete my account', { tag: '@one-width' }, () => {
  test('is confirmed by the emailed link, and removes the account', async ({ page }, info) => {
    const email = freshEmail(info)
    await signUpInBrowser(page, email)
    await gotoReady(page, PRIVACY)

    await askButton(page).click()
    await expect(linkSent(page)).toBeVisible()

    await gotoReady(page, await deleteLink(email))
    expect((await userSession(page))?.user.email, 'opening the link deletes nothing').toBe(email)

    await confirmButton(page).click()
    await expect(page.getByText('Your account has been deleted.')).toBeVisible()
    await expect(page).toHaveURL(`${PRIVACY}?account-deleted=1`)
    await expect(header(page).getByRole('link', { name: 'Log in' })).toBeVisible()
    expect(await userSession(page)).toBeNull()
  })

  test('works with only a keyboard', async ({ page }, info) => {
    const email = freshEmail(info)
    await signUpInBrowser(page, email)
    await gotoReady(page, PRIVACY)

    await askButton(page).focus()
    await page.keyboard.press('Enter')
    await expect(linkSent(page), 'focus follows the press').toBeFocused()

    await gotoReady(page, await deleteLink(email))
    await confirmButton(page).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByText('Your account has been deleted.')).toBeVisible()
  })

  test('passes axe at every step', async ({ page }, info) => {
    const email = freshEmail(info)
    await signUpInBrowser(page, email)
    await gotoReady(page, PRIVACY)
    await expect(askButton(page)).toBeVisible()
    await expectNoAxeViolations(page)

    await askButton(page).click()
    await expect(linkSent(page)).toBeVisible()
    await expectNoAxeViolations(page)

    await gotoReady(page, await deleteLink(email))
    await expect(confirmButton(page)).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('in a browser that isn’t logged in, asks to log in and keeps the link', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await signUpInBrowser(page, email)
    await gotoReady(page, PRIVACY)
    await askButton(page).click()
    await expect(linkSent(page)).toBeVisible()
    const link = await deleteLink(email)
    await page.context().clearCookies()

    await gotoReady(page, link)
    await expect(confirmButton(page)).toHaveCount(0)
    await expect(page.getByText(/only works in a browser where you’re logged in/)).toBeVisible()
    await expectNoAxeViolations(page)

    await page.getByRole('main').getByRole('link', { name: 'Log in' }).click()
    await expect(page).toHaveURL(`/log-in/?next=${encodeURIComponent(link)}`)
  })

  test('says so when the link is no good, and offers a new one', async ({ page }, info) => {
    const email = freshEmail(info)
    await signUpInBrowser(page, email)
    await gotoReady(page, `${PRIVACY}?delete-account=not-a-real-token`)

    await confirmButton(page).click()

    await expect(page.getByRole('alert').filter({ hasText: /run out/ })).toBeVisible()
    await expect(askButton(page)).toBeVisible()
    expect((await userSession(page))?.user.email).toBe(email)
  })
})
