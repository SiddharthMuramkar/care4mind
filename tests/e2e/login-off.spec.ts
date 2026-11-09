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

test('shows no link to the Privacy page', async ({ page }) => {
  await gotoReady(page, '/')
  await expect(page.getByRole('link', { name: 'Privacy' })).toHaveCount(0)
})

test('has no Sign up, Log in or Privacy page', { tag: '@one-width' }, async ({ request }) => {
  for (const path of ['/log-in/', '/sign-up/', '/privacy/']) {
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
  'answers every method on an auth route the way an address that doesn’t exist answers',
  { tag: '@one-width' },
  async ({ request }) => {
    const missing = await request.get('/api/nothing/')
    expect(missing.status()).toBe(404)
    for (const method of ['GET', 'OPTIONS', 'PUT', 'DELETE']) {
      const route = await request.fetch('/api/auth/get-session/', { method })
      expect(route.status(), method).toBe(404)
      expect(route.headers()['content-type'], method).toBe(missing.headers()['content-type'])
    }
  },
)

test(
  'keeps the Privacy page’s text out of the 404 and its React payload',
  { tag: '@one-width' },
  async ({ request }) => {
    const page = await request.get('/privacy/')
    expect(await page.text()).not.toContain('What we keep')
    const payload = await request.get('/privacy/', { headers: { RSC: '1' } })
    expect(await payload.text()).not.toContain('What we keep')
    const file = await request.get('/privacy.rsc')
    expect(await file.text()).not.toContain('What we keep')
  },
)

test.describe('without JavaScript', { tag: '@one-width' }, () => {
  test.use({ javaScriptEnabled: false })

  test('shows the real 404 page for an address that would be a login page', async ({ page }) => {
    await page.goto('/privacy/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page isn’t in the book')
  })
})

test(
  'keeps the Menu drawing at 320 px, as there is no Log in to fit',
  { tag: '@self-width' },
  async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await gotoReady(page, '/concepts/vikshepa/')
    await expect(
      page.getByRole('banner').locator('a', { hasText: 'Menu' }).locator('svg'),
    ).toBeVisible()
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
