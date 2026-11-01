import type { HrefTarget } from '../types'

/** The site map's fixed pages (design B2), each at its own path. */
const FIXED_PAGES = {
  home: '/',
  concepts: '/concepts/',
  'concept-map': '/concepts/map/',
  texts: '/texts/',
  questionnaires: '/questionnaires/',
  library: '/library/',
  references: '/library/references/',
  search: '/search/',
  proposals: '/proposals/',
  start: '/start/',
} as const

const withAnchor = (path: string, anchor: string | undefined) =>
  anchor === undefined ? path : `${path}#${anchor}`

/** A passage's anchor on its work's page: its locator with dots as hyphens (`1.30` → `1-30`). */
export function passageAnchor(locator: string): string {
  return locator.replaceAll('.', '-')
}

/** A Reference's anchor, on the References page and on every page that lists it. */
export function referenceAnchor(id: string): string {
  return `ref-${id}`
}

/**
 * The path of a page, or of an anchor on one (design B2), always with its trailing slash. Every
 * internal link on the site is made here, so an address changes in one place.
 */
export function hrefFor(target: HrefTarget): string {
  if ('page' in target) return FIXED_PAGES[target.page]
  switch (target.kind) {
    case 'concept':
      return withAnchor(`/concepts/${target.id}/`, target.anchor)
    case 'topic':
      return withAnchor(`/topics/${target.id}/`, target.anchor)
    case 'work':
      return `/texts/${target.id}/`
    case 'passage': {
      const at = target.id.indexOf('/')
      if (at < 1) throw new Error(`A passage id is work/locator, not “${target.id}”.`)
      return `/texts/${target.id.slice(0, at)}/#${passageAnchor(target.id.slice(at + 1))}`
    }
    case 'questionnaire':
      if (target.status === 'coming-later') return `/questionnaires/#${target.id}`
      return target.flow ? `/questionnaires/${target.id}/take/` : `/questionnaires/${target.id}/`
    case 'glossary':
      return `/concepts/#${target.id}`
    case 'reference':
      return `${FIXED_PAGES.references}#${referenceAnchor(target.id)}`
    case 'resource-list':
    case 'page':
      return withAnchor(`/library/${target.id}/`, target.anchor)
  }
}
