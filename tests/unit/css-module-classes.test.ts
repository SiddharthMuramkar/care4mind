import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const files = (dir: string, pattern: RegExp) =>
  readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && pattern.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name))

function resolveImport(from: string, spec: string): string {
  if (spec.startsWith('@/')) return resolve('src', spec.slice(2))
  return resolve(dirname(from), spec)
}

/** The classes a CSS module defines, read from its selectors. */
function definedClasses(css: string): Set<string> {
  const stripped = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/url\([^)]*\)/g, '')
    .replace(/'[^']*'|"[^"]*"/g, "''")
  const names = new Set<string>()
  for (const selectors of stripped.matchAll(/([^{};]+)\{/g)) {
    const text = (selectors[1] ?? '').trim()
    if (text.startsWith('@')) continue
    for (const match of text.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) names.add(match[1] ?? '')
  }
  return names
}

/** Each module, with the classes markup reads from it and whether it reads one by a computed key. */
function moduleUses() {
  const uses = new Map<string, { names: Set<string>; dynamic: boolean; readers: string[] }>()
  for (const file of files('src', /\.tsx?$/)) {
    const source = readFileSync(file, 'utf8')
    const text = source.replace(/^import .*$/gm, '')
    for (const imp of source.matchAll(/import\s+(\w+)\s+from\s+'([^']+\.module\.css)'/g)) {
      const [, binding = '', spec = ''] = imp
      const path = resolveImport(file, spec)
      const entry = uses.get(path) ?? { names: new Set<string>(), dynamic: false, readers: [] }
      entry.readers.push(file)
      for (const read of text.matchAll(new RegExp(`\\b${binding}\\.(\\w+)`, 'g'))) {
        entry.names.add(read[1] ?? '')
      }
      for (const read of text.matchAll(new RegExp(`\\b${binding}\\['([\\w-]+)'\\]`, 'g'))) {
        entry.names.add(read[1] ?? '')
      }
      if (new RegExp(`\\b${binding}\\[(?!')`).test(text)) entry.dynamic = true
      uses.set(path, entry)
    }
  }
  return uses
}

describe('CSS module classes', () => {
  const uses = moduleUses()

  it('markup reads only the classes its module defines', () => {
    const missing = [...uses].flatMap(([path, { names, readers }]) => {
      const defined = definedClasses(readFileSync(path, 'utf8'))
      return [...names]
        .filter((name) => !defined.has(name))
        .map((name) => `${readers.join(',')}: ${name}`)
    })
    expect(missing).toEqual([])
  })

  it('every class a module defines is read by markup', () => {
    const unused = [...uses]
      .filter(([, { dynamic }]) => !dynamic)
      .flatMap(([path, { names }]) =>
        [...definedClasses(readFileSync(path, 'utf8'))]
          .filter((name) => !names.has(name))
          .map((name) => `${path}: .${name}`),
      )
    expect(unused).toEqual([])
  })
})
