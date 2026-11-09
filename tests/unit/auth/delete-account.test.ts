import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { loginHarness, TEST_SETTINGS } from './harness'

let login: Awaited<ReturnType<typeof loginHarness>>

beforeAll(async () => {
  login = await loginHarness()
})
beforeEach(() => login.reset())
afterEach(() => vi.useRealTimers())
afterAll(() => login.close())

const EMAIL = 'asha@example.test'

/** Sign up, and return the cookie header that user's browser would now send. */
async function signedUp(email = EMAIL) {
  const response = await login.signUp(email)
  expect(response.status).toBe(200)
  return login.cookieHeader(response)
}

const askToDelete = (cookie: string) =>
  login.request('POST', '/delete-user', { headers: { cookie } })

/** The link in the newest email to this address, as the user would follow it. */
function linkIn(email = EMAIL) {
  const message = login.outbox.filter(({ to }) => to === email).at(-1)
  const link = message?.text.match(/https?:\/\/\S+/)?.[0]
  if (!link) throw new Error(`No link was sent to ${email}.`)
  return new URL(link)
}

const tokenIn = (email?: string) => linkIn(email).searchParams.get('delete-account') ?? ''

const confirmDelete = (cookie: string, token: string) =>
  login.request('GET', `/delete-user/callback/?token=${token}`, { headers: { cookie } })

describe('Delete my account', () => {
  it('emails a link to the Privacy page, and leaves the account until it is followed', async () => {
    const cookie = await signedUp()
    login.outbox.length = 0

    const response = await askToDelete(cookie)

    expect(response.status).toBe(200)
    expect(login.outbox).toHaveLength(1)
    expect(login.outbox[0]?.to).toBe(EMAIL)
    expect(linkIn().origin + linkIn().pathname).toBe('http://localhost:3000/privacy/')
    expect(await login.count('user')).toBe(1)
  })

  it('removes the account and every user-session once the emailed link is confirmed', async () => {
    const cookie = await signedUp()
    const otherBrowser = await login.logIn(EMAIL)
    await askToDelete(cookie)

    const response = await confirmDelete(cookie, tokenIn())

    expect(response.status).toBe(200)
    expect(await login.users()).toEqual([])
    expect(await login.count('session')).toBe(0)
    const stillIn = await login.request('GET', '/get-session', {
      headers: { cookie: otherBrowser },
    })
    expect(await stillIn.json()).toBeNull()
  })

  it('tells the browser it is no longer logged in', async () => {
    const cookie = await signedUp()
    await askToDelete(cookie)

    const response = await confirmDelete(cookie, tokenIn())

    expect(response.headers.getSetCookie().join('\n')).toMatch(/c4m-logged-in=;/)
  })

  it('needs a user-session to ask, and to confirm', async () => {
    const cookie = await signedUp()
    await askToDelete(cookie)

    expect((await login.request('POST', '/delete-user')).status).toBe(401)
    const noSession = await login.request('GET', `/delete-user/callback/?token=${tokenIn()}`)
    expect(noSession.status).toBe(404)
    expect(await login.count('user')).toBe(1)
  })

  it('refuses a link sent to someone else, so a shared phone can’t delete another account', async () => {
    const asha = await signedUp()
    const ravi = await signedUp('ravi@example.test')
    await askToDelete(asha)

    const response = await confirmDelete(ravi, tokenIn())

    expect(response.ok).toBe(false)
    expect((await login.users()).map(({ email }) => email).toSorted()).toEqual([
      EMAIL,
      'ravi@example.test',
    ])
  })

  it('refuses a link that isn’t one', async () => {
    const cookie = await signedUp()
    expect((await confirmDelete(cookie, 'not-a-real-token')).ok).toBe(false)
    expect(await login.count('user')).toBe(1)
  })

  it('refuses a link after 24 hours', async () => {
    const cookie = await signedUp()
    await askToDelete(cookie)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(Date.now() + 24 * 60 * 60 * 1000 + 1000)

    const response = await confirmDelete(cookie, tokenIn())

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({ code: 'INVALID_TOKEN' })
    expect(await login.count('user')).toBe(1)
  })

  it('tells the user how long the link works, and what to do if they didn’t ask', async () => {
    const cookie = await signedUp()
    login.outbox.length = 0
    await askToDelete(cookie)
    const [message] = login.outbox
    if (!message) throw new Error('No email was sent.')
    const { text, html, subject } = message
    expect(subject).toMatch(/delete/i)
    expect(text).toMatch(/24 hours/)
    expect(text).toMatch(/ignore this email/)
    expect(html).toContain(`href="${linkIn().href}"`)
  })
})

