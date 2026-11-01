// The records as the content tools see them: the record schema the tools take its facts from,
// each record's order, and every record the generated registry lists, read with the repo's own
// TypeScript compiler. Plain Node, no new dependency.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { ToolError } from './cli.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REGISTRY_SCRIPT = join(HERE, 'registry.mjs')
const REGISTRY = 'src/content/generated/registry.ts'

/** Records in the order tools list them: by kind, then by id. */
export function sortRecords(records) {
  const kinds = Object.keys(KIND_FOLDERS)
  return [...records].sort(
    (a, b) => kinds.indexOf(a.kind) - kinds.indexOf(b.kind) || idOf(a).localeCompare(idOf(b)),
  )
}

// ---------------------------------------------------------------------------------------------
// Loading records: the ones the generated registry lists, as the site reads them. The registry
// and the record files are TypeScript, so a module hook compiles each .ts file with the repo's
// TypeScript compiler, and resolves `@/` to `src/` as the repo's tsconfig does.

let hooked = false
/** The repo root `@/` resolves against: this repo's, until a tool reads another root's records. */
let aliasRoot = join(HERE, '../..')

/** A TypeScript module, compiled as it loads by the repo's TypeScript compiler. */
async function importTypeScript(file) {
  if (typeof registerHooks !== 'function')
    throw new ToolError('Reading records needs Node 22.15 or newer (module.registerHooks).')
  if (!hooked) {
    const ts = (await import('typescript')).default
    registerHooks(typeScriptHooks(ts))
    hooked = true
  }
  return import(pathToFileURL(file).href)
}

/**
 * The record schema, `src/content/schema`, that the tools take its facts from: the kinds and
 * their folders, each record's id, the slug rule, the link fields and how text is stored.
 */
export const schema = await importTypeScript(join(HERE, '../../src/content/schema/index.ts'))
export const { KIND_FOLDERS, idOf } = schema

/** Every record the registry under `root` lists, in its order. Throws if the registry is stale. */
export async function loadRecords(root) {
  const check = spawnSync(process.execPath, [REGISTRY_SCRIPT, '--check', '--root', root], {
    encoding: 'utf8',
  })
  if (check.status !== 0) throw new ToolError(check.stderr.trim() || 'The registry check failed.')
  aliasRoot = root
  const { registry } = await importTypeScript(join(root, REGISTRY))
  return registry.map((entry) => entry.record)
}

function typeScriptHooks(ts) {
  const file = (path) =>
    [path, `${path}.ts`, join(path, 'index.ts')].find(
      (candidate) =>
        candidate.endsWith('.ts') && existsSync(candidate) && statSync(candidate).isFile(),
    )
  return {
    resolve(specifier, context, nextResolve) {
      let found
      if (specifier.startsWith('@/')) found = file(join(aliasRoot, 'src', specifier.slice(2)))
      else if (/^\.\.?\//.test(specifier) && context.parentURL?.endsWith('.ts'))
        found = file(fileURLToPath(new URL(specifier, context.parentURL)))
      return found
        ? { url: pathToFileURL(found).href, shortCircuit: true }
        : nextResolve(specifier, context)
    },
    load(url, context, nextLoad) {
      if (!url.startsWith('file:') || !url.endsWith('.ts')) return nextLoad(url, context)
      const fileName = fileURLToPath(url)
      const { outputText } = ts.transpileModule(readFileSync(fileName, 'utf8'), {
        fileName,
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          verbatimModuleSyntax: true,
        },
      })
      return { format: 'module', source: outputText, shortCircuit: true }
    },
  }
}
