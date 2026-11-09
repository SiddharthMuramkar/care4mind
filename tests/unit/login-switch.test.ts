import { buildCustomRoute } from 'next/dist/lib/build-custom-route'
import loadCustomRoutes from 'next/dist/lib/load-custom-routes'
import { isValidElement, type ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import nextConfig from '../../next.config'

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
    const { LoginRequired } = await import('@/components/login-gate')
    expect(LoginRequired({ children: 'the Questionnaire' })).toBe('the Questionnaire')
  })

  it('sets the page behind the login gate while the switch is on', async () => {
    buildWithLogin(true)
    const { LoginRequired } = await import('@/components/login-gate')
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

describe('the addresses that must not answer while the switch is off', () => {
  afterEach(() => vi.unstubAllEnvs())

  /** Whether Next's own route table, as Vercel reads it, sends this address to the 404. */
  async function goesNowhere(address: string) {
    vi.stubEnv('VERCEL_ENV', 'production')
    const { rewrites } = await loadCustomRoutes(nextConfig)
    return rewrites.beforeFiles.some((rewrite) => {
      const { regex } = buildCustomRoute('rewrite', rewrite)
      return new RegExp(regex).test(address)
    })
  }

  // Next and Vercel serve a page's prerendered body at these addresses too, without the page.
  it.each([
    '/privacy/',
    '/log-in/',
    '/sign-up/',
    '/privacy.rsc',
    '/log-in.rsc',
    '/sign-up.rsc',
    '/privacy.segments/_full.segment.rsc',
    '/privacy.segments/privacy/__PAGE__.segment.rsc',
    '/log-in.segments/_tree.segment.rsc',
    '/sign-up.segments/sign-up/__PAGE__.segment.rsc',
  ])('sends %s to the 404', async (address) => {
    expect(await goesNowhere(address)).toBe(true)
  })

  it('leaves every other page’s files alone', async () => {
    expect(await goesNowhere('/concepts/vikshepa.rsc')).toBe(false)
    expect(await goesNowhere('/privacy-policy.rsc')).toBe(false)
  })
})
