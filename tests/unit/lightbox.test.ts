import { join } from 'node:path'

import { build } from 'vite'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

/**
 * A component's own script and the chunks it splits off, built as the Plate viewer's size test
 * builds that viewer: the site's code bundled, every package left out.
 */
async function chunksOf(entry: string) {
  const result = await build({
    configFile: false,
    root: ROOT,
    logLevel: 'error',
    resolve: { alias: { '@': join(ROOT, 'src') } },
    oxc: { jsx: { runtime: 'automatic', development: false } },
    build: {
      write: false,
      minify: false,
      lib: { entry: join(ROOT, entry), formats: ['es'] },
      rolldownOptions: {
        external: (id) => !/^(\.|\/|@\/)/.test(id),
      },
    },
  })
  return (Array.isArray(result) ? result : [result])
    .flatMap((bundle) => ('output' in bundle ? bundle.output : []))
    .flatMap((output) => (output.type === 'chunk' ? [output] : []))
}

describe('the lightbox', () => {
  it.each([
    ['the homepage’s Plates', 'src/components/art/HeroPlates.tsx'],
    ['a credits picture', 'src/components/art/LightboxButton.tsx'],
  ])(
    'loads apart from what opens it, %s, only when asked for',
    { timeout: 60_000 },
    async (_, entry) => {
      const chunks = await chunksOf(entry)
      const opener = chunks.find((chunk) => chunk.isEntry)
      if (!opener) throw new Error('the build wrote no script')
      expect(opener.imports).not.toContain('@base-ui/react/dialog')
      expect(opener.dynamicImports).toHaveLength(1)
      const lightbox = chunks.find((chunk) => chunk.fileName === opener.dynamicImports[0])
      expect(lightbox?.imports).toContain('@base-ui/react/dialog')
      expect(lightbox?.code).toContain('Close')
    },
  )
})
