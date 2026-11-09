import { renderToReadableStream } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import NotFound from '@/app/not-found'
import type { ArtRecord } from '@/art'
import { EMBLEM_MARK } from '@/art/emblem'

const answer = vi.hoisted(() => ({ picture: undefined as ArtRecord | undefined }))

// The registry has no Plate for this page yet, so the test says what `artFor` answers.
vi.mock('@/art', () => ({
  artFor: (target: { kind: string; key?: string }) => {
    if (target.kind !== 'section' || target.key !== 'notFound') {
      throw new Error(`The 404 page asked for ${JSON.stringify(target)}.`)
    }
    return answer.picture
  },
}))

const PLATE: ArtRecord = {
  id: 'plate-404',
  family: 'plate',
  src: '/art/plates/plate-404.jpg',
  width: 1024,
  height: 1024,
  alt: 'A traveller at a fork in a forest path',
  origin: { kind: 'generated', tool: 'Recraft', model: 'V3', prompt: 'A brief', made: '2026-11' },
  licence: 'Made for Care4Mind',
  approved: false,
}

async function rendered(picture: ArtRecord) {
  answer.picture = picture
  // The page's starting points wait on the content, so it needs the renderer that can wait.
  const stream = await renderToReadableStream(await NotFound())
  await stream.allReady
  return new Response(stream).text()
}

const pictures = (html: string) => html.match(/<img[^>]*>/g) ?? []
const drawings = (html: string) => html.match(/<svg[^>]*>/g) ?? []

describe('the 404 page’s picture', () => {
  it('is the decorative Emblem while `artFor` answers with it, and has no ring', async () => {
    const html = await rendered(EMBLEM_MARK)
    expect(pictures(html)).toHaveLength(1)
    expect(pictures(html)[0]).toContain('emblem-mark')
    expect(pictures(html)[0]).toMatch(/alt=""/)
    expect(pictures(html)[0]).toMatch(/width="200"/)
    expect(pictures(html)[0]).toMatch(/height="200"/)
    expect(pictures(html)[0]).not.toMatch(/\ssizes=/)
    expect(drawings(html)).toHaveLength(1)
    expect(drawings(html)[0]).toContain('data-lotus')
  })

  it('is a decorative Medallion once `artFor` answers with a Plate', async () => {
    const html = await rendered(PLATE)
    expect(pictures(html)).toHaveLength(1)
    expect(pictures(html)[0]).toContain('plate-404')
    expect(pictures(html)[0]).toMatch(/alt=""/)
    expect(pictures(html)[0]).toMatch(/width="200"/)
    expect(pictures(html)[0]).toMatch(/height="200"/)
    expect(pictures(html)[0]).not.toMatch(/\ssizes=/)
    expect(drawings(html)).toHaveLength(2)
  })

  it('stands above the kicker and the title', async () => {
    const html = await rendered(EMBLEM_MARK)
    expect(html.indexOf('<img')).toBeGreaterThan(-1)
    expect(html.indexOf('<img')).toBeLessThan(html.indexOf('Error 404'))
    expect(html.indexOf('Error 404')).toBeLessThan(html.indexOf('<h1'))
  })
})
