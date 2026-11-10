import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// The content module's interface is enforced by lint:
// outside src/content, code imports content through @/content alone (statically, dynamically
// or by `typeof import()`), a 'use client' file imports it and the feature flags for types
// only, and a test reaches internals only through @/content/testing. Each fixture below is
// linted with the repo's own config, as if it were the file at `path`, and names only exports
// that exist.

const eslint = new ESLint({ cwd: process.cwd() })

/** The boundary problems ESLint reports for a snippet placed at `path`. */
async function boundaryProblems(path: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: path })
  return (result?.messages ?? [])
    .filter((m) => m.ruleId === 'no-restricted-imports' || m.ruleId === 'no-restricted-syntax')
    .map((m) => m.message)
}

const PAGE = 'src/app/fixture/page.tsx'
const COMPONENT = 'src/components/Fixture.tsx'

describe('the content boundary', { timeout: 30_000 }, () => {
  it('lets a page import the public interface', async () => {
    const code = "import { concepts } from '@/content'\nexport const load = concepts\n"
    expect(await boundaryProblems(PAGE, code)).toEqual([])
  })

  it('stops a page importing a content internal by alias', async () => {
    const code =
      "import { localSource } from '@/content/source'\nexport const source = localSource\n"
    expect(await boundaryProblems(PAGE, code)).toHaveLength(1)
  })

  it('stops a component importing a content internal by relative path', async () => {
    const internal =
      "import { contentGraph } from '../content/graph'\nexport const g = contentGraph\n"
    const index = "import { concepts } from '../content'\nexport const load = concepts\n"
    expect(await boundaryProblems(COMPONENT, internal)).toHaveLength(1)
    expect(await boundaryProblems(COMPONENT, index)).toHaveLength(1)
  })

  it('stops a page importing a record file or the schema', async () => {
    const data =
      "import vikshepa from '@/content/data/concepts/vikshepa'\nexport default vikshepa\n"
    const schema =
      "import type { ConceptRecord } from '@/content/schema'\nexport type C = ConceptRecord\n"
    expect(await boundaryProblems(PAGE, data)).toHaveLength(1)
    expect(await boundaryProblems(PAGE, schema)).toHaveLength(1)
  })

  it("stops a 'use client' file importing a value from the public interface", async () => {
    const code =
      "'use client'\nimport { concepts } from '@/content'\nexport const load = concepts\n"
    expect(await boundaryProblems(COMPONENT, code)).toHaveLength(1)
  })

  it("lets a 'use client' file import types from the public interface", async () => {
    const code =
      "'use client'\nimport type { ReferenceView } from '@/content'\nexport type R = ReferenceView\n"
    expect(await boundaryProblems(COMPONENT, code)).toEqual([])
  })

  it("asks a 'use client' file for `import type`, not inline type specifiers", async () => {
    // An inline `type` specifier still leaves an import of the module behind.
    const code =
      "'use client'\nimport { type ReferenceView } from '@/content'\nexport type R = ReferenceView\n"
    expect(await boundaryProblems(COMPONENT, code)).toHaveLength(1)
  })

  it('stops the graph importing from the views or the derivations above it', async () => {
    const views = "import { createContent } from '../views'\nexport const c = createContent\n"
    const derive = "import { routes } from '../derive/routes'\nexport const r = routes\n"
    const names = "import { displayName } from '../names'\nexport const name = displayName\n"
    expect(await boundaryProblems('src/content/graph/fixture.ts', views)).toHaveLength(1)
    expect(await boundaryProblems('src/content/graph/fixture.ts', derive)).toHaveLength(1)
    expect(await boundaryProblems('src/content/graph/fixture.ts', names)).toEqual([])
  })

  it('stops a page dynamically importing a content internal, however the source is written', async () => {
    const alias = "export const g = () => import('@/content/graph')\n"
    const template = 'export const g = () => import(`@/content/graph`)\n'
    const typeQuery = "export type G = typeof import('@/content/graph')\n"
    expect(await boundaryProblems(PAGE, alias)).toHaveLength(1)
    expect(await boundaryProblems(PAGE, template)).toHaveLength(1)
    expect(await boundaryProblems(PAGE, typeQuery)).toHaveLength(1)
  })

  it('stops a component dynamically importing a content internal by relative path', async () => {
    const code = "export const s = () => import('../content/source')\n"
    expect(await boundaryProblems(COMPONENT, code)).toHaveLength(1)
  })

  it('lets a page dynamically import the public interface', async () => {
    const code = "export const c = () => import('@/content')\n"
    expect(await boundaryProblems(PAGE, code)).toEqual([])
  })

  it("stops a 'use client' file dynamically importing the public interface", async () => {
    const code = "'use client'\nexport const c = () => import('@/content')\n"
    expect(await boundaryProblems(COMPONENT, code)).toHaveLength(1)
  })

  it("stops a 'use client' file importing a feature-flag value, statically or dynamically", async () => {
    const plain =
      "'use client'\nimport { features } from '@/config/features'\nexport const f = features\n"
    const dynamic = "'use client'\nexport const f = () => import('@/config/features')\n"
    expect(await boundaryProblems(COMPONENT, plain)).toHaveLength(1)
    expect(await boundaryProblems(COMPONENT, dynamic)).toHaveLength(1)
  })

  it("lets a 'use client' file import feature-flag types", async () => {
    const code =
      "'use client'\nimport type { Features } from '@/config/features'\nexport type F = Features\n"
    expect(await boundaryProblems(COMPONENT, code)).toEqual([])
  })

  it('stops the graph dynamically importing from the views or the derivations above it', async () => {
    const views = "export const v = () => import('../views')\n"
    const derive = "export const r = () => import('../derive/routes')\n"
    const names = "export const n = () => import('../names')\n"
    expect(await boundaryProblems('src/content/graph/fixture.ts', views)).toHaveLength(1)
    expect(await boundaryProblems('src/content/graph/fixture.ts', derive)).toHaveLength(1)
    expect(await boundaryProblems('src/content/graph/fixture.ts', names)).toEqual([])
  })

  it('lets a test use the public interface and the testing entry, and no other internal', async () => {
    const TEST = 'tests/unit/fixture.test.ts'
    const pub = "import { concepts } from '@/content'\nexport const load = concepts\n"
    const testing =
      "import { createContent, localSource } from '@/content/testing'\nexport const t = [createContent, localSource]\n"
    const graph = "import { contentGraph } from '@/content/graph'\nexport const g = contentGraph\n"
    const dynamic = "export const v = () => import('@/content/views')\n"
    expect(await boundaryProblems(TEST, pub)).toEqual([])
    expect(await boundaryProblems(TEST, testing)).toEqual([])
    expect(await boundaryProblems(TEST, graph)).toHaveLength(1)
    expect(await boundaryProblems(TEST, dynamic)).toHaveLength(1)
  })

  it('lets files inside the content module import its internals', async () => {
    const code =
      "import { localSource } from '@/content/source'\nexport const source = localSource\n"
    expect(await boundaryProblems('src/content/fixture.ts', code)).toEqual([])
  })
})

