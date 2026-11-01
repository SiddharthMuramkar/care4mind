import type { Metadata } from 'next'
import Link from 'next/link'

import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { AzIndex, AzLetter, type ChipGroup, type RailLetter } from '@/components/az'
import { turnForward } from '@/components/PageTurn'
import type { PreviewPayload } from '@/components/preview/LinkPreview'
import { TopicCard } from '@/components/topics'
import { concepts, hrefFor, site, topics, works, type AzEntry as Entry } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { count } from '@/lib/text'

import reading from '../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'concepts' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** A letter's anchor on the page: `#letter-a`, and `#letter-other` for names starting otherwise. */
const letterId = (letter: string) => `letter-${letter === '#' ? 'other' : letter.toLowerCase()}`

const KINDS = [
  { value: 'concept', label: 'Concept pages' },
  { value: 'term', label: 'Terms' },
  { value: 'glossary', label: 'Glossary' },
] as const

/**
 * The Concepts A–Z (D14): the topics as cards, then every Concept, every term explained inside
 * one (or in a topic's introduction) and every glossary entry, by letter, under a rail of letters
 * and filter chips.
 */
export default async function ConceptsPage() {
  const [letters, topicCards, workCards, conceptCards, routes] = await Promise.all([
    site.azIndex(),
    topics.list(),
    works.list(),
    concepts.list(),
    site.routes(),
  ])
  const all = letters.flatMap(({ entries }) => entries)
  const ofKind = (kind: Entry['kind']) => all.filter((entry) => entry.kind === kind).length
  const quoted = new Set(all.flatMap((entry) => entry.works))
  const topicNames = new Map(topicCards.map(({ slug, name }) => [slug, name]))
  const summaries = new Map(conceptCards.map(({ href, summary }) => [href, summary]))

  const groups: ChipGroup[] = [
    {
      group: 'topic',
      label: 'Topic',
      chips: topicCards.map(({ slug, name }) => ({ value: slug, label: name })),
    },
    {
      group: 'text',
      label: 'Text',
      chips: workCards
        .filter(({ slug }) => quoted.has(slug))
        .map(({ slug, title, lang }) => ({ value: slug, label: title, lang })),
    },
    { group: 'kind', label: 'Show', chips: KINDS },
  ]
  const rail: RailLetter[] = letters.map(({ letter, entries }) => ({
    letter,
    id: letterId(letter),
    filled: entries.length > 0,
  }))

  /** A Concept's link shows its preview: its names and its summary. */
  const previewOf = (entry: Entry): PreviewPayload | undefined => {
    const text = entry.href === undefined ? undefined : summaries.get(entry.href)
    if (entry.kind !== 'concept' || text === undefined) return undefined
    return {
      kind: 'concept',
      name: entry.name,
      text,
      ...(entry.lang ? { lang: entry.lang } : {}),
      ...(entry.devanagari ? { devanagari: entry.devanagari } : {}),
      ...(entry.gloss ? { gloss: entry.gloss } : {}),
    }
  }

  // Each entry's place in the whole list, which names it as the list reorders.
  const filled = letters.filter(({ entries }) => entries.length > 0)
  const starts = filled.map((_, at) =>
    filled.slice(0, at).reduce((sum, { entries }) => sum + entries.length, 1),
  )
  const sections = filled.map(({ letter, entries }, at) => ({
    letter,
    entries: entries.map((entry, offset) => ({ entry, index: (starts[at] ?? 1) + offset })),
  }))

  return (
    <ReadingPage path={PATH} width="wide">
      <TitlePage>
        <p className={reading.kicker}>From A to Z</p>
        <PageTitle>Concepts</PageTitle>
        <p className={reading.summary}>
          Every Concept, every term explained inside one, and every glossary entry.
        </p>
        <p className={styles.facts}>
          {count(all.length, 'entry', 'entries')}:{' '}
          {count(ofKind('concept'), 'Concept page', 'Concept pages')},{' '}
          {count(ofKind('term'), 'term', 'terms')} and{' '}
          {count(ofKind('glossary'), 'glossary entry', 'glossary entries')}
        </p>
      </TitlePage>

      <section className={reading.section} aria-labelledby="topics-title">
        <h2 id="topics-title" className={reading.sectionTitle}>
          By topic
        </h2>
        <ul className={styles.topics}>
          {topicCards.map((topic) => (
            <li key={topic.slug}>
              <TopicCard topic={topic} />
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          Looking for a term by another spelling?{' '}
          <Link href={hrefFor({ page: 'search' })}>Search the site</Link>.
          {routes.some((route) => route.kind === 'concept-map') ? (
            <>
              {' '}
              Or see how the Concepts connect on the{' '}
              <Link href={hrefFor({ page: 'concept-map' })} transitionTypes={turnForward}>
                Concept map
              </Link>{' '}
              (a proposal).
            </>
          ) : null}
        </p>
      </section>

      <section className={reading.section} aria-labelledby="az-title">
        <h2 id="az-title" className={reading.sectionTitle}>
          From A to Z
        </h2>
        <AzIndex letters={rail} groups={groups} total={all.length}>
          {sections.map(({ letter, entries }) => (
            <AzLetter
              key={letter}
              letter={letter}
              id={letterId(letter)}
              entries={entries}
              topicNames={topicNames}
              previewOf={previewOf}
            />
          ))}
        </AzIndex>
      </section>
    </ReadingPage>
  )
}
