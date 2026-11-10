import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { art, ownArt } from '@/art'
import { HeadPicture } from '@/components/art'
import { ConceptCard } from '@/components/ConceptCard'
import { hrefFor } from '@/content'

// Only the lookup the card makes is stood in for: no Concept has its own Plate yet.
vi.mock('@/art', async (original) => ({
  ...(await original<typeof import('@/art')>()),
  ownArt: vi.fn(),
}))

const concept = {
  slug: 'vikshepa',
  name: 'Vikṣepa',
  lang: 'sa-Latn',
  term: { iast: 'vikṣepa', devanagari: 'विक्षेप', ascii: ['viksepa'] },
  gloss: 'Distraction',
  summary: 'The challenges a seeker encounters.',
  topic: {
    slug: 'mind',
    name: 'Mind: states and obstacles',
    href: hrefFor({ kind: 'topic', id: 'mind' }),
  },
  readingMinutes: 8,
} as Parameters<typeof ConceptCard>[0]['concept']

const card = (props: { pictureSize?: 64 | 72 } = {}) =>
  renderToStaticMarkup(createElement(ConceptCard, { concept, action: 'Read', ...props }))

const widthOf = (markup: string) => markup.match(/<img[^>]*\bwidth="(\d+)"/)?.[1]

describe('the picture at a page head', () => {
  const head = (id: Parameters<typeof art>[0]) =>
    renderToStaticMarkup(createElement(HeadPicture, { art: art(id), size: 120, phoneSize: 88 }))

  it('shows a Plate as a Medallion, in its ring', () => {
    const markup = head('plate-jeweller')
    expect(markup).toContain('<svg')
    expect(markup).toContain('jeweller.jpg')
    expect(widthOf(markup)).toBe('120')
  })

  it('draws a Medallion its full frame and, for a phone, the plain ring of its smaller size', () => {
    const rings = head('plate-jeweller').match(/<svg[\s\S]*?<\/svg>/g) ?? []
    const paths = rings.map((ring) => ring.match(/<path\b/g)?.length ?? 0)
    expect(paths).toHaveLength(2)
    expect(paths[0]).toBeGreaterThanOrEqual(10)
    expect(paths[1]).toBe(2)
  })

  it('shows anything else as a Sticker, with no ring', () => {
    const markup = head('sticker-mind-swirl')
    expect(markup).not.toContain('<svg')
    expect(markup).toContain('mind-swirl')
    expect(widthOf(markup)).toBe('120')
  })

  it('is decorative and sets no sizes', () => {
    for (const markup of [head('plate-jeweller'), head('sticker-mind-swirl')]) {
      expect(markup).toContain('alt=""')
      expect(markup).not.toContain('sizes=')
    }
  })
})

describe('a Concept card', () => {
  it('shows a Concept’s own Plate as a Medallion at 64 px, decorative', () => {
    vi.mocked(ownArt).mockImplementation((target) =>
      'slug' in target && target.slug === 'vikshepa' ? art('plate-jeweller') : undefined,
    )
    const markup = card()
    expect(markup).toContain('<svg')
    expect(markup).toContain('alt=""')
    expect(widthOf(markup)).toBe('64')
    expect(markup).toMatch(/withArt/)
    expect(markup).toContain('data-plate')
    expect(markup.indexOf('<img'), 'the picture comes before the title').toBeLessThan(
      markup.indexOf('<h3'),
    )
  })

  it('takes the homepage’s larger size when asked', () => {
    vi.mocked(ownArt).mockReturnValue(art('plate-jeweller'))
    expect(widthOf(card({ pictureSize: 72 }))).toBe('72')
  })

  it('stays bare with no Plate of its own: no picture and no row kept for one', () => {
    vi.mocked(ownArt).mockReturnValue(undefined)
    const markup = card()
    expect(markup).not.toContain('<img')
    expect(markup).not.toContain('<svg')
    expect(markup).not.toMatch(/withArt/)
    expect(markup).not.toContain('data-plate')
  })
})
