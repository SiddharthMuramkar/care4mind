/** Every page the site serves, and a URL that must 404. Extend this list whenever a page is added. */
export const PAGES = [
  { path: '/', name: 'preview home' },
  { path: '/directions', name: 'directions index' },
  { path: '/directions/press', name: 'Press style tile' },
  { path: '/directions/chroma', name: 'Chroma style tile' },
  { path: '/directions/kolam', name: 'Kolam style tile' },
] as const

export const MISSING = '/this-page-does-not-exist'
