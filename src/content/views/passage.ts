import type { ContentGraph } from '../graph'
import type { PassageQuote, PassageRecord, WorkRecord } from '../schema/index'
import type { LatinScript, PassageView, VerseView, WorkRef } from '../types'
import { byName, carriedOver, must, present } from './common'
import { hrefFor, passageAnchor } from './href'
import { displayName, passageLabel } from '../names'
import { recordRef } from './refs'

/** Reading order of two locators as numbers: 1.2 before 1.20 before 2.3. */
export function compareOrder(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const difference = (a[i] ?? -1) - (b[i] ?? -1)
    if (difference !== 0) return difference
  }
  return 0
}

/** Passages of any works in reading order: by work title, then by locator. */
export function inReadingOrder(passages: readonly PassageRecord[], graph: ContentGraph) {
  const title = (passage: PassageRecord) =>
    displayName({ term: must(graph, 'work', passage.work).title })
  return [...passages].sort((a, b) => byName(title(a), title(b)) || compareOrder(a.order, b.order))
}

/** The language tag of a work's transliterated text: Sanskrit unless the work says Pali. */
export function latinScript(work: WorkRecord): LatinScript {
  return work.language === 'pi' ? 'pi-Latn' : 'sa-Latn'
}

export function workRef(work: WorkRecord): WorkRef {
  return {
    slug: work.slug,
    title: displayName({ term: work.title }),
    lang: latinScript(work),
    href: hrefFor({ kind: 'work', id: work.slug }),
  }
}

/** A verse as a record quotes it: the foundation's Shloka, with its work and its passage's link. */
export function verseView(quote: PassageQuote, graph: ContentGraph): VerseView {
  const passage = must(graph, 'passage', quote.passage)
  const work = must(graph, 'work', passage.work)
  const translation =
    quote.translation === undefined
      ? undefined
      : passage.translations.find((candidate) => candidate.id === quote.translation)
  return {
    source: passageLabel(passage, work),
    verse: passage.locator,
    devanagari: [...passage.devanagari],
    transliteration: [...(passage.transliteration?.lines ?? [])],
    transliterationScheme: passage.transliteration?.scheme ?? 'informal',
    translation: translation?.text ?? '',
    ...present({ translationSource: translation?.source, meaning: quote.meaning }),
    passage: passage.id,
    work: workRef(work),
    href: hrefFor({ kind: 'passage', id: passage.id }),
  }
}

/**
 * A passage as its work's page shows it: its lines, each translation attributed to its source
 * and to the records whose quote shows it, and every record that quotes it.
 */
export function passageView(passage: PassageRecord, graph: ContentGraph): PassageView {
  const work = must(graph, 'work', passage.work)
  const quotes = graph.quotedIn(passage.id)
  const quoting = [...new Map(quotes.map(({ record }) => [`${record.kind}/${record.id}`, record]))]
  return {
    id: passage.id,
    work: workRef(work),
    locator: passage.locator,
    label: passageLabel(passage, work),
    anchor: passageAnchor(passage.locator),
    href: hrefFor({ kind: 'passage', id: passage.id }),
    devanagari: [...passage.devanagari],
    ...(passage.transliteration === undefined
      ? {}
      : {
          transliteration: {
            lines: [...passage.transliteration.lines],
            scheme: passage.transliteration.scheme,
          },
        }),
    translations: passage.translations.map((translation) => ({
      id: translation.id,
      text: translation.text,
      ...present({ source: translation.source }),
      quotedIn: quotes
        .filter((quote) => quote.translation === translation.id)
        .map(({ record }) => recordRef(record, graph)),
    })),
    quotedIn: quoting.map(([, record]) => recordRef(record, graph)),
    ...carriedOver(passage),
  }
}
