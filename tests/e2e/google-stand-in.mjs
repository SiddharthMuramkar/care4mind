// Google's token endpoint, faked inside the server a browser test run starts: Better Auth posts
// each sign-in's code there from the server, where Playwright can't reach, and has no setting to
// move it. Node loads this file before anything else, by NODE_OPTIONS in playwright.config.ts,
// so it exists in test runs only and nothing in the site's own code knows about it.
//
// The code a spec invents (login.ts, `fakeGoogle`) is the person who signed in; the id token
// built from it needs no signature, because Better Auth only decodes what it just fetched.

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

const realFetch = globalThis.fetch

const part = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')

globalThis.fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input)
  if (url !== TOKEN_URL) return realFetch(input, init)
  const code = new URLSearchParams(String(init?.body)).get('code') ?? ''
  const profile = JSON.parse(Buffer.from(code, 'base64url').toString('utf8'))
  return Response.json({
    access_token: 'google-access-token',
    expires_in: 3600,
    token_type: 'Bearer',
    scope: 'openid email profile',
    id_token: `${part({ alg: 'none' })}.${part({ iss: 'https://accounts.google.com', ...profile })}.x`,
  })
}
