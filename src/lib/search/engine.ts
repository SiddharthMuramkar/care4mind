/**
 * The search engine (design A4, D10): pure TypeScript over the site's search documents.
 * `buildIndex()` packs them into compact JSON, once, with the site; `query()` finds any spelling
 * in it, in this order: exact, prefix, phonetic, then fuzzy. Pages reach it only through
 * `search()` (./search.ts), so a content back end can answer in its place.
 */
import type { SearchDocument, SearchKind } from '@/content'

import { editDistance, fold, isLatin, phoneticKey, words, writtenWords } from './normalise'

/** Where a hit matched, most telling first. */
export type SearchField = 'names' | 'title' | 'keywords' | 'people' | 'excerpt'

/** One thing found (design A4), with the field and the spelling that found it. */
export interface SearchHit {
  id: string
  kind: SearchKind
  title: string
  href: string
  matched: { field: SearchField; variant: string }
  /** What it sits in: a term's Concept, a passage's work. */
  parent?: string
  score: number
}

/**
 * One document, packed: id, kind, title, href, parent (or null), names, keywords, people, and the
 * excerpt's own words (those no other field has), space-separated.
 */
type Row = [
  id: string,
  kind: SearchKind,
  title: string,
  href: string,
  parent: string | null,
  names: string[],
  keywords: string[],
  people: string[],
  excerpt: string,
]

/** The packed index, as /search-index.json serves it. */
export interface SearchIndex {
  version: 1
  rows: Row[]
}

/** The address the browser loads the index from (src/app/search-index.json). */
export const INDEX_PATH = '/search-index.json'

/** Each kind in the order a tie is broken, and the order groups of equal weight are shown. */
export const KIND_ORDER: readonly SearchKind[] = [
  'concept',
  'term',
  'topic',
  'glossary',
  'work',
  'passage',
  'questionnaire',
  'reference',
  'library-item',
  'page',
]

const WEIGHT: Record<SearchField, number> = {
  names: 10,
  title: 8,
  keywords: 4,
  people: 4,
  excerpt: 1,
}

/** How well a word matched, before its field's weight. */
const EXACT = 1
const PHONETIC = 0.6
const PHONETIC_PREFIX = 0.45
/** One typo, or two. */
const FUZZY = (distance: number) => (distance === 1 ? 0.4 : 0.3)

/** The typos forgiven in a word: one in 5–7 letters, two from 8. */
const editsFor = (word: string) =>
  !isLatin(word) ? 0 : word.length >= 8 ? 2 : word.length >= 5 ? 1 : 0

/** A prefix scores between 0.5 and 0.75: higher the more of the word it already has. */
const prefixQuality = (typed: string, word: string) => 0.5 + 0.25 * (typed.length / word.length)

/** Words too common to find anything by, left out of excerpts. */
const COMMON = new Set(
  'about after also and are but can from has have into its not one our than that the their them then there these they this those through was were what when which while who will with within you your'.split(
    ' ',
  ),
)

/** Packs the search documents into the index: compact JSON, built once with the site. */
export function buildIndex(documents: readonly SearchDocument[]): SearchIndex {
  return {
    version: 1,
    rows: documents.map((document): Row => {
      const { id, kind, title, href, parent, names, keywords, people, excerpt } = document
      // The excerpt counts only for words no other field has, each once, and no common ones.
      const known = new Set([title, ...names, ...keywords, ...people].flatMap(words))
      const own: string[] = []
      for (const word of writtenWords(excerpt)) {
        const folded = fold(word)
        if (folded.length < 3 || COMMON.has(folded) || known.has(folded)) continue
        known.add(folded)
        own.push(word)
      }
      return [
        id,
        kind,
        title,
        href,
        parent ?? null,
        [...names],
        [...keywords],
        [...people],
        own.join(' '),
      ]
    }),
  }
}

const FIELDS = ['names', 'title', 'keywords', 'people', 'excerpt'] as const

/** Where a word or phrase occurs: a document, a field, and which of the field's values. */
interface Posting {
  doc: number
  field: SearchField
  value: number
  /** How many words the value has. */
  size: number
}

