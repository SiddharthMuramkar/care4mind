import { describe, expect, it } from 'vitest'

import { concepts, home, topics } from '@/content'
import { localSource } from '@/content/source'

describe('the homepage below the hero', () => {
  it('features the Concepts its record chooses, each resolved with its reading time', async () => {
    const [record] = await localSource.records('home')
    const view = await home.get()
    const listed = await concepts.list()
    expect(view.featured.map(({ slug }) => slug)).toEqual(record?.featured)
    expect(view.featured).toHaveLength(3)
    for (const card of view.featured) {
      const listedCard = listed.find(({ slug }) => slug === card.slug)
      expect(card.name, card.slug).toBe(listedCard?.name)
      expect(card.summary, card.slug).toBe(listedCard?.summary)
      expect(card.href, card.slug).toBe(listedCard?.href)
      expect(card.topic.name, card.slug).toBe(listedCard?.topic.name)
      expect(Number.isInteger(card.readingMinutes), card.slug).toBe(true)
      expect(card.readingMinutes, card.slug).toBeGreaterThanOrEqual(1)
    }
  })

  it('counts each topic’s Concepts from the Concepts themselves', async () => {
    const [topicCards, listed] = await Promise.all([topics.list(), concepts.list()])
    for (const topic of topicCards)
      expect(topic.conceptCount, topic.slug).toBe(
        listed.filter((concept) => concept.topic.slug === topic.slug).length,
      )
    expect(topicCards.reduce((sum, topic) => sum + topic.conceptCount, 0)).toBe(listed.length)
  })

  it('lists its drafted words and its unused areas in its provenance', async () => {
    const { provenance } = await home.get()
    expect(provenance.drafted).toContain('featured')
    expect(provenance.drafted).toContain('howItWorks')
    expect(provenance.drafted).toContain('whoBehind')
    expect(provenance.edits.some((edit) => edit.includes('unused'))).toBe(true)
  })
})
