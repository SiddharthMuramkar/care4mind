import { describe, expect, it, vi } from 'vitest'

import { brevoSender, emailedCodeMessage } from '@/lib/auth/email'

describe('the emailed code’s message', () => {
  it('gives the code in plain text and HTML, and says how long it lasts', () => {
    const message = emailedCodeMessage('asha@example.test', '123456')
    expect(message.to).toBe('asha@example.test')
    expect(message.text).toContain('123456')
    expect(message.html).toContain('123456')
    expect(message.text).toContain('10 minutes')
  })
})

describe('the email sender', () => {
  const email = { apiKey: 'a-key', from: 'login@care4mind.org' }

  it('posts to Brevo as its API documents', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ messageId: 'x' }), { status: 201 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    try {
      await brevoSender(email)(emailedCodeMessage('asha@example.test', '123456'))
      expect(fetchMock).toHaveBeenCalledOnce()
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
      expect(url).toBe('https://api.brevo.com/v3/smtp/email')
      expect(init.method).toBe('POST')
      expect(init.headers).toMatchObject({ 'api-key': 'a-key' })
      expect(JSON.parse(String(init.body))).toMatchObject({
        sender: { email: 'login@care4mind.org', name: 'Care4Mind' },
        to: [{ email: 'asha@example.test' }],
        subject: 'Your Care4Mind code',
      })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('rejects when Brevo refuses, so a failed send is logged rather than lost', async () => {
    vi.stubGlobal('fetch', async () => new Response('nope', { status: 401 }))
    try {
      await expect(
        brevoSender(email)(emailedCodeMessage('asha@example.test', '123456')),
      ).rejects.toThrow(/401/)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('goes to the local stand-in when a browser test run names one', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    try {
      await brevoSender({ ...email, apiUrl: 'http://localhost:3112/email' })(
        emailedCodeMessage('asha@example.test', '123456'),
      )
      expect(fetchMock.mock.calls[0]?.[0 as never]).toBe('http://localhost:3112/email')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
