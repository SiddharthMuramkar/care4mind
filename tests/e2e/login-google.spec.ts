import { hrefFor } from '@/content'

import { expect, gotoReady, test } from './fixtures'
import { fakeGoogle, freshEmail, waitForBotCheck } from './login'
import { ROUTES } from './routes'

// Getting in with Google, and the tick box, as a browser sees them. Google itself is faked at the
// edge: its sign-in page by route interception here, its token endpoint inside the test server
// (google-stand-in.mjs). What Google's real pages do is checked in the go-live ticket.

const LOGIN_ON = ROUTES.some(({ path }) => path === hrefFor({ page: 'log-in' }))

test.skip(!LOGIN_ON, 'the login switch is off in this build')
test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), 'a deployed site has no local stand-ins')

const tickBox = (page: import('@playwright/test').Page) =>
  page.getByRole('checkbox', {
    name: 'I am 18 or over and agree that Care4Mind can see my results',
  })

const google = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Continue with Google' })

const logOut = (page: import('@playwright/test').Page) =>
  page.getByRole('banner').getByRole('button', { name: 'Log out' })

test.describe('the tick box', { tag: '@one-width' }, () => {
  test('is on Sign up, unticked, and not on Log in', async ({ page }) => {
    await gotoReady(page, '/sign-up/')
    await expect(tickBox(page)).toBeVisible()
    await expect(tickBox(page)).not.toBeChecked()

    await gotoReady(page, '/log-in/')
    await expect(tickBox(page)).toHaveCount(0)
  })

  test('keeps Sign up from sending a code until it is ticked', async ({ page }, info) => {
    await gotoReady(page, '/sign-up/')
    await page.getByLabel('Your name').fill('Asha Rao')
    await page.getByLabel('Your email').fill(freshEmail(info))
    await waitForBotCheck(page)
    await page.getByRole('button', { name: 'Email me a code' }).click()
    await expect(page.getByRole('heading', { name: 'Enter your emailed code' })).toHaveCount(0)
    await expect(tickBox(page)).toBeFocused()
  })

  test('keeps Google from starting until it is ticked', async ({ page }) => {
    await gotoReady(page, '/sign-up/')
    await waitForBotCheck(page)
    await google(page).click()
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/tick the box/)
    await expect(page).toHaveURL(/\/sign-up\//)
  })
})

test.describe('Google', { tag: '@one-width' }, () => {
  test('is offered on both screens', async ({ page }) => {
    await gotoReady(page, '/sign-up/')
    await expect(google(page)).toBeVisible()
    await gotoReady(page, '/log-in/')
    await expect(google(page)).toBeVisible()
  })

  test('signs up a new user with the name Google gives, and lands back where they were', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await fakeGoogle(page, { email, name: 'Asha From Google' })

    await gotoReady(page, '/sign-up/?next=%2Fconcepts%2Fvikshepa%2F')
    await tickBox(page).check()
    await waitForBotCheck(page)
    await google(page).click()

    await expect(page).toHaveURL('/concepts/vikshepa/')
    await expect(logOut(page)).toBeVisible()
    const session = (await (await page.request.get('/api/auth/get-session/')).json()) as {
      user: { name: string; email: string }
    }
    expect(session.user).toMatchObject({ name: 'Asha From Google', email })
  })

  test('sends a new Google user who pressed Log in to Sign up, not logged in', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await fakeGoogle(page, { email, name: 'Asha From Google' })

    await gotoReady(page, '/log-in/?next=%2Fconcepts%2Fvikshepa%2F')
    await waitForBotCheck(page)
    await google(page).click()

    await expect(page).toHaveURL(/\/sign-up\/\?next=%2Fconcepts%2Fvikshepa%2F/)
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/no account for that Google/)
    await expect(logOut(page)).toHaveCount(0)
    await expect(tickBox(page)).toBeVisible()

    // And Log in, linked from there, comes back clean.
    await page.getByRole('main').getByRole('link', { name: 'Log in' }).click()
    await expect(page).toHaveURL('/log-in/?next=%2Fconcepts%2Fvikshepa%2F')
    await expect(page.getByRole('main').getByRole('alert')).toHaveText('')
  })

  test('logs in a returning Google user from Log in, and Log in leaves the name alone', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await fakeGoogle(page, { email, name: 'Asha From Google' })
    await gotoReady(page, '/sign-up/')
    await tickBox(page).check()
    await waitForBotCheck(page)
    await google(page).click()
    await expect(logOut(page)).toBeVisible()
    await page.context().clearCookies()

    await page.unroute('https://accounts.google.com/**')
    await fakeGoogle(page, { email, name: 'Someone Else' })
    await gotoReady(page, '/log-in/')
    await waitForBotCheck(page)
    await google(page).click()
    await expect(logOut(page)).toBeVisible()
    const session = (await (await page.request.get('/api/auth/get-session/')).json()) as {
      user: { name: string }
    }
    expect(session.user.name).toBe('Asha From Google')
  })

  test('refuses an address Google hasn’t confirmed, and offers the emailed code', async ({
    page,
  }, info) => {
    await fakeGoogle(page, {
      email: freshEmail(info),
      name: 'Asha From Google',
      email_verified: false,
    })
    await gotoReady(page, '/sign-up/')
    await tickBox(page).check()
    await waitForBotCheck(page)
    await google(page).click()

    await expect(page).toHaveURL(/\/sign-up\/\?error=EMAIL_NOT_CONFIRMED/)
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/confirmed that email/)
    await expect(logOut(page)).toHaveCount(0)
  })
})
