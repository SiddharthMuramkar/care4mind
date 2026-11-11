import type { PanelId } from './types'

/**
 * The width from which the header lists the sections as links beside Search, and the Menu and its
 * Drawer go (nav.module.css, SiteHeader.module.css, MenuButton.module.css).
 */
export const TABLET = '(min-width: 48rem)'

/** The width from which Concepts and Library open panels, and Search is a labelled field. */
export const WIDE = '(min-width: 64rem)'

const PANELS: readonly string[] = ['concepts', 'library'] satisfies PanelId[]

/** The panel a section's item opens on a computer, and its list in the Drawer, where it has one. */
export const panelOf = (id: string) => (PANELS.includes(id) ? (id as PanelId) : undefined)

/** A path with its trailing slash, as hrefFor() writes every address. */
const slashed = (path: string) => (path.endsWith('/') ? path : `${path}/`)

/**
 * Where a page sits against a link (`aria-current`): `page` on the link's own page, `true` on a
 * page within the paths it heads (each read as a folder, so /concepts doesn't head /concepts-map/),
 * and nothing elsewhere.
 */
export function currentFor(
  pathname: string,
  href: string,
  within: readonly string[] = [],
): 'page' | 'true' | undefined {
  const path = slashed(pathname)
  if (path === href) return 'page'
  return within.some((prefix) => path.startsWith(slashed(prefix))) ? 'true' : undefined
}
