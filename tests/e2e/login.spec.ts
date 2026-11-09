import { hrefFor } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, scrollsSideways, test } from './fixtures'
import { tabTo } from './focus-ring'
import { emailedCode, fakeGoogle, freshEmail, inbox, LOGGED_IN, waitForBotCheck } from './login'
import { ROUTES } from './routes'

// Sign up and Log in with an emailed code, as a user does them in a browser: the header, both
// screens, the bot check, the code, Start, Log out. The server's rules are tested request by
// request in tests/unit/auth; these cover what only a browser shows.

const LOGIN_ON = ROUTES.some(({ path }) => path === hrefFor({ page: 'log-in' }))
const START = '/questionnaires/karmayoga-scale/'
const FLOW = `${START}take/`

test.skip(!LOGIN_ON, 'the login switch is off in this build')
test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), 'a deployed site has no local stand-ins')

const header = (page: import('@playwright/test').Page) => page.getByRole('banner')

async function detailsAndCode(
  page: import('@playwright/test').Page,
  { name, email }: { name?: string; email: string },
) {
  if (name !== undefined) {
    await page.getByLabel('Your name').fill(name)
    await page.getByRole('checkbox', { name: /18 or over/ }).check()
  }
  await page.getByLabel('Your email').fill(email)
  await waitForBotCheck(page)
  await page.getByRole('button', { name: 'Email me a code' }).click()
  await expect(page.getByRole('heading', { name: 'Enter your emailed code' })).toBeVisible()
}

test.describe('the header', () => {
  test('shows Log in beside Search and carries the page to come back to', async ({ page }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const logIn = header(page).getByRole('link', { name: 'Log in' })
    await expect(logIn).toBeVisible()
    await expect(logIn).toHaveAttribute('href', '/log-in/?next=%2Fconcepts%2Fvikshepa%2F')
  })

  test('adds nothing to a page view for a visitor who isn’t logged in', async ({ page }) => {
    const authRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/api/auth/')) authRequests.push(request.url())
    })
    await gotoReady(page, '/concepts/vikshepa/')
    expect(authRequests).toEqual([])
  })
})

