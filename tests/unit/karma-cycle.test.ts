import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { KarmaCycle } from '@/components/art'

const html = renderToStaticMarkup(createElement(KarmaCycle))
const between = (open: string, close: string) => {
  const start = html.indexOf(open)
  return html.slice(start, html.indexOf(close, start))
}
const svg = between('<svg', '</svg>')
const list = between('<ol', '</ol>')
const words = (markup: string) => markup.replace(/<[^>]+>/g, '')

/** Appendix C of the images spec, word for word: each line as the old picture sets it. */
const LINES = [
  'Karmabandha',
  'Mochana',
  'Karmabija',
  'Dharmabaddha',
  'Kama (Desire)',
  'Nischayam',
  'Resolve',
  'Karma',
  'Action',
  'Karmaphala',
  'Punya or Papa',
  'Citta-shuddhi',
  'Manonigraha',
  'Buddhi',
  'Svadharma',
  'Phala-Tyaga',
  'Lokasamgraha',
]

const DESCRIPTION =
  'A cycle of action. Karmabija leads, through Manonigraha, to Dharmabaddha Kama (desire); through Buddhi to Nischayam (resolve); through Svadharma to Karma (action); and through Phala-Tyaga to Karmaphala, punya or papa. Lokasamgraha also leads into Karmaphala. Karmaphala and Karmabija are struck through, and Citta-shuddhi leads from Karmaphala back to Karmabija. At the centre: Karmabandha Mochana.'

/** The list, one step to an item, in plain words: what the picture says, in reading order. */
const STEPS = [
  'Karmabija (struck through) leads, through Manonigraha, to Dharmabaddha Kama (Desire).',
  'Dharmabaddha Kama (Desire) leads, through Buddhi, to Nischayam (Resolve).',
  'Nischayam (Resolve) leads, through Svadharma, to Karma (Action).',
  'Karma (Action) leads, through Phala-Tyaga, to Karmaphala, Punya or Papa (both struck through).',
  'Karmaphala, Punya or Papa (both struck through) leads, through Citta-shuddhi, to Karmabija (struck through).',
  'Lokasamgraha also leads into Karmaphala, Punya or Papa (both struck through).',
  'At the centre: Karmabandha Mochana.',
]

describe('the Karma Yoga cycle', () => {
  it('sets every word of the old picture as real text, spelled as it was', () => {
    const texts = [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map(([, inner = '']) =>
      words(inner),
    )
    expect(texts.sort()).toEqual([...LINES].sort())
  })

  it('names the picture by its title and description, the description from the spec', () => {
    const [, labelledBy = ''] = /aria-labelledby="([^"]+)"/.exec(svg) ?? []
    const ids = labelledBy.split(' ')
    expect(ids).toHaveLength(2)
    expect(svg).toContain(`<title id="${ids[0]}">The Karma Yoga cycle</title>`)
    expect(svg).toContain(`<desc id="${ids[1]}">${DESCRIPTION}</desc>`)
    expect(svg).toMatch(/^<svg[^>]* role="img"/)
  })

  it('draws a line through each of the three struck words, and no others', () => {
    const struck = [...svg.matchAll(/<text[^>]*>((?:(?!<\/text>).)*)<\/text><line /g)].map(
      ([, inner = '']) => words(inner),
    )
    expect(struck.sort()).toEqual(['Karmabija', 'Karmaphala', 'Punya or Papa'])
    expect(svg.match(/<line /g)).toHaveLength(3)
  })

  it('lists the same steps as the drawing, in reading order', () => {
    const items = [...list.matchAll(/<li>(.*?)<\/li>/g)].map(([, inner = '']) => words(inner))
    expect(items).toEqual(STEPS)
  })

  it('strikes through the same three words in the list, and no others', () => {
    const struck = [...list.matchAll(/<s>(.*?)<\/s>/g)].map(([, inner = '']) => words(inner))
    expect([...new Set(struck)].sort()).toEqual(['Karmabija', 'Karmaphala', 'Punya or Papa'])
  })

  it('marks the Sanskrit, not the English', () => {
    expect(svg).toContain('<tspan lang="sa-Latn">Kama</tspan> (Desire)')
    expect(list).toMatch(/<span lang="sa-Latn">Karmabija<\/span>/)
  })
})
