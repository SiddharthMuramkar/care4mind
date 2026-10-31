import { beforeAll, describe, expect, it } from 'vitest'

import { contentGraph, type ContentGraph } from '@/content/graph'
import { CONTENT_KINDS, type ContentRecord, type RecordOf } from '@/content/schema'
import { localSource } from '@/content/source'

// Rules that can only pass once all of content v1 has arrived (settled rule 11). The census
// tickets landed References before the Concepts that cite them, and ticket 01 landed five topics
// with one Concept between them, so ticket 01 wrote each check below switched off. Ticket 12,
// the fidelity sweep, switched them on once the migration was complete: from here on they hold.

/** Modern constructs a Concept's keywords never name, as stems at the start of a word, so 'stressed' and 'self esteem' are refused but 'distress' is not: a construct reaches a Concept only through an explained link. */
const namesModernConstruct = (keyword: string) =>
  /\b(anxi|depress|stress|trauma|burnout|resilien|self[- ]?(esteem|worth)|procrastinat)/.test(
    keyword,
  )

/** The number of glossary entries ticket 05 records in its Comments, confirmed by ticket 12. */
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

// Read once, with room for a busy machine: every check below runs over the whole content.
beforeAll(async () => {
  records = (await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))).flat()
  graph = await contentGraph()
}, 60_000)

function ofKind<K extends ContentRecord['kind']>(kind: K): RecordOf<K>[] {
  return records.filter((record): record is RecordOf<K> => record.kind === kind)
}

describe('content v1, complete', () => {
  it('gives every topic a Concept', () => {
    const empty = ofKind('topic')
      .filter((topic) => graph.conceptsInTopic(topic.slug).primary.length === 0)
      .map((topic) => topic.slug)
    expect(empty).toEqual([])
  })

  it('has every Reference cited by a record', () => {
    const uncited = ofKind('reference')
      .filter((reference) => graph.citedBy(reference.id).length === 0)
      .map((reference) => reference.id)
    expect(uncited).toEqual([])
  })

  it('has every passage quoted', () => {
    const unquoted = ofKind('passage')
      .filter((passage) => graph.quotedIn(passage.id).length === 0)
      .map((passage) => passage.id)
    expect(unquoted).toEqual([])
  })

  it('gives every work a passage', () => {
    const empty = ofKind('work')
      .filter((work) => !ofKind('passage').some((passage) => passage.work === work.slug))
      .map((work) => work.slug)
    expect(empty).toEqual([])
  })

  it('holds 19 Concepts', () => {
    expect(ofKind('concept')).toHaveLength(19)
  })

  it('holds 18 Questionnaires: 1 preview and 17 coming later', () => {
    const questionnaires = ofKind('questionnaire')
    expect(questionnaires).toHaveLength(18)
    expect(questionnaires.filter(({ status }) => status === 'preview')).toHaveLength(1)
    expect(questionnaires.filter(({ status }) => status === 'coming-later')).toHaveLength(17)
  })

  it('holds 5 topics, 3 reading lists, 1 page and the homepage', () => {
    expect(ofKind('topic')).toHaveLength(5)
    expect(ofKind('resource-list')).toHaveLength(3)
    expect(ofKind('page')).toHaveLength(1)
    expect(ofKind('home')).toHaveLength(1)
  })

  it('holds the glossary entries ticket 05 records', () => {
    expect(ofKind('glossary')).toHaveLength(GLOSSARY_ENTRIES)
  })

  it('pairs each description page’s Concept and Questionnaire', () => {
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

  it('links the Atman, Jiva, Jagat and Chitta Bhumis entries to their Concepts', () => {
    const problems = ['Atman', 'Jiva', 'Jagat', 'Chitta Bhumis'].flatMap((name) => {
      const entry = ofKind('glossary').find((glossary) => glossary.name.ascii === name)
      if (!entry) return [`no glossary entry “${name}”`]
      if (entry.concept === undefined) return [`“${name}” links to no Concept`]
      return graph.record('concept', entry.concept) ? [] : [`“${name}” links to a missing Concept`]
    })
    expect(problems).toEqual([])
  })

  it('gives every Concept drafted keywords that name no modern construct or condition', () => {
    const problems = ofKind('concept').flatMap((concept) => [
      ...(concept.keywords.length === 0 ? [`${concept.slug} has no keywords`] : []),
      ...(concept.provenance.drafted?.includes('keywords')
        ? []
        : [`${concept.slug} doesn’t name keywords as drafted`]),
      ...concept.keywords
        .filter((keyword) => keyword !== keyword.toLowerCase().trim() || keyword === '')
        .map((keyword) => `${concept.slug}: “${keyword}” isn’t a plain lowercase word`),
      ...concept.keywords
        .filter((keyword) => namesModernConstruct(keyword))
        .map((keyword) => `${concept.slug}: “${keyword}” names a modern construct or condition`),
      ...concept.keywords
        .filter((keyword, index) => concept.keywords.indexOf(keyword) !== index)
        .map((keyword) => `${concept.slug}: “${keyword}” is listed twice`),
    ])
    expect(problems).toEqual([])
  })
})
