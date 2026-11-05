import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

// Comments say why in words. A code such as a decision number, a design code, a ticket number or
// a spec name resolves nowhere once its register is gone, and agents copy the style of the file
// they open. ESLint reads neither CSS nor YAML, so this test reads every comment itself.

/** The codes a comment may not cite. Requirement ids (FR-01, NFR-04) resolve in the brief. */
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
function scriptComments(path: string, text: string): string[] {
  const kind = path.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : path.endsWith('.jsx')
      ? ts.ScriptKind.JSX
      : path.endsWith('.ts')
        ? ts.ScriptKind.TS
        : ts.ScriptKind.JS
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, false, kind)
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

/** A YAML comment starts a line or follows a space. */
const yamlComments = (text: string) =>
  text.split('\n').flatMap((line) => line.match(/(?:^|\s)#.*$/)?.[0] ?? [])

function commentsIn(path: string, text: string): string[] {
  if (path.endsWith('.css')) return blockComments(text)
  if (/\.ya?ml$/.test(path)) return yamlComments(text)
  return scriptComments(path, text)
}

/** Each code a piece of text cites, as "what: the comment's line". */
function codesIn(path: string, text: string): string[] {
  return commentsIn(path, text).flatMap((comment) =>
    comment
      .split('\n')
      .flatMap((line) =>
        CODES.filter(([, code]) => code.test(line)).map(([what]) => `${what}: ${line.trim()}`),
      ),
  )
}

describe('comments cite no codes', () => {
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
