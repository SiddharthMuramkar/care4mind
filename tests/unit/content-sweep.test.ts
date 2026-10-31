import { beforeAll, describe, expect, it } from 'vitest'

import type { Features } from '@/config/features'
import {
  CONTENT_KINDS,
  idOf,
  type ContentRecord,
  type FlagRole,
  type Provenance,
  type RecordOf,
  localSource,
  createContent,
} from '@/content/testing'

// Content-v1 ticket 12, the fidelity sweep: content v1 is complete, so the site derivations give
// real answers on the real content. Read through the public interface, built over the site's own
// content source with the feature flags each test needs, and through the content source itself
// for what a record stores (its links, flags and listed edits).

const ON: Features = { questionnairePreview: true, conceptMap: true, devanagariFirst: true }
const OFF: Features = { questionnairePreview: false, conceptMap: false, devanagariFirst: false }

const site = createContent(localSource, ON)

/** The 19 Concepts, by the slugs the batch tickets chose (D02, settled rule 14). */
const CONCEPTS = [
  'ahimsa',
  'asteya',
  'atma-bandhu',
  'atman',
  'brahma-vihara',
  'brahmacharya',
  'chittabhumi',
  'five-steps-of-perfection',
  'jagat',
  'jiva',
  'karta',
  'momentum-of-spiritual-practice',
  'panch-klesha',
  'satya',
  'spiritual-practitioner',
  'sthitaprajna',
  'triguna',
  'upa-vikshepa',
  'vikshepa',
]

/** The pages that only exist while their feature flag is on (settled rule 17). */
const FLAGGED_PAGES = ['/questionnaires/karmayoga-scale/take/', '/concepts/map/', '/proposals/']

/** Every public page of design B2, with the slugs content v1 has (D01, D02). */
const PAGES = [
  '/',
  '/concepts/',
  ...CONCEPTS.map((slug) => `/concepts/${slug}/`),
  '/concepts/map/',
  ...['self', 'mind', 'practice', 'values', 'temperament'].map((slug) => `/topics/${slug}/`),
  '/texts/',
  ...[
    'bhagavad-gita',
    'dhammapada',
    'sadhana-panchakam',
    'sushruta-samhita',
    'vedanta-sara',
    'yoga-sutra',
  ].map((slug) => `/texts/${slug}/`),
  '/questionnaires/',
  '/questionnaires/karmayoga-scale/',
  '/questionnaires/karmayoga-scale/take/',
  '/library/',
  '/library/references/',
  ...['textbooks', 'inspirational-books', 'courses', 'methods'].map((slug) => `/library/${slug}/`),
  '/search/',
  '/proposals/',
]

let records: ContentRecord[] = []

// Read once, with room for a busy machine: the graph under every view is built from all of it.
beforeAll(async () => {
  records = (await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))).flat()
  await site.site.routes()
}, 60_000)

/** Every record of a kind. */
function ofKind<K extends ContentRecord['kind']>(kind: K): RecordOf<K>[] {
  return records.filter((candidate): candidate is RecordOf<K> => candidate.kind === kind)
}

/** A record's name as the tools print it: `kind/id`. */
const nameOf = (candidate: ContentRecord) => `${candidate.kind}/${idOf(candidate)}`

/** Every provenance a record keeps: its own, or a topic introduction's. */
function provenancesOf(candidate: ContentRecord): Provenance[] {
  if (candidate.kind !== 'topic') return [candidate.provenance]
  return candidate.intro ? [candidate.intro.provenance] : []
}

/** The provenance of a record named `kind/id`. */
function provenanceOf(name: string): Provenance {
  const [provenance] = provenancesOf(
    records.find((candidate) => nameOf(candidate) === name) ?? fail(`No record ${name}`),
  )
  return provenance ?? fail(`${name} keeps no provenance`)
}

function fail(message: string): never {
  throw new Error(message)
}

