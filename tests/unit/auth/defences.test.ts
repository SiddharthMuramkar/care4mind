import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { isThrowawayEmail } from '@/lib/auth/defences'
import { readLoginSettings } from '@/lib/auth/settings'

import { loginHarness, TEST_SETTINGS } from './harness'

let login: Awaited<ReturnType<typeof loginHarness>>

beforeAll(async () => {
  login = await loginHarness()
})
beforeEach(() => login.reset())
afterAll(() => login.close())

const HOUR = 60 * 60_000

describe('BotID, the second check', () => {
  describe('in record-only mode', () => {
    it('lets a suspected bot through and records it', async () => {
      login.setBotId({ isBot: true })
      expect((await login.sendCode('bot@example.test', 'sign-up')).status).toBe(200)
      expect(login.records).toContainEqual({ defence: 'botid', action: 'recorded' })
      expect(login.outbox).toHaveLength(1)
    })

    it('records nothing for a human', async () => {
      await login.sendCode('asha@example.test', 'sign-up')
      expect(login.records).toEqual([])
    })

    it('lets people in when BotID itself fails, and says so', async () => {
      login.setBotId('unreachable')
      expect((await login.sendCode('asha@example.test', 'sign-up')).status).toBe(200)
      expect(login.records).toContainEqual({ defence: 'botid', action: 'check-failed' })
    })

    it('lets people in when BotID never answers, and says so', async () => {
      login.setBotId('hangs')
      expect((await login.sendCode('asha@example.test', 'sign-up')).status).toBe(200)
      expect(login.records).toContainEqual({ defence: 'botid', action: 'check-failed' })
      expect(login.outbox).toHaveLength(1)
    })

    it('counts an answer with no verdict as a failed check, and says so', async () => {
      login.setBotId({})
      expect((await login.sendCode('asha@example.test', 'sign-up')).status).toBe(200)
      expect(login.records).toEqual([{ defence: 'botid', action: 'check-failed' }])
    })
  })

  it('runs after the bot check has passed, and never for a request it refused', async () => {
    login.setVerdict({ success: false })
    await login.sendCode('asha@example.test', 'sign-up')
    expect(login.botIdChecks).toEqual([])

    login.setVerdict({ success: true, hostname: 'www.care4mind.xyz', action: 'login' })
    await login.sendCode('asha@example.test', 'sign-up')
    expect(login.botIdChecks).toEqual([{ atVerifiedCount: 2 }])
  })

  it('guards the same routes as the bot check', async () => {
    await login.request('POST', '/sign-in/social', {
      body: { provider: 'google' },
      headers: { 'x-captcha-response': 'a-token' },
    })
    expect(login.botIdChecks).toHaveLength(1)
  })

  describe('with the blocking setting on', () => {
    let blocking: Awaited<ReturnType<typeof loginHarness>>

    beforeAll(async () => {
      blocking = await loginHarness({ settings: { botId: { blocking: true } } })
    })
    beforeEach(() => blocking.reset())
    afterAll(() => blocking.close())

    it('refuses a suspected bot, sends nothing and records it', async () => {
      blocking.setBotId({ isBot: true })
      const response = await blocking.sendCode('bot@example.test', 'sign-up')
      expect(response.status).toBe(403)
      expect(await response.json()).toMatchObject({ code: 'VERIFICATION_FAILED' })
      expect(blocking.outbox).toEqual([])
      expect(blocking.records).toContainEqual({ defence: 'botid', action: 'blocked' })
    })

    it('lets a human through', async () => {
      expect((await blocking.sendCode('asha@example.test', 'sign-up')).status).toBe(200)
    })

    it('stops everyone when BotID itself fails, as the bot check does', async () => {
      blocking.setBotId('unreachable')
      expect((await blocking.sendCode('asha@example.test', 'sign-up')).status).toBe(500)
    })

    it.each([
      ['never answers', 'hangs'],
      ['answers with no verdict', {}],
    ] as const)('stops everyone when BotID %s, and says so', async (_, answer) => {
      blocking.setBotId(answer)
      expect((await blocking.sendCode('asha@example.test', 'sign-up')).status).toBe(500)
      expect(blocking.records).toEqual([{ defence: 'botid', action: 'check-failed' }])
      expect(blocking.outbox).toEqual([])
    })
  })
})

