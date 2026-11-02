import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwind from '@tailwindcss/postcss'
import postcss from 'postcss'
import { expect, test } from 'vitest'

test('the global stylesheet holds no Tailwind utility but sr-only, and no @property --tw- rule', async () => {
  const from = resolve('src/styles/globals.css')
  const { root } = await postcss([tailwind()]).process(readFileSync(from, 'utf8'), { from })
  const utilities: string[] = []
  root.walkAtRules('layer', (layer) => {
    if (layer.params !== 'utilities') return
    layer.walkRules((rule) => {
      utilities.push(rule.selector)
    })
  })
  const properties: string[] = []
  root.walkAtRules('property', (rule) => {
    if (rule.params.startsWith('--tw-')) properties.push(rule.params)
  })
  expect(utilities).toEqual(['.sr-only'])
  expect(properties).toEqual([])
}, 30_000)
