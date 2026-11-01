import { describe, expect, it } from 'vitest'

import { home, library, references, type ResourceListView } from '@/content'
import { CONTENT_KINDS, type ContentRecord, type Provenance, localSource } from '@/content/testing'

// Content-v1 ticket 07: the current site's scattered reading lists as three lists (Text Books,
// Inspirational Books and Courses), the Methods page, and a real destination for each homepage
// area. Read through the public interface, as a page would, and through the content source for
// what only a record keeps (its provenance).

/** A reading list of the Library, as its page would get it. */
async function readingList(slug: string): Promise<ResourceListView> {
  const view = await library.get(slug)
  if (view?.kind !== 'resource-list') throw new Error(`No reading list “${slug}”.`)
  return view
}

/** The Reference ids of a group's books, in its order. */
const booksOf = (group: ResourceListView['groups'][number]) =>
  group.items.flatMap((item) => (item.type === 'reference' ? [item.reference.id] : []))

/** A record's provenance: its own, or a topic introduction's (a topic without one has none). */
const provenanceOf = (record: ContentRecord): Pick<Provenance, 'sources'> =>
  record.kind === 'topic' ? (record.intro?.provenance ?? { sources: [] }) : record.provenance

describe('Textbooks', () => {
  it('merges both Text Books pages, Indian Philosophy and Positive Psychology under the pages’ own headings', async () => {
    const list = await readingList('textbooks')
    expect(list.title).toBe('Textbooks')
    expect(
      list.groups.map(({ id, heading, items }) => ({ id, heading, books: items.length })),
    ).toEqual([
      { id: 'indian-and-western-textbooks', heading: 'Indian and Western Textbooks', books: 11 },
      {
        id: 'indian-psychology-and-philosophy',
        heading: 'Indian Psychology & Philosophy Books',
        books: 7,
      },
      { id: 'positive-psychology', heading: 'Positive Psychology', books: 2 },
    ])
    const books = list.groups.flatMap(booksOf)
    expect(new Set(books).size).toBe(books.length)
  })

  it('includes the five books only /text-books-2-2/ lists', async () => {
    const [indianAndWestern] = (await readingList('textbooks')).groups
    expect(indianAndWestern && booksOf(indianAndWestern)).toEqual(
      expect.arrayContaining([
        'galotti-2008',
        'stillings-1987',
        'lopez-2021',
        'rao-paranjpe-2016',
        'parker-2015',
      ]),
    )
  })

  it('keeps both Positive Psychology books’ descriptions as their annotations', async () => {
    const group = (await readingList('textbooks')).groups.find(
      ({ id }) => id === 'positive-psychology',
    )
    expect(
      group?.items.map((item) =>
        item.type === 'reference'
          ? [item.reference.id, item.annotation?.split(' ').slice(0, 3).join(' ')]
          : [],
      ),
    ).toEqual([
      ['compton', 'This brief paperback'],
      ['boniwell', 'Discover the latest'],
    ])
  })

  it('gives the merged pages’ groups the anchors their old addresses lead to', async () => {
    const hrefs = (await readingList('textbooks')).groups.map(({ href }) => href)
    expect(hrefs).toContain('/library/textbooks/#indian-psychology-and-philosophy')
    expect(hrefs).toContain('/library/textbooks/#positive-psychology')
  })
})

describe('Inspirational books', () => {
  it('lists the page’s books, each with its description, and /text-books/’s inspirational section once', async () => {
    const list = await readingList('inspirational-books')
    expect(list.title).toBe('Inspirational books')
    const items = list.groups.flatMap(({ items }) => items)
    expect(items).toHaveLength(13)
    expect(items.filter((item) => item.type !== 'reference' || !item.annotation)).toEqual([])
    const books = list.groups.flatMap(booksOf)
    expect(new Set(books).size).toBe(13)
    expect(books).toEqual(
      expect.arrayContaining([
        'gupta-2013',
        'mascaro-1994-gita',
        'mascaro-1994-upanisads',
        'nisargadatta-2008',
        'yogananda-1946-1975',
        'gandhi-1993',
        'frankl-2008',
        'khalil-2001',
      ]),
    )
  })
})

describe('Courses in India', () => {
  /** The courses on the list, in its order. */
  const coursesOf = (list: ResourceListView) =>
    list.groups.flatMap(({ items }) =>
      items.flatMap((item) => (item.type === 'course' ? [item] : [])),
    )

  it('lists the five institutes and the IGNOU and NIOS courses, each with its provider, name, description and link', async () => {
    const list = await readingList('courses')
    expect(list.title).toBe('Courses in India')
    const courses = coursesOf(list)
    expect(courses.map(({ provider }) => provider)).toEqual([
      'MIT School of Vedic Sciences',
      'Fatima Mata National College',
      'Delhi University',
      'Banaras Hindu University',
      'KIIT University',
      'IGNOU',
      'IGNOU',
      'NIOS',
    ])
    expect(courses.map(({ city }) => city)).toEqual([
      'Pune, Maharashtra',
      'Kollam, Kerala',
      undefined,
      undefined,
      'Bhubaneshwar',
      undefined,
      undefined,
      undefined,
    ])
    expect(courses.slice(5).map(({ name }) => name)).toEqual([
      'B.A. in Psychology (UG)',
      'M.A. in Psychology (PG)',
      'Secondary Level Psychology',
    ])
    expect(courses.filter(({ name, description, url }) => !name || !description || !url)).toEqual(
      [],
    )
  })

  it('keeps the link labels out, as interface text', async () => {
    const labels = /course details|department website|learn more|ug psychology|pg psychology/i
    const offenders = coursesOf(await readingList('courses')).filter(
      ({ provider, name, description = '' }) => labels.test(`${provider} ${name} ${description}`),
    )
    expect(offenders).toEqual([])
  })

  it('keeps KIIT’s link to ksrm.ac.in as given, flagged for the Research editor', async () => {
    const kiit = coursesOf(await readingList('courses')).find(({ provider }) =>
      provider.startsWith('KIIT'),
    )
    expect(new URL(kiit?.url ?? 'about:blank').hostname).toBe('ksrm.ac.in')
    const [record] = (await localSource.records('resource-list')).filter(
      ({ slug }) => slug === 'courses',
    )
    expect(
      record?.provenance.flags.some(
        ({ for: role, note }) => role === 'research-editor' && note.includes('ksrm.ac.in'),
      ),
    ).toBe(true)
  })
})