describe('a throwaway email', () => {
  it('is refused on Sign up, so no code is sent and no account can follow', async () => {
    const response = await login.sendCode('someone@mailinator.com', 'sign-up')
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: 'THROWAWAY_EMAIL' })
    expect(login.outbox).toEqual([])
    expect(await login.count('verification')).toBe(0)
  })

  it('is refused however it is capitalised, and on a subdomain of a listed domain', async () => {
    expect((await login.sendCode('Someone@MAILINATOR.com', 'sign-up')).status).toBe(400)
    expect((await login.sendCode('someone@sub.mailinator.com', 'sign-up')).status).toBe(400)
  })

  it('lets a real address through', async () => {
    expect((await login.sendCode('asha@example.test', 'sign-up')).status).toBe(200)
    expect(login.outbox).toHaveLength(1)
  })

  it.each(['someone@duck.com', 'someone@mozmail.com', 'someone@passmail.net'])(
    'lets the privacy relay %s through',
    async (email) => {
      expect((await login.sendCode(email, 'sign-up')).status).toBe(200)
      expect(login.outbox).toHaveLength(1)
    },
  )

  it('keeps a privacy relay off the refused list even if the list adds it', () => {
    const list = new Set(['mozmail.com', 'mailinator.com'])
    expect(isThrowawayEmail('someone@mozmail.com', list)).toBe(false)
    expect(isThrowawayEmail('someone@mailinator.com', list)).toBe(true)
  })

  it('logs in an account already there, its name unchanged, when the list adds its domain', async () => {
    await login.addUser('someone@mailinator.com', 'Asha')
    expect((await login.sendCode('someone@mailinator.com', 'sign-up')).status).toBe(200)
    const redeemed = await login.redeemCode(
      'someone@mailinator.com',
      login.codeFor('someone@mailinator.com'),
      'Someone Else',
    )
    expect(redeemed.status).toBe(200)
    expect((await login.users())[0]).toMatchObject({ name: 'Asha' })
  })

  it('leaves Log in alone: an account whose domain the list later adds can still get in', async () => {
    const response = await login.sendCode('someone@mailinator.com', 'log-in')
    expect(response.status).toBe(200)
  })
})

