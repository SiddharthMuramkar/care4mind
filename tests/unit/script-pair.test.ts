import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ScriptPair } from '@/components/script/ScriptPair'

const render = (props: Parameters<typeof ScriptPair>[0]) =>
  renderToStaticMarkup(createElement(ScriptPair, props))

describe('ScriptPair', () => {
  it('sets the IAST, then the Devanagari, each with its language tag', () => {
    const html = render({ iast: 'vikṣepa', devanagari: 'विक्षेप' })
    expect(html).toBe(
      '<span><span lang="sa-Latn">vikṣepa</span> <span lang="sa-Deva">विक्षेप</span></span>',
    )
  })

  it('tags a Pali transliteration as Pali', () => {
    expect(render({ iast: 'dhammapada', lang: 'pi-Latn' })).toContain('lang="pi-Latn"')
  })

  it('is the transliteration alone when there is no Devanagari', () => {
    const html = render({ iast: 'vikṣepa' })
    expect(html).toBe('<span><span lang="sa-Latn">vikṣepa</span></span>')
  })

  it('sets verses as blocks with as="div"', () => {
    const html = render({ iast: 'a', devanagari: 'अ', as: 'div' })
    expect(html).toBe('<div><div lang="sa-Latn">a</div> <div lang="sa-Deva">अ</div></div>')
  })
})
