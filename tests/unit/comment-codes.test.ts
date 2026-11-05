import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

// Comments and test titles say why in words. A code such as a decision number, a design code, a
// ticket number or a spec name resolves nowhere once its register is gone, and agents copy the
// style of the file they open. ESLint reads neither CSS nor YAML, so this test reads them itself.

/** The codes a comment or a test title may not cite. Requirement ids resolve in the brief. */
const CODES: [string, RegExp][] = [
  ['a decision code', /\bD(?:0[1-9]|1\d|2[01])\b/],
  ['a design code', /\b[A-C][1-9]\b/],
  ['a ticket number', /\btickets? #?\d+/i],
  ['an issue number', /(?<![\w&])#\d{1,3}(?![\w-])/],
  ['a settled rule', /\bsettled rules?\b/i],
  ['a spec name', /\bfront-end-site\b|\bcontent[- ]v1\b/i],
]

const SOURCE = /\.(?:ts|tsx|mjs|cjs|js|css|ya?ml)$/

/** Every tracked source file, so a new folder is covered without listing it here. */
const scanned = (path: string) => SOURCE.test(path)

const blockComments = (text: string) => text.match(/\/\*[\s\S]*?\*\//g) ?? []

/**
 * Every comment in a script. The parser reads the file, because a bare scanner cannot tell a
 * regular expression from a division and swallows the comments between two slashes. A comment
 * leads the token after it, or trails the one before it on its line; a parent and its edge child
 * share a boundary, so a comment there is seen twice and kept once.
 */
function parse(path: string, text: string): ts.SourceFile {
  const kind = path.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : path.endsWith('.jsx')
      ? ts.ScriptKind.JSX
      : path.endsWith('.ts')
        ? ts.ScriptKind.TS
        : ts.ScriptKind.JS
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, false, kind)
}

function scriptComments(file: ts.SourceFile, text: string): string[] {
  const seen = new Set<number>()
  const found: string[] = []
  const keep = (ranges: readonly ts.CommentRange[] | undefined) => {
    for (const range of ranges ?? []) {
      if (seen.has(range.pos)) continue
      seen.add(range.pos)
      found.push(text.slice(range.pos, range.end))
    }
  }
  const visit = (node: ts.Node) => {
    keep(ts.getLeadingCommentRanges(text, node.getFullStart()))
    keep(ts.getTrailingCommentRanges(text, node.end))
    node.getChildren(file).forEach(visit)
  }
  visit(file)
  return found
}

const TITLE_CALLS = new Set(['describe', 'it', 'test'])
const TITLE_MODIFIERS = new Set([
  'concurrent',
  'describe',
  'each',
  'fails',
  'only',
  'parallel',
  'runIf',
  'sequential',
  'serial',
  'skip',
  'skipIf',
  'todo',
])

/** The words of a title, with any interpolated value left out. */
function titleText(node: ts.Expression): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isTemplateExpression(node))
    return [node.head.text, ...node.templateSpans.map(({ literal }) => literal.text)].join(' ')
  return undefined
}

/**
 * Every test title in a script: the first argument where a test call takes one, through any
 * modifier chain. A skip inside a test takes a condition and a reason, not a title.
 */
function scriptTitles(file: ts.SourceFile): string[] {
  const found: string[] = []
  const titleOf = (node: ts.CallExpression): string | undefined => {
    const modifiers: string[] = []
    let callee: ts.Expression = node.expression
    while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee)) {
      if (ts.isPropertyAccessExpression(callee)) modifiers.unshift(callee.name.text)
      callee = callee.expression
    }
    if (!ts.isIdentifier(callee) || !TITLE_CALLS.has(callee.text)) return undefined
    if (!modifiers.every((modifier) => TITLE_MODIFIERS.has(modifier))) return undefined
    if (modifiers.includes('describe') && callee.text !== 'test') return undefined
    const [first, second] = node.arguments
    if (!first || (!second && !modifiers.includes('todo'))) return undefined
    return titleText(first)
  }
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const title = titleOf(node)
      if (title !== undefined) found.push(title)
    }
    node.getChildren(file).forEach(visit)
  }
  visit(file)
  return found
}

