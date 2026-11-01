import type { Metadata } from 'next'
import Link from 'next/link'

import { AzIndex, AzLetter, type ChipGroup, type RailLetter } from '@/components/az'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Folio } from '@/components/folio'
import { PageTurn, turnForward } from '@/components/page-turn'
import type { PreviewPayload } from '@/components/preview'
import { TopicCard } from '@/components/topics'
import { features } from '@/config/features'
import { concepts, hrefFor, site, topics, works, type AzEntry as Entry } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

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

const counted = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

/**
 * The Concepts A–Z (D14): the topics as cards, then every Concept, every term explained inside
 * one (or in a topic's introduction) and every glossary entry, by letter, under a rail of letters
 * and filter chips.
 */
export default async function ConceptsPage() {
  const [letters, topicCards, workCards, conceptCards] = await Promise.all([
    site.azIndex(),
    topics.list(),
    works.list(),
    concepts.list(),
  ])
  const all = letters.flatMap(({ entries }) => entries)
  const count = (kind: Entry['kind']) => all.filter((entry) => entry.kind === kind).length
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
    <PageTurn>
      <main id="main" className={cx(reading.page, styles.page)}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="concepts-title">
          <header className={reading.titlePage}>
            <p className={reading.kicker}>From A to Z</p>
            <h1 id="concepts-title" className={reading.title}>
              Concepts
            </h1>
            <p className={reading.summary}>
              Every Concept, every term explained inside one, and every glossary entry.
            </p>
            <p className={styles.facts}>
              {counted(all.length, 'entry', 'entries')}:{' '}
              {counted(count('concept'), 'Concept page', 'Concept pages')},{' '}
              {counted(count('term'), 'term', 'terms')} and{' '}
              {counted(count('glossary'), 'glossary entry', 'glossary entries')}
            </p>
          </header>

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
              {features.conceptMap ? (
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
        </Folio>
      </main>
    </PageTurn>
  )
}
