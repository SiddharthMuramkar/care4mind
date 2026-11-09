import { readFileSync } from 'node:fs'

import { describe, expect, it, vi } from 'vitest'

import { authRoute } from '@/lib/auth/route-handler'

import { flagsOff, flagsOn } from '../../flags'

describe('the auth route on Vercel', () => {
  it('runs in Singapore, next to the database', () => {
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as { regions?: string[] }
    expect(vercel.regions).toEqual(['sin1'])
  })
})

describe('the login switch', () => {
  it('answers every auth route as if it doesn’t exist while off, without building Better Auth', async () => {
    const getAuth = vi.fn(() => {
      throw new Error('login settings were read')
    })
    const route = authRoute({ features: flagsOff(), getAuth })
    for (const path of ['/get-session/', '/email-otp/send-verification-otp/', '/sign-out/']) {
      const url = `http://localhost:3000/api/auth${path}`
      expect((await route.GET(new Request(url))).status, path).toBe(404)
      expect((await route.POST(new Request(url, { method: 'POST' }))).status, path).toBe(404)
    }
    expect(getAuth).not.toHaveBeenCalled()
  })

  it('reaches the auth instance only once the switch is on and a request arrives', async () => {
    const handler = vi.fn(async () => new Response('from better auth'))
    const getAuth = vi.fn(() => ({ handler }))
    const route = authRoute({ features: flagsOn(), getAuth })
    expect(getAuth).not.toHaveBeenCalled()
    const response = await route.GET(new Request('http://localhost:3000/api/auth/get-session/'))
    expect(await response.text()).toBe('from better auth')
    expect(getAuth).toHaveBeenCalledTimes(1)
  })
})
