import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { CONTENT_KINDS } from '@/content/schema'

const glossary = readFileSync('GLOSSARY.md', 'utf8')

const srcText = execFileSync('git', ['ls-files', 'src'], { encoding: 'utf8' })
  .split('\n')
  .filter((file) => /\.(ts|tsx|css)$/.test(file))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n')

/** Every backticked token on a glossary entry's code line. */
function codeTokens(text: string): string[] {
  return text
    .split('\n')
    .filter((line) => line.startsWith('_In code_:'))
    .flatMap((line) => [...line.matchAll(/`([^`\n]+)`/g)].map(([, token = '']) => token))
}

/** The given kinds that no code line names by their exact kind string. */
function unnamedKinds(text: string, kinds: readonly string[]): string[] {
  const tokens = new Set(codeTokens(text))
  return kinds.filter((kind) => !tokens.has(kind))
}

/** The capitalised code names on code lines that the given source never uses. */
function unknownCodeNames(text: string, source: string): string[] {
  const names = new Set(
    codeTokens(text)
      .flatMap((token) => token.split(/[^A-Za-z]+/))
      .filter((word) => /^[A-Z]/.test(word)),
  )
  return [...names].filter((name) => !new RegExp(`\\b${name}\\b`).test(source)).sort()
}

describe('the glossary and the code', () => {
  it('names every content kind in a code line', () => {
    expect(unnamedKinds(glossary, CONTENT_KINDS)).toEqual([])
  })

  it('names no capitalised code name that the source has dropped', () => {
    expect(unknownCodeNames(glossary, srcText)).toEqual([])
  })

  it('fails on a kind no code line names', () => {
    expect(unnamedKinds('_In code_: `concept`', ['concept', 'page'])).toEqual(['page'])
  })

  it('fails on a code name the source does not hold', () => {
    expect(
      unknownCodeNames('_In code_: `NopeThing`, `ConceptRecord`', 'a ConceptRecord here'),
    ).toEqual(['NopeThing'])
  })
})
