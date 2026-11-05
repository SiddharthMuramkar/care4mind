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

  it('offers the six everyday starting points its record chooses, each resolved to its Concept', async () => {
    const [record] = await localSource.records('home')
    const view = await home.get()
    const listed = await concepts.list()
    expect(view.onYourMind).toHaveLength(6)
    expect(view.onYourMind.map(({ label }) => label)).toEqual([
      'I can’t focus',
      'My mind feels scattered',
      'Anger, fear and clinging',
      'Staying steady under pressure',
      'Am I my own friend or foe?',
      'Being kinder, to others and myself',
    ])
    expect(view.onYourMind.map(({ concept }) => concept.slug)).toEqual(
      record?.onYourMind.map(({ concept }) => concept),
    )
    expect(view.onYourMind.map(({ concept }) => concept.slug)).toEqual([
      'vikshepa',
      'chittabhumi',
      'panch-klesha',
      'sthitaprajna',
      'atma-bandhu',
      'brahma-vihara',
    ])
    for (const { concept } of view.onYourMind) {
      const listedCard = listed.find(({ slug }) => slug === concept.slug)
      expect(concept.name, concept.slug).toBe(listedCard?.name)
      expect(concept.href, concept.slug).toBe(listedCard?.href)
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
    expect(provenance.drafted).toContain('onYourMind')
    expect(provenance.drafted).toContain('howItWorks')
    expect(provenance.drafted).toContain('whoBehind')
    expect(provenance.edits.some((edit) => edit.includes('unused'))).toBe(true)
  })
})
