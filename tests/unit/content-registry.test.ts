import { spawnSync } from 'node:child_process'
import { globSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { features, proposalsPageOn, readFeatures } from '@/config/features'
import { buildGraph, contentGraph, DanglingIdError, graphFor } from '@/content/graph'
import {
  CONTENT_KINDS,
  defineConcept,
  defineGlossaryEntry,
  defineHome,
  definePage,
  definePassage,
  defineQuestionnaire,
  defineReference,
  defineResourceList,
  defineTopic,
  defineWork,
  idOf,
  KIND_FOLDERS,
  type ConceptRecord,
  type ContentKind,
  type ContentRecord,
  type QuestionnaireRecord,
  type RecordOf,
  type ReferenceRecord,
} from '@/content/schema'
import { localSource, registrySource, type ContentSource } from '@/content/source'

// The storage layers of the content module: the record schema, the generated registry, the
// content source (the seam) and the graph that resolves every link once. The graph has no public
// interface of its own until ticket 13's views, so it is tested here, through its own seam, with
// made-up sources. The feature flags the interface reads are tested here too: the flags' own
// test file belongs to front-end-site ticket 04.

const provenance = {
  sources: [{ url: 'https://example.org/page/', retrieved: '2026-10-27' }],
  edits: [],
  flags: [],
}

const concept: ConceptRecord = {
  kind: 'concept',
  slug: 'example',
  name: { term: { iast: 'udāharaṇa', ascii: ['Udaharana'] }, english: 'Example' },
  summary: 'A sentence from the page.',
  topics: { primary: 'mind' },
  verses: [],
  sections: [],
  references: [],
  reviewStatus: 'carried-over-not-reviewed',
  provenance,
}

const questionnaire: QuestionnaireRecord = {
  kind: 'questionnaire',
  slug: 'example',
  title: 'Example Profile',
  sourceTitle: 'Example Profiling',
  status: 'coming-later',
  concepts: ['example'],
  scoring: { status: 'pending', reason: 'No documented scoring rules yet.' },
  heldBack: [],
  reviewStatus: 'carried-over-not-reviewed',
  provenance,
}

const reference: ReferenceRecord = {
  kind: 'reference',
  id: 'author-2024',
  type: 'book',
  title: 'A title',
  asCited: [],
  provenance,
}

function without<T extends object, K extends keyof T>(value: T, key: K): Omit<T, K> {
  return Object.fromEntries(Object.entries(value).filter(([name]) => name !== key)) as Omit<T, K>
}

describe('record schema', () => {
  it('has an identity helper for every kind of record', () => {
    const records = [
      defineConcept(concept),
      defineQuestionnaire(questionnaire),
      defineReference(reference),
      defineTopic({ kind: 'topic', slug: 'mind', name: { english: 'Mind' }, order: 1 }),
      defineWork({
        kind: 'work',
        slug: 'yoga-sutra',
        title: { iast: 'Yoga Sūtra', ascii: ['Yoga Sutra'] },
        locatorLabel: 'Sutra',
        provenance,
      }),
      definePassage({
        kind: 'passage',
        id: 'yoga-sutra/1.2',
        work: 'yoga-sutra',
        locator: '1.2',
        order: [1, 2],
        devanagari: [],
        translations: [],
        provenance,
      }),
      defineGlossaryEntry({
        kind: 'glossary',
        slug: 'atman',
        name: { ascii: 'Atman' },
        provenance,
      }),
      defineResourceList({
        kind: 'resource-list',
        slug: 'textbooks',
        title: 'Text Books',
        groups: [],
        provenance,
      }),
      definePage({
        kind: 'page',
        slug: 'methods',
        title: 'Methods',
        summary: '',
        sections: [],
        provenance,
      }),
      defineHome({
        kind: 'home',
        shloka: { devanagari: 'यद्', iast: 'yad', translation: 'As' },
        intro: '',
        areas: [],
        closing: '',
        provenance,
      }),
    ]
    expect(records.map((record) => record.kind)).toEqual([
      'concept',
      'questionnaire',
      'reference',
      'topic',
      'work',
      'passage',
      'glossary',
      'resource-list',
      'page',
      'home',
    ])
  })

  it('refuses a record with a wrong or missing field when it typechecks', () => {
    // Each line below must fail `pnpm typecheck`; the directive fails it if a line ever passes.
    // @ts-expect-error a Concept needs a summary
    defineConcept(without(concept, 'summary'))
    // @ts-expect-error a Concept is named by a Sanskrit term, an English name or both
    defineConcept({ ...concept, name: {} })
    // @ts-expect-error a record's kind matches its helper
    defineConcept({ ...concept, kind: 'topic' })
    // @ts-expect-error a record has no fields the schema doesn't list
    defineConcept({ ...concept, colour: 'saffron' })
    // @ts-expect-error a review status is one of three
    defineConcept({ ...concept, reviewStatus: 'approved' })
    // @ts-expect-error scoring stays pending until planning tickets 26 and 28 supply rules
    defineQuestionnaire({ ...questionnaire, scoring: { status: 'scored', reason: '' } })
    // @ts-expect-error a Questionnaire lists what it held back, even when nothing was
    defineQuestionnaire(without(questionnaire, 'heldBack'))
    // @ts-expect-error a Reference needs a title (FR-03)
    defineReference(without(reference, 'title'))
    // @ts-expect-error a Reference's type is one of the listed types
    defineReference({ ...reference, type: 'blog' })
    expect(concept.kind).toBe('concept')
  })
})

const REGISTRY_SCRIPT = resolve('scripts/content/registry.mjs')
const REGISTRY_COMMAND = 'node scripts/content/registry.mjs'

/** Runs the registry script on a folder laid out like the repo. */
function runRegistry(root: string, ...args: string[]) {
  return spawnSync(process.execPath, [REGISTRY_SCRIPT, '--root', root, ...args], {
    encoding: 'utf8',
  })
}

describe('the registry script', () => {
  let root = ''

  function addRecordFile(path: string) {
    const file = join(root, 'src/content/data', path)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, "export default { kind: 'topic' }\n")
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'content-registry-'))
    addRecordFile('topics/mind.ts')
  })

  afterEach(() => rmSync(root, { recursive: true, force: true }))

  it('fails --check when the registry is missing, naming the command that writes it', () => {
    const check = runRegistry(root, '--check')
    expect(check.status).toBe(1)
    expect(check.stderr).toContain(REGISTRY_COMMAND)
  })

  it('passes --check once it has written the registry', () => {
    expect(runRegistry(root).status).toBe(0)
    expect(runRegistry(root, '--check').status).toBe(0)
  })

  it('fails --check when a record file is added without running it again', () => {
    runRegistry(root)
    addRecordFile('passages/yoga-sutra/1.2.ts')
    const check = runRegistry(root, '--check')
    expect(check.status).toBe(1)
    expect(check.stderr).toContain(REGISTRY_COMMAND)
  })

  it('fails --check when a record file is removed without running it again', () => {
    addRecordFile('topics/self.ts')
    runRegistry(root)
    rmSync(join(root, 'src/content/data/topics/self.ts'))
    expect(runRegistry(root, '--check').status).toBe(1)
  })
})

