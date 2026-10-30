import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/** Write the content registry before any test reads content, as the other scripts do. */
export default function setup() {
  execFileSync(
    process.execPath,
    [fileURLToPath(new URL('./scripts/content/registry.mjs', import.meta.url))],
    {
      stdio: 'ignore',
    },
  )
}
