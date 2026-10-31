import { beforeAll, describe, expect, it } from 'vitest'

import { works, type PassageView } from '@/content'
import type { PassageRecord } from '@/content/schema'
import { localSource } from '@/content/source'

// Ticket 04, the works and passages census: every verse the 16 description pages quote is one
// passage under its work. The list below is that census. These tests read the real records
// through the public interface, and through the content source where a rule is about what a
// record stores.

/** The census: each work's passages, in reading order. */
const CENSUS: Readonly<Record<string, readonly string[]>> = {
  'yoga-sutra': [
    '1.2',
    '1.20',
    '1.21',
    '1.22',
    '1.30',
    '1.31',
    '1.33',
    '2.3',
    '2.5',
    '2.7',
    '2.9',
    '2.30',
    '2.32',
    '2.35',
    '2.36',
  ],
  'vedanta-sara': ['5.211'],
  'bhagavad-gita': [
    '2.54',
    '2.55',
    '2.56',
    '2.57',
    '2.58',
    '2.68',
    '6.5',
    '6.17',
    '14.5',
    '14.6',
    '14.7',
    '14.8',
    '14.9',
    '14.11',
    '14.12',
    '14.13',
    '17.15',
    '18.23',
    '18.24',
    '18.25',
  ],
  dhammapada: ['160'],
  'sadhana-panchakam': ['1', '2', '3', '4', '5'],
  'sushruta-samhita': ['4.35'],
}

/** Each census work as its page names it. */
const WORKS = {
  'yoga-sutra': { iast: 'Yoga Sūtra', language: 'sa', locatorLabel: 'Sutra', by: 'Patanjali' },
  'vedanta-sara': { iast: 'Vedānta Sāra', language: 'sa', locatorLabel: 'Shloka' },
  'bhagavad-gita': {
    iast: 'Bhagavad Gītā',
    devanagari: 'भगवद्गीता',
    language: 'sa',
    locatorLabel: 'Verse',
  },
  dhammapada: { iast: 'Dhammapada', language: 'pi', locatorLabel: 'Verse' },
  'sadhana-panchakam': {
    iast: 'Sādhana Pañcakam',
    language: 'sa',
    locatorLabel: 'Shloka',
    by: 'Adi Sankaracharya',
  },
  'sushruta-samhita': { iast: 'Suśruta Saṃhitā', language: 'sa', locatorLabel: 'Sutram' },
}

const page = (slug: string) => `https://care4mind.org/${slug}/`
const VALUES = [
  'knowyourvaluesahimsanon-violenceprofiling',
  'knowyourvaluessatyatruthfulnessprofiling',
  'knowyourvaluesasteyanonstealingprofiling',
  'knowyourvaluesbrahmacharya-profiling',
]
const STEADY_WISDOM = ['sthitaprajna', 'knowyourvaluesbrahmacharya-profiling']

/** Verses several pages quote, each stored once, with the pages that quote it. */
const SHARED: Readonly<Record<string, readonly string[]>> = {
  'yoga-sutra/1.30': ['vikshepa', 'knowyourmind'],
  'yoga-sutra/2.30': VALUES,
  'yoga-sutra/2.32': VALUES,
  'bhagavad-gita/2.54': STEADY_WISDOM,
  'bhagavad-gita/2.55': STEADY_WISDOM,
  'bhagavad-gita/2.56': STEADY_WISDOM,
  'bhagavad-gita/2.57': STEADY_WISDOM,
  'bhagavad-gita/2.58': STEADY_WISDOM,
  'bhagavad-gita/2.68': STEADY_WISDOM,
}

/** Verses a page heads without naming their work: each gets the work its text identifies. */
const UNNAMED = [
  'yoga-sutra/1.20',
  'yoga-sutra/1.21',
  'yoga-sutra/1.22',
  'yoga-sutra/1.31',
  'yoga-sutra/2.3',
  'yoga-sutra/2.5',
  'yoga-sutra/2.7',
  'yoga-sutra/2.9',
  'yoga-sutra/2.30',
  'yoga-sutra/2.32',
  'yoga-sutra/2.35',
  'yoga-sutra/2.36',
  'bhagavad-gita/2.54',
  'bhagavad-gita/2.55',
  'bhagavad-gita/2.56',
  'bhagavad-gita/2.57',
  'bhagavad-gita/2.58',
  'bhagavad-gita/2.68',
  'bhagavad-gita/6.17',
  'bhagavad-gita/14.6',
  'bhagavad-gita/14.7',
  'bhagavad-gita/14.8',
  'bhagavad-gita/14.9',
  'bhagavad-gita/14.11',
  'bhagavad-gita/14.12',
  'bhagavad-gita/14.13',
  'bhagavad-gita/17.15',
]

