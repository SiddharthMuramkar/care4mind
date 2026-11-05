import { describe, expect, it } from 'vitest'

import {
  DEFAULT_SELECTION,
  fromChips,
  isDefault,
  readSelection,
  shownEntries,
  writeSelection,
} from '@/components/az/filter'

// The A–Z opens on its Concept pages: an address without `kind` asks for them, and a press adds
// Terms or the Glossary to them.

const KNOWN = {
  topic: new Set(['mind', 'self']),
  text: new Set(['gita']),
  kind: new Set(['concept', 'term', 'glossary']),
  concept: new Set(['atman']),
}

describe('the A–Z filter', () => {
  it('reads a plain address as the Concept pages', () => {
    expect(readSelection('', KNOWN)).toEqual(DEFAULT_SELECTION)
    expect(readSelection('?topic=mind', KNOWN).kind).toEqual(['concept'])
  })

  it('reads the kinds an address names, and the default for none it knows', () => {
    expect(readSelection('?kind=concept,term', KNOWN).kind).toEqual(['concept', 'term'])
    expect(readSelection('?kind=glossary', KNOWN).kind).toEqual(['glossary'])
    expect(readSelection('?kind=bogus', KNOWN).kind).toEqual(['concept'])
  })

  it('writes the default as the plain address, and any other choice in full', () => {
    expect(writeSelection(DEFAULT_SELECTION)).toBe('')
    expect(writeSelection({ ...DEFAULT_SELECTION, topic: ['mind'] })).toBe('?topic=mind')
    expect(
      writeSelection({ topic: [], text: [], kind: ['concept', 'term', 'glossary'], concept: [] }),
    ).toBe('?kind=concept,term,glossary')
  })

  it('round-trips every choice of kinds through the address', () => {
    const kinds = ['concept', 'term', 'glossary']
    for (let mask = 1; mask < 8; mask += 1) {
      const kind = kinds.filter((_, at) => mask & (1 << at))
      const selection = { topic: ['self'], text: [], kind, concept: [] }
      expect(readSelection(writeSelection(selection), KNOWN)).toEqual(selection)
    }
  })

  it('pressing Terms adds them to the Concept pages', () => {
    const next = fromChips(['kind:concept', 'kind:term'])
    expect(writeSelection(next)).toBe('?kind=concept,term')
  })

  it('letting go of every kind goes back to the Concept pages', () => {
    expect(fromChips([])).toEqual(DEFAULT_SELECTION)
    expect(isDefault(fromChips(['topic:mind']))).toBe(false)
    expect(isDefault(fromChips(['kind:concept']))).toBe(true)
  })

  it('shows only the kinds chosen', () => {
    expect(shownEntries(DEFAULT_SELECTION)).toBe('[data-entry]:is([data-kind~="concept"])')
  })

  it('a list that opens on every kind passes none, and its plain address presses nothing', () => {
    const plain = { topic: [], text: [], kind: [], concept: [] }
    expect(readSelection('', KNOWN, [])).toEqual(plain)
    expect(readSelection('?kind=term', KNOWN, []).kind).toEqual(['term'])
    expect(fromChips([], [])).toEqual(plain)
    expect(writeSelection(plain, [])).toBe('')
    expect(writeSelection({ ...plain, kind: ['term'] }, [])).toBe('?kind=term')
    expect(isDefault(plain, [])).toBe(true)
    expect(isDefault(fromChips(['concept:atman'], []), [])).toBe(false)
    expect(shownEntries(plain)).toBe('[data-entry]')
  })
})