test.describe('Sign up and Log in', { tag: '@one-width' }, () => {
  test('are separate screens: Sign up asks a name and an email, Log in only an email', async ({
    page,
  }) => {
    await gotoReady(page, '/sign-up/')
    await expect(page.getByRole('heading', { name: 'Sign up', level: 1 })).toBeVisible()
    await expect(page.getByLabel('Your name')).toBeVisible()
    await expect(page.getByLabel('Your email')).toBeVisible()

    await gotoReady(page, '/log-in/')
    await expect(page.getByRole('heading', { name: 'Log in', level: 1 })).toBeVisible()
    await expect(page.getByLabel('Your name')).toHaveCount(0)
    await expect(page.getByLabel('Your email')).toBeVisible()
  })

  test('passes axe on both screens, with the bot check in place', async ({ page }) => {
    for (const path of ['/sign-up/', '/log-in/']) {
      await gotoReady(page, path)
      await waitForBotCheck(page)
      await expectNoAxeViolations(page)
    }
  })

  test('refuses a press with no bot check result yet, and says so', async ({ page }) => {
    await page.route('https://challenges.cloudflare.com/**', (route) => route.abort())
    await gotoReady(page, '/log-in/')
    await page.getByLabel('Your email').fill('asha@example.test')
    await page.getByRole('button', { name: 'Email me a code' }).click()
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/bot check/)
  })

  test('signs up with an emailed code, and lands back where the user was', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/concepts/vikshepa/')
    await header(page).getByRole('link', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/log-in\/\?next=/)
    await page.getByRole('link', { name: 'Sign up' }).click()

    await detailsAndCode(page, { name: 'Asha Rao', email })
    await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page).toHaveURL('/concepts/vikshepa/')
    await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()
    await expect(header(page).getByRole('link', { name: 'Log in' })).toHaveCount(0)
  })

  test('takes a whole code pasted at once, spaces and all', async ({ page, context }, info) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/')
    await detailsAndCode(page, { name: 'Asha Rao', email })
    const code = await emailedCode(email)
    await page.getByLabel('Your six-digit code').focus()
    await page.evaluate(
      (text) => navigator.clipboard.writeText(text),
      `${code.slice(0, 3)} ${code.slice(3)}`,
    )
    await page.keyboard.press('ControlOrMeta+V')
    await expect(page.getByLabel('Your six-digit code')).toHaveValue(code)
    await page.keyboard.press('Enter')
    await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()
  })

  test('says a wrong code is wrong, and leaves the field to try again', async ({ page }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/')
    await detailsAndCode(page, { name: 'Asha Rao', email })
    const code = await emailedCode(email)
    await page.getByLabel('Your six-digit code').fill(code === '000000' ? '111111' : '000000')
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/isn.t right/)
    await page.getByLabel('Your six-digit code').fill(code)
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()
  })

  test('stops a name of only spaces at the details, before a code is sent', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/')
    await page.getByLabel('Your name').fill('   ')
    await page.getByRole('checkbox', { name: /18 or over/ }).check()
    await page.getByLabel('Your email').fill(email)
    await waitForBotCheck(page)
    await page.getByRole('button', { name: 'Email me a code' }).click()
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/give your name/)
    await expect(page.getByRole('heading', { name: 'Enter your emailed code' })).toHaveCount(0)
    expect(await inbox(email)).toEqual([])
  })

  test('goes back to the details when the server still needs the name or the tick', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/')
    await detailsAndCode(page, { name: 'Asha Rao', email })
    await page.route('**/api/auth/sign-in/email-otp/', (route) =>
      route.fulfill({ status: 400, json: { code: 'NAME_NEEDED' } }),
    )
    await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByLabel('Your name')).toBeVisible()
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/give your name/)
  })

  test('at Log in, an email with no account hears the same as one with, gets no code, and is pointed to Sign up', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/log-in/')
    await detailsAndCode(page, { email })
    await expect(
      page.getByText(`If ${email} has an account, a six-digit code is on its way.`),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()
    expect(await inbox(email)).toEqual([])
  })

  test('logs in an email that already has an account, and leaves its name alone', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/')
    await detailsAndCode(page, { name: 'Asha Rao', email })
    await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()
    await page.goto('/api/auth/get-session/')
    await page.context().clearCookies()

    await gotoReady(page, '/sign-up/')
    await detailsAndCode(page, { name: 'Someone Else', email })
    await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()

    const session = (await (await page.request.get('/api/auth/get-session/')).json()) as {
      user: { name: string }
    }
    expect(session.user.name).toBe('Asha Rao')
  })

  test('resets the bot check on each new code, and sends one', async ({ page }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/')
    await page.waitForFunction(() => window.turnstile !== undefined)
    await page.evaluate(() => {
      const turnstile = window.turnstile as NonNullable<Window['turnstile']>
      const reset = turnstile.reset.bind(turnstile)
      Object.assign(window, { __botCheckResets: 0 })
      turnstile.reset = (widget?: string) => {
        const seen = window as unknown as { __botCheckResets: number }
        seen.__botCheckResets += 1
        reset(widget)
      }
    })
    const resets = () =>
      page.evaluate(() => (window as unknown as { __botCheckResets: number }).__botCheckResets)

    await detailsAndCode(page, { name: 'Asha Rao', email })
    const before = await resets()
    await waitForBotCheck(page)

    await page.getByRole('button', { name: 'Send a new code' }).click()
    await expect(page.getByText('A new code is on its way.')).toBeVisible()
    await expect.poll(resets).toBe(before + 1)
    await expect.poll(async () => (await inbox(email)).length).toBeGreaterThan(1)
    await waitForBotCheck(page)
  })
})

test.describe('a new code, asked for again', { tag: '@one-width' }, () => {
  const SEND = '**/api/auth/email-otp/send-verification-otp/'

  test('is said each time, cleared while it is on its way, and not said after a failure', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/')
    await detailsAndCode(page, { name: 'Asha Rao', email })
    const said = page.locator('[role="status"]').filter({ hasText: 'A new code is on its way.' })
    const resend = page.getByRole('button', { name: 'Send a new code' })

    await waitForBotCheck(page)
    await resend.click()
    await expect(said).toBeVisible()

    await waitForBotCheck(page)
    let release = () => {}
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route(SEND, async (route) => {
      await held
      await route.continue()
    })
    await resend.click()
    await expect(said).toHaveCount(0)
    release()
    await expect(said).toBeVisible()
    await page.unroute(SEND)

    await waitForBotCheck(page)
    await page.route(SEND, (route) => route.fulfill({ status: 500, json: {} }))
    await resend.click()
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(/went wrong/)
    await expect(said).toHaveCount(0)
  })
})

