import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwind from '@tailwindcss/postcss'
import postcss from 'postcss'
import { expect, test } from 'vitest'

async function compileGlobalStylesheet() {
  const from = resolve('src/styles/globals.css')
  const { root } = await postcss([tailwind()]).process(readFileSync(from, 'utf8'), { from })
  return root
}

/** Base UI sets these on the elements it renders. */
const SET_BY_BASE_UI = [
  '--drawer-swipe-movement-x',
  '--drawer-swipe-progress',
  '--drawer-swipe-strength',
  '--toast-index',
  '--toast-offset-y',
  '--toast-swipe-movement-x',
  '--toast-swipe-movement-y',
  '--transform-origin',
]

test('every variable a CSS module reads is defined in the compiled stylesheet or set locally', async () => {
  const root = await compileGlobalStylesheet()
  const compiled = new Set<string>()
  root.walkDecls(/^--/, (decl) => {
    compiled.add(decl.prop)
  })
  const read = (pattern: string) =>
    globSync(pattern)
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n')
  const modules = read('src/**/*.module.css')
  const components = read('src/**/*.{ts,tsx}')
  const used = new Set((modules.match(/(?<=var\()--[\w-]+/g) ?? []) as string[])
  const undefinedVariables = [...used].filter(
    (name) =>
      !compiled.has(name) &&
      !SET_BY_BASE_UI.includes(name) &&
      !new RegExp(`${name}\\s*:`).test(modules) &&
      !components.includes(name),
  )
  expect(undefinedVariables).toEqual([])
}, 30_000)

test('the global stylesheet holds no Tailwind utility but sr-only, and no @property --tw- rule', async () => {
  const root = await compileGlobalStylesheet()
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
