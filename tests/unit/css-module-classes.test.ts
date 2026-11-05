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

/** The CSS modules a component folder's index re-exports, by folder path and exported name. */
function reexportedStyles() {
  const byFolder = new Map<string, Map<string, string>>()
  for (const file of files('src', /^index\.tsx?$/)) {
    const source = readFileSync(file, 'utf8')
    for (const exp of source.matchAll(
      /export\s+\{\s*default(?:\s+as\s+(\w+))?\s*\}\s+from\s+'([^']+\.module\.css)'/g,
    )) {
      const [, name = 'default', spec = ''] = exp
      const folder = dirname(resolve(file))
      const entry = byFolder.get(folder) ?? new Map<string, string>()
      entry.set(name, resolveImport(file, spec))
      byFolder.set(folder, entry)
    }
  }
  return byFolder
}

/** Each module, with the classes markup reads from it and whether it reads one by a computed key. */
function moduleUses() {
  const uses = new Map<string, { names: Set<string>; dynamic: boolean; readers: string[] }>()
  const reexports = reexportedStyles()
  for (const file of files('src', /\.tsx?$/)) {
    const source = readFileSync(file, 'utf8')
    const text = source.replace(/import\s+[\s\S]*?\s+from\s+'[^']+'/g, '')
    const record = (path: string, binding: string) => {
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
    for (const imp of source.matchAll(/import\s+(\w+)\s+from\s+'([^']+\.module\.css)'/g)) {
      const [, binding = '', spec = ''] = imp
      record(resolveImport(file, spec), binding)
    }
    // A folder's index is its interface, styles included: an import of the folder may be a
    // re-exported CSS module under another name.
    for (const imp of source.matchAll(/import\s+([\s\S]*?)\s+from\s+'([^']+)'/g)) {
      const [, clause = '', spec = ''] = imp
      if (spec.endsWith('.module.css')) continue
      const styles = reexports.get(resolveImport(file, spec))
      if (!styles) continue
      const bindings: [string, string][] = []
      for (const part of (clause.match(/\{([\s\S]*)\}/)?.[1] ?? '').split(',')) {
        const named = part.trim().match(/^(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?$/)
        if (named?.[1]) bindings.push([named[1], named[2] ?? named[1]])
      }
      const own = clause
        .replace(/\{[\s\S]*\}/, '')
        .replace(/,/g, '')
        .trim()
      if (/^\w+$/.test(own)) bindings.push(['default', own])
      for (const [name, binding] of bindings) {
        const path = styles.get(name)
        if (path) record(path, binding)
      }
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
