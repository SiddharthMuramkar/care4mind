import { isValidElement, type ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// What the login switch changes outside the auth route itself, in a build with it on and with
// it off: the browser tests of the switched-off state run only in `pnpm check:e2e:off`, and
// this has to hold in `pnpm check`.

function buildWithLogin(login: boolean) {
  vi.doMock('@/config/features', async (original) => {
    const actual = await original<typeof import('@/config/features')>()
    const env = login ? {} : { VERCEL_ENV: 'production' }
    return { ...actual, features: { ...actual.readFeatures(env), login } }
  })
}

beforeEach(() => vi.resetModules())
afterEach(() => vi.doUnmock('@/config/features'))

describe('login before Start', () => {
  it('leaves the page exactly as it was while the switch is off', async () => {
    buildWithLogin(false)
    const { LoginRequired } = await import('@/components/login')
    expect(LoginRequired({ children: 'the Questionnaire' })).toBe('the Questionnaire')
  })

  it('sets the page behind the login gate while the switch is on', async () => {
    buildWithLogin(true)
    const { LoginRequired } = await import('@/components/login')
    const gate = LoginRequired({ children: 'the Questionnaire' }) as ReactElement<{
      children: string
      logIn: string
    }>
    expect(isValidElement(gate)).toBe(true)
    expect(gate.props).toMatchObject({ children: 'the Questionnaire', logIn: '/log-in/' })
  })
})

describe('the Log in link', () => {
  it('is left out of the header while the switch is off', async () => {
    buildWithLogin(false)
    const { siteNav } = await import('@/components/nav')
    expect((await siteNav()).login).toBeUndefined()
  })

  it('is in the header while the switch is on', async () => {
    buildWithLogin(true)
    const { siteNav } = await import('@/components/nav')
    expect((await siteNav()).login?.href).toBe('/log-in/')
  })
})
