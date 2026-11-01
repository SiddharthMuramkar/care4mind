import {
  concepts,
  type PageView,
  references,
  type ReferenceType,
  type ReferenceView,
  type ResourceListView,
  topics,
  type TopicCard,
} from '@/content'

/** What a Reference is, in words: one, and many (a filter chip). */
export const TYPE_NAMES: Readonly<Record<ReferenceType, { one: string; many: string }>> = {
  'journal-article': { one: 'Journal article', many: 'Journal articles' },
  book: { one: 'Book', many: 'Books' },
  chapter: { one: 'Chapter', many: 'Chapters' },
  thesis: { one: 'Thesis', many: 'Theses' },
  'web-page': { one: 'Web page', many: 'Web pages' },
  'dictionary-entry': { one: 'Dictionary entry', many: 'Dictionary entries' },
  report: { one: 'Report', many: 'Reports' },
  other: { one: 'Other source', many: 'Other sources' },
}

export const counted = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

/** What a Library page holds, counted from its content: its books, courses, entries or sections. */
export function holdingsOf(view: ResourceListView | PageView): { count: number; unit: string } {
  if (view.kind === 'page')
    return {
      count: view.sections.length,
      unit: view.sections.length === 1 ? 'section' : 'sections',
    }
  const items = view.groups.flatMap((group) => group.items)
  const books = items.every((item) => item.type === 'reference' && item.reference.type === 'book')
  const courses = items.every((item) => item.type === 'course')
  const [one, many] = books
    ? ['book', 'books']
    : courses
      ? ['course', 'courses']
      : ['entry', 'entries']
  return { count: items.length, unit: items.length === 1 ? one : many }
}

/** Another site's name, as a link to it says: `archive.org`. */
export const siteOf = (url: string) => new URL(url).hostname.replace(/^www\./, '')

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

/** The letter a Reference is filed under: its first author's (or its title's) initial, or `#`. */
export function initialOf(reference: Pick<ReferenceView, 'authors' | 'title'>): string {
  const first = (reference.authors ?? reference.title).normalize('NFD').charAt(0).toUpperCase()
  return LETTERS.includes(first) ? first : '#'
}

/** A letter's anchor on the References page: `#letter-a`, and `#letter-other` for the rest. */
export const letterId = (letter: string) =>
  `letter-${letter === '#' ? 'other' : letter.toLowerCase()}`

export interface Shelfmark {
  reference: ReferenceView
  /** Its topics: those of the Concepts that cite it, and of a topic that cites it itself. */
  topics: readonly string[]
}

/**
 * Every Reference, as the References page files it: by letter (A to Z, then `#`), each letter
 * in `references.list()`'s order, with the topics a filter picks it out by and the topics and
 * types there are chips for.
 */
export async function catalogue() {
  const [all, topicCards, conceptCards] = await Promise.all([
    references.list(),
    topics.list(),
    concepts.list(),
  ])
  const conceptTopics = new Map(
    await Promise.all(
      conceptCards.map(async ({ slug, topic }) => {
        const concept = await concepts.get(slug)
        return [slug, [topic.slug, ...(concept?.secondaryTopics ?? []).map((t) => t.slug)]] as const
      }),
    ),
  )
  const marked: Shelfmark[] = all.map((reference) => ({
    reference,
    topics: [
      ...new Set(
        reference.citedIn.flatMap((record) =>
          record.kind === 'concept'
            ? (conceptTopics.get(record.id) ?? [])
            : record.kind === 'topic'
              ? [record.id]
              : [],
        ),
      ),
    ],
  }))
  const letters = [...LETTERS, '#'].map((letter) => ({
    letter,
    id: letterId(letter),
    entries: marked.filter(({ reference }) => initialOf(reference) === letter),
  }))
  const used = new Set(marked.flatMap(({ topics }) => topics))
  const types = (Object.keys(TYPE_NAMES) as ReferenceType[])
    .map((type) => ({ type, count: all.filter((reference) => reference.type === type).length }))
    .filter(({ count }) => count > 0)
  return {
    all,
    // `#` only when something is filed there.
    letters: letters.filter(({ letter, entries }) => letter !== '#' || entries.length > 0),
    topics: topicCards.filter(({ slug }) => used.has(slug)) satisfies TopicCard[],
    types,
  }
}
