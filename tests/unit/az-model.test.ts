import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { azModel, ConceptsAz } from '@/components/az'
import type { Route } from 'next'

import type { AzEntry, AzLetter, ConceptCard } from '@/content'

const href = (path: string) => path as Route

const entry = (name: string, kind: AzEntry['kind'], extra: Partial<AzEntry> = {}): AzEntry => ({
  kind,
  name,
  spellings: [],
  anchors: [],
  topics: ['mind'],
  works: [],
  ...extra,
})

const atman = entry('Ātman', 'concept', {
  lang: 'sa-Latn',
  devanagari: 'आत्मन्',
  gloss: 'self',
  href: href('/concepts/atman/'),
  works: ['gita'],
})
const buddhi = entry('Buddhi', 'term', { href: href('/concepts/atman/#buddhi') })
const bhakti = entry('Bhakti', 'glossary')

const LETTERS: AzLetter[] = [
  { letter: 'A', entries: [atman] },
  { letter: 'B', entries: [buddhi, bhakti] },
  { letter: 'C', entries: [] },
  { letter: '#', entries: [entry('1st', 'glossary')] },
]

const card = {
  slug: 'atman',
  name: 'Ātman',
  href: href('/concepts/atman/'),
  summary: 'The self.',
  topic: { slug: 'mind', name: 'Mind', href: href('/topics/mind/') },
  readingMinutes: 4,
} as unknown as ConceptCard

const model = azModel({
  letters: LETTERS,
  topics: [{ slug: 'mind', name: 'Mind' }],
  works: [
    { slug: 'gita', title: 'Bhagavadgītā', lang: 'sa-Latn' },
    { slug: 'unquoted', title: 'Other' },
  ],
  concepts: [card],
})

describe('the A–Z model', () => {
  it('counts the entries by kind', () => {
    expect(model.counts).toEqual({ all: 4, concept: 1, term: 1, glossary: 2 })
    expect(model.total).toBe(1)
  })

  it('gives each letter its anchor, and fills only letters with entries', () => {
    expect(model.rail).toEqual([
      { letter: 'A', id: 'letter-a', filled: true },
      { letter: 'B', id: 'letter-b', filled: true },
      { letter: 'C', id: 'letter-c', filled: false },
      { letter: '#', id: 'letter-other', filled: true },
    ])
  })

  it('offers chips for the topics, the quoted works and the kinds with their counts', () => {
    expect(model.groups.map(({ group }) => group)).toEqual(['topic', 'text', 'kind'])
    expect(model.groups[1]?.chips).toEqual([
      { value: 'gita', label: 'Bhagavadgītā', lang: 'sa-Latn' },
    ])
    expect(model.groups[2]?.chips).toEqual([
      { value: 'concept', label: 'Concept pages (1)' },
      { value: 'term', label: 'Terms (1)' },
      { value: 'glossary', label: 'Glossary (2)' },
    ])
  })

  it('numbers the entries across the whole list, skipping empty letters', () => {
    expect(model.sections.map(({ id }) => id)).toEqual(['letter-a', 'letter-b', 'letter-other'])
    expect(model.sections.flatMap(({ entries }) => entries.map(({ index }) => index))).toEqual([
      1, 2, 3, 4,
    ])
  })

  it('gives a Concept its card and its preview, and other kinds neither', () => {
    const [first] = model.sections[0]?.entries ?? []
    expect(first?.card).toBe(card)
    expect(first?.preview).toEqual({
      kind: 'concept',
      name: 'Ātman',
      text: 'The self.',
      topic: card.topic,
      readingMinutes: 4,
      lang: 'sa-Latn',
      devanagari: 'आत्मन्',
      gloss: 'self',
    })
    const term = model.sections[1]?.entries[0]
    expect(term?.card).toBeUndefined()
    expect(term?.preview).toBeUndefined()
  })
})

describe('the Concepts A–Z', () => {
  const html = renderToStaticMarkup(ConceptsAz({ model }))

  it('renders a section per letter with entries, hiding those with no Concept page', () => {
    expect(html).toContain('id="letter-a"')
    expect(html).toMatch(/<section[^>]*id="letter-b"[^>]*hidden/)
    expect(html).not.toContain('id="letter-c"')
  })

  it('renders the rail and the chips', () => {
    expect(html).toContain('href="#letter-a"')
    expect(html).toContain('Glossary (2)')
  })
})