describe('the content source', () => {
  it('reads every record of a kind from the registry it is given', async () => {
    const source = registrySource(async () => ({
      registry: [
        { path: 'concepts/example', record: concept },
        { path: 'references/author-2024', record: reference },
        { path: 'questionnaires/example', record: questionnaire },
      ],
    }))
    expect(await source.records('concept')).toEqual([concept])
    expect(await source.records('reference')).toEqual([reference])
    expect(await source.records('topic')).toEqual([])
  })

  it('fails with the command that writes the registry when the registry is missing', async () => {
    const missing = Object.assign(new Error("Cannot find module './generated/registry'"), {
      code: 'ERR_MODULE_NOT_FOUND',
    })
    const source = registrySource(() => Promise.reject(missing))
    await expect(source.records('concept')).rejects.toThrow(REGISTRY_COMMAND)
  })

  it('passes on any other failure as it is', async () => {
    const source = registrySource(() => Promise.reject(new Error('A record file threw.')))
    await expect(source.records('concept')).rejects.toThrow('A record file threw.')
  })
})

/** A made-up content source holding the given records. */
function sourceOf(...records: ContentRecord[]): ContentSource {
  return {
    async records<K extends ContentKind>(kind: K) {
      return records.filter((record): record is RecordOf<K> => record.kind === kind)
    },
  }
}

