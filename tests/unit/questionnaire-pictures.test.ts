import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { art, ownArt } from '@/art'
import { QuestionnaireCard } from '@/components/QuestionnaireCard'

// Only the lookup the card makes is stood in for, so that a bare card can be drawn at all: the
// one Questionnaire with a card today has its own Plate.
vi.mock('@/art', async (original) => ({
  ...(await original<typeof import('@/art')>()),
  ownArt: vi.fn(),
}))

const questionnaire = {
  slug: 'karmayoga-scale',
  title: 'KarmaYoga Scale',
  status: 'preview',
  shownStatus: 'preview',
  summary: 'A short reflection on how you act.',
} as Parameters<typeof QuestionnaireCard>[0]['questionnaire']

const card = () => renderToStaticMarkup(createElement(QuestionnaireCard, { questionnaire }))

describe('a Questionnaire card', () => {
  it('shows its own Plate as a Medallion at 64 px, decorative, with no sizes', () => {
    vi.mocked(ownArt).mockReturnValue(art('plate-karma-yoga'))
    const markup = card()
    expect(markup).toContain('<svg')
    expect(markup).toContain('karma-yoga.jpg')
    expect(markup).toContain('alt=""')
    expect(markup.match(/<img[^>]*\bwidth="(\d+)"/)?.[1]).toBe('64')
    expect(markup).not.toContain('sizes=')
    expect(markup).toMatch(/withArt/)
  })

  it('sets the picture before the title', () => {
    vi.mocked(ownArt).mockReturnValue(art('plate-karma-yoga'))
    const markup = card()
    expect(markup.indexOf('<img')).toBeGreaterThanOrEqual(0)
    expect(markup.indexOf('<img')).toBeLessThan(markup.indexOf('<h3'))
  })

  it('stays bare with no Plate of its own: no picture and no row kept for one', () => {
    vi.mocked(ownArt).mockReturnValue(undefined)
    const markup = card()
    expect(markup).not.toContain('<img')
    expect(markup).not.toContain('<svg')
    expect(markup).not.toMatch(/withArt/)
  })
})