/** A word (or a phrase run together) the index holds, with its phonetic key. */
interface Entry {
  text: string
  key: string
  /** Whether a name, title, keyword or author has it: only those are matched by sound or typo. */
  named: boolean
  latin: boolean
}

interface Document {
  row: Row
  /** Each field's values as written: an excerpt's are its single words. */
  values: Record<SearchField, readonly string[]>
}

/** The index unpacked for matching, made once per index. */
interface Prepared {
  documents: Document[]
  /** Every folded word, and where it occurs. */
  postings: Map<string, Posting[]>
  words: Entry[]
  /** Values of more than one word, run together ("brahma vihara" → brahmavihara), and where. */
  phrases: Map<string, Posting[]>
  runs: Entry[]
}

const prepared = new WeakMap<SearchIndex, Prepared>()

/** Unpacks an index for matching ahead of its first query, so typing stays quick. */
export function warmIndex(index: SearchIndex): void {
  prepare(index)
}

const entries = (map: Map<string, Posting[]>): Entry[] =>
  [...map].map(([text, list]) => ({
    text,
    key: phoneticKey(text),
    named: list.some(({ field }) => field !== 'excerpt'),
    latin: isLatin(text),
  }))

function prepare(index: SearchIndex): Prepared {
  const known = prepared.get(index)
  if (known) return known
  const postings = new Map<string, Posting[]>()
  const phrases = new Map<string, Posting[]>()
  const add = (map: Map<string, Posting[]>, key: string, posting: Posting) => {
    const list = map.get(key)
    if (list) list.push(posting)
    else map.set(key, [posting])
  }
  const documents = index.rows.map((row, doc): Document => {
    const values: Record<SearchField, readonly string[]> = {
      names: row[5],
      title: [row[2]],
      keywords: row[6],
      people: row[7],
      excerpt: row[8] === '' ? [] : row[8].split(' '),
    }
    for (const field of FIELDS) {
      values[field].forEach((text, value) => {
        const found = words(text)
        const size = found.length
        for (const word of new Set(found)) add(postings, word, { doc, field, value, size })
        if (size > 1) add(phrases, found.join(''), { doc, field, value, size: 1 })
      })
    }
    return { row, values }
  })
  const made: Prepared = {
    documents,
    postings,
    words: entries(postings),
    phrases,
    runs: entries(phrases),
  }
  prepared.set(index, made)
  return made
}

/** One value a typed word matched, and what the match is worth. */
interface Match {
  score: number
  posting: Posting
}

/** What a typed word found: by document, each value it matched in it. */
type Found = Map<number, Map<string, Match>>

/**
 * Every value a typed word (or a run-together phrase) matches, in this order: exact, prefix,
 * phonetic, then fuzzy. Excerpts are matched exactly, or by a prefix of three letters or more.
 */
function lookUp(
  typed: string,
  count: number,
  map: Map<string, Posting[]>,
  vocabulary: readonly Entry[],
): Found {
  const found: Found = new Map()
  const offer = (word: string, quality: number, excerpts: boolean) => {
    for (const posting of map.get(word) ?? []) {
      if (!excerpts && posting.field === 'excerpt') continue
      // A value the query covers whole ("vikṣepa") beats one it is only part of ("upa-vikṣepa").
      const whole = 0.75 + 0.25 * Math.min(1, count / posting.size)
      const score = WEIGHT[posting.field] * quality * whole
      const values = found.get(posting.doc) ?? new Map<string, Match>()
      found.set(posting.doc, values)
      const at = `${posting.field}:${posting.value}`
      if ((values.get(at)?.score ?? 0) < score) values.set(at, { score, posting })
    }
  }
  const latin = isLatin(typed)
  const key = phoneticKey(typed)
  const edits = editsFor(typed)
  const keyEdits = editsFor(key)
  for (const { text, key: sound, named, latin: alsoLatin } of vocabulary) {
    if (text === typed) offer(text, EXACT, true)
    else if (text.startsWith(typed)) offer(text, prefixQuality(typed, text), typed.length >= 3)
    else if (!named || !latin || !alsoLatin) continue
    else if (sound === key) offer(text, PHONETIC, false)
    else if (key.length >= 3 && sound.startsWith(key)) offer(text, PHONETIC_PREFIX, false)
    else if (edits > 0) {
      // A typo in the letters as typed, or in their sound, each within its own allowance.
      const byLetters = editDistance(typed, text, edits)
      const bySound = keyEdits > 0 ? editDistance(key, sound, keyEdits) : Infinity
      const distance = Math.min(
        byLetters <= edits ? byLetters : Infinity,
        bySound <= keyEdits ? bySound : Infinity,
      )
      if (distance !== Infinity) offer(text, FUZZY(distance), false)
    }
  }
  return found
}