describe('the route registry, on the real content', () => {
  it('lists every page of design B2 with the content’s slugs, every flag on', async () => {
    const paths = (await site.site.routes()).map(({ path }) => path)
    expect(paths).toHaveLength(45)
    expect(paths.toSorted()).toEqual(PAGES.toSorted())
  })

  it('marks one sample for each kind of page', async () => {
    const samples = (await site.site.routes()).filter(({ sample }) => sample)
    expect(samples.map(({ kind }) => kind).toSorted()).toEqual([
      'concept',
      'concept-map',
      'concepts',
      'home',
      'library',
      'page',
      'proposals',
      'questionnaire',
      'questionnaire-flow',
      'questionnaires',
      'references',
      'resource-list',
      'search',
      'texts',
      'topic',
      'work',
    ])
  })

  it('marks the Concept map and /proposals/ as proposals', async () => {
    const proposals = (await site.site.routes()).filter(({ proposal }) => proposal)
    expect(proposals.map(({ path }) => path).toSorted()).toEqual(['/concepts/map/', '/proposals/'])
  })

  it('leaves out the KarmaYoga flow, the Concept map and /proposals/ with their flags off', async () => {
    const paths = (await createContent(localSource, OFF).site.routes()).map(({ path }) => path)
    expect(paths.toSorted()).toEqual(
      PAGES.filter((page) => !FLAGGED_PAGES.includes(page)).toSorted(),
    )
  })
})

describe('the A–Z, on the real content', () => {
  /** The glossary entries that name a Concept, each with the Concept it merges into. */
  const MERGED: Readonly<Record<string, string>> = {
    atman: 'atman',
    jiva: 'jiva',
    jagat: 'jagat',
    'chitta-bhumis': 'chittabhumi',
  }

  const entries = async () => (await site.site.azIndex()).flatMap(({ entries }) => entries)

  it('merges the Atman, Jiva, Jagat and Chitta Bhumis entries into their Concepts', async () => {
    const all = await entries()
    for (const [entry, concept] of Object.entries(MERGED)) {
      const carrying = all.filter(({ anchors }) => anchors.includes(entry))
      expect(carrying, entry).toHaveLength(1)
      expect(carrying[0], entry).toMatchObject({ kind: 'concept', href: `/concepts/${concept}/` })
    }
  })

  it('lists every other glossary entry once, as an entry of its own', async () => {
    const glossary = (await entries()).filter(({ kind }) => kind === 'glossary')
    expect(glossary).toHaveLength(74)
    const others = ofKind('glossary')
      .map(({ slug }) => slug)
      .filter((slug) => !(slug in MERGED))
    expect(glossary.flatMap(({ anchors }) => anchors).toSorted()).toEqual(others.toSorted())
  })

  it('gives each of the 19 Concepts one entry', async () => {
    const concepts = (await entries()).filter(({ kind }) => kind === 'concept')
    expect(concepts.map(({ href }) => href).toSorted()).toEqual(
      CONCEPTS.map((slug) => `/concepts/${slug}/`).toSorted(),
    )
  })
})

describe('the search documents, on the real content', () => {
  it('cover every kind, with one document for each thing the content holds', async () => {
    const documents = await site.site.searchDocuments()
    const count: Record<string, number> = {}
    for (const { kind } of documents) count[kind] = (count[kind] ?? 0) + 1
    // The counts the tickets record: 19 Concepts and their 46 term blocks (tickets 01, 05 and
    // 08–11), 78 glossary entries (05), 6 works and 43 passages (04), 188 References (03), the
    // 41 books and courses on the three reading lists (07), 18 Questionnaires, 5 topics, and
    // the Methods page with the three lists as pages.
    expect(count).toEqual({
      concept: 19,
      term: 46,
      glossary: 78,
      work: 6,
      passage: 43,
      reference: 188,
      'library-item': 41,
      questionnaire: 18,
      topic: 5,
      page: 4,
    })
    expect(documents).toHaveLength(448)
  })

  it('give every Concept that cites Tomar (2024) the person Tomar', async () => {
    const citing = (await site.concepts.list({ reference: 'tomar-2024' })).map(({ slug }) => slug)
    expect(citing).toHaveLength(16)
    const withTomar = (await site.site.searchDocuments())
      .filter(({ kind, people }) => kind === 'concept' && people.includes('Tomar'))
      .map(({ id }) => id.replace(/^concept:/, ''))
    expect(withTomar.toSorted()).toEqual(citing.toSorted())
  })
})

