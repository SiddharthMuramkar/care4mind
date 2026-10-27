import { beforeAll, describe, expect, it } from 'vitest'

import { references, type ReferenceView } from '@/content'

// Ticket 03, the References census (content-v1): every Reference the kept pages cite or list
// exists once, with each way the pages wrote it. Read through the public interface, as the
// References page and every Concept read them. References no record cites yet are expected
// until the batch tickets land; the completeness checks wait for ticket 12.

let all: ReferenceView[] = []

beforeAll(async () => {
  all = await references.list()
})

function reference(id: string): ReferenceView {
  const found = all.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`No Reference “${id}”.`)
  return found
}

/** A current-site page's address, as provenance names it. */
const page = (path: string) => `https://care4mind.org/${path}/`

const VALUES_PAGES = [
  'knowyourvaluesahimsanon-violenceprofiling',
  'knowyourvaluessatyatruthfulnessprofiling',
  'knowyourvaluesasteyanonstealingprofiling',
  'knowyourvaluesbrahmacharya-profiling',
].map(page)

/** The pages a Reference was read from. */
const pagesOf = (view: ReferenceView) => view.provenance.sources.map((source) => source.url)

/** Text compared without case, diacritics, punctuation or spacing. */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * What makes two References the same work: type, title and year. The year is its four digits
 * (or "n.d."), without the letter or date a page adds to tell its own entries apart.
 */
const workKey = (view: Pick<ReferenceView, 'type' | 'title' | 'year'>) =>
  [view.type, fold(view.title), /\d{4}|n\.d\./.exec(view.year ?? '')?.[0] ?? ''].join(' | ')

/** Each work key or link held by more than one Reference, with their ids. */
function shared(views: readonly ReferenceView[], keyOf: (view: ReferenceView) => string[]) {
  const ids = new Map<string, string[]>()
  for (const view of views)
    for (const key of keyOf(view)) ids.set(key, [...(ids.get(key) ?? []), view.id])
  return [...ids]
    .filter(([, holders]) => holders.length > 1)
    .map(([key, holders]) => ({ key, holders }))
}

/** Lowercase ASCII words joined by hyphens. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** A text's words, folded: "Rodríguez-Nieto, G." gives rodriguez, nieto and g. */
const wordsOf = (text = '') => fold(text).split(' ').filter(Boolean)

/**
 * How an id breaks settled rule 15, if it does. An id is lowercase ASCII words joined by hyphens:
 * the first author's surname (with no author, a short name the title, container or address
 * gives), then the year when there is one, then a word only to tell two apart.
 */
function idProblems(view: ReferenceView): string[] {
  const problems: string[] = []
  if (!SLUG.test(view.id)) problems.push('is not lowercase ASCII words joined by hyphens')
  const [name = ''] = view.id.split('-')
  const names = view.authors
    ? wordsOf(view.authors)
    : [view.title, view.container, view.url].flatMap((text) => wordsOf(text))
  const giver = view.authors ? 'its authors don’t' : 'its title, container or address don’t'
  if (!names.includes(name)) problems.push(`starts with “${name}”, a name ${giver} give`)
  const year = /\d{4}/.exec(view.year ?? '')?.[0]
  if (year && !view.id.split('-').includes(year)) problems.push(`leaves out its year, ${year}`)
  return problems
}

/** A URL's host, or nothing for text that isn't a URL. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/**
 * How a Reference's links break the ticket's rules, if they do: a `#` link is dropped; with no
 * DOI or URL, `noStableLink` says why and a Research-editor flag asks for one; a retailer's link
 * is kept only with a Project-owner flag.
 */
