import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { beforeAll, describe, expect, it } from 'vitest'

import { features, type Features } from '@/config/features'
import { site, type RouteEntry } from '@/content'
import { localSource } from '@/content/source'
import { createContent } from '@/content/views'

// Front-end-site ticket 02: the page files in the app and the route registry agree. The
// end-to-end suite tests the registry's routes, so a page the registry missed would go untested,
// and an entry with no page would test nothing but a 404.

const APP = fileURLToPath(new URL('../../src/app/', import.meta.url))

/** Next.js's page files: `page` with one of its default page extensions. */
const PAGE_FILE = /^page\.(?:tsx|ts|jsx|js)$/

/**
 * The route pattern a page file serves, in the registry's form: `concepts/[slug]/page.tsx` (a
 * path under `src/app/`) serves `/concepts/[slug]/`. A route group, `(name)`, adds nothing to
 * the address, and a page in a private folder, `_name`, serves none.
 */
function patternOf(file: string): string | null {
  const folders = file.split(/[\\/]/).slice(0, -1)
  if (folders.some((folder) => folder.startsWith('_'))) return null
  const unmappable = folders.find((folder) => /^@|^\(\.{1,3}\)/.test(folder))
  if (unmappable) {
    throw new Error(
      `${file}: a parallel or intercepting route (${unmappable}) has no pattern of its own; teach patternOf() how this one maps.`,
    )
  }
  const segments = folders.filter((folder) => !/^\(.+\)$/.test(folder))
  return `/${segments.map((segment) => `${segment}/`).join('')}`
}

/** The pattern of every page file in the app, each once. */
function pagePatterns(): string[] {
  const files = readdirSync(APP, { recursive: true, encoding: 'utf8' })
  const pages = files.filter((file) => PAGE_FILE.test(file.split(/[\\/]/).at(-1) ?? ''))
  return [...new Set(pages.map(patternOf).filter((pattern) => pattern !== null))].sort()
}

/** The patterns of a registry's entries, each once. */
const patternsOf = (routes: readonly RouteEntry[]) =>
  [...new Set(routes.map(({ pattern }) => pattern))].sort()

/** Every feature flag on, however many the site has. */
const EVERY_FLAG_ON = Object.fromEntries(
  Object.keys(features).map((flag) => [flag, true]),
) as Record<keyof Features, boolean>

describe('the route pattern of a page file', () => {
  it('follows its folders and ends in a slash', () => {
    expect(patternOf('page.tsx')).toBe('/')
    expect(patternOf('concepts/page.tsx')).toBe('/concepts/')
    expect(patternOf('concepts/[slug]/page.tsx')).toBe('/concepts/[slug]/')
    expect(patternOf('questionnaires/[slug]/take/page.tsx')).toBe('/questionnaires/[slug]/take/')
    expect(patternOf('docs/[[...path]]/page.js')).toBe('/docs/[[...path]]/')
  })

  it('leaves a route group out of the address, and a private folder out of the routes', () => {
    expect(patternOf('(reading)/texts/[slug]/page.tsx')).toBe('/texts/[slug]/')
    expect(patternOf('library/_drafts/page.tsx')).toBeNull()
  })

  it('refuses a parallel or intercepting route rather than guess its address', () => {
    expect(() => patternOf('@modal/(.)concepts/[slug]/page.tsx')).toThrow(/@modal/)
    expect(() => patternOf('concepts/(..)texts/page.tsx')).toThrow(/\(\.\.\)texts/)
  })
})

describe('page files and the route registry', () => {
  // Page files exist whatever the feature flags; a switched-off feature's page answers 404 and
  // leaves the registry. So the files are matched against the registry with every flag on.
  let everyFlagOn: RouteEntry[] = []
  let thisBuild: RouteEntry[] = []

  // Read once, with room for a busy machine: the registry is built from all of the content.
  beforeAll(async () => {
    everyFlagOn = await createContent(localSource, EVERY_FLAG_ON).site.routes()
    thisBuild = await site.routes()
  }, 60_000)

  it('finds the app’s page files', () => {
    expect(pagePatterns()).toEqual(expect.arrayContaining(['/', '/concepts/', '/concepts/[slug]/']))
  })

  it('gives every page file’s pattern an entry in the registry', () => {
    const registered = patternsOf(everyFlagOn)
    const unregistered = pagePatterns().filter((pattern) => !registered.includes(pattern))
    expect(unregistered, 'page files with no route in site.routes()').toEqual([])
  })

  it('gives each pattern params equal to its registry entries', async () => {
    for (const [flags, registry] of [
      [EVERY_FLAG_ON, everyFlagOn],
      [features, thisBuild],
    ] as const) {
      const content = createContent(localSource, flags)
      for (const pattern of patternsOf(registry)) {
        expect(await content.site.params(pattern)).toEqual(
          registry.flatMap((entry) =>
            entry.pattern === pattern && entry.record ? [{ slug: entry.record.id }] : [],
          ),
        )
      }
    }
  })

  it('gives every entry’s pattern a page file, every flag on and in this build', () => {
    const pages = pagePatterns()
    for (const [build, routes] of [
      ['every flag on', everyFlagOn],
      ['this build', thisBuild],
    ] as const) {
      const pageless = patternsOf(routes).filter((pattern) => !pages.includes(pattern))
      expect(pageless, `registry patterns with no page file (${build})`).toEqual([])
    }
  })
})