describe('the Concept map, on the real content', () => {
  it('has the 19 Concepts as its nodes', async () => {
    const { nodes } = await site.site.graph()
    expect(nodes.map(({ slug }) => slug).toSorted()).toEqual(CONCEPTS.toSorted())
  })

  it('makes no edge through Tomar (2024), or through any Reference four or more Concepts cite', async () => {
    const { edges } = await site.site.graph()
    const common = (await site.references.list())
      .filter(({ citedIn }) => citedIn.filter(({ kind }) => kind === 'concept').length >= 4)
      .map(({ id }) => id)
    expect(common).toContain('tomar-2024')
    expect(edges.filter(({ via }) => common.includes(via))).toEqual([])
  })

  it('joins the Concepts that quote the same verse, saying which', async () => {
    const { edges } = await site.site.graph()
    const joined = (a: string, b: string, via: string) =>
      edges.some(
        (edge) =>
          edge.kind === 'passage' &&
          edge.via === via &&
          [edge.source, edge.target].toSorted().join(' ') === [a, b].toSorted().join(' '),
      )
    // From the census: Yoga Sūtra 1.30 is quoted on Vikshepa and Know Your Mind, Bhagavad Gītā
    // 2.54 on Sthitaprajna and Brahmacharya, and Yoga Sūtra 2.30 on all four values pages.
    expect(joined('vikshepa', 'chittabhumi', 'yoga-sutra/1.30')).toBe(true)
    expect(joined('sthitaprajna', 'brahmacharya', 'bhagavad-gita/2.54')).toBe(true)
    for (const [a, b] of [
      ['ahimsa', 'satya'],
      ['ahimsa', 'asteya'],
      ['ahimsa', 'brahmacharya'],
      ['satya', 'asteya'],
      ['satya', 'brahmacharya'],
      ['asteya', 'brahmacharya'],
    ] as const)
      expect(joined(a, b, 'yoga-sutra/2.30'), `${a} and ${b}`).toBe(true)
    const reason = edges.find(({ via }) => via === 'yoga-sutra/1.30')?.reason
    expect(reason).toBe('Both quote Yoga Sūtra 1.30')
  })
})

/**
 * A fact from the design notes that a person must decide: on each record named, a flag for the
 * role, or a listed edit, that says it.
 */
interface DesignFact {
  fact: string
  records: readonly string[]
  in: FlagRole | 'edits'
  says: RegExp
}

/** The 27 verses whose page names no work (the passages census), stored under their text's work. */
const UNNAMED_WORKS = [
  ...[
    '1.20',
    '1.21',
    '1.22',
    '1.31',
    '2.3',
    '2.5',
    '2.7',
    '2.9',
    '2.30',
    '2.32',
    '2.35',
    '2.36',
  ].map((locator) => `passage/yoga-sutra/${locator}`),
  ...[
    '2.54',
    '2.55',
    '2.56',
    '2.57',
    '2.58',
    '2.68',
    '6.17',
    '14.6',
    '14.7',
    '14.8',
    '14.9',
    '14.11',
    '14.12',
    '14.13',
    '17.15',
  ].map((locator) => `passage/bhagavad-gita/${locator}`),
]

