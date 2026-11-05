import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { Breadcrumbs } from '@/components/Breadcrumbs'

// The route registry decides which pages exist, switched-off features included: a page's trail
// resolves its path against it, and no page asks a flag again.

const pages = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return pages(path)
    return entry.name === 'page.tsx' ? [path] : []
  })

describe('the route registry decides which pages exist', () => {
  it('a trail to a path the registry does not list answers 404', async () => {
    await expect(Breadcrumbs({ path: '/this-page-does-not-exist/' })).rejects.toMatchObject({
      digest: 'NEXT_HTTP_ERROR_FALLBACK;404',
    })
  })

  it.each(pages('src/app'))('%s never answers 404 on a flag', (path) => {
    const source = readFileSync(path, 'utf8')
    if (source.includes('@/config/features')) expect(source).not.toMatch(/\bnotFound\b/)
    expect(source).not.toMatch(/proposalsPageOn|features\.\w+\s*\?|if\s*\(\s*!?\s*features\./)
  })
})
