import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

import { build } from 'vite'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

/**
 * The viewer's own script, minified: the component and the site's code it pulls in. React and
 * `next/image` are left out, because every picture on the site shares them. The real bundler
 * splits its chunks across unrelated modules, so can't say this.
 */
async function viewerChunk() {
  const result = await build({
    configFile: false,
    root: ROOT,
    logLevel: 'error',
    resolve: { alias: { '@': join(ROOT, 'src') } },
    oxc: { jsx: { runtime: 'automatic', development: false } },
    build: {
      write: false,
      minify: true,
      lib: {
        entry: join(ROOT, 'src/components/art/PlateViewer.tsx'),
        formats: ['es'],
      },
      rolldownOptions: {
        external: (id) => !/^(\.|\/|@\/)/.test(id),
      },
    },
  })
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((bundle) =>
    'output' in bundle ? bundle.output : [],
  )
  const chunk = outputs.find((output) => output.type === 'chunk')
  if (chunk?.type !== 'chunk') throw new Error('the build wrote no script')
  return chunk
}

describe('the Plate viewer script', () => {
  it('is at most 3 KB gzipped', { timeout: 60_000 }, async () => {
    const { code } = await viewerChunk()
    expect(code).toContain('Next painting')
    expect(gzipSync(code, { level: 9 }).length).toBeLessThanOrEqual(3 * 1024)
  })

  it('brings in no carousel library', { timeout: 60_000 }, async () => {
    const { imports, dynamicImports } = await viewerChunk()
    expect([...imports, ...dynamicImports].sort()).toEqual([
      'next/image',
      'react',
      'react/jsx-runtime',
    ])
  })
})