describe('Therapy approaches', () => {
  it('stays a page, with the page’s title, summary and sections, and its two tables as table blocks', async () => {
    const page = await library.get('methods')
    if (page?.kind !== 'page') throw new Error('No page “methods”.')
    expect(page.title).toBe('Therapy approaches')
    expect(page.summary).toMatch(/^Psychotherapy, also known as talk therapy, /)
    expect(page.sections.map(({ heading }) => heading)).toEqual([
      'Therapeutic Methods in Mental Treatment',
      'Psychoanalysis / Psychodynamic Therapy',
      'Specific Types of Psychotherapy',
      'Delivery Formats',
      'Key Elements of Effective Psychotherapy',
    ])
    const tables = page.sections.flatMap(({ blocks }) =>
      blocks.flatMap((block) => (block.kind === 'table' ? [block] : [])),
    )
    expect(tables.map(({ columns, rows }) => ({ columns, rows: rows.length }))).toEqual([
      { columns: ['Approach', 'Description'], rows: 5 },
      { columns: ['Therapy Type', 'Description'], rows: 8 },
    ])
  })

  it('opens its first section without repeating the summary, and captions the five approaches as five', async () => {
    const page = await library.get('methods')
    if (page?.kind !== 'page') throw new Error('No page “methods”.')
    const [first] = page.sections.flatMap(({ blocks }) =>
      blocks.flatMap((block) => (block.kind === 'paragraph' ? [block] : [])),
    )
    expect(JSON.stringify(first)).not.toContain(page.summary)
    const [approaches] = page.sections.flatMap(({ blocks }) =>
      blocks.flatMap((block) => (block.kind === 'table' ? [block] : [])),
    )
    expect(approaches?.caption).toBe('Five approaches to psychotherapy')
  })
})

describe('the Library', () => {
  it('holds the three reading lists and the Therapy approaches page', async () => {
    expect((await library.list()).map(({ kind, slug }) => `${kind}/${slug}`).sort()).toEqual([
      'page/methods',
      'resource-list/courses',
      'resource-list/inspirational-books',
      'resource-list/textbooks',
    ])
  })

  it('resolves every item on a reading list to a Reference, unless it is a course', async () => {
    const known = new Set((await references.list()).map(({ id }) => id))
    const lists = await Promise.all(
      ['textbooks', 'inspirational-books', 'courses'].map(readingList),
    )
    const items = lists.flatMap(({ slug, groups }) =>
      groups.flatMap(({ items }) => items.map((item) => ({ slug, item }))),
    )
    expect(items.length).toBe(20 + 13 + 8)
    expect(
      items.filter(({ item }) => item.type !== 'course' && !known.has(item.reference.id)),
    ).toEqual([])
    expect(
      items.filter(({ slug, item }) => (slug === 'courses') !== (item.type === 'course')),
    ).toEqual([])
  })

  it('makes no record from the empty pages, /resources/ and /webpages-and-av-material/', async () => {
    const empty = [
      'https://care4mind.org/resources/',
      'https://care4mind.org/webpages-and-av-material/',
    ]
    const records = (
      await Promise.all(CONTENT_KINDS.map((kind) => localSource.records(kind)))
    ).flat()
    const fromThem = records.filter((record) =>
      provenanceOf(record).sources.some(({ url }) => empty.includes(url)),
    )
    expect(fromThem).toEqual([])
  })

  it('lists the images left out of each reading list (D18)', async () => {
    const lists = await localSource.records('resource-list')
    expect(
      lists
        .filter(({ provenance }) => !provenance.edits.some((edit) => /\bimages?\b/.test(edit)))
        .map(({ slug }) => slug),
    ).toEqual([])
  })
})

describe('the homepage', () => {
  it('leads five of its six areas to their new homes, and Applications, which led to the dead questionnaire app, nowhere', async () => {
    const { areas } = await home.get()
    expect(areas.map(({ title, href }) => [title, href])).toEqual([
      ['Concepts', '/concepts/'],
      ['Techniques', '/library/methods/'],
      ['Resources', '/library/'],
      ['Tradition and Texts', '/library/textbooks/'],
      ['Applications', undefined],
      ['Research', '/library/courses/'],
    ])
  })

  it('flags Applications, Tradition and Texts and Research for the Project owner', async () => {
    const [record] = await localSource.records('home')
    const notes = (record?.provenance.flags ?? [])
      .filter(({ for: role }) => role === 'project-owner')
      .map(({ note }) => note)
    for (const area of ['Applications', 'Tradition and Texts', 'Research'])
      expect(
        notes.some((note) => note.includes(`${area} area`)),
        area,
      ).toBe(true)
  })
})