const DESIGN_FACTS: readonly DesignFact[] = [
  {
    fact: 'vikṣepa’s “Bhagavad Gita” heading over Yoga Sūtra 1.30, relabelled',
    records: ['passage/yoga-sutra/1.30'],
    in: 'research-editor',
    says: /“Bhagavad Gita \(Chapter 1, Sutra 30\)”/,
  },
  {
    fact: 'vikṣepa’s headings, reworded by the foundation',
    records: ['concept/vikshepa'],
    in: 'edits',
    says: /“What is the definition of Vikshepa- Vikṣepa \(Distraction\) \?” → “What is vikṣepa\?”/,
  },
  {
    fact: 'vikṣepa’s comparison heading, reworded by the foundation',
    records: ['concept/vikshepa'],
    in: 'edits',
    says: /“Indian vs Western concept” → “Indian and Western concepts”/,
  },
  {
    fact: 'the join verify found in vikṣepa’s text',
    records: ['concept/vikshepa'],
    in: 'edits',
    says: /“above- mentioned” → “above-mentioned”/,
  },
  {
    fact: 'vikṣepa’s summary, condensed by the foundation',
    records: ['concept/vikshepa'],
    in: 'research-editor',
    says: /summary was condensed/,
  },
  {
    fact: 'every verse whose page names no work',
    records: UNNAMED_WORKS,
    in: 'research-editor',
    says: /Confirm the attribution/,
  },
  {
    fact: 'Atman’s and Jiva’s text, adapted from DharmaWiki: how to credit it',
    records: ['concept/atman', 'concept/jiva'],
    in: 'research-editor',
    says: /DharmaWiki/,
  },
  {
    fact: 'Atman’s and Jiva’s text, adapted from DharmaWiki: whether it may be used',
    records: ['concept/atman', 'concept/jiva'],
    in: 'project-owner',
    says: /DharmaWiki/,
  },
  {
    fact: 'Jiva’s text, cut off mid-citation',
    records: ['concept/jiva'],
    in: 'research-editor',
    says: /mid-citation/,
  },
  {
    fact: 'the KarmaYoga Scale’s two item orders',
    records: ['questionnaire/karmayoga-scale'],
    in: 'psychology-expert',
    says: /different orders/,
  },
  {
    fact: 'the KarmaYoga Scale’s items 34–42, with their options reversed',
    records: ['questionnaire/karmayoga-scale'],
    in: 'psychology-expert',
    says: /34–42/,
  },
  {
    fact: 'the KarmaYoga Scale’s statements, permission needed',
    records: ['questionnaire/karmayoga-scale'],
    in: 'project-owner',
    says: /Permission is needed/,
  },
  {
    fact: 'the Dosha Survey’s anti-spam field, left out',
    records: ['questionnaire/dosha-survey'],
    in: 'psychology-expert',
    says: /anti-spam field/,
  },
  {
    fact: 'the Dosha Survey’s unknown author',
    records: ['questionnaire/dosha-survey'],
    in: 'project-owner',
    says: /author and rights holder are unknown/,
  },
  {
    fact: 'the glossary’s two Anavrtti cards',
    records: ['glossary/anavrtti'],
    in: 'research-editor',
    says: /two “Anavrtti/,
  },
  {
    fact: 'the Brihadaranyaka card, merged as another spelling',
    records: ['glossary/brhadaranyaka-upanishad'],
    in: 'edits',
    says: /Merged into this entry: the card “Brihadaranyaka Upanishad/,
  },
  {
    fact: 'the glossary’s two Pravrtti and Nivrtti cards',
    records: ['glossary/pravrtti-and-nivrtti'],
    in: 'research-editor',
    says: /two “Pravrtti and Nivrtti” cards/,
  },
  {
    fact: 'the glossary’s two Upanishads cards',
    records: ['glossary/upanishads'],
    in: 'research-editor',
    says: /two “Upanishads” cards/,
  },
  {
    fact: 'Navavidha Bhakti’s borrowed description, left out',
    records: ['glossary/navavidha-bhakti'],
    in: 'research-editor',
    says: /Mundaka Upanishad card’s/,
  },
  {
    fact: 'the “Vedic” red link, dropped',
    records: ['glossary/anavrtti'],
    in: 'edits',
    says: /“Vedic”, a DharmaWiki red link/,
  },
  {
    fact: 'Tomar (2024): permission to reproduce it',
    records: ['reference/tomar-2024'],
    in: 'project-owner',
    says: /^Rights: Tomar \(2024\)/,
  },
  {
    fact: 'no published source for Sthitaprajña’s or Five Steps of Perfection’s questionnaire',
    records: ['questionnaire/sthitaprajna', 'questionnaire/five-steps-of-perfection'],
    in: 'psychology-expert',
    says: /No published source was found/,
  },
  {
    fact: 'no published source for the Dosha Survey',
    records: ['questionnaire/dosha-survey'],
    in: 'project-owner',
    says: /No published source was found/,
  },
  {
    fact: 'KIIT’s link to ksrm.ac.in',
    records: ['resource-list/courses'],
    in: 'research-editor',
    says: /ksrm\.ac\.in/,
  },
  {
    fact: 'the “#” links on Text Books and Indian Philosophy, dropped',
    records: [
      'reference/cornelissen-2001',
      'reference/joshi-cornelissen-2004',
      'reference/misra-mohanty-2001',
      'reference/rao-marwaha-2005',
      'reference/salagame-2011',
    ],
    in: 'research-editor',
    says: /points nowhere \(“#”\)/,
  },
  {
    fact: 'the books whose only link is a retailer’s',
    records: [
      'reference/boniwell',
      'reference/compton',
      'reference/frankl-2008',
      'reference/gandhi-1993',
      'reference/gupta-2013',
      'reference/khalil-2001',
      'reference/mascaro-1994-gita',
      'reference/mascaro-1994-upanisads',
      'reference/nisargadatta-2008',
      'reference/yogananda-1946-1975',
    ],
    in: 'project-owner',
    says: /retailer \(Amazon\)/,
  },
  {
    fact: 'saṃvega, offered as Momentum of Spiritual Practice’s headword',
    records: ['concept/momentum-of-spiritual-practice'],
    in: 'research-editor',
    says: /saṃvega/,
  },
  {
    fact: 'the yama–niyama copy the values topic stores',
    records: ['topic/values'],
    in: 'research-editor',
    says: /Asteya page’s copy/,
  },
  {
    fact: 'Triguna’s shortcode and its test message, dropped',
    records: ['concept/triguna'],
    in: 'edits',
    says: /test shortcode.*test message/,
  },
  {
    fact: 'the homepage’s Applications area, with no real target',
    records: ['home/home'],
    in: 'project-owner',
    says: /Applications area/,
  },
]

describe('the design facts, each a flag or a listed edit', () => {
  it.each(DESIGN_FACTS)('$fact', ({ records: names, in: where, says }) => {
    const unsaid = names.filter((name) => {
      const { edits, flags } = provenanceOf(name)
      const texts =
        where === 'edits' ? edits : flags.filter((flag) => flag.for === where).map((f) => f.note)
      return !texts.some((text) => says.test(text))
    })
    expect(unsaid).toEqual([])
  })
})

describe('the flags pack', () => {
  it('asks the Psychology expert about every Questionnaire that has no purpose', () => {
    const unasked = ofKind('questionnaire').filter(
      ({ purpose, provenance }) =>
        purpose === undefined &&
        !provenance.flags.some(
          (flag) => flag.for === 'psychology-expert' && /\bpurpose\b/.test(flag.note),
        ),
    )
    expect(unasked.map(({ slug }) => slug)).toEqual([])
  })
})

describe('the records verify can’t check', () => {
  it('are those with no saved page, each flagged with where it came from', () => {
    const elsewhere = records.filter((candidate) =>
      provenancesOf(candidate).some(({ sources }) =>
        sources.every(({ url }) => !url.startsWith('https://care4mind.org/')),
      ),
    )
    expect(elsewhere.map(nameOf)).toEqual(['reference/navare-pandey-2022'])
    const unflagged = elsewhere.filter((candidate) =>
      provenancesOf(candidate).some(
        ({ flags }) =>
          !flags.some(
            (flag) =>
              flag.for === 'research-editor' &&
              /not from a page of the current site/.test(flag.note),
          ),
      ),
    )
    expect(unflagged.map(nameOf)).toEqual([])
  })
})

describe('the Concept slugs (D02)', () => {
  const slugOf = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  it('are the 19 the batch tickets chose', () => {
    expect(
      ofKind('concept')
        .map(({ slug }) => slug)
        .toSorted(),
    ).toEqual(CONCEPTS.toSorted())
  })

  it('each name a Concept by its page’s spelling of its headword, else by its English title', () => {
    const unexplained = ofKind('concept').filter(({ slug, name }) => {
      const spellings = name.term ? name.term.ascii : [name.english ?? '']
      // Know Your Mind writes only the plural, “chittabhumis”: its slug is the singular
      // (settled rule 14).
      const written = slug === 'chittabhumi' ? 'chittabhumis' : slug
      return !spellings.map(slugOf).includes(written)
    })
    expect(unexplained.map(({ slug }) => slug)).toEqual([])
  })
})

describe('the late links', () => {
  it('name triguṇa as the Dosha Survey’s Concept, so its card sits in the temperament topic', async () => {
    const survey = await site.questionnaires.get('dosha-survey')
    expect(survey?.concepts.map(({ slug }) => slug)).toEqual(['triguna'])
    expect(survey?.topics.map(({ slug }) => slug)).toEqual(['temperament'])
  })

  it('flag that placement for the Project owner as a structure call', () => {
    const calls = provenanceOf('questionnaire/dosha-survey').flags.filter(
      (flag) => flag.for === 'project-owner' && flag.ticket === 13,
    )
    expect(calls).toHaveLength(1)
    expect(calls[0]?.note).toMatch(/temperament/)
  })
})