test.describe('with only a keyboard', { tag: '@one-width' }, () => {
  const button = (page: import('@playwright/test').Page, name: string) =>
    page.getByRole('button', { name })

  test('signs up, asks for a new code and confirms the code', async ({ page }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/')
    await tabTo(page, page.getByLabel('Your name'))
    await page.keyboard.type('Asha Rao')
    const tick = page.getByRole('checkbox', { name: /18 or over/ })
    await tabTo(page, tick)
    await page.keyboard.press('Space')
    await expect(tick).toBeChecked()
    await tabTo(page, page.getByLabel('Your email'))
    await page.keyboard.type(email)
    await waitForBotCheck(page)
    await tabTo(page, button(page, 'Email me a code'))
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Enter your emailed code' })).toBeFocused()

    await waitForBotCheck(page)
    await tabTo(page, button(page, 'Send a new code'))
    await page.keyboard.press('Enter')
    await expect(page.getByText('A new code is on its way.')).toBeVisible()

    await expect.poll(async () => (await inbox(email)).length).toBeGreaterThan(1)
    const code = await emailedCode(email)
    await tabTo(page, page.getByLabel('Your six-digit code'))
    await page.keyboard.type(code)
    await tabTo(page, button(page, 'Confirm'))
    await page.keyboard.press('Enter')
    await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()
  })

  test('asks for a code at Log in', async ({ page }, info) => {
    await gotoReady(page, '/log-in/')
    await tabTo(page, page.getByLabel('Your email'))
    await page.keyboard.type(freshEmail(info))
    await waitForBotCheck(page)
    await tabTo(page, button(page, 'Email me a code'))
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Enter your emailed code' })).toBeVisible()
  })

  test('continues with Google on Sign up', async ({ page }, info) => {
    await fakeGoogle(page, { email: freshEmail(info), name: 'Asha From Google' })
    await gotoReady(page, '/sign-up/')
    const tick = page.getByRole('checkbox', { name: /18 or over/ })
    await tabTo(page, tick)
    await page.keyboard.press('Space')
    await waitForBotCheck(page)
    await tabTo(page, button(page, 'Continue with Google'))
    await page.keyboard.press('Enter')
    await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()
  })
})

test.describe('without JavaScript', { tag: '@one-width' }, () => {
  test.use({ javaScriptEnabled: false })

  for (const path of ['/sign-up/', '/log-in/']) {
    test(`${path} shows the note in place of a form that couldn’t work`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole('main').getByText('needs JavaScript')).toBeVisible()
      await expect(page.getByLabel('Your email')).toBeHidden()
      await expect(page.locator('button[type="submit"]')).toBeDisabled()
    })
  }
})

test.describe('the sign-up form’s code', { tag: '@one-width' }, () => {
  test('stays off a page with no form on it', async ({ page, request }) => {
    await gotoReady(page, '/concepts/vikshepa/')
    const sources = await page
      .locator('script[src]')
      .evaluateAll((scripts) => scripts.map((script) => (script as HTMLScriptElement).src))
    for (const source of sources) {
      const text = await (await request.get(source)).text()
      expect(text, source).not.toContain('challenges.cloudflare.com')
    }
  })
})

test.describe('the header at 320 px', { tag: '@self-width' }, () => {
  test('gives up the Menu drawing, so Log in fits beside it', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await gotoReady(page, '/concepts/vikshepa/')
    await expect(header(page).locator('a', { hasText: 'Menu' }).locator('svg')).toBeHidden()
  })
})

