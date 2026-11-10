import { describe, expect, it } from 'vitest'

import { siteNav } from '@/components/nav'
import { references, topics } from '@/content'

const inWords = (count: number, one: string, many: string) => {
  const unit = count === 1 ? one : many
  return { count, unit, text: `${count} ${unit}` }
}

describe('the site navigation', () => {
  it('hands each topic its Concept count in finished words, and the unit for its count', async () => {
    const [{ concepts }, cards] = await Promise.all([siteNav(), topics.list()])
    expect(concepts.topics.length).toBe(cards.length)
    for (const card of cards)
      expect(concepts.topics.find((topic) => topic.slug === card.slug)?.holds).toEqual(
        inWords(card.conceptCount, 'Concept', 'Concepts'),
      )
  })

  it('hands each Library page what it holds in finished words, and the unit for its count', async () => {
    const [{ library }, all] = await Promise.all([siteNav(), references.list()])
    const holdings = library.pages.flatMap((page) => (page.holds ? [page.holds] : []))
    expect(holdings.length).toBeGreaterThan(0)
    for (const holds of holdings) expect(holds.text).toBe(`${holds.count} ${holds.unit}`)
    expect(library.pages.find((page) => page.slug === 'references')?.holds).toEqual(
      inWords(all.length, 'Reference', 'References'),
    )
  })

  it('hands the footer its link to the Picture credits page', async () => {
    expect((await siteNav()).credits).toEqual({ label: 'Picture credits', href: '/credits/' })
  })
})
