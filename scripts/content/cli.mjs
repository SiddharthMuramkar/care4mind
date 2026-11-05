// What every content tool shares on the command line: the error a person can fix, the runner
// that turns it into exit code 2, and the --root option.

import { realpathSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

/** A problem the person running a tool can fix: printed as it is, with exit code 2. */
export class ToolError extends Error {}

/**
 * Runs a tool's main function when its file is the one Node was asked to run (never on import).
 * Any failure exits 2: a ToolError as its message, anything else with its stack, so a crash
 * isn't mistaken for a string missing from a page.
 */
export async function runTool(meta, main) {
  const script = process.argv[1]
  if (!(meta.main ?? (script !== undefined && realpathSync(script) === fileURLToPath(meta.url))))
    return
  try {
    process.exitCode = (await main(process.argv.slice(2))) ?? 0
  } catch (error) {
    const text =
      error instanceof ToolError
        ? error.message
        : error instanceof Error
          ? (error.stack ?? error.message)
          : String(error)
    process.stderr.write(`${text}\n`)
    process.exitCode = 2
  }
}

/** The repo root `--root` names, or this script's repo; and the arguments left over. */
export function rootFrom(args) {
  const at = args.indexOf('--root')
  if (at === -1) return { root: resolve(HERE, '../..'), rest: args }
  if (!args[at + 1]) throw new ToolError('--root needs a folder.')
  return { root: resolve(args[at + 1]), rest: [...args.slice(0, at), ...args.slice(at + 2)] }
}
