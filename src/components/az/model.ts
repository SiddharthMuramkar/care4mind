import { conceptPreview, type PreviewPayload } from '@/components/preview'
import type { AzEntry as Entry, AzLetter, ConceptCard as Card, LatinScript } from '@/content'

import { DEFAULT_KINDS } from './filter'
import type { ChipGroup, RailLetter } from './types'

type Kind = Entry['kind']

/** A letter's anchor on the page: `letter-a`, and `letter-other` for names starting otherwise. */
export const letterId = (letter: string) =>
  `letter-${letter === '#' ? 'other' : letter.toLowerCase()}`

const KINDS: readonly { value: Kind; label: string }[] = [
  { value: 'concept', label: 'Concept pages' },
  { value: 'term', label: 'Terms' },
  { value: 'glossary', label: 'Glossary' },
]

/** An entry as the list shows it: its place in the whole list, and a Concept's card and preview. */
export interface AzListEntry {
  entry: Entry
  index: number
  card?: Card
  preview?: PreviewPayload
}

export interface AzSection {
  letter: string
  id: string
  entries: readonly AzListEntry[]
}

/** Everything the Concepts A–Z shows, worked out from the content. */
export interface AzModel {
  counts: Readonly<Record<Kind | 'all', number>>
  /** How many entries the plain address shows. */
  total: number
  rail: readonly RailLetter[]
  /** The topic and text rows, by slug, then the row of entry kinds. */
  groups: readonly [ChipGroup, ChipGroup, ChipGroup<Kind>]
  /** The letters with entries. */
  sections: readonly AzSection[]
  topicNames: ReadonlyMap<string, string>
}

export interface AzSource {
  letters: readonly AzLetter[]
  topics: readonly { slug: string; name: string }[]
  works: readonly { slug: string; title: string; lang?: LatinScript }[]
  concepts: readonly Card[]
}

/** The Concepts A–Z: its rail, its chips, its counts and its numbered sections. */
export function azModel({ letters, topics, works, concepts }: AzSource): AzModel {
  const all = letters.flatMap(({ entries }) => entries)
  const ofKind = (kind: Kind) => all.filter((entry) => entry.kind === kind).length
  const quoted = new Set(all.flatMap((entry) => entry.works))
  const cards = new Map(concepts.map((card) => [card.href, card]))
  const cardOf = (entry: Entry) =>
    entry.kind === 'concept' && entry.href !== undefined ? cards.get(entry.href) : undefined

  const groups: AzModel['groups'] = [
    {
      group: 'topic',
      label: 'Topic',
      chips: topics.map(({ slug, name }) => ({ value: slug, label: name })),
    },
    {
      group: 'text',
      label: 'Text',
      chips: works
        .filter(({ slug }) => quoted.has(slug))
        .map(({ slug, title, lang }) => ({ value: slug, label: title, ...(lang ? { lang } : {}) })),
    },
    {
      group: 'kind',
      label: 'Show',
      chips: KINDS.map(({ value, label }) => ({ value, label: `${label} (${ofKind(value)})` })),
    },
  ]

  let index = 1
  const sections = letters
    .filter(({ entries }) => entries.length > 0)
    .map(({ letter, entries }) => ({
      letter,
      id: letterId(letter),
      entries: entries.map((entry): AzListEntry => {
        const card = cardOf(entry)
        return {
          entry,
          index: index++,
          // A Concept's link previews the Concept under the entry's own names.
          ...(card ? { card, preview: conceptPreview(card, entry) } : {}),
        }
      }),
    }))

  return {
    counts: {
      all: all.length,
      concept: ofKind('concept'),
      term: ofKind('term'),
      glossary: ofKind('glossary'),
    },
    total: all.filter(({ kind }) => DEFAULT_KINDS.includes(kind)).length,
    rail: letters.map(({ letter, entries }) => ({
      letter,
      id: letterId(letter),
      filled: entries.length > 0,
    })),
    groups,
    sections,
    topicNames: new Map(topics.map(({ slug, name }) => [slug, name])),
  }
}
