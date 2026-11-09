import type { Page } from '@playwright/test'

import { hrefFor } from '@/content'

import { expectNoAxeViolations } from './axe'
import { expect, gotoReady, test } from './fixtures'
import { emailedCode, freshEmail, waitForBotCheck } from './login'
import { ROUTES } from './routes'

// What a real person gets when something stands in their way: things to try when the bot check
// keeps failing, and a prompt to open a full browser inside another app.

const LOGIN_ON = ROUTES.some(({ path }) => path === hrefFor({ page: 'log-in' }))

test.skip(!LOGIN_ON, 'the login switch is off in this build')
test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), 'a deployed site has no local stand-ins')

/** Stands in for Cloudflare's script, so a test decides when the bot check fails. */
const FAKE_TURNSTILE = `
  window.turnstile = {
    render(element, options) { window.__botCheck = options; return 'widget' },
    reset() {},
    remove() {},
  }
`

/** Answer with the stand-in for Cloudflare's script, and open the page. */
async function openWithFakeBotCheck(page: Page, path: string) {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: FAKE_TURNSTILE }),
  )
  await gotoReady(page, path)
  await page.waitForFunction(() => '__botCheck' in window)
}

const botCheck = (page: Page, callback: 'error-callback' | 'callback') =>
  page.evaluate((name) => {
    const { __botCheck: options } = window as unknown as {
      __botCheck: Record<string, (token?: string) => void>
    }
    options[name]?.('a-token')
  }, callback)

const help = (page: Page) => page.getByText('The bot check keeps failing.')

/** Long enough for React to have shown anything it was going to show. */
const settled = (page: Page) =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)))

test.describe('a person who keeps failing the bot check', { tag: '@one-width' }, () => {
  test('sees nothing extra after one failure, which Cloudflare retries itself', async ({
    page,
  }) => {
    await openWithFakeBotCheck(page, '/sign-up/')
    await botCheck(page, 'error-callback')
    await settled(page)
    await expect(help(page)).toHaveCount(0)
  })

  test('sees things to try once it fails again', async ({ page }) => {
    await openWithFakeBotCheck(page, '/sign-up/')
    await botCheck(page, 'error-callback')
    await botCheck(page, 'error-callback')
    await expect(help(page)).toBeVisible()
    const main = page.getByRole('main')
    await expect(main.getByText('Open this page in another browser.')).toBeVisible()
    await expect(main.getByText('Use mobile data instead of Wi-Fi.')).toBeVisible()
    await expect(main.getByText('Turn off your VPN, if you use one.')).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('sees them when the server keeps refusing the token', async ({ page }) => {
    await page.route('**/api/auth/email-otp/send-verification-otp/', (route) =>
      route.fulfill({ status: 403, json: { code: 'VERIFICATION_FAILED' } }),
    )
    await openWithFakeBotCheck(page, '/log-in/')
    await page.getByLabel('Your email').fill('asha@example.test')
    const press = async () => {
      await botCheck(page, 'callback')
      await page.getByRole('button', { name: 'Email me a code' }).click()
      await expect(page.getByRole('main').getByRole('alert')).toHaveText(/bot check/)
    }
    await press()
    await expect(help(page)).toHaveCount(0)
    await press()
    await expect(help(page)).toBeVisible()
  })

  test('sees them at once when the bot check can’t load at all', async ({ page }) => {
    await page.route('https://challenges.cloudflare.com/**', (route) => route.abort())
    await gotoReady(page, '/log-in/')
    await expect(help(page)).toBeVisible()
  })
})

const IN_APP = [
  [
    'Instagram on Android',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UQ1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.0.0 Mobile Safari/537.36 Instagram 360.0.0.30.109 Android',
  ],
  [
    'Facebook on iPhone',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22B83 [FBAN/FBIOS;FBAV/490.0.0;FBDV/iPhone15,4]',
  ],
  [
    'an iPhone app’s web view',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22B83',
  ],
] as const

const FULL_BROWSERS = [
  [
    'Chrome on Android',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  ],
  [
    'Safari on iPhone',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  ],
  [
    'Chrome on iPhone',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
  ],
] as const

const prompt = (page: Page) => page.getByText(/open this page in Chrome or\s+Safari/)

test.describe('inside another app', { tag: '@one-width' }, () => {
  for (const [name, userAgent] of IN_APP) {
    test.describe(name, () => {
      test.use({ userAgent })

      test('suggests Chrome or Safari on Sign up and Log in', async ({ page }) => {
        for (const path of ['/sign-up/', '/log-in/']) {
          await gotoReady(page, path)
          await expect(prompt(page), path).toBeVisible()
        }
      })
    })
  }

  for (const [name, userAgent] of FULL_BROWSERS) {
    test.describe(name, () => {
      test.use({ userAgent })

      test('suggests nothing', async ({ page }) => {
        await gotoReady(page, '/sign-up/')
        await expect(prompt(page)).toHaveCount(0)
      })
    })
  }

  test.describe('the emailed code', () => {
    test.use({ userAgent: IN_APP[0][1] })

    test('still gets the user in, and the screen passes axe', async ({ page }, info) => {
      const email = freshEmail(info)
      await gotoReady(page, '/sign-up/')
      await expect(prompt(page)).toBeVisible()
      await expectNoAxeViolations(page)

      await page.getByLabel('Your name').fill('Asha Rao')
      await page.getByRole('checkbox', { name: /18 or over/ }).check()
      await page.getByLabel('Your email').fill(email)
      await waitForBotCheck(page)
      await page.getByRole('button', { name: 'Email me a code' }).click()
      await page.getByLabel('Your six-digit code').fill(await emailedCode(email))
      await page.getByRole('button', { name: 'Confirm' }).click()

      await expect(page.getByRole('banner').getByRole('button', { name: 'Log out' })).toBeVisible()
    })
  })
})