/** A YAML comment starts a line or follows a space. */
const yamlComments = (text: string) =>
  text.split('\n').flatMap((line) => line.match(/(?:^|\s)#.*$/)?.[0] ?? [])

function commentsIn(path: string, text: string, file?: ts.SourceFile): string[] {
  if (path.endsWith('.css')) return blockComments(text)
  if (/\.ya?ml$/.test(path)) return yamlComments(text)
  return scriptComments(file ?? parse(path, text), text)
}

/** Each code a piece of text cites in a comment or a test title, as "what: the line". */
function codesIn(path: string, text: string): string[] {
  const file = /\.(?:css|ya?ml)$/.test(path) ? undefined : parse(path, text)
  const inComments = commentsIn(path, text, file).flatMap((comment) =>
    comment
      .split('\n')
      .flatMap((line) =>
        CODES.filter(([, code]) => code.test(line)).map(([what]) => `${what}: ${line.trim()}`),
      ),
  )
  const inTitles = (file ? scriptTitles(file) : []).flatMap((title) =>
    CODES.filter(([, code]) => code.test(title)).map(
      ([what]) => `${what} in a test title: ${title}`,
    ),
  )
  return [...inComments, ...inTitles]
}

describe('comments and test titles cite no codes', () => {
  it('finds a code in each kind of file', () => {
    expect(codesIn('a.ts', '// The redirect table (D17).\nconst a = "D17"')).toHaveLength(1)
    expect(codesIn('a.ts', 'const a = x / y // as D17 has it\nconst b = z / w')).toHaveLength(1)
    expect(codesIn('a.tsx', 'const a = <b>{/* design B6 */}</b>')).toHaveLength(1)
    expect(codesIn('a.mjs', '/**\n * From ticket 05.\n */')).toHaveLength(1)
    expect(codesIn('a.css', 'a { color: red } /* settled rule 4 */')).toHaveLength(1)
    expect(codesIn('a.yml', 'on: push # front-end-site spec\nname: "#12"')).toHaveLength(1)
  })

  it('lets requirement ids, anchors, colours and code stay', () => {
    expect(codesIn('a.ts', '// FR-01, NFR-04: every page, `/texts/yoga-sutra/#1-30`.')).toEqual([])
    expect(codesIn('a.css', '/* indigo #151a3d */')).toEqual([])
    expect(codesIn('a.ts', 'const url = "https://x.org/issues/12" // a link')).toEqual([])
  })

  it('finds a code in a test title, however the test is written', () => {
    expect(codesIn('a.ts', "describe('the gate (D16)', () => {})")).toHaveLength(1)
    expect(codesIn('a.ts', "it('gives design B6’s trail', () => {})")).toHaveLength(1)
    expect(codesIn('a.ts', "test.describe('addresses (D02)', () => {})")).toHaveLength(1)
    expect(codesIn('a.ts', "it.each([1])('case %s (ticket 3)', () => {})")).toHaveLength(1)
    expect(codesIn('a.ts', "test.skip('not yet (D02)', () => {})")).toHaveLength(1)
    expect(codesIn('a.ts', "it.todo('write me (D02)')")).toHaveLength(1)
  })

  it('lets requirement ids, arguments and plain strings stay in titles', () => {
    expect(codesIn('a.ts', "describe('the table (FR-07)', () => {})")).toEqual([])
    expect(codesIn('a.ts', 'const s = "D17"\npattern.test(s)')).toEqual([])
    expect(codesIn('a.ts', "test.skip(cond, 'left for ticket 3')")).toEqual([])
    expect(codesIn('a.ts', 'test.describe(name, () => {})')).toEqual([])
  })

  it('holds in every source file', () => {
    const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
      .split('\n')
      .filter(scanned)
    const found = files.flatMap((path) =>
      codesIn(path, readFileSync(path, 'utf8')).map((hit) => `${path}: ${hit}`),
    )
    expect(found).toEqual([])
  })
})