function linkProblems(view: ReferenceView): string[] {
  const problems: string[] = []
  const flags = view.provenance.flags
  if (view.url !== undefined && /^(#.*)?$/.test(view.url.trim()))
    problems.push('keeps a link to nowhere')
  if (!view.doi && view.url === undefined) {
    if (!view.noStableLink?.trim()) problems.push('has no link and doesn’t say why')
    if (!flags.some((flag) => flag.for === 'research-editor' && /\blink/i.test(flag.note)))
      problems.push('has no link, and no Research-editor flag asks for one')
  }
  const retailer = view.url !== undefined && /(^|\.)amazon\./i.test(hostOf(view.url))
  if (retailer && !flags.some((f) => f.for === 'project-owner' && /retailer/i.test(f.note)))
    problems.push('links a retailer, and no Project-owner flag says so')
  return problems
}

const byWork = (view: ReferenceView) => [workKey(view)]
const byLink = (view: ReferenceView) =>
  [view.doi && `doi ${view.doi.toLowerCase()}`, view.url && `url ${view.url}`].filter(
    (key): key is string => !!key,
  )

const DESCRIPTION_PAGES = [
  'vikshepa',
  'upavikshepaprofiling',
  'panchkleshavikaarprofiling',
  'knowyourmind',
  'sthitaprajna',
  'fivestepsofperfectionprofiling',
  'momentumofspiritualpractice',
  'spiritualpractitionerprofiling',
  'brahmavihara',
  'knowyourvaluesahimsanon-violenceprofiling',
  'knowyourvaluessatyatruthfulnessprofiling',
  'knowyourvaluesasteyanonstealingprofiling',
  'knowyourvaluesbrahmacharya-profiling',
  'frienorfoeofself',
  'karta-2',
  'triguna',
].map(page)

describe('Tomar (2024)', () => {
  it('is one Reference holding at least five ways the pages write it', () => {
    const tomar = reference('tomar-2024')
    expect(new Set(tomar.asCited).size).toBeGreaterThanOrEqual(5)
  })

  it('is cited on all 16 description pages', () => {
    expect([...pagesOf(reference('tomar-2024'))].sort()).toEqual([...DESCRIPTION_PAGES].sort())
  })

  it('asks the Project owner about its rights', () => {
    const notes = reference('tomar-2024')
      .provenance.flags.filter((flag) => flag.for === 'project-owner')
      .map((flag) => flag.note)
    expect(notes.some((note) => /rights/i.test(note) && /permission/i.test(note))).toBe(true)
  })
})

describe('once each', () => {
  it('finds two made-up References that are one work', () => {
    const made = (id: string, year: string, title: string): ReferenceView => ({
      ...reference('tomar-2024'),
      id,
      year,
      title,
    })
    const views = [
      made('one', '2020a, October 19', 'Yogasutra- Verse 2.30'),
      made('two', '2020, October 19', 'yogasutra verse 2.30'),
      made('three', '2020', 'Yogasutra- Verse 2.32'),
    ]
    expect(shared(views, byWork).map(({ holders }) => holders)).toEqual([['one', 'two']])
  })

  it('stores no work twice: no two References share type, title and year', () => {
    expect(shared(all, byWork)).toEqual([])
  })

  it('stores no link twice: no two References share a DOI or URL', () => {
    expect(shared(all, byLink)).toEqual([])
  })

  it('keeps each source the four values pages share as one Reference cited by all four', () => {
    for (const id of [
      'srinivasan-2016',
      'thapliyal-2023',
      'shlokam-2020-yogasutra-2-30',
      'shlokam-2020-yogasutra-2-32',
    ])
      expect(pagesOf(reference(id)), id).toEqual(expect.arrayContaining(VALUES_PAGES))
  })
})

describe('ids (settled rule 15)', () => {
  const made = (id: string, fields: Partial<ReferenceView>): ReferenceView => ({
    ...reference('tomar-2024'),
    authors: undefined,
    url: undefined,
    container: undefined,
    ...fields,
    id,
  })

  it('accepts the rule’s own examples and refuses ids that break it', () => {
    const tomar = { authors: 'Tomar, V. S.', year: '2024' }
    expect(idProblems(made('tomar-2024', tomar))).toEqual([])
    expect(
      idProblems(made('apa-distraction', { authors: 'APA Dictionary', year: 'n.d.-b' })),
    ).toEqual([])
    expect(
      idProblems(made('shlokam-2021', { title: 'Gita Ch 18 – Shlokam', year: '2021, May 7' })),
    ).toEqual([])
    expect(idProblems(made('Tomar_2024', tomar))).toEqual([
      'is not lowercase ASCII words joined by hyphens',
      'starts with “Tomar_2024”, a name its authors don’t give',
      'leaves out its year, 2024',
    ])
    expect(idProblems(made('smith-2024', tomar))).toEqual([
      'starts with “smith”, a name its authors don’t give',
    ])
    expect(idProblems(made('tomar', tomar))).toEqual(['leaves out its year, 2024'])
    expect(idProblems(made('gita-2021', { title: 'Shlokam', year: '2021' }))).toEqual([
      'starts with “gita”, a name its title, container or address don’t give',
    ])
  })

  it('gives every Reference an id that follows the rule', () => {
    const problems = all.flatMap((view) => idProblems(view).map((p) => `${view.id} ${p}`))
    expect(problems).toEqual([])
  })
})

describe('links', () => {
  const made = (fields: Partial<ReferenceView>): ReferenceView => ({
    ...reference('tomar-2024'),
    url: undefined,
    doi: undefined,
    noStableLink: undefined,
    provenance: { sources: [], edits: [], flags: [] },
    ...fields,
  })
  const asking = { for: 'research-editor' as const, note: 'No DOI or link is given; add one.' }
  const retailer = { for: 'project-owner' as const, note: 'Its only link goes to a retailer.' }

  it('finds a made-up link to nowhere, a missing link nobody asks for, and an unflagged retailer', () => {
    expect(linkProblems(made({ url: 'https://example.org/book' }))).toEqual([])
    expect(linkProblems(made({ url: '#' }))).toEqual(['keeps a link to nowhere'])
    expect(
      linkProblems(
        made({
          noStableLink: 'none given',
          provenance: { ...made({}).provenance, flags: [asking] },
        }),
      ),
    ).toEqual([])
    expect(linkProblems(made({ noStableLink: 'none given' }))).toEqual([
      'has no link, and no Research-editor flag asks for one',
    ])
    expect(linkProblems(made({}))).toEqual([
      'has no link and doesn’t say why',
      'has no link, and no Research-editor flag asks for one',
    ])
    expect(linkProblems(made({ url: 'https://www.amazon.in/dp/1' }))).toEqual([
      'links a retailer, and no Project-owner flag says so',
    ])
    expect(
      linkProblems(
        made({
          url: 'https://www.amazon.com/dp/1',
          provenance: { ...made({}).provenance, flags: [retailer] },
        }),
      ),
    ).toEqual([])
  })

  it('keeps no link to nowhere, says why a Reference has none and asks for it, and flags retailers', () => {
    const problems = all.flatMap((view) => linkProblems(view).map((p) => `${view.id} ${p}`))
    expect(problems).toEqual([])
  })

  it('flags the five books whose “More Info” links on Text Books and Indian Philosophy go nowhere', () => {
    for (const id of [
      'rao-marwaha-2005',
      'joshi-cornelissen-2004',
      'cornelissen-2001',
      'misra-mohanty-2001',
      'salagame-2011',
    ]) {
      const notes = reference(id)
        .provenance.flags.filter((flag) => flag.for === 'research-editor')
        .map((flag) => flag.note)
      expect(
        notes.some((note) => note.includes('“#”')),
        id,
      ).toBe(true)
    }
  })
})

describe('gaps the pages leave (FR-03)', () => {
  /** The Research editor's notes on a Reference. */
  const notesOn = (id: string) =>
    reference(id)
      .provenance.flags.filter((flag) => flag.for === 'research-editor')
      .map((flag) => flag.note)
      .join(' ')

  it('flags Sharma & Pareek’s missing year, and the Positive Psychology books’ year and publisher', () => {
    expect(notesOn('sharma-pareek')).toMatch(/\byear\b/)
    for (const id of ['compton', 'boniwell']) {
      expect(notesOn(id), id).toMatch(/\byear\b/)
      expect(notesOn(id), id).toMatch(/\bpublisher\b/)
    }
  })
})
