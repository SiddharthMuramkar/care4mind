import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ReadingPage } from '@/components/ReadingPage'

// The reading page's shell (main#main, the trail, the folio and its title) lives in one module,
// and each page renders it itself: a layout would sit outside the page turn.

const APP = 'src/app'

/** Every page file below the homepage, as a path from the repo's root. */
const pages = readdirSync(APP, { recursive: true, encoding: 'utf8' })
  .filter((path) => path.endsWith('page.tsx') && path !== 'page.tsx')
  .map((path) => join(APP, path))

describe('the reading page shell', () => {
  it('finds the pages below the homepage', () => {
    expect(pages.length).toBeGreaterThan(0)
  })

  it.each(pages)('%s renders the shell and builds none of it by hand', (path) => {
    const source = readFileSync(path, 'utf8')
    expect(source).toMatch(/<ReadingPage\b/)
    expect(source).not.toMatch(/<main\b|<Breadcrumbs\b|<PageTurn\b|<h1\b/)
  })

  // The route registry decides which pages exist, switched-off features included.
  it('answers 404 for a path the route registry does not list', async () => {
    await expect(
      ReadingPage({ path: '/this-page-does-not-exist/', children: null }),
    ).rejects.toMatchObject({ digest: expect.stringMatching(/404/) })
  })

  it.each(pages)('%s leaves it to the route registry whether it exists', (path) => {
    const source = readFileSync(path, 'utf8')
    expect(source).not.toMatch(/proposalsPageOn|features\.(conceptMap|questionnairePreview)/)
  })
})
