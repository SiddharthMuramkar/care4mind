import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// Every component lives in a folder named for its module, and that folder's index.ts is its
// interface. Lint keeps outside code to the interface; the folder layout is checked here.

const eslint = new ESLint({ cwd: process.cwd() })

/** The import problems ESLint reports for a snippet placed at `path`. */
async function importProblems(path: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: path })
  return (result?.messages ?? [])
    .filter((m) => m.ruleId === 'no-restricted-imports')
    .map((m) => m.message)
}

const PAGE = 'src/app/fixture/page.tsx'
const COMPONENT = 'src/components/fixture/Fixture.tsx'
const LIB = 'src/lib/fixture.ts'

const use = (specifier: string) => `import { thing } from '${specifier}'\nexport const t = thing\n`

describe('the components boundary', { timeout: 30_000 }, () => {
  it("lets code import a component module's interface", async () => {
    expect(await importProblems(PAGE, use('@/components/folio'))).toEqual([])
    expect(await importProblems(COMPONENT, use('@/components/folio'))).toEqual([])
    expect(await importProblems(LIB, use('@/components/folio'))).toEqual([])
  })

  it("lets a component import its own folder's files", async () => {
    expect(await importProblems(COMPONENT, use('./Part'))).toEqual([])
  })

  it("stops code importing a component module's internals", async () => {
    expect(await importProblems(PAGE, use('@/components/folio/Folio'))).toHaveLength(1)
    expect(await importProblems(COMPONENT, use('@/components/folio/Folio'))).toHaveLength(1)
    expect(await importProblems(LIB, use('@/components/folio/Folio'))).toHaveLength(1)
  })

  it('stops a component reaching out of its folder by a relative path', async () => {
    expect(await importProblems(COMPONENT, use('../folio/Folio'))).toHaveLength(1)
    expect(await importProblems(COMPONENT, use('../folio'))).toHaveLength(1)
  })

  it('stops code outside the components reaching them by a relative path', async () => {
    expect(await importProblems(PAGE, use('../../components/folio'))).toHaveLength(1)
    expect(await importProblems(LIB, use('../components/folio'))).toHaveLength(1)
  })

  it('stops code outside the app importing from it', async () => {
    const stylesheet = "import '@/app/questionnaire.css'\n"
    expect(await importProblems(COMPONENT, stylesheet)).toHaveLength(1)
    expect(await importProblems(COMPONENT, use('@/app/manifest'))).toHaveLength(1)
    expect(await importProblems(LIB, use('../app/sitemap'))).toHaveLength(1)
  })

  it('keeps the content boundary alongside it', async () => {
    const code = `${use('@/components/folio/Folio')}import { g } from '@/content/graph'\nexport const h = g\n`
    expect(await importProblems(COMPONENT, code)).toHaveLength(2)
  })
})

describe('the components folder', () => {
  const root = join(process.cwd(), 'src/components')
  const entries = readdirSync(root).map((name) => ({
    name,
    isFolder: statSync(join(root, name)).isDirectory(),
  }))

  it('holds folders only: every component lives in its module’s folder', () => {
    expect(entries.filter((entry) => !entry.isFolder).map((entry) => entry.name)).toEqual([])
  })

  it('gives every module folder an index.ts, its interface', () => {
    const withoutIndex = entries
      .filter((entry) => entry.isFolder)
      .filter((entry) => !readdirSync(join(root, entry.name)).includes('index.ts'))
      .map((entry) => entry.name)
    expect(withoutIndex).toEqual([])
  })
})
