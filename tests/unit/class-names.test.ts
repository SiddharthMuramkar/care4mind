import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/** The global classes markup may name: Tailwind's `sr-only`, and the site's own `skip-link`. */
const GLOBAL_CLASSES = ['sr-only', 'skip-link']

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name))
}

const isLogical = (kind: ts.SyntaxKind) =>
  kind === ts.SyntaxKind.AmpersandAmpersandToken ||
  kind === ts.SyntaxKind.BarBarToken ||
  kind === ts.SyntaxKind.QuestionQuestionToken ||
  kind === ts.SyntaxKind.PlusToken

/** Every class written as text in a className, wherever in its expression the text sits. */
function literalClassNames(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const names: string[] = []
  const collectText = (node: ts.Node): void => {
    // A comparison (placement === 'header') chooses a class; its text is not one.
    if (ts.isBinaryExpression(node) && !isLogical(node.operatorToken.kind)) return
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
      names.push(...node.text.split(/\s+/).filter(Boolean))
    }
    node.forEachChild(collectText)
  }
  const visit = (node: ts.Node): void => {
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'className' && node.initializer) {
      collectText(node.initializer)
    }
    node.forEachChild(visit)
  }
  visit(source)
  return names
}

describe('class names in markup', () => {
  it('come from CSS modules, apart from the allowed global classes', () => {
    const strays = sourceFiles('src').flatMap((file) =>
      literalClassNames(file)
        .filter((name) => !GLOBAL_CLASSES.includes(name))
        .map((name) => `${file}: ${name}`),
    )
    expect(strays).toEqual([])
  })

  it('reach for sr-only rather than a module’s own copy of it', () => {
    const copies = readdirSync('src', { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.module.css'))
      .map((entry) => join(entry.parentPath, entry.name))
      .filter((file) => /clip-path:\s*inset\(50%\)/.test(readFileSync(file, 'utf8')))
    expect(copies).toEqual([])
  })
})

describe('the global stylesheet', () => {
  it('drops Tailwind’s default palette, so Press’s colours are the only ones', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(/--color-\*:\s*initial;/)
  })
})
