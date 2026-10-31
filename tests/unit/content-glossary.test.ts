import { beforeAll, describe, expect, it } from 'vitest'

import { concepts, site } from '@/content'
import { type ConceptRecord, type GlossaryEntryRecord, localSource } from '@/content/testing'

// Content-v1 ticket 05: the current /concepts/ page's glossary cards as glossary entries, and the
// three short posts, Atman, Jiva and Jagat, as Concepts in the self topic. Read through the
// content source and the public interface, as the other content tests are.

/** The saved /concepts/ page's 82 cards, less the four merges (ticket 05's Comments). */
const ENTRIES = 78

/** The short posts that became Concepts, each named by its glossary card too. */
const POSTS = ['atman', 'jiva', 'jagat']

let glossary: readonly GlossaryEntryRecord[] = []
let conceptRecords: readonly ConceptRecord[] = []

beforeAll(async () => {
  glossary = await localSource.records('glossary')
  conceptRecords = await localSource.records('concept')
})

const entry = (slug: string) => glossary.find((glossaryEntry) => glossaryEntry.slug === slug)
const conceptOf = (slug: string) => conceptRecords.find((concept) => concept.slug === slug)

/** Every string inside a value. */
const stringsIn = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : value && typeof value === 'object'
      ? Object.values(value).flatMap(stringsIn)
      : []

const flaggedFor = (
  record: GlossaryEntryRecord | ConceptRecord | undefined,
  role: string,
  pattern: RegExp,
) => record?.provenance.flags.some((flag) => flag.for === role && pattern.test(flag.note))

describe('the glossary', () => {
  it('holds one entry per card, the duplicated cards merged', () => {
    expect(glossary).toHaveLength(ENTRIES)
  })

  it('keeps interface text out of every description', () => {
    const offenders = glossary
      .filter(({ definition = '' }) =>
        /click to learn more|no information available|read more/i.test(definition),
      )
      .map(({ slug }) => slug)
    expect(offenders).toEqual([])
  })

  it('links every entry to its DharmaWiki article', () => {
    const offenders = glossary
      .filter(({ url }) => url === undefined || new URL(url).hostname !== 'dharmawiki.org')
      .map(({ slug }) => slug)
    expect(offenders).toEqual([])
  })

  it('merges each duplicated card into one entry, flagging the choices it made', () => {
    for (const slug of [
      'anavrtti',
      'brhadaranyaka-upanishad',
      'pravrtti-and-nivrtti',
      'upanishads',
    ])
      expect(entry(slug), slug).toBeDefined()
    expect(entry('brihadaranyaka-upanishad')).toBeUndefined()
    const brhadaranyaka = entry('brhadaranyaka-upanishad')?.provenance.edits.join(' ')
    expect(brhadaranyaka).toContain('“Brihadaranyaka Upanishad”')
    expect(brhadaranyaka).toContain('“बृहदारण्यक उपनिषद्”')
    expect(flaggedFor(entry('anavrtti'), 'research-editor', /two descriptions/)).toBe(true)
  })

  it('gives Pravrtti and Nivrtti its own description and the link to its own article', () => {
    const pravrtti = entry('pravrtti-and-nivrtti')
    expect(pravrtti?.definition).toBe('Pravṛtti is worldly action; Nivṛtti is renunciation.')
    expect(decodeURIComponent(pravrtti?.url ?? '')).toContain('/Pravrtti_and_Nivrtti_(')
    expect(flaggedFor(pravrtti, 'research-editor', /Nishkama Karma’s description/)).toBe(true)
  })

  it('never shows one entry with another entry’s description', () => {
    const definitions = glossary.flatMap(({ definition }) => (definition ? [definition] : []))
    expect(new Set(definitions).size).toBe(definitions.length)
    const navavidha = entry('navavidha-bhakti')
    expect(navavidha?.definition).toBeUndefined()
    expect(navavidha?.url).toBeDefined()
    expect(flaggedFor(navavidha, 'research-editor', /Mundaka Upanishad/)).toBe(true)
  })

  it('writes Purushartha’s visarga where the card typed a colon, and lists the fix', () => {
    const purushartha = entry('purushartha')
    expect(purushartha?.name.devanagari).toBe('पुरुषार्थः')
    expect(purushartha?.provenance.edits.join(' ')).toContain('“पुरुषार्थ:” → “पुरुषार्थः”')
    expect(flaggedFor(purushartha, 'research-editor', /colon/)).toBe(true)
  })

  it('flags every entry, in one note for the Project owner, as perhaps adapted from DharmaWiki', () => {
    const notes = glossary.map(
      (glossaryEntry) =>
        glossaryEntry.provenance.flags.find(
          (flag) => flag.for === 'project-owner' && /DharmaWiki/.test(flag.note),
        )?.note,
    )
    expect(notes).not.toContain(undefined)
    expect(new Set(notes).size).toBe(1)
  })

  it('merges the Anubandha Chatushtaya post into its entry, flagged for attribution', () => {
    const anubandha = entry('anubandha-chatushtaya')
    expect(anubandha?.provenance.sources.map(({ url }) => url)).toEqual([
      'https://care4mind.org/concepts/',
      'https://care4mind.org/anubandha-chatushtaya/',
    ])
    expect(anubandha?.definition).toMatch(/^The fourfold requisites for studying Vedanta: .+\./)
    expect(anubandha?.definition).toMatch(/ literally means four connections, .+\.$/)
    expect(flaggedFor(anubandha, 'research-editor', /DharmaWiki/)).toBe(true)
  })

  it('links the Atman, Jiva and Jagat entries to their Concepts, which the A–Z merges them into', async () => {
    for (const slug of POSTS) expect(entry(slug)?.concept, slug).toBe(slug)
    const entries = (await site.azIndex()).flatMap((letter) => letter.entries)
    for (const slug of POSTS)
      expect(
        entries
          .filter(({ anchors }) => anchors.includes(slug))
          .map(({ kind, href }) => ({ kind, href })),
        slug,
      ).toEqual([{ kind: 'concept', href: `/concepts/${slug}/` }])
  })
})

describe('the short posts', () => {
  it('become Concepts in the self topic, with no Questionnaire', async () => {
    for (const slug of POSTS) {
      const record = conceptOf(slug)
      expect(record?.topics.primary, slug).toBe('self')
      expect(record?.questionnaire, slug).toBeUndefined()
      expect((await concepts.get(slug))?.topic.slug, slug).toBe('self')
    }
  })

  it('drop DharmaWiki’s citation markers and the lone “[” Jiva ends with, flagging the truncation', () => {
    for (const slug of POSTS)
      expect(
        stringsIn(conceptOf(slug)?.sections).filter((text) => text.includes('[')),
        slug,
      ).toEqual([])
    expect(flaggedFor(conceptOf('jiva'), 'research-editor', /mid-citation/)).toBe(true)
  })

  it('flag Atman and Jiva for attribution to DharmaWiki', () => {
    for (const slug of ['atman', 'jiva'])
      expect(flaggedFor(conceptOf(slug), 'research-editor', /credit DharmaWiki/), slug).toBe(true)
  })

  it('keep each Concept’s own DharmaWiki article, the one its glossary card links to', () => {
    for (const slug of POSTS)
      expect(
        conceptOf(slug)?.external?.map(({ url }) => url),
        slug,
      ).toEqual([entry(slug)?.url])
  })
})
