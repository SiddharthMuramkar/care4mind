import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const BACKDROPS = [
  'src/components/nav/MenuDrawer.module.css',
  'src/components/questionnaire/RetakeDialog.module.css',
]

/** The block under one at-rule, so a nested rule's brace doesn't end the match early. */
function atRule(css: string, name: string) {
  const start = css.indexOf(name)
  if (start < 0) return ''
  const open = css.indexOf('{', start)
  let depth = 0
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    if (css[i] === '}') depth -= 1
    if (depth === 0) return css.slice(open, i + 1)
  }
  return ''
}

describe('modal backdrops on iOS 26', () => {
  it('covers the strips under the toolbars, with the body as their containing block', () => {
    for (const file of BACKDROPS) {
      const css = readFileSync(file, 'utf8')
      expect(css, file).toContain('min-height: 100dvh')
      expect(atRule(css, '@supports (-webkit-touch-callout: none)'), file).toContain(
        'position: absolute',
      )
    }
    const globals = readFileSync('src/styles/globals.css', 'utf8')
    expect(atRule(globals, 'body')).toContain('position: relative')
  })
})
