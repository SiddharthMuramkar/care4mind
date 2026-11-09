import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MedallionRing } from '@/components/art'

// The drawn ring around a Medallion: what it draws at each size, and how it asks to be still.

const ring = (props: { size: number; still?: boolean }) =>
  renderToStaticMarkup(createElement(MedallionRing, props))

const pathsIn = (markup: string) => markup.match(/<path\b/g)?.length ?? 0

describe('the Medallion ring', () => {
  it('draws its whole frame, in 10 to 14 paths, from 96 px up', () => {
    for (const size of [96, 120, 240, 360]) {
      expect(pathsIn(ring({ size }))).toBeGreaterThanOrEqual(10)
      expect(pathsIn(ring({ size }))).toBeLessThanOrEqual(14)
    }
  })

  it('below 96 px draws only its two rings', () => {
    expect(pathsIn(ring({ size: 72 }))).toBe(2)
    expect(pathsIn(ring({ size: 95 }))).toBe(2)
  })

  it('hides itself from assistive technology and from keyboard focus', () => {
    expect(ring({ size: 240 })).toContain('aria-hidden="true"')
    expect(ring({ size: 240 })).toContain('focusable="false"')
  })

  it('draws in the current colour, and never fills a shape', () => {
    const markup = ring({ size: 240 })
    expect(markup).toContain('stroke="currentColor"')
    expect(markup).toContain('fill="none"')
    expect(markup).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it('has no ids, so two rings on a page can never share one', () => {
    expect(ring({ size: 240 })).not.toMatch(/\bid=/)
    expect(ring({ size: 72 })).not.toMatch(/\bid=/)
  })

  it('leaves out the ink-in when still, and changes nothing else', () => {
    const inking = ring({ size: 240 })
    const still = ring({ size: 240, still: true })
    expect(inking).toMatch(/class="[^"]*inks/)
    expect(still).not.toMatch(/inks/)
    expect(still.replace(/ class="[^"]*"/g, '')).toBe(inking.replace(/ class="[^"]*"/g, ''))
  })
})