describe('the graph', () => {
  const mind = defineTopic({ kind: 'topic', slug: 'mind', name: { english: 'Mind' }, order: 1 })
  const self = defineTopic({ kind: 'topic', slug: 'self', name: { english: 'Self' }, order: 2 })
  const yogaSutra = defineWork({
    kind: 'work',
    slug: 'yoga-sutra',
    title: { iast: 'Yoga Sūtra', ascii: ['Yoga Sutra'] },
    locatorLabel: 'Sutra',
    provenance,
  })
  const ys130 = definePassage({
    kind: 'passage',
    id: 'yoga-sutra/1.30',
    work: 'yoga-sutra',
    locator: '1.30',
    order: [1, 30],
    devanagari: [],
    translations: [{ id: 'first', text: 'Disease, mental laziness, doubt …' }],
    provenance,
  })
  const tomar = defineReference({
    ...reference,
    id: 'tomar-2024',
    authors: 'Tomar, V. S.',
    year: '2024',
  })
  const schleim = defineReference({
    ...reference,
    id: 'schleim-2025',
    authors: 'Schleim, S.',
    year: '2025',
  })
  const obstacles = defineConcept({
    ...concept,
    slug: 'obstacles',
    topics: { primary: 'mind', also: ['self'] },
    verses: [{ passage: 'yoga-sutra/1.30', translation: 'first' }],
    sections: [
      {
        id: 'what',
        heading: 'What it is',
        blocks: [{ kind: 'paragraph', text: 'Nine obstacles (Tomar, 2024; Schleim, 2025).' }],
      },
    ],
    references: ['tomar-2024', 'schleim-2025'],
  })
  const steadiness = defineConcept({
    ...concept,
    slug: 'steadiness',
    topics: { primary: 'self' },
    sections: [
      {
        id: 'verse',
        heading: 'A verse',
        blocks: [
          {
            kind: 'term',
            id: 'sthiti',
            term: { iast: 'sthiti', ascii: [] },
            blocks: [{ kind: 'verse', quote: { passage: 'yoga-sutra/1.30' } }],
          },
          { kind: 'paragraph', text: 'Steady (Tomar, 2024), unsteady (Rao, 2001).' },
        ],
      },
    ],
    references: ['tomar-2024'],
  })
  const profile = defineQuestionnaire({
    ...questionnaire,
    concepts: ['obstacles'],
    source: 'schleim-2025',
  })
  const textbooks = defineResourceList({
    kind: 'resource-list',
    slug: 'textbooks',
    title: 'Text Books',
    groups: [
      { id: 'all', heading: 'All', items: [{ type: 'reference', reference: 'schleim-2025' }] },
    ],
    provenance,
  })
  const world = [
    mind,
    self,
    yogaSutra,
    ys130,
    tomar,
    schleim,
    obstacles,
    steadiness,
    profile,
    textbooks,
  ]

  it('finds each record by its kind and id', async () => {
    const graph = await buildGraph(sourceOf(...world))
    expect(graph.record('concept', 'obstacles')).toBe(obstacles)
    expect(graph.record('passage', 'yoga-sutra/1.30')).toBe(ys130)
    expect(graph.record('topic', 'obstacles')).toBeUndefined()
    expect(graph.records('topic')).toEqual([mind, self])
  })

  it('lists the records that cite a Reference', async () => {
    const graph = await buildGraph(sourceOf(...world))
    expect(graph.citedBy('tomar-2024')).toEqual([
      { kind: 'concept', id: 'obstacles' },
      { kind: 'concept', id: 'steadiness' },
    ])
    expect(graph.citedBy('schleim-2025')).toEqual([
      { kind: 'concept', id: 'obstacles' },
      { kind: 'questionnaire', id: 'example' },
      { kind: 'resource-list', id: 'textbooks' },
    ])
  })

  it('lists where a passage is quoted, with the translation each quote shows', async () => {
    const graph = await buildGraph(sourceOf(...world))
    expect(graph.quotedIn('yoga-sutra/1.30')).toEqual([
      { record: { kind: 'concept', id: 'obstacles' }, translation: 'first' },
      { record: { kind: 'concept', id: 'steadiness' } },
    ])
  })

  it('lists the Concepts in each topic and the Concepts quoting each work', async () => {
    const graph = await buildGraph(sourceOf(...world))
    expect(graph.conceptsInTopic('mind')).toEqual({ primary: ['obstacles'], also: [] })
    expect(graph.conceptsInTopic('self')).toEqual({ primary: ['steadiness'], also: ['obstacles'] })
    expect(graph.conceptsQuotingWork('yoga-sutra')).toEqual(['obstacles', 'steadiness'])
  })

  it('resolves each in-text citation to one of the record’s own References', async () => {
    const graph = await buildGraph(sourceOf(...world))
    expect(graph.citations('concept', 'obstacles')).toEqual([
      { text: 'Tomar, 2024', reference: 'tomar-2024' },
      { text: 'Schleim, 2025', reference: 'schleim-2025' },
    ])
    expect(graph.citations('concept', 'steadiness')).toEqual([
      { text: 'Tomar, 2024', reference: 'tomar-2024' },
      { text: 'Rao, 2001' },
    ])
  })

  it('refuses a dangling id, naming the record, the field and the missing id', async () => {
    const broken = defineConcept({
      ...obstacles,
      verses: [{ passage: 'yoga-sutra/9.99' }],
      references: ['tomar-2024', 'nobody-1999'],
    })
    const others = world.filter((record) => record !== obstacles)
    const build = buildGraph(sourceOf(...others, broken))
    await expect(build).rejects.toThrow(DanglingIdError)
    await expect(build).rejects.toThrow(
      'concept “obstacles”, field verses[0].passage: no passage “yoga-sutra/9.99”',
    )
    await expect(build).rejects.toThrow(
      'concept “obstacles”, field references[1]: no reference “nobody-1999”',
    )
  })

  it('refuses an id of the wrong kind', async () => {
    const wrongKind = defineConcept({ ...steadiness, topics: { primary: 'obstacles' } })
    const others = world.filter((record) => record !== steadiness)
    await expect(buildGraph(sourceOf(...others, wrongKind))).rejects.toThrow(
      'concept “steadiness”, field topics.primary: no topic “obstacles”',
    )
  })

  it('refuses a translation its passage doesn’t have', async () => {
    const wrongTranslation = defineConcept({
      ...obstacles,
      verses: [{ passage: 'yoga-sutra/1.30', translation: 'second' }],
    })
    const others = world.filter((record) => record !== obstacles)
    await expect(buildGraph(sourceOf(...others, wrongTranslation))).rejects.toThrow(
      'concept “obstacles”, field verses[0].translation: no translation “second” in passage “yoga-sutra/1.30”',
    )
  })

  describe('a Questionnaire form', () => {
    const item = (id: string) => ({ id, text: 'A made-up statement.', responseSet: 'yes' })
    const part = (id: string, ...items: string[]) => ({
      id,
      title: 'A part',
      instructions: 'Answer each.',
      items: items.map(item),
    })
    const withParts = (...parts: ReturnType<typeof part>[]) =>
      defineQuestionnaire({ ...profile, form: { responseSets: { yes: ['Yes', 'No'] }, parts } })
    const others = world.filter((record) => record !== profile)

    it('refuses an item id repeated within the form', async () => {
      const build = buildGraph(sourceOf(...others, withParts(part('a', 'q1'), part('b', 'q1'))))
      await expect(build).rejects.toThrow(DanglingIdError)
      await expect(build).rejects.toThrow(
        'questionnaire “example”, field form.parts[1].items[0].id: item “q1” repeated',
      )
    })

    it('refuses a repeated part id', async () => {
      const build = buildGraph(sourceOf(...others, withParts(part('a', 'q1'), part('a', 'q2'))))
      await expect(build).rejects.toThrow(
        'questionnaire “example”, field form.parts[1].id: part “a” repeated',
      )
    })
  })

  it('is built once per source', async () => {
    const source = sourceOf(...world)
    expect(await graphFor(source)).toBe(await graphFor(source))
    expect(await contentGraph()).toBe(await contentGraph())
  })
})