/** The best of a document's matches. */
const bestOf = (values: Map<string, Match>): Match =>
  [...values.values()].reduce((a, b) => (b.score > a.score ? b : a))

/** Hits by kind, the kind with the best hit first; within a kind, best first. */
function grouped(hits: SearchHit[]): SearchHit[] {
  const rank = (hit: SearchHit) => KIND_ORDER.indexOf(hit.kind)
  const byScore = (a: SearchHit, b: SearchHit) =>
    b.score - a.score || rank(a) - rank(b) || a.title.localeCompare(b.title)
  const sorted = hits.toSorted(byScore)
  const order = [...new Set(sorted.map(({ kind }) => kind))]
  return sorted.toSorted((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))
}

/**
 * The documents a query finds (design A4), grouped by kind. Every word of the query must match
 * one of a document's fields; a query or a name written as one word or as several finds the same.
 */
export function query(index: SearchIndex, q: string): SearchHit[] {
  const typed = words(q)
  if (typed.length === 0) return []
  const { documents, postings, words: vocabulary, phrases, runs } = prepare(index)
  const count = typed.length
  const scores = new Map<number, Match>()

  // Word by word: a document must match every word, and scores the sum of its best matches.
  // It shows the value that matched the most words, the best scoring of those.
  const perWord = typed.map((word) => lookUp(word, count, postings, vocabulary))
  for (const doc of perWord[0]?.keys() ?? []) {
    const all = perWord.map((found) => found.get(doc))
    if (all.some((values) => values === undefined)) continue
    const tally = new Map<string, { words: number; score: number; match: Match }>()
    for (const values of all as Map<string, Match>[]) {
      for (const [at, match] of values) {
        const known = tally.get(at)
        tally.set(at, {
          words: (known?.words ?? 0) + 1,
          score: (known?.score ?? 0) + match.score,
          match,
        })
      }
    }
    const shown = [...tally.values()].reduce((a, b) =>
      b.words > a.words || (b.words === a.words && b.score > a.score) ? b : a,
    )
    const score = (all as Map<string, Match>[]).reduce(
      (sum, values) => sum + bestOf(values).score,
      0,
    )
    scores.set(doc, { score, posting: shown.match.posting })
  }

  // The query run together, against names written in more than one word, and the other way.
  const joined = typed.join('')
  const together = [lookUp(joined, 1, phrases, runs)]
  if (count > 1) together.push(lookUp(joined, 1, postings, vocabulary))
  for (const found of together) {
    for (const [doc, values] of found) {
      const best = bestOf(values)
      const score = best.score * count
      if ((scores.get(doc)?.score ?? 0) < score) scores.set(doc, { score, posting: best.posting })
    }
  }

  const hits = [...scores].map(([doc, { score, posting }]): SearchHit => {
    const { row, values } = documents[doc] as Document
    const [id, kind, title, href, parent] = row
    const { field, value } = posting
    const hit: SearchHit = {
      id,
      kind,
      title,
      href,
      matched: { field, variant: values[field][value] ?? title },
      score: Math.round(score * 100) / 100,
    }
    if (parent !== null) hit.parent = parent
    return hit
  })
  return grouped(hits)
}
