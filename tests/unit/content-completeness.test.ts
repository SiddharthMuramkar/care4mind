import { beforeAll, describe, expect, it } from 'vitest'

import { contentGraph, type ContentGraph } from '@/content/graph'
import { CONTENT_KINDS, type ContentRecord, type RecordOf } from '@/content/schema'
import { localSource } from '@/content/source'

// Rules that can only pass once all of content v1 has arrived (settled rule 11). The census
// tickets land References before the Concepts that cite them, and ticket 01 lands five topics
// with one Concept between them, so each check below is written now and switched off:
// ticket 12 switches each one on (`it.skip` → `it`) once the migration is complete.

/** The number of glossary entries ticket 05 records in its Comments; ticket 12 confirms it. */
const GLOSSARY_ENTRIES = 78

/** The 16 current pages that each describe a Concept and a questionnaire (D12). */
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
].map((slug) => `https://care4mind.org/${slug}/`)

let records: ContentRecord[] = []
let graph: ContentGraph

beforeAll(async () => {
  records = (await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))).flat()
  graph = await contentGraph()
})

function ofKind<K extends ContentRecord['kind']>(kind: K): RecordOf<K>[] {
  return records.filter((record): record is RecordOf<K> => record.kind === kind)
}

describe('content v1, complete', () => {
  it.skip('gives every topic a Concept (ticket 12 switches this on)', () => {
    const empty = ofKind('topic')
      .filter((topic) => graph.conceptsInTopic(topic.slug).primary.length === 0)
      .map((topic) => topic.slug)
    expect(empty).toEqual([])
  })

  it.skip('has every Reference cited by a record (ticket 12 switches this on)', () => {
    const uncited = ofKind('reference')
      .filter((reference) => graph.citedBy(reference.id).length === 0)
      .map((reference) => reference.id)
    expect(uncited).toEqual([])
  })

  it.skip('has every passage quoted (ticket 12 switches this on)', () => {
    const unquoted = ofKind('passage')
      .filter((passage) => graph.quotedIn(passage.id).length === 0)
      .map((passage) => passage.id)
    expect(unquoted).toEqual([])
  })

  it.skip('gives every work a passage (ticket 12 switches this on)', () => {
    const empty = ofKind('work')
      .filter((work) => !ofKind('passage').some((passage) => passage.work === work.slug))
      .map((work) => work.slug)
    expect(empty).toEqual([])
  })

  it.skip('holds 19 Concepts (ticket 12 switches this on)', () => {
    expect(ofKind('concept')).toHaveLength(19)
  })

  it.skip('holds 18 Questionnaires: 1 preview and 17 coming later (ticket 12 switches this on)', () => {
    const questionnaires = ofKind('questionnaire')
    expect(questionnaires).toHaveLength(18)
    expect(questionnaires.filter(({ status }) => status === 'preview')).toHaveLength(1)
    expect(questionnaires.filter(({ status }) => status === 'coming-later')).toHaveLength(17)
  })

  it.skip('holds 5 topics, 3 reading lists, 1 page and the homepage (ticket 12 switches this on)', () => {
    expect(ofKind('topic')).toHaveLength(5)
    expect(ofKind('resource-list')).toHaveLength(3)
    expect(ofKind('page')).toHaveLength(1)
    expect(ofKind('home')).toHaveLength(1)
  })

  it.skip('holds the glossary entries ticket 05 records (ticket 12 switches this on)', () => {
    expect(ofKind('glossary')).toHaveLength(GLOSSARY_ENTRIES)
  })

  it.skip('pairs each description page’s Concept and Questionnaire (ticket 12 switches this on)', () => {
    const fromPage =
      (url: string) => (record: { provenance: { sources: readonly { url: string }[] } }) =>
        record.provenance.sources.some((source) => source.url === url)
    const problems = DESCRIPTION_PAGES.flatMap((url) => {
      const concept = ofKind('concept').find(fromPage(url))
      const questionnaire = ofKind('questionnaire').find(fromPage(url))
      if (!concept || !questionnaire) return [`${url}: no Concept or no Questionnaire`]
      return concept.questionnaire === questionnaire.slug &&
        questionnaire.concepts.includes(concept.slug)
        ? []
        : [`${url}: ${concept.slug} and ${questionnaire.slug} don’t point at each other`]
    })
    expect(problems).toEqual([])
  })

  it.skip('links the Atman, Jiva, Jagat and Chitta Bhumis entries to their Concepts (ticket 12 switches this on)', () => {
    const problems = ['Atman', 'Jiva', 'Jagat', 'Chitta Bhumis'].flatMap((name) => {
      const entry = ofKind('glossary').find((glossary) => glossary.name.ascii === name)
      if (!entry) return [`no glossary entry “${name}”`]
      if (entry.concept === undefined) return [`“${name}” links to no Concept`]
      return graph.record('concept', entry.concept) ? [] : [`“${name}” links to a missing Concept`]
    })
    expect(problems).toEqual([])
  })
})
