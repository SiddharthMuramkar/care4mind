import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Folio, FrameCorners } from '@/components/Folio'

const corners = (html: string) => html.match(/data-corner=/g) ?? []

describe('the Folio frame', () => {
  it('marks the frame variant with four diamond corners', () => {
    const html = renderToStaticMarkup(Folio({ children: 'Hero' }))
    expect(corners(html)).toHaveLength(4)
    expect(html).toContain('data-paper')
  })

  it('keeps the frame variant when it is named', () => {
    const html = renderToStaticMarkup(Folio({ variant: 'frame', children: 'Hero' }))
    expect(corners(html)).toHaveLength(4)
  })

  it('leaves the page variant unframed, with no corners in the DOM', () => {
    const html = renderToStaticMarkup(
      Folio({
        as: 'article',
        variant: 'page',
        'aria-labelledby': 'page-title',
        children: 'Reading',
      }),
    )
    expect(corners(html)).toHaveLength(0)
    expect(html).toMatch(/^<article/)
    expect(html).toContain('aria-labelledby="page-title"')
    expect(html).toContain('data-paper')
  })

  it('offers its corners to the cards the frame marks', () => {
    expect(corners(renderToStaticMarkup(FrameCorners()))).toHaveLength(4)
  })
})

describe('where the double frame stands', () => {
  const source = (path: string) => readFileSync(path, 'utf8')

  it('reading pages and the error pages take the page variant', () => {
    expect(source('src/components/ReadingPage/ReadingPage.tsx')).toContain('variant="page"')
    for (const path of ['src/app/not-found.tsx', 'src/app/error.tsx', 'src/app/global-error.tsx']) {
      expect(source(path), path).toContain('variant="page"')
    }
  })

  it('the hero keeps the frame, and verse cards and featured cards take its corners', () => {
    expect(source('src/app/page.tsx')).not.toContain('variant="page"')
    expect(source('src/components/prose/VerseCard.tsx')).toContain('<FrameCorners')
    expect(source('src/components/ConceptCard/ConceptCard.tsx')).toContain('featured')
    expect(source('src/components/QuestionnaireCard/QuestionnaireCard.tsx')).toContain('featured')
  })

  it('only the homepage features its cards', () => {
    const featuredCard = /<(?:Concept|Questionnaire)Card\b[^>]*\bfeatured\b/
    expect(source('src/app/page.tsx')).toMatch(featuredCard)
    for (const path of [
      'src/app/start/page.tsx',
      'src/app/topics/[slug]/page.tsx',
      'src/app/questionnaires/page.tsx',
    ]) {
      expect(source(path), path).not.toMatch(featuredCard)
    }
  })
})