let records: readonly PassageRecord[] = []
/** Every passage as its work's page shows it. */
let shown: PassageView[] = []

beforeAll(async () => {
  records = await localSource.records('passage')
  const all = await Promise.all((await works.list()).map((card) => works.get(card.slug)))
  shown = all.flatMap((work) => work?.passages ?? [])
})

/** The passage record with this id. */
function passage(id: string): PassageRecord {
  const found = records.find((record) => record.id === id)
  if (!found) throw new Error(`no passage ${id}`)
  return found
}

const researchNotes = (record: PassageRecord) =>
  record.provenance.flags.filter((flag) => flag.for === 'research-editor').map((f) => f.note)

/** Every key anywhere inside a value. */
function keysIn(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysIn)
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, inner]) => [key, ...keysIn(inner)])
  return []
}

describe('the works and passages census', () => {
  it.each(Object.entries(CENSUS))(
    'opens %s on its census passages, in reading order',
    async (slug, locators) => {
      const work = await works.get(slug)
      expect(work, `no work “${slug}”`).not.toBeNull()
      // Other tickets may add a passage the census lacks; the census's own stay in this order.
      const fromCensus = (work?.passages ?? [])
        .map((passage) => passage.locator)
        .filter((locator) => locators.includes(locator))
      expect(fromCensus).toEqual(locators)
    },
  )

  it('gives every passage the id of its work and locator, and shows it on that work’s page', () => {
    expect(shown.map((p) => p.id).sort()).toEqual(records.map((record) => record.id).sort())
    const wrong = shown.filter((p) => p.id !== `${p.work.slug}/${p.locator}`).map((p) => p.id)
    expect(wrong).toEqual([])
  })

  it.each(Object.entries(WORKS))('names %s as its pages do', async (slug, expected) => {
    const work = await works.get(slug)
    expect({
      iast: work?.term.iast,
      devanagari: work?.term.devanagari,
      language: work?.language,
      locatorLabel: work?.locatorLabel,
      by: work?.attribution,
    }).toEqual(expected)
  })

  it('stores the Dhammapada as Pali, and every other work as Sanskrit', async () => {
    const languages = Object.fromEntries((await works.list()).map((w) => [w.slug, w.language]))
    const { dhammapada, ...others } = languages
    expect(dhammapada).toBe('pi')
    expect(new Set(Object.values(others))).toEqual(new Set(['sa']))
    const verse = shown.find((p) => p.id === 'dhammapada/160')
    expect(verse?.work.lang).toBe('pi-Latn')
  })

  it('keeps translation ids unique within each passage', () => {
    const repeated = records
      .filter(
        ({ translations }) => new Set(translations.map((t) => t.id)).size !== translations.length,
      )
      .map(({ id }) => id)
    expect(repeated).toEqual([])
  })

  it.each(Object.entries(SHARED))(
    'stores %s once, read from every page that quotes it',
    (id, pages) => {
      const sources = passage(id).provenance.sources.map((source) => source.url)
      expect(sources).toEqual(pages.map(page))
    },
  )

  it('leaves Devanagari empty only where no page gives it, flagged for the Research editor', () => {
    const empty = records.filter((record) => record.devanagari.length === 0)
    expect(empty.map((record) => record.id)).toEqual(
      expect.arrayContaining(['yoga-sutra/1.2', 'dhammapada/160']),
    )
    const unflagged = empty
      .filter((record) => !researchNotes(record).some((note) => /devanagari/i.test(note)))
      .map((record) => record.id)
    expect(unflagged).toEqual([])
  })

  it('flags each verse a page quotes without naming its work, for the Research editor', () => {
    const unflagged = UNNAMED.filter(
      (id) => !researchNotes(passage(id)).some((note) => /confirm the attribution/i.test(note)),
    )
    expect(unflagged).toEqual([])
  })

  it('stores no “quoted on”: the graph works out which records quote a passage', () => {
    const stored = records.flatMap((record) =>
      keysIn(record)
        .filter((key) => /quoted/i.test(key))
        .map((key) => `${record.id}: ${key}`),
    )
    expect(stored).toEqual([])
  })
})
