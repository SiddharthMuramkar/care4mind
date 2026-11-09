import { existsSync, readFileSync } from 'node:fs'
import { createServer, type IncomingHttpHeaders, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'

// The download of the old site's media library. The old site can't be reached from CI, so the
// tests aim at what decides whether a run can be trusted: the comparison that stops it, and
// where files land.

interface ApiRow {
  id: number
  source_url: string
  media_details: {
    width?: number
    height?: number
    filesize?: number
    sizes?: Record<string, { source_url: string }>
  }
}

interface Original {
  wpId: number
  oldPath: string
  size: string
  kb: number
}

const fetchTool = (await import(pathToFileURL(resolve('scripts/art/fetch.mjs')).href)) as {
  compareLibrary(apiRows: readonly ApiRow[], files: readonly Original[]): string[]
  addressesOf(apiRows: readonly ApiRow[]): { address: string; wpId: number }[]
  exportPath(root: string, oldPath: string): string
  masterPath(root: string, newSrc: string): string
  download(url: string): Promise<Buffer>
  listLibrary(origin: string): Promise<ApiRow[]>
  checkPixels(bytes: Buffer, row: ApiRow): Promise<void>
}

const PATH = '/wp-content/uploads/2024/05/Cosmos-icon.png'
const original: Original = { wpId: 511, oldPath: PATH, size: '777x777', kb: 1124 }
const apiRow: ApiRow = {
  id: 511,
  source_url: `https://care4mind.org${PATH}`,
  media_details: { width: 777, height: 777, filesize: 1124 * 1024 },
}

const BODY_OF_A_FONT = Buffer.from('not a picture')

describe('compareLibrary', () => {
  it('finds nothing when the live list matches the saved one', () => {
    expect(fetchTool.compareLibrary([apiRow], [original])).toEqual([])
  })

  it('names a file the old site has added', () => {
    const added = { ...apiRow, id: 999 }
    expect(fetchTool.compareLibrary([apiRow, added], [original]).join()).toMatch(/999.*added/)
  })

  it('names a file the old site has removed', () => {
    expect(fetchTool.compareLibrary([], [original]).join()).toMatch(/511.*removed/)
  })

  it('names a file that moved', () => {
    const moved = { ...apiRow, source_url: 'https://care4mind.org/wp-content/uploads/x.png' }
    expect(fetchTool.compareLibrary([moved], [original]).join()).toMatch(/511.*path/)
  })

  it('names a file whose pixel size changed', () => {
    const resized = { ...apiRow, media_details: { ...apiRow.media_details, width: 800 } }
    expect(fetchTool.compareLibrary([resized], [original]).join()).toMatch(/511.*800x777/)
  })

  it('names a file whose reported size changed', () => {
    const grown = { ...apiRow, media_details: { ...apiRow.media_details, filesize: 2048 * 1024 } }
    expect(fetchTool.compareLibrary([grown], [original]).join()).toMatch(/511.*2048/)
  })

  it('does not ask a font for a pixel size', () => {
    const font = { ...apiRow, media_details: { filesize: 1124 * 1024, sizes: {} } }
    expect(fetchTool.compareLibrary([font], [{ ...original, size: 'font' }])).toEqual([])
  })
})

describe('addressesOf', () => {
  it('lists a file and each resized copy once, as paths in a stable order', () => {
    const row: ApiRow = {
      ...apiRow,
      media_details: {
        sizes: {
          medium: { source_url: 'https://care4mind.org/wp-content/uploads/2024/05/c-300x300.png' },
          full: { source_url: apiRow.source_url },
        },
      },
    }
    expect(fetchTool.addressesOf([row])).toEqual([
      { address: PATH, wpId: 511 },
      { address: '/wp-content/uploads/2024/05/c-300x300.png', wpId: 511 },
    ])
  })
})

describe('where files land', () => {
  it('keeps the year and month, because one name exists in two months', () => {
    expect(fetchTool.exportPath('/repo', '/wp-content/uploads/2023/09/a.png')).toBe(
      '/repo/art/wp-export/2023/09/a.png',
    )
    expect(fetchTool.exportPath('/repo', '/wp-content/uploads/2025/02/a.png')).toBe(
      '/repo/art/wp-export/2025/02/a.png',
    )
  })

  it('refuses a path that would leave the export folder', () => {
    expect(() => fetchTool.exportPath('/repo', '/wp-content/uploads/2023/09/..')).toThrow()
    expect(() => fetchTool.exportPath('/repo', '/wp-content/uploads/../../etc/passwd')).toThrow()
  })

  it('names a master from the address the site will serve it at', () => {
    expect(fetchTool.masterPath('/repo', '/art/stickers/cosmos.png')).toBe(
      '/repo/art/masters/stickers/cosmos.png',
    )
  })

  it('refuses a master outside the three picture folders', () => {
    expect(() => fetchTool.masterPath('/repo', '/art/../secrets/x.png')).toThrow()
    expect(() => fetchTool.masterPath('/repo', '/other/x.png')).toThrow()
  })
})

describe('talking to the old site', () => {
  let server: Server | undefined
  afterEach(() => server?.close())

  /** A local stand-in for the old site, and the headers it was last sent. */
  async function site(respond: Parameters<typeof createServer>[1]) {
    const seen: { headers?: IncomingHttpHeaders; urls: string[] } = { urls: [] }
    server = createServer((request, response) => {
      seen.headers = request.headers
      seen.urls.push(request.url ?? '')
      respond?.(request, response)
    })
    await new Promise<void>((done) => server?.listen(0, '127.0.0.1', done))
    return { origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, seen }
  }

  const BODY = Buffer.from('the bytes of a font')

  it('keeps a body that matches its Content-Length, asking for it unencoded', async () => {
    const { origin, seen } = await site((_, response) => {
      response.writeHead(200, { 'content-length': BODY.length })
      response.end(BODY)
    })
    await expect(fetchTool.download(`${origin}/a.ttf`)).resolves.toEqual(BODY)
    expect(seen.headers?.['accept-encoding']).toBe('identity')
    expect(seen.headers?.['user-agent']).toMatch(/care4mind/)
  })

  it('refuses a compressed response, whose Content-Length is not the size of the file', async () => {
    const gzipped = gzipSync(BODY)
    const { origin } = await site((_, response) => {
      response.writeHead(200, { 'content-encoding': 'gzip', 'content-length': gzipped.length })
      response.end(gzipped)
    })
    await expect(fetchTool.download(`${origin}/a.ttf`)).rejects.toThrow(/encod/i)
  })

  it('refuses a response with no Content-Length', async () => {
    const { origin } = await site((_, response) => {
      response.writeHead(200, { 'transfer-encoding': 'chunked' })
      response.end(BODY)
    })
    await expect(fetchTool.download(`${origin}/a.ttf`)).rejects.toThrow(/content-length/i)
  })

  it('refuses a body cut short', async () => {
    const { origin } = await site((_, response) => {
      response.writeHead(200, { 'content-length': BODY.length + 10 })
      response.write(BODY, () => response.destroy())
    })
    await expect(fetchTool.download(`${origin}/a.ttf`)).rejects.toThrow()
  })

  it('refuses a missing file', async () => {
    const { origin } = await site((_, response) => {
      response.writeHead(404, { 'content-length': 0 })
      response.end()
    })
    await expect(fetchTool.download(`${origin}/a.ttf`)).rejects.toThrow(/404/)
  })

  it('asks for as many pages as the list has, and no more', async () => {
    const { origin, seen } = await site((request, response) => {
      const page = new URL(request.url ?? '', 'http://x').searchParams.get('page')
      response.writeHead(200, { 'x-wp-totalpages': '2', 'content-type': 'application/json' })
      response.end(JSON.stringify([{ id: Number(page) }]))
    })
    const rows = await fetchTool.listLibrary(origin)
    expect(rows.map((row) => row.id)).toEqual([1, 2])
    expect(seen.urls).toHaveLength(2)
  })
})

describe('checkPixels', () => {
  const blank = (width: number, height: number) =>
    sharp({ create: { width, height, channels: 3, background: '#fff' } })
      .png()
      .toBuffer()

  it('accepts a picture of the size the list says', async () => {
    const row = { ...apiRow, media_details: { width: 2, height: 3 } }
    await expect(fetchTool.checkPixels(await blank(2, 3), row)).resolves.toBeUndefined()
  })

  it('refuses a picture of another size', async () => {
    const row = { ...apiRow, media_details: { width: 2, height: 3 } }
    await expect(fetchTool.checkPixels(await blank(3, 2), row)).rejects.toThrow(/511/)
  })

  it('leaves a font alone', async () => {
    const row = { ...apiRow, media_details: { sizes: {} } }
    await expect(fetchTool.checkPixels(BODY_OF_A_FONT, row)).resolves.toBeUndefined()
  })
})

describe('what the download left in the repo', () => {
  const read = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as unknown
  const { files } = read('scripts/art/originals.json') as {
    files: { wpId: number; verdict: string; newSrc: string | null }[]
  }
  const addresses = read('art/old-media-addresses.json') as { address: string; wpId: number }[]

  it('lists all 273 old media addresses once each', () => {
    expect(addresses).toHaveLength(273)
    expect(new Set(addresses.map((row) => row.address)).size).toBe(273)
  })

  it('gives every file in the library an address, and every address a known file', () => {
    const ids = new Set(addresses.map((row) => row.wpId))
    const byNumber = (a: number, b: number) => a - b
    expect([...ids].sort(byNumber)).toEqual(files.map((file) => file.wpId).sort(byNumber))
  })

  it('holds all 22 masters', () => {
    const kept = files.filter((file) => file.verdict === 'KEEP')
    expect(kept).toHaveLength(22)
    for (const file of kept)
      expect(existsSync(fetchTool.masterPath('.', file.newSrc ?? '')), file.newSrc ?? '').toBe(true)
  })

  it('pins sharp, which the tools reach directly', () => {
    const pkg = read('package.json') as { devDependencies: Record<string, string> }
    expect(pkg.devDependencies.sharp).toBe('0.35.5')
  })
})
