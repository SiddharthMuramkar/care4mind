import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

// Base UI's iOS 26 setup: Safari draws the page under its translucent toolbars, and only an
// absolutely positioned backdrop on a relative body reaches under them. Playwright's WebKit has no
// such toolbars, so the stylesheets are read instead.

const BACKDROPS = [
  'src/components/nav/MenuDrawer.module.css',
  'src/components/questionnaire/RetakeDialog.module.css',
] as const

/** The text inside the braces that open at `start`, nested braces and all. */
function block(css: string, start: number): string {
  const open = css.indexOf('{', start)
  let depth = 0
  for (let at = open; at < css.length; at += 1) {
    if (css[at] === '{') depth += 1
    if (css[at] === '}') depth -= 1
    if (depth === 0) return css.slice(open + 1, at)
  }
  throw new Error('unbalanced braces')
}

/** The bodies of every rule whose prelude is exactly `prelude`. */
function rules(css: string, prelude: string): string[] {
  const escaped = prelude.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return [...css.matchAll(new RegExp(`(?:^|[}{;\\s])${escaped}\\s*\\{`, 'g'))].map((match) =>
    block(css, match.index),
  )
}

describe.each(BACKDROPS)('the backdrop in %s', (path) => {
  const css = readFileSync(path, 'utf8')

  it('fills the dynamic viewport', () => {
    expect(rules(css, '.backdrop').some((body) => /min-height:\s*100dvh/.test(body))).toBe(true)
  })

  it('is absolutely positioned where Safari supports -webkit-touch-callout', () => {
    const supports = rules(css, '@supports (-webkit-touch-callout: none)')
    const backdrop = supports.flatMap((body) => rules(body, '.backdrop'))
    expect(backdrop.some((body) => /position:\s*absolute/.test(body))).toBe(true)
  })
})

describe('globals.css', () => {
  it('makes body the containing block, so an absolute backdrop covers a scrolled page', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8')
    const base = rules(css, '@layer base').flatMap((body) => rules(body, 'body'))
    expect(base.some((body) => /position:\s*relative/.test(body))).toBe(true)
  })
})
