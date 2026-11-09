import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { loginHarness } from './harness'

let login: Awaited<ReturnType<typeof loginHarness>>

beforeAll(async () => {
  login = await loginHarness()
})
beforeEach(() => login.reset())
afterAll(() => login.close())

describe('starting a Google sign-in', () => {
  it('is refused with no bot check token', async () => {
    const response = await login.startGoogle('sign-up', { token: null })
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: 'MISSING_RESPONSE' })
  })

  it('is refused with a token Cloudflare doesn’t accept', async () => {
    login.setVerdict({ success: false })
    expect((await login.startGoogle('sign-up')).status).toBe(403)
  })

  it('verifies the token on the server, then sends the user to Google', async () => {
    const response = await login.startGoogle('log-in')
    expect(response.status).toBe(200)
    expect(login.verified).toHaveLength(1)
    const { url } = (await response.json()) as { url: string }
    expect(new URL(url).origin).toBe('https://accounts.google.com')
  })

  it('makes no account yet', async () => {
    await login.startGoogle('sign-up')
    expect(await login.count('user')).toBe(0)
    expect(await login.count('session')).toBe(0)
  })
})

const ASHA = {
  sub: 'google-subject-asha',
  email: 'asha@example.test',
  name: 'Asha Rao',
  email_verified: true,
}

/** Where a redirect went. */
const redirectOf = (response: Response) =>
  new URL(response.headers.get('location') ?? '', 'http://x')

describe('coming back from Google on Sign up', () => {
  it('creates the account with the name Google supplies and starts a user-session', async () => {
    const response = await login.googleSignIn('sign-up', ASHA)
    expect(response.status).toBe(302)
    expect(redirectOf(response).pathname).toBe('/concepts/vikshepa/')
    expect(response.headers.get('set-cookie')).toMatch(/session_token=/)
    expect(await login.users()).toEqual([
      { email: 'asha@example.test', name: 'Asha Rao', emailVerified: true },
    ])
  })

  it('makes no account while Google hasn’t confirmed the email, and starts no user-session', async () => {
    const response = await login.googleSignIn('sign-up', { ...ASHA, email_verified: false })
    expect(response.status).toBe(302)
    expect(redirectOf(response).searchParams.get('error')).toBe('EMAIL_NOT_CONFIRMED')
    expect(response.headers.getSetCookie().join()).not.toMatch(/session_token=/)
    expect(await login.count('user')).toBe(0)
    expect(await login.count('account')).toBe(0)
  })
})

describe('coming back from Google on Log in', () => {
  it('sends a new Google user to Sign up, with no account made', async () => {
    const response = await login.googleSignIn('log-in', ASHA)
    expect(response.status).toBe(302)
    const sentTo = redirectOf(response)
    expect(sentTo.pathname).toBe('/sign-up/')
    expect(sentTo.searchParams.get('error')).toBe('signup_disabled')
    expect(await login.count('user')).toBe(0)
  })

  it('logs in a returning Google user, name unchanged by what Google now says', async () => {
    await login.googleSignIn('sign-up', ASHA)
    const response = await login.googleSignIn('log-in', { ...ASHA, name: 'Someone Else' })
    expect(redirectOf(response).pathname).toBe('/concepts/vikshepa/')
    expect(await login.users()).toEqual([
      { email: 'asha@example.test', name: 'Asha Rao', emailVerified: true },
    ])
  })
})

describe('one account per email', () => {
  it('Google first, then an emailed code at the same address: the same account', async () => {
    await login.googleSignIn('sign-up', ASHA)
    await login.sendCode(ASHA.email, 'log-in')
    const response = await login.redeemCode(ASHA.email, login.codeFor(ASHA.email))
    expect(response.status).toBe(200)
    expect(await login.users()).toEqual([
      { email: 'asha@example.test', name: 'Asha Rao', emailVerified: true },
    ])
    expect(await login.count('account')).toBe(1)
  })

  it('an emailed code first, then Google at the same address: the same account, its name kept', async () => {
    await login.signUp(ASHA.email, 'Asha From The Form')
    const response = await login.googleSignIn('log-in', { ...ASHA, name: 'Asha Rao' })
    expect(redirectOf(response).pathname).toBe('/concepts/vikshepa/')
    expect(response.headers.get('set-cookie')).toMatch(/session_token=/)
    expect(await login.users()).toEqual([
      { email: 'asha@example.test', name: 'Asha From The Form', emailVerified: true },
    ])
    expect(await login.count('user')).toBe(1)
  })

  it('refuses to link an address Google hasn’t confirmed to the account that has it', async () => {
    await login.signUp(ASHA.email, 'Asha')
    const response = await login.googleSignIn('log-in', { ...ASHA, email_verified: false })
    expect(redirectOf(response).searchParams.get('error')).toBe('account_not_linked')
    expect(response.headers.getSetCookie().join()).not.toMatch(/session_token=/)
    expect(await login.count('account')).toBe(0)
  })
})

describe('the Google callback address', () => {
  const CALLBACK = 'http://localhost:3000/api/auth/callback/google/'

  it('ends with the site’s slash in what Google is sent, both ways', async () => {
    const started = await login.startGoogle('sign-up')
    const { url } = (await started.clone().json()) as { url: string }
    expect(new URL(url).searchParams.get('redirect_uri')).toBe(CALLBACK)

    await login.finishGoogle(started, ASHA)
    expect(login.googleTokenRequests[0]?.get('redirect_uri')).toBe(CALLBACK)
  })

  it('is answered at the slash form', async () => {
    const response = await login.googleSignIn('sign-up', ASHA)
    expect(response.status).toBe(302)
    expect(await login.count('user')).toBe(1)
  })
})

describe('the tick box', () => {
  it('refuses a Google sign-up with no tick, leaving no account', async () => {
    const response = await login.googleSignIn('sign-up', ASHA, { agreed: false })
    expect(redirectOf(response).searchParams.get('error')).toBe('TICK_BOX_NEEDED')
    expect(response.headers.getSetCookie().join()).not.toMatch(/session_token=/)
    expect(await login.count('user')).toBe(0)
  })

  it('refuses an emailed-code sign-up with no tick, leaving no account', async () => {
    await login.sendCode(ASHA.email, 'sign-up')
    const response = await login.redeemCode(ASHA.email, login.codeFor(ASHA.email), 'Asha', {
      agreed: false,
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: 'TICK_BOX_NEEDED' })
    expect(await login.count('user')).toBe(0)
  })

  it('takes only a real tick: the word “true” is not one', async () => {
    await login.sendCode(ASHA.email, 'sign-up')
    const response = await login.request('POST', '/sign-in/email-otp', {
      body: { email: ASHA.email, otp: login.codeFor(ASHA.email), name: 'Asha', agreed: 'true' },
    })
    expect(response.status).toBe(400)
    expect(await login.count('user')).toBe(0)
  })

  it('asks nothing of someone logging in to an account they already have', async () => {
    await login.signUp(ASHA.email, 'Asha')
    await login.sendCode(ASHA.email, 'log-in')
    const response = await login.redeemCode(ASHA.email, login.codeFor(ASHA.email))
    expect(response.status).toBe(200)
  })
})

describe('Google’s sign-in with an id token', () => {
  it('is switched off: nothing here sends one, and it can’t carry the tick box', async () => {
    const response = await login.request('POST', '/sign-in/social', {
      body: { provider: 'google', idToken: { token: 'x.y.z' }, requestSignUp: true },
      headers: { 'x-captcha-response': 'a-token' },
    })
    expect(response.status).toBe(404)
    expect(await login.count('user')).toBe(0)
  })
})
