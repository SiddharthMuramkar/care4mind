import type { Page } from '@playwright/test'

import { site, type RouteEntry } from '@/content'

import { inScope } from './fixtures'

/**
 * Every public page, from the route registry (`site.routes()`) for this build's feature flags:
 * a page is tested the moment it exists, and a switched-off feature's routes aren't in it. The
 * server must be built with the same flags (the FEATURE_* variables) as the run that tests it.
 */
export const ROUTES: readonly RouteEntry[] = await site.routes()

/** The routes a looping spec visits: every one, or with E2E_SCOPE=sample one of each kind. */
export const ROUTES_IN_SCOPE = inScope(ROUTES)

/** Where a check ran, for its failure message: the route and the width of the screen. */
export function at(page: Page, path: string) {
  return `${path} at ${page.viewportSize()?.width ?? 'an unknown width of'} px`
}

/** A URL that must 404. */
export const MISSING = '/this-page-does-not-exist/'

/** The foundation's three pages, which the font and logo specs check one by one. */
export const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/concepts/vikshepa/', name: 'Concept page' },
  { path: '/questionnaires/karmayoga-scale/', name: 'Questionnaire page' },
] as const
