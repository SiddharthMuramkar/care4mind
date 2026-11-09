import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FolkBorder } from '@/components/art'

const render = (...variants: Parameters<typeof FolkBorder>[0]['variant'][]) =>
  renderToStaticMarkup(
    createElement(
      'div',
      null,
      ...variants.map((variant, key) => createElement(FolkBorder, { variant, key })),
    ),
  )

const patternIds = (html: string) =>
  [...html.matchAll(/<pattern[^>]* id="([^"]+)"/g)].map((m) => m[1])
const fills = (html: string) => [...html.matchAll(/fill="url\(#([^)]+)\)"/g)].map((m) => m[1])

describe('the FolkBorder', () => {
  it('gives two borders on one page different pattern ids, each filled from its own', () => {
    const html = render('dot-line', 'dot-line')
    const ids = patternIds(html)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    expect(fills(html)).toEqual(ids)
  })

  it('is hidden from assistive technology and never takes focus', () => {
    const html = render('dot-line')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('focusable="false"')
  })

  it('is 12 px tall at any width, with no viewBox to stretch its dots', () => {
    const html = render('dot-line')
    expect(html).toContain('height="12"')
    expect(html).toContain('width="100%"')
    expect(html).not.toContain('viewBox')
  })

  it('draws three different borders', () => {
    const drawings = (['dot-line', 'dot-band', 'rule-dots'] as const).map((variant) =>
      render(variant).replace(/id="[^"]+"|url\(#[^)]+\)/g, ''),
    )
    expect(new Set(drawings).size).toBe(3)
  })
})
