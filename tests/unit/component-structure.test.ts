import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// A component lives in a folder named for it, and that folder's index is the only import.
// The fixtures are linted with the repo's own config, as if each were the file at `path`.

const eslint = new ESLint({ cwd: process.cwd() })

async function structureProblems(path: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: path })
  return (result?.messages ?? [])
    .filter((message) => message.ruleId === 'no-restricted-imports')
    .map((message) => message.message)
}

const PAGE = 'src/app/fixture/page.tsx'
const OUTSIDE = 'src/components/Outside/Outside.tsx'
const INSIDE = 'src/components/nav/MenuButton.tsx'

describe('the component structure', { timeout: 30_000 }, () => {
  it('lets a page import a component folder', async () => {
    const code = "import { Folio } from '@/components/Folio'\nexport const folio = Folio\n"
    expect(await structureProblems(PAGE, code)).toEqual([])
  })

  it("stops an import of a file inside another component's folder", async () => {
    const alias = "import { Text } from '@/components/prose/Text'\nexport const text = Text\n"
    const relative = "import { Text } from '../prose/Text'\nexport const text = Text\n"
    expect(await structureProblems(PAGE, alias)).toHaveLength(1)
    expect(await structureProblems(OUTSIDE, relative)).toHaveLength(1)
  })

  it('lets a component import a file in its own folder', async () => {
    const code = "import { MenuGlyph } from './glyphs'\nexport const glyph = MenuGlyph\n"
    expect(await structureProblems(INSIDE, code)).toEqual([])
  })

  it('stops a component importing from the app', async () => {
    const code = "import cta from '@/app/cta.module.css'\nexport const styles = cta\n"
    expect(await structureProblems(OUTSIDE, code)).toHaveLength(1)
  })

  it('lets a page import from the app', async () => {
    const code = "import cta from '@/app/cta.module.css'\nexport const styles = cta\n"
    expect(await structureProblems(PAGE, code)).toEqual([])
  })
})
