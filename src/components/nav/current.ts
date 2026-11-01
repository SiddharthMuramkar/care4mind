import type { PanelId } from './types'

/** The width from which the header shows its five sections on one line (SiteHeader.module.css). */
export const WIDE = '(min-width: 72rem)'

const PANELS: readonly string[] = ['concepts', 'library'] satisfies PanelId[]

/** The panel a section's item opens on a computer, and its list in the Drawer, where it has one. */
export const panelOf = (id: string) => (PANELS.includes(id) ? (id as PanelId) : undefined)

/** A path with its trailing slash, as hrefFor() writes every address. */
const slashed = (path: string) => (path.endsWith('/') ? path : `${path}/`)

/**
 * Where a page sits against a link (`aria-current`): `page` on the link's own page, `true` on a
 * page within the paths it heads, and nothing elsewhere.
 */
export function currentFor(
  pathname: string,
  href: string,
  within: readonly string[] = [],
): 'page' | 'true' | undefined {
  const path = slashed(pathname)
  if (path === href) return 'page'
  return within.some((prefix) => path.startsWith(prefix)) ? 'true' : undefined
}
