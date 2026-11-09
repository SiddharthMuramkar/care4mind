/**
 * Where to go once a user has got in: the page they came from, handed through the address as
 * `?next=`. The address is public and anyone can link to it, so only a page on this site is
 * accepted; anything else goes home, and can't send someone off to another site.
 */
const HOME = '/'

/** A backslash browsers read as a slash, or a tab or newline they strip before reading the address. */
const isUnsafeCharacter = (character: string) => {
  const code = character.charCodeAt(0)
  return character === '\\' || code < 0x20 || code === 0x7f
}

const BASE = 'https://care4mind.invalid'

export function safeReturnAddress(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || [...next].some(isUnsafeCharacter)) return HOME
  let url: URL
  try {
    url = new URL(next, BASE)
  } catch {
    return HOME
  }
  // `/.//evil.example/` resolves to `//evil.example/`, which a browser reads as another site.
  if (url.origin !== BASE || url.pathname.startsWith('//')) return HOME
  if (/^\/(?:log-in|sign-up|api)(?:\/|$)/.test(url.pathname)) return HOME
  return `${url.pathname}${url.search}${url.hash}`
}
