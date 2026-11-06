import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Numeral } from '@/components/Numeral'

const render = (props: Parameters<typeof Numeral>[0]) =>
  renderToStaticMarkup(createElement(Numeral, props))

describe('Numeral', () => {
  it('writes a number in Devanagari digits, always with its language tag', () => {
    expect(render({ value: 3 })).toBe('<span lang="sa-Deva">३</span>')
    expect(render({ value: '1.30' })).toBe('<span lang="sa-Deva">१.३०</span>')
  })

  it('carries its class, and hides decoration from assistive technology', () => {
    expect(render({ value: 12, className: 'order', decorative: true })).toBe(
      '<span lang="sa-Deva" class="order" aria-hidden="true">१२</span>',
    )
  })
})
