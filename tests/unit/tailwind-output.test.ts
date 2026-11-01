import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import tailwind from '@tailwindcss/postcss'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'

const GLOBALS = join(process.cwd(), 'src/styles/globals.css')

async function compiledGlobals() {
  const result = await postcss([tailwind()]).process(readFileSync(GLOBALS, 'utf8'), {
    from: GLOBALS,
  })
  return result.root
}

describe('the global stylesheet', () => {
  it('compiles no Tailwind utility but sr-only', async () => {
    const root = await compiledGlobals()
    const selectors: string[] = []
    root.walkAtRules('layer', (layer) => {
      if (layer.params !== 'utilities') return
      layer.walkRules((rule) => {
        selectors.push(rule.selector)
      })
    })
    expect(selectors).toEqual(['.sr-only'])
  })

  it('keeps every token it declares, though only CSS modules read most of them', async () => {
    const root = await compiledGlobals()
    const declared = new Set<string>()
    postcss.parse(readFileSync(GLOBALS, 'utf8')).walkAtRules('theme', (theme) => {
      theme.walkDecls(/^--/, (decl) => {
        if (!decl.prop.endsWith('-*')) declared.add(decl.prop)
      })
    })
    const emitted = new Set<string>()
    root.walkDecls(/^--/, (decl) => {
      emitted.add(decl.prop)
    })
    expect([...declared].filter((token) => !emitted.has(token))).toEqual([])
  })

  it('registers no --tw- custom property', async () => {
    const root = await compiledGlobals()
    const properties: string[] = []
    root.walkAtRules('property', (rule) => {
      if (rule.params.startsWith('--tw-')) properties.push(rule.params)
    })
    expect(properties).toEqual([])
  })
})
