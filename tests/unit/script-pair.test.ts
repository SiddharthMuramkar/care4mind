import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ScriptPair, Transliterated } from '@/components/script'

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

describe('Transliterated', () => {
  const marked = (text: string) => renderToStaticMarkup(createElement(Transliterated, { text }))

  it('tags each transliterated word in a plain name as Sanskrit', () => {
    expect(marked('Temperament (guṇa)')).toBe('Temperament (<span lang="sa-Latn">guṇa</span>)')
    expect(marked('Self and person (ātman · jīva)')).toBe(
      'Self and person (<span lang="sa-Latn">ātman</span> · <span lang="sa-Latn">jīva</span>)',
    )
  })

  it('leaves text with no IAST letter as it is', () => {
    expect(marked('Values: yama and niyama')).toBe('Values: yama and niyama')
  })
})
