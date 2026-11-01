import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// The content module's interface is enforced by lint (content-v1 spec, "The boundary rule"):
// outside src/content, code imports content through @/content alone, and a 'use client' file
// imports it for types only. Each fixture below is linted with the repo's own config, as if it
// were the file at `path`.

const eslint = new ESLint({ cwd: process.cwd() })

/** The boundary problems ESLint reports for a snippet placed at `path`. */
async function boundaryProblems(path: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: path })
  return (result?.messages ?? [])
    .filter((m) => m.ruleId === 'no-restricted-imports' || m.ruleId === 'no-restricted-syntax')
    .map((m) => m.message)
}

const PAGE = 'src/app/fixture/page.tsx'
const COMPONENT = 'src/components/fixture/Fixture.tsx'

describe('the content boundary', { timeout: 30_000 }, () => {
  it('lets a page import the public interface', async () => {
    const code = "import { getConcept } from '@/content'\nexport const load = getConcept\n"
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
    const index = "import { getConcept } from '../content'\nexport const load = getConcept\n"
    // The components boundary also refuses a component's `../`, so look for the content message.
    const relative = expect.stringContaining('Reach the content module through @/content')
    expect(await boundaryProblems(COMPONENT, internal)).toContainEqual(relative)
    expect(await boundaryProblems(COMPONENT, index)).toContainEqual(relative)
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
      "'use client'\nimport { getConcept } from '@/content'\nexport const load = getConcept\n"
    expect(await boundaryProblems(COMPONENT, code)).toHaveLength(1)
  })

  it("lets a 'use client' file import types from the public interface", async () => {
    const code =
      "'use client'\nimport type { Reference } from '@/content'\nexport type R = Reference\n"
    expect(await boundaryProblems(COMPONENT, code)).toEqual([])
  })

  it("asks a 'use client' file for `import type`, not inline type specifiers", async () => {
    // An inline `type` specifier still leaves an import of the module behind.
    const code =
      "'use client'\nimport { type Reference } from '@/content'\nexport type R = Reference\n"
    expect(await boundaryProblems(COMPONENT, code)).toHaveLength(1)
  })

  it('lets files inside the content module import its internals', async () => {
    const code =
      "import { localSource } from '@/content/source'\nexport const source = localSource\n"
    expect(await boundaryProblems('src/content/fixture.ts', code)).toEqual([])
  })
})
