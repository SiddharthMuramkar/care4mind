import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// A browser where BotID's script fails to load, driving the real botid package. Only what the
// package and our wrapper touch is stubbed.

const PROTECTED = '/api/auth/email-otp/send-verification-otp/'

const within = <T>(work: Promise<T>) =>
  Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('it never settled')), 1000),
    ),
  ])

class ScriptStub {
  src = ''
  async = false
  onerror: ((event: unknown) => void) | null = null
  onload: (() => void) | null = null
  remove() {
    scripts.splice(scripts.indexOf(this), 1)
  }
}

let scripts: ScriptStub[] = []
let onScript: (script: ScriptStub) => void

function fail(script: ScriptStub) {
  const event = { target: script }
  for (const listener of captureListeners) listener(event)
  script.onerror?.(event)
}

let captureListeners: ((event: { target: unknown }) => void)[] = []
let realFetch: ReturnType<typeof vi.fn<(...args: unknown[]) => Promise<Response>>>

beforeEach(() => {
  scripts = []
  captureListeners = []
  onScript = (script) => queueMicrotask(() => fail(script))
  realFetch = vi.fn<(...args: unknown[]) => Promise<Response>>(async () => new Response('{}'))
  const location = {
    hostname: 'www.care4mind.xyz',
    origin: 'https://www.care4mind.xyz',
    host: 'www.care4mind.xyz',
    href: 'https://www.care4mind.xyz/sign-up/',
    pathname: '/sign-up/',
    search: '',
  }
  const stubWindow = {
    location,
    fetch: realFetch,
    addEventListener: (
      type: string,
      listener: (event: { target: unknown }) => void,
      capture?: boolean,
    ) => {
      if (type === 'error' && capture) captureListeners.push(listener)
    },
  }
  vi.stubGlobal('window', stubWindow)
  vi.stubGlobal('location', location)
  vi.stubGlobal('HTMLScriptElement', ScriptStub)
  vi.stubGlobal(
    'XMLHttpRequest',
    class {
      open() {}
      send() {}
    },
  )
  vi.stubGlobal('document', {
    createElement: () => new ScriptStub(),
    querySelector: (selector: string) =>
      scripts.find((script) => selector.includes(script.src)) ?? null,
    head: {
      appendChild: (script: ScriptStub) => {
        scripts.push(script)
        onScript(script)
      },
    },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })
  vi.resetModules()
})

afterEach(() => vi.unstubAllGlobals())

const send = () =>
  within(
    (window.fetch as typeof fetch)(PROTECTED, { method: 'POST', body: '{}' }) as Promise<Response>,
  )

describe('BotID in the browser, when its script can’t load', () => {
  it('still sends the first press, without BotID’s header', async () => {
    await import('@/components/login/startBotId')
    const response = await send()
    expect(response.ok).toBe(true)
    expect(realFetch).toHaveBeenCalledTimes(1)
    expect(
      new Headers((realFetch.mock.calls[0]?.[1] as RequestInit).headers).has('x-is-human'),
    ).toBe(false)
  })

  it('sends a second press too, instead of hanging on a script tag that failed', async () => {
    await import('@/components/login/startBotId')
    await send()
    await send()
    expect(realFetch).toHaveBeenCalledTimes(2)
  })

  it('leaves an ordinary failed fetch a failure', async () => {
    await import('@/components/login/startBotId')
    realFetch.mockRejectedValueOnce(new TypeError('network down'))
    await expect(within((window.fetch as typeof fetch)('/somewhere-else/'))).rejects.toThrow(
      'network down',
    )
  })
})