describe('feature flags (D16, D20)', () => {
  const allOn = { questionnairePreview: true, conceptMap: true, devanagariFirst: true }
  const allOff = { questionnairePreview: false, conceptMap: false, devanagariFirst: false }

  it('switches every flag on in local runs and Vercel previews, and off in production', () => {
    expect(readFeatures({})).toEqual(allOn)
    expect(readFeatures({ VERCEL_ENV: 'development' })).toEqual(allOn)
    expect(readFeatures({ VERCEL_ENV: 'preview' })).toEqual(allOn)
    expect(readFeatures({ VERCEL_ENV: 'production' })).toEqual(allOff)
  })

  it('lets each flag’s own variable force it on in production', () => {
    const production = { VERCEL_ENV: 'production' }
    expect(readFeatures({ ...production, FEATURE_QUESTIONNAIRE_PREVIEW: '1' })).toEqual({
      ...allOff,
      questionnairePreview: true,
    })
    expect(readFeatures({ ...production, FEATURE_CONCEPT_MAP: '1' })).toEqual({
      ...allOff,
      conceptMap: true,
    })
    expect(readFeatures({ ...production, FEATURE_DEVANAGARI_FIRST: '1' })).toEqual({
      ...allOff,
      devanagariFirst: true,
    })
  })

  it('lets each flag’s own variable force it off anywhere else', () => {
    expect(readFeatures({ FEATURE_QUESTIONNAIRE_PREVIEW: '0' })).toEqual({
      ...allOn,
      questionnairePreview: false,
    })
    expect(readFeatures({ VERCEL_ENV: 'preview', FEATURE_CONCEPT_MAP: '0' })).toEqual({
      ...allOn,
      conceptMap: false,
    })
    expect(readFeatures({ FEATURE_DEVANAGARI_FIRST: '0' })).toEqual({
      ...allOn,
      devanagariFirst: false,
    })
  })

  it('refuses an override that is neither 1 nor 0', () => {
    expect(() => readFeatures({ FEATURE_CONCEPT_MAP: 'true' })).toThrow('FEATURE_CONCEPT_MAP')
  })

  it('shows the proposals page while either proposal is on, with no flag of its own', () => {
    expect(proposalsPageOn(allOn)).toBe(true)
    expect(proposalsPageOn({ ...allOff, conceptMap: true })).toBe(true)
    expect(proposalsPageOn({ ...allOff, devanagariFirst: true })).toBe(true)
    expect(proposalsPageOn({ ...allOn, conceptMap: false, devanagariFirst: false })).toBe(false)
  })

  it('reads the flags once, from this process’s environment', () => {
    expect(features).toEqual(readFeatures(process.env))
  })
})

