import { hrefFor } from '@/content'

import { expect, gotoReady, test } from './fixtures'
import { ROUTES } from './routes'

// With the login switch off the site behaves as it did before login existed. These run only on
// a build made with FEATURE_LOGIN=0, as production is until go-live.

const LOGIN_ON = ROUTES.some(({ path }) => path === hrefFor({ page: 'log-in' }))
const START = '/questionnaires/karmayoga-scale/'

test.skip(LOGIN_ON, 'the login switch is on in this build')

test('shows no Log in', async ({ page }) => {
  await gotoReady(page, '/concepts/vikshepa/')
  await expect(page.getByRole('banner').getByRole('link', { name: 'Log in' })).toHaveCount(0)
})

test('has no Sign up or Log in screen', { tag: '@one-width' }, async ({ request }) => {
  for (const path of ['/log-in/', '/sign-up/']) {
    expect((await request.get(path)).status(), path).toBe(404)
  }
})

test(
  'answers every auth route as if it doesn’t exist',
  { tag: '@one-width' },
  async ({ request }) => {
    expect((await request.get('/api/auth/get-session/')).status()).toBe(404)
    const send = await request.post('/api/auth/email-otp/send-verification-otp/', {
      data: { email: 'asha@example.test', type: 'sign-in' },
    })
    expect(send.status()).toBe(404)
  },
)

test(
  'lets Start open the Questionnaire as it always has',
  { tag: '@one-width' },
  async ({ page }) => {
    await gotoReady(page, START)
    await page.getByRole('link', { name: 'Start the Questionnaire' }).click()
    await expect(page).toHaveURL(`${START}take/`)
    await expect(page.getByRole('progressbar', { name: 'Your progress' })).toBeVisible()
  },
)
