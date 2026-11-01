import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// The content module's interface is enforced by lint: outside src/content, code imports content
// through @/content alone, a 'use client' file imports it and the feature flags for types only,
// and tests may also use @/content/testing. Each fixture below is linted with the repo's own
// config, as if it were the file at `path`.

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
const TEST = 'tests/unit/fixture.test.ts'
const BROWSER_TEST = 'tests/e2e/fixture.spec.ts'

describe('the content boundary', { timeout: 30_000 }, () => {
  it('lets a page import the public interface', async () => {
    const code = "import { concepts } from '@/content'\nexport const list = concepts.list\n"
    expect(await boundaryProblems(PAGE, code)).toEqual([])
  })

  it('stops a page importing a content internal by alias', async () => {
    const code =
      "import { localSource } from '@/content/source'\nexport const source = localSource\n"
    expect(await boundaryProblems(PAGE, code)).toHaveLength(1)
  })

  it('stops a component importing a content internal by relative path', async () => {
    const internal =
      "import { contentGraph } from '../content/graph'\nexport const graph = contentGraph\n"
    const index = "import { concepts } from '../content'\nexport const list = concepts.list\n"
    expect(await boundaryProblems(COMPONENT, internal)).toHaveLength(1)
    expect(await boundaryProblems(COMPONENT, index)).toHaveLength(1)
  })

  it('stops a page importing a record file, the schema or the testing entry', async () => {
    const data =
      "import vikshepa from '@/content/data/concepts/vikshepa'\nexport default vikshepa\n"
    const schema =
      "import type { ConceptRecord } from '@/content/schema'\nexport type C = ConceptRecord\n"
    const testing =
      "import { localSource } from '@/content/testing'\nexport const source = localSource\n"
    expect(await boundaryProblems(PAGE, data)).toHaveLength(1)
    expect(await boundaryProblems(PAGE, schema)).toHaveLength(1)
    expect(await boundaryProblems(PAGE, testing)).toHaveLength(1)
  })

  it('stops a page loading a content internal with import() by alias', async () => {
    const code = "export const source = (await import('@/content/source')).localSource\n"
    expect(await boundaryProblems(PAGE, code)).toHaveLength(1)
  })

  it('stops a component loading the content module with import() by relative path', async () => {
    const internal = "export const graph = (await import('../content/graph')).contentGraph\n"
    const index = "export const list = (await import('../content')).concepts.list\n"
    expect(await boundaryProblems(COMPONENT, internal)).toHaveLength(1)
    expect(await boundaryProblems(COMPONENT, index)).toHaveLength(1)
  })

  it('lets a page load the public interface with import()', async () => {
    const code = "export const list = (await import('@/content')).concepts.list\n"
    expect(await boundaryProblems(PAGE, code)).toEqual([])
  })

  it("stops a 'use client' file importing a value from the public interface", async () => {
    const code =
      "'use client'\nimport { concepts } from '@/content'\nexport const list = concepts.list\n"
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

  it("stops a 'use client' file reading the feature flags", async () => {
    const imported =
      "'use client'\nimport { features } from '@/config/features'\nexport const on = features.conceptMap\n"
    const loaded =
      "'use client'\nexport const on = (await import('@/config/features')).features.conceptMap\n"
    expect(await boundaryProblems(COMPONENT, imported)).toHaveLength(1)
    expect(await boundaryProblems(COMPONENT, loaded)).toHaveLength(1)
  })

  it("lets a 'use client' file import the flags' types, and a server file their values", async () => {
    const types =
      "'use client'\nimport type { Features } from '@/config/features'\nexport type F = Features\n"
    const values =
      "import { features } from '@/config/features'\nexport const on = features.conceptMap\n"
    expect(await boundaryProblems(COMPONENT, types)).toEqual([])
    expect(await boundaryProblems(PAGE, values)).toEqual([])
  })

  it('stops the graph importing from the views or the derivations above it', async () => {
    const views = "import { displayName } from '../views/names'\nexport const name = displayName\n"
    const derive = "import { siteRoutes } from '../derive/routes'\nexport const r = siteRoutes\n"
    const names = "import { displayName } from '../names'\nexport const name = displayName\n"
    expect(await boundaryProblems('src/content/graph/fixture.ts', views)).toHaveLength(1)
    expect(await boundaryProblems('src/content/graph/fixture.ts', derive)).toHaveLength(1)
    expect(await boundaryProblems('src/content/graph/fixture.ts', names)).toEqual([])
  })

  it('lets files inside the content module import its internals', async () => {
    const code =
      "import { localSource } from '@/content/source'\nexport const source = localSource\n"
    expect(await boundaryProblems('src/content/fixture.ts', code)).toEqual([])
  })

  it('lets a test import the public interface and the testing entry', async () => {
    const code =
      "import { concepts } from '@/content'\nimport { localSource } from '@/content/testing'\nexport const both = [concepts, localSource]\n"
    expect(await boundaryProblems(TEST, code)).toEqual([])
    expect(await boundaryProblems(BROWSER_TEST, code)).toEqual([])
  })

  it('stops a test importing any other content internal', async () => {
    const alias =
      "import { contentGraph } from '@/content/graph'\nexport const graph = contentGraph\n"
    const path =
      "import { contentGraph } from '../../src/content/graph'\nexport const graph = contentGraph\n"
    expect(await boundaryProblems(TEST, alias)).toHaveLength(1)
    expect(await boundaryProblems(TEST, path)).toHaveLength(1)
  })

  it('stops a test loading a content internal with import()', async () => {
    const alias = "export const graph = (await import('@/content/graph')).contentGraph\n"
    const path = "export const graph = (await import('../../src/content/graph')).contentGraph\n"
    expect(await boundaryProblems(TEST, alias)).toHaveLength(1)
    expect(await boundaryProblems(TEST, path)).toHaveLength(1)
  })
})