test.describe('Start, while login is on', { tag: '@one-width' }, () => {
  test('goes to Log in, then back to the Questionnaire once the user is in', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, START)
    await page.getByRole('link', { name: 'Start the Questionnaire' }).click()
    await expect(page).toHaveURL(/\/log-in\/\?next=%2Fquestionnaires%2Fkarmayoga-scale%2Ftake%2F/)

    await page.getByRole('link', { name: 'Sign up' }).click()
    await detailsAndCode(page, { name: 'Asha Rao', email })
    await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page).toHaveURL(FLOW)
    await expect(page.getByRole('progressbar', { name: 'Your progress' })).toBeVisible()
  })

  test('refuses a return address on another site, and goes home instead', async ({
    page,
  }, info) => {
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/?next=https%3A%2F%2Fevil.example%2F')
    await detailsAndCode(page, { name: 'Asha Rao', email })
    await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('a throwaway email', { tag: '@one-width' }, () => {
  test('is refused on Sign up, with a reason, and no code is sent', async ({ page }) => {
    await gotoReady(page, '/sign-up/')
    await page.getByLabel('Your name').fill('Asha Rao')
    await page.getByLabel('Your email').fill('someone@mailinator.com')
    await page.getByRole('checkbox', { name: /18 or over/ }).check()
    await waitForBotCheck(page)
    await page.getByRole('button', { name: 'Email me a code' }).click()
    await expect(page.getByText('throwaway email address')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Enter your emailed code' })).toHaveCount(0)
    expect(await inbox('someone@mailinator.com')).toEqual([])
  })
})

test.describe('a logged-in user', { tag: '@one-width' }, () => {
  test('sees Log out, which ends the user-session and brings back Log in', async ({
    page,
  }, info) => {
    // A user of its own: ending the saved user-session would log out every spec that shares it.
    const email = freshEmail(info)
    await gotoReady(page, '/sign-up/?next=%2Fconcepts%2Fvikshepa%2F')
    await detailsAndCode(page, { name: 'Asha Rao', email })
    await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page).toHaveURL('/concepts/vikshepa/')

    const logOut = header(page).getByRole('button', { name: 'Log out' })
    await expect(logOut).toBeVisible()
    await logOut.click()
    await expect(header(page).getByRole('link', { name: 'Log in' })).toBeVisible()
    await page.reload()
    await expect(header(page).getByRole('link', { name: 'Log in' })).toBeVisible()
    await expect(header(page).getByRole('button', { name: 'Log out' })).toHaveCount(0)
  })

  test.describe('with the saved user-session', () => {
    test.use({ storageState: LOGGED_IN })

    test('goes straight into the Questionnaire from Start', async ({ page }) => {
      await gotoReady(page, START)
      await page.getByRole('link', { name: 'Start the Questionnaire' }).click()
      await expect(page).toHaveURL(FLOW)
      await expect(page.getByRole('progressbar', { name: 'Your progress' })).toBeVisible()
    })

    test('keeps its login through a failed check, and is seen as logged in once it works', async ({
      page,
      context,
    }) => {
      const CHECK = '**/api/auth/get-session/'
      await page.route(CHECK, (route) => route.fulfill({ status: 500, body: 'oops' }))
      const answered = page.waitForResponse(CHECK)
      await page.goto('/concepts/vikshepa/')
      await answered
      await page.unroute(CHECK)

      await gotoReady(page, '/concepts/vikshepa/')
      await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()
      expect((await context.cookies()).map(({ name }) => name)).toContain('c4m-logged-in')
    })

    test('has a header that still fits 320 px with the longer Log out', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await gotoReady(page, '/concepts/vikshepa/')
      await expect(header(page).getByRole('button', { name: 'Log out' })).toBeVisible()
      expect(await scrollsSideways(page)).toEqual([])
    })
  })
})

test.describe('the auth route', { tag: '@one-width' }, () => {
  test('answers at the site’s trailing-slash address', async ({ request }) => {
    const response = await request.get('/api/auth/get-session/')
    expect(response.status()).toBe(200)
  })

  test('leaves a static page static with the login switch on', async ({ request }) => {
    for (const path of [START, FLOW, '/log-in/', '/sign-up/']) {
      const response = await request.get(path)
      expect(response.headers()['x-nextjs-prerender'], path).toMatch(/^1\b/)
    }
  })
})
