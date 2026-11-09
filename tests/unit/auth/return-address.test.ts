import { describe, expect, it } from 'vitest'

import { safeReturnAddress } from '@/lib/auth/return-address'

describe('the address to return to after getting in', () => {
  it('keeps a page on this site, with its query', () => {
    expect(safeReturnAddress('/questionnaires/karmayoga-scale/take/')).toBe(
      '/questionnaires/karmayoga-scale/take/',
    )
    expect(safeReturnAddress('/search/?q=focus')).toBe('/search/?q=focus')
  })

  it('goes home when there is nothing to return to', () => {
    expect(safeReturnAddress(null)).toBe('/')
    expect(safeReturnAddress('')).toBe('/')
  })

  it.each([
    ['another site', 'https://evil.example/'],
    ['a protocol-relative address', '//evil.example/'],
    ['a backslash browsers treat as a slash', '/\\evil.example/'],
    ['a scheme with no slashes', 'javascript:alert(1)'],
    ['a tab browsers strip', '/\t/evil.example/'],
    ['a newline browsers strip', '/\n/evil.example/'],
    ['a dot segment that resolves to two slashes', '/.//evil.example/'],
    ['an up-level segment that resolves to two slashes', '/a/..//evil.example/'],
    ['no leading slash', 'questionnaires/x/take/'],
    ['the screen it came from', '/log-in/'],
    ['the other screen', '/sign-up/?next=/x/'],
    ['the auth route', '/api/auth/sign-out/'],
  ])('refuses %s and goes home instead', (_name, value) => {
    expect(safeReturnAddress(value)).toBe('/')
  })
})