describe('the limit per email', () => {
  const emailCount = () => login.records.filter((record) => record.defence === 'email-limit').length

  it('only records past its number while record-only', async () => {
    for (let send = 0; send < 4; send++) {
      expect((await login.sendCode('asha@example.test', 'sign-up')).status).toBe(200)
    }
    expect(login.outbox).toHaveLength(4)
    expect(login.records).toEqual([
      { defence: 'email-limit', action: 'recorded', count: 4, limit: 3 },
    ])
  })

  it('counts each address on its own, however it is written', async () => {
    for (let send = 0; send < 3; send++) await login.sendCode('asha@example.test', 'sign-up')
    await login.sendCode('ravi@example.test', 'sign-up')
    expect(emailCount()).toBe(0)
    await login.sendCode('ASHA@example.test', 'sign-up')
    expect(emailCount()).toBe(1)
  })

  it('starts again after an hour', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      for (let send = 0; send < 3; send++) await login.sendCode('asha@example.test', 'sign-up')
      vi.advanceTimersByTime(HOUR + 1000)
      await login.sendCode('asha@example.test', 'sign-up')
      expect(emailCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  describe('with the limits turned to blocking', () => {
    let blocking: Awaited<ReturnType<typeof loginHarness>>

    beforeAll(async () => {
      blocking = await loginHarness({
        settings: { limits: { ...TEST_SETTINGS.limits, blocking: true } },
      })
    })
    beforeEach(() => blocking.reset())
    afterAll(() => blocking.close())

    it('refuses past its number, without sending', async () => {
      for (let send = 0; send < 3; send++) {
        expect((await blocking.sendCode('asha@example.test', 'sign-up')).status).toBe(200)
      }
      const response = await blocking.sendCode('asha@example.test', 'sign-up')
      expect(response.status).toBe(429)
      expect(await response.json()).toMatchObject({ code: 'EMAIL_LIMIT' })
      expect(blocking.outbox).toHaveLength(3)
      expect(blocking.records).toContainEqual({
        defence: 'email-limit',
        action: 'blocked',
        count: 4,
        limit: 3,
      })
    })

    it('answers the same for an address with no account, so nothing is revealed', async () => {
      for (let send = 0; send < 3; send++) await blocking.sendCode('nobody@example.test', 'log-in')
      expect((await blocking.sendCode('nobody@example.test', 'log-in')).status).toBe(429)
    })
  })
})

describe('the cap on new accounts', () => {
  it('only records past its number while record-only', async () => {
    for (let user = 0; user < 6; user++) {
      expect((await login.signUp(`user${user}@example.test`)).status).toBe(200)
    }
    expect(await login.users()).toHaveLength(6)
    expect(login.records).toContainEqual({
      defence: 'new-account-cap',
      action: 'recorded',
      count: 6,
      limit: 5,
    })
  })

  describe('with the limits turned to blocking', () => {
    let blocking: Awaited<ReturnType<typeof loginHarness>>

    beforeAll(async () => {
      blocking = await loginHarness({
        settings: { limits: { ...TEST_SETTINGS.limits, blocking: true } },
      })
    })
    beforeEach(() => blocking.reset())
    afterAll(() => blocking.close())

    it('refuses the account past its number and creates nothing', async () => {
      for (let user = 0; user < 5; user++) {
        expect((await blocking.signUp(`user${user}@example.test`)).status).toBe(200)
      }
      const response = await blocking.signUp('sixth@example.test')
      expect(response.status).toBe(429)
      expect(await response.json()).toMatchObject({ code: 'NEW_ACCOUNT_CAP' })
      expect(await blocking.users()).toHaveLength(5)
    })

    it('still lets someone with an account log in past the cap', async () => {
      for (let user = 0; user < 5; user++) await blocking.signUp(`user${user}@example.test`)
      await blocking.sendCode('user0@example.test', 'log-in')
      const response = await blocking.redeemCode(
        'user0@example.test',
        blocking.codeFor('user0@example.test'),
      )
      expect(response.status).toBe(200)
    })

    it('counts only the last hour', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      try {
        for (let user = 0; user < 5; user++) await blocking.signUp(`user${user}@example.test`)
        vi.advanceTimersByTime(HOUR + 1000)
        expect((await blocking.signUp('later@example.test')).status).toBe(200)
      } finally {
        vi.useRealTimers()
      }
    })
  })
})

describe('the sign-up spike alert', () => {
  const alerts = (harness: typeof login) =>
    harness.outbox.filter(({ to }) => to === 'developer@care4mind.test')

  it('stays quiet up to the number', async () => {
    for (let user = 0; user < 4; user++) await login.signUp(`user${user}@example.test`)
    expect(alerts(login)).toEqual([])
  })

  it('emails the developer once when new accounts pass it, not once per sign-up', async () => {
    for (let user = 0; user < 8; user++) await login.signUp(`user${user}@example.test`)
    expect(alerts(login)).toHaveLength(1)
    expect(alerts(login)[0]?.text).toMatch(/Attack Mode/)
  })

  it('can alert again in a later hour, when the spike is still there', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      for (let user = 0; user < 5; user++) await login.signUp(`user${user}@example.test`)
      expect(alerts(login)).toHaveLength(1)
      // Half an hour on, this spike has still not gone away.
      vi.advanceTimersByTime(HOUR / 2)
      for (let user = 5; user < 10; user++) await login.signUp(`user${user}@example.test`)
      expect(alerts(login)).toHaveLength(1)
      vi.advanceTimersByTime(HOUR / 2 + 1000)
      await login.signUp('still@example.test')
      expect(alerts(login)).toHaveLength(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('doesn’t count anyone but new accounts: Log in is quiet', async () => {
    for (let user = 0; user < 4; user++) await login.signUp(`user${user}@example.test`)
    await login.sendCode('user0@example.test', 'log-in')
    await login.redeemCode('user0@example.test', login.codeFor('user0@example.test'))
    expect(alerts(login)).toEqual([])
  })

  it('never stops a sign-up when the alert can’t send, and tries again on the next one', async () => {
    login.failEmailTo('developer@care4mind.test')
    for (let user = 0; user < 5; user++) {
      expect((await login.signUp(`user${user}@example.test`)).status).toBe(200)
    }
    expect(login.records).toContainEqual({ defence: 'spike-alert', action: 'send-failed' })
    expect(alerts(login)).toEqual([])

    login.failEmailTo(undefined)
    await login.signUp('next@example.test')
    expect(alerts(login)).toHaveLength(1)
  })
})

describe('one connection, as a lecture hall on one Wi-Fi is', () => {
  it('gets 30 new accounts in with the provisional numbers and blocking on', async () => {
    const { limits } = readLoginSettings({
      BETTER_AUTH_URL: 'https://www.care4mind.xyz',
      BETTER_AUTH_SECRET: 'x'.repeat(32),
      DATABASE_URL: 'postgres://user:pass@db.example.test/care4mind',
      TURNSTILE_SITE_KEY: 'a-real-site-key',
      TURNSTILE_SECRET_KEY: 'a-real-secret',
      GOOGLE_CLIENT_ID: 'a-real-client-id',
      GOOGLE_CLIENT_SECRET: 'a-real-client-secret',
      BREVO_API_KEY: 'a-real-key',
      LOGIN_EMAIL_FROM: 'login@care4mind.org',
      LOGIN_ALERT_EMAIL: 'developer@care4mind.org',
      LOGIN_LIMITS_BLOCKING: '1',
    })
    const hall = await loginHarness({ settings: { limits } })
    try {
      // Every request carries the same address: the hall shares one connection.
      for (let phone = 0; phone < 30; phone++) {
        const email = `phone${phone}@example.test`
        await hall.sendCode(email, 'sign-up')
        const response = await hall.redeemCode(email, hall.codeFor(email), 'A User')
        expect(response.status, email).toBe(200)
      }
      expect(await hall.users()).toHaveLength(30)
    } finally {
      await hall.close()
    }
  })
})
