import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { loginHarness } from './harness'

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

  it('refuses a link after 24 hours, and says the link is what ran out', async () => {
    const cookie = await signedUp()
    await askToDelete(cookie)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(Date.now() + 24 * 60 * 60 * 1000 + 1000)

    const response = await confirmDelete(cookie, tokenIn())

    expect(response.ok).toBe(false)
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
