import { describe, expect, it } from 'vitest'

import { azModel } from '@/components/az'
import { conceptPreview, referencePreview } from '@/components/preview'
import { citationLinks } from '@/components/prose'
import { concepts, site } from '@/content'

// Every preview slip's payload is built in one place, whichever page links to it.

describe('preview payloads', () => {
  it('previews a Concept by its names, its topic, its reading time and its summary', async () => {
    const cards = await concepts.list()
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards)
      expect(conceptPreview(card)).toEqual({
        kind: 'concept',
        name: card.name,
        ...(card.lang ? { lang: card.lang } : {}),
        ...(card.term?.devanagari ? { devanagari: card.term.devanagari } : {}),
        ...(card.gloss ? { gloss: card.gloss } : {}),
        topic: card.topic,
        readingMinutes: card.readingMinutes,
        text: card.summary,
      })
  })

  it('previews an A–Z Concept entry as its Concept, under the entry’s own names', async () => {
    const [letters, cards] = await Promise.all([site.azIndex(), concepts.list()])
    const model = azModel({ letters, topics: [], works: [], concepts: cards })
    const previewed = model.sections
      .flatMap((section) => section.entries)
      .flatMap(({ entry, card, preview }) => (card ? [{ entry, card, preview }] : []))
    expect(previewed.length).toBeGreaterThan(0)
    for (const { entry, card, preview } of previewed)
      expect(preview).toEqual({
        kind: 'concept',
        name: entry.name,
        ...(entry.lang ? { lang: entry.lang } : {}),
        ...(entry.devanagari ? { devanagari: entry.devanagari } : {}),
        ...(entry.gloss ? { gloss: entry.gloss } : {}),
        topic: card.topic,
        readingMinutes: card.readingMinutes,
        text: card.summary,
      })
  })

  it('previews a citation as its Reference: its label and its title', () => {
    const reference = { id: 'r1', anchor: 'ref-r1', label: 'Tomar, 2024', title: 'A study' }
    const expected = { kind: 'reference', name: 'Tomar, 2024', text: 'A study' }
    expect(referencePreview(reference as never)).toEqual(expected)
    expect(
      citationLinks({ 'Tomar, 2024': 'r1' }, [reference as never])['Tomar, 2024']?.preview,
    ).toEqual(expected)
  })
})