// `@/art` is server-only, so a file that reaches past it could put every record in the browser.
describe('the art boundary', { timeout: 30_000 }, () => {
  it("stops a 'use client' file importing the registry", async () => {
    const code = "'use client'\nimport { ART } from '@/art/registry'\nexport const a = ART\n"
    expect(await boundaryProblems(COMPONENT, code)).toHaveLength(1)
  })

  it('stops a page or a font file importing an art internal by alias', async () => {
    const registry = "import { ART } from '@/art/registry'\nexport const a = ART\n"
    const types = "import type { ArtRecord } from '@/art/types'\nexport type A = ArtRecord\n"
    expect(await boundaryProblems(PAGE, registry)).toHaveLength(1)
    expect(await boundaryProblems(PAGE, types)).toHaveLength(1)
    expect(await boundaryProblems('src/fonts/fixture.ts', registry)).toHaveLength(1)
  })

  it('stops a page importing an art internal by relative path', async () => {
    const code = "import { ART } from '../../art/registry'\nexport const a = ART\n"
    expect(await boundaryProblems(PAGE, code)).toHaveLength(1)
  })

  it('stops a dynamic import of an art internal, however the source is written', async () => {
    const alias = "export const a = () => import('@/art/registry')\n"
    const template = 'export const a = () => import(`@/art/registry`)\n'
    const typeQuery = "export type A = typeof import('@/art/registry')\n"
    expect(await boundaryProblems(PAGE, alias)).toHaveLength(1)
    expect(await boundaryProblems(PAGE, template)).toHaveLength(1)
    expect(await boundaryProblems(PAGE, typeQuery)).toHaveLength(1)
  })

  it('lets a page import the public interface', async () => {
    const code = "import { art } from '@/art'\nexport const a = art\n"
    expect(await boundaryProblems(PAGE, code)).toEqual([])
  })

  it("lets a 'use client' file import the Emblem records", async () => {
    const code =
      "'use client'\nimport { EMBLEM_RING } from '@/art/emblem'\nexport const e = EMBLEM_RING\n"
    expect(await boundaryProblems(COMPONENT, code)).toEqual([])
  })

  it('lets files inside the art module import its internals', async () => {
    const code = "import { ART } from './registry'\nexport const a = ART\n"
    expect(await boundaryProblems('src/art/fixture.ts', code)).toEqual([])
  })
})