describe('the record files', () => {
  const DATA = 'src/content/data'
  const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  async function recordFiles() {
    const paths = globSync(`${DATA}/**/*.ts`).map((file) =>
      relative(DATA, file).split(sep).join('/').replace(/\.ts$/, ''),
    )
    return Promise.all(
      paths.sort().map(async (path) => {
        const file = (await import(resolve(DATA, `${path}.ts`))) as { default: ContentRecord }
        return { path, record: file.default }
      }),
    )
  }

  it('each hold one record of their folder’s kind, named by its id', async () => {
    const problems: string[] = []
    for (const { path, record } of await recordFiles()) {
      const [folder, ...name] = path.split('/')
      if (KIND_FOLDERS[record.kind] !== folder)
        problems.push(`${path}: a ${record.kind} record in the ${folder} folder`)
      if (idOf(record) !== name.join('/')) problems.push(`${path}: its id is “${idOf(record)}”`)
    }
    expect(problems).toEqual([])
  })

  it('give each record an id that is unique within its kind and follows its kind’s rule', async () => {
    const seen = new Set<string>()
    const problems: string[] = []
    for (const { path, record } of await recordFiles()) {
      const id = idOf(record)
      if (seen.has(`${record.kind}:${id}`))
        problems.push(`${path}: a second ${record.kind} “${id}”`)
      seen.add(`${record.kind}:${id}`)
      const fits =
        record.kind === 'passage'
          ? id === `${record.work}/${record.locator}` && SLUG.test(record.work)
          : SLUG.test(id)
      if (!fits) problems.push(`${path}: “${id}” breaks the id rule for a ${record.kind}`)
    }
    expect(problems).toEqual([])
  })

  it('are all listed in the registry on disk', () => {
    const check = runRegistry(process.cwd(), '--check')
    expect(check.stderr).toBe('')
    expect(check.status).toBe(0)
  })

  it('are what the local source reads', async () => {
    const files = await recordFiles()
    const read = await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))
    expect(read.flat()).toHaveLength(files.length)
    expect(await localSource.records('concept')).toContainEqual(
      files.find(({ path }) => path === 'concepts/vikshepa')?.record,
    )
  })
})