describe('when the email can’t be sent', () => {
  it('says so instead of promising a link, and tells the user to ask again', async () => {
    const cookie = await signedUp()
    login.failEmailTo(EMAIL)

    const response = await askToDelete(cookie)

    expect(response.ok).toBe(false)
    expect(await response.json()).toMatchObject({ code: 'DELETE_EMAIL_FAILED' })
    expect(login.outbox.filter(({ subject }) => /delete/i.test(subject))).toEqual([])
  })

  it('says so on the live site too, where the send runs in the background', async () => {
    const waiting: Promise<unknown>[] = []
    const live = await loginHarness({
      deps: { backgroundTask: (work) => void waiting.push(work) },
    })
    try {
      await live.sendCode(EMAIL, 'sign-up')
      await Promise.all(waiting)
      const cookie = live.cookieHeader(await live.redeemCode(EMAIL, live.codeFor(EMAIL), 'A User'))
      live.failEmailTo(EMAIL)

      const response = await live.request('POST', '/delete-user', { headers: { cookie } })

      expect(response.status).toBe(502)
    } finally {
      await Promise.all(waiting)
      await live.close()
    }
  })

  it('still promises a link when one was sent', async () => {
    const cookie = await signedUp()
    expect((await askToDelete(cookie)).status).toBe(200)
  })
})

describe('how many links one account can ask for', () => {
  describe('with the limits blocking', () => {
    let blocking: Awaited<ReturnType<typeof loginHarness>>

    beforeAll(async () => {
      blocking = await loginHarness({
        settings: { limits: { ...TEST_SETTINGS.limits, blocking: true } },
      })
    })
    beforeEach(() => blocking.reset())
    afterAll(() => blocking.close())

    const signUpAndAsk = async () => {
      const cookie = blocking.cookieHeader(await blocking.signUp(EMAIL))
      blocking.outbox.length = 0
      for (let ask = 0; ask < 3; ask++) {
        const response = await blocking.request('POST', '/delete-user', { headers: { cookie } })
        expect(response.status, `ask ${ask}`).toBe(200)
      }
      return cookie
    }

    it('refuses the fourth in an hour, sends nothing and says so', async () => {
      const cookie = await signUpAndAsk()

      const response = await blocking.request('POST', '/delete-user', { headers: { cookie } })

      expect(response.status).toBe(429)
      expect(await response.json()).toMatchObject({ code: 'DELETE_LINK_LIMIT' })
      expect(blocking.outbox).toHaveLength(3)
      expect(blocking.records).toContainEqual({
        defence: 'delete-link-limit',
        action: 'blocked',
        count: 4,
        limit: 3,
      })
    })

    it('counts per account, so one account’s asks can’t refuse another’s', async () => {
      await signUpAndAsk()
      const ravi = blocking.cookieHeader(await blocking.signUp('ravi@example.test'))

      const response = await blocking.request('POST', '/delete-user', { headers: { cookie: ravi } })

      expect(response.status).toBe(200)
    })

    it('never counts a deletion, only an ask that sends an email', async () => {
      const cookie = await signUpAndAsk()

      const response = await blocking.request('POST', '/delete-user', {
        headers: { cookie },
        body: { token: 'not-a-real-token' },
      })

      expect(response.status).not.toBe(429)
    })

    it('answers 401, and counts nothing, for a request with no user-session', async () => {
      await signUpAndAsk()
      const before = await blocking.count('defenceCount')

      expect((await blocking.request('POST', '/delete-user')).status).toBe(401)

      expect(await blocking.count('defenceCount')).toBe(before)
    })
  })

  it('only records while the limits aren’t blocking, and still sends', async () => {
    const cookie = await signedUp()
    login.outbox.length = 0
    for (let ask = 0; ask < 3; ask++) await askToDelete(cookie)

    const response = await askToDelete(cookie)

    expect(response.status).toBe(200)
    expect(login.outbox).toHaveLength(4)
    expect(login.records).toContainEqual({
      defence: 'delete-link-limit',
      action: 'recorded',
      count: 4,
      limit: 3,
    })
  })
})
