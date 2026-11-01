import type { Metadata } from 'next'

import { AzIndex, type ChipGroup, type RailLetter } from '@/components/az'
import { catalogue, counted, TYPE_NAMES } from '@/components/library/catalogue'
import library from '@/components/library/library.module.css'
import { type CitingConcept, ReferenceEntry } from '@/components/library/ReferenceEntry'
import styles from '@/components/library/references.module.css'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { concepts, hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '../../reading.module.css'

const PATH = hrefFor({ page: 'references' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * Every Reference the site cites, once, in one style, filed by author under a rail
 * of letters, with a search box and filter chips by type, topic and citing Concept, as the A–Z has. Each entry is anchored
 * where citations lead (`#ref-<id>`), shows what cites it and copies its citation.
 */
export default async function ReferencesPage() {
  const [{ all, letters, topics, types }, conceptCards] = await Promise.all([
    catalogue(),
    concepts.list(),
  ])

  // One preview per Concept, shared by all its chips (the page's data sends it once).
  const citing = new Map<string, CitingConcept>(
    conceptCards.map((concept) => [
      concept.slug,
      {
        topic: concept.topic.slug,
        preview: {
          kind: 'concept',
          name: concept.name,
          text: concept.summary,
          ...(concept.lang ? { lang: concept.lang } : {}),
          ...(concept.term?.devanagari ? { devanagari: concept.term.devanagari } : {}),
          ...(concept.english ? { gloss: concept.english } : {}),
        },
      },
    ]),
  )

  const byCount = types.toSorted((a, b) => b.count - a.count)
  // A source's type takes the A–Z's "kind" row, so the address reads `?kind=book`.
  const groups: ChipGroup[] = [
    {
      group: 'kind',
      label: 'Type',
      chips: byCount.map(({ type }) => ({ value: type, label: TYPE_NAMES[type].many })),
    },
    {
      group: 'topic',
      label: 'Topic',
      chips: topics.map(({ slug, name }) => ({ value: slug, label: name })),
    },
  ]
  const cited = new Set(
    all.flatMap(({ citedIn }) =>
      citedIn.filter(({ kind }) => kind === 'concept').map(({ id }) => id),
    ),
  )
  groups.push({
    group: 'concept',
    label: 'Concept',
    chips: conceptCards
      .filter(({ slug }) => cited.has(slug))
      .toSorted((a, b) => a.name.localeCompare(b.name, 'en'))
      .map(({ slug, name, lang }) => ({ value: slug, label: name, ...(lang ? { lang } : {}) })),
  })
  const rail: RailLetter[] = letters.map(({ letter, id, entries }) => ({
    letter,
    id,
    filled: entries.length > 0,
  }))
  const reviewed = all.filter(({ reviewStatus }) => reviewStatus === 'reviewed').length

  return (
    <ReadingPage path={PATH} className={library.page}>
      <TitlePage>
        <p className={reading.kicker}>Library</p>
        <PageTitle>References</PageTitle>
        <p className={reading.summary}>Every source the site cites, once, filed by author.</p>
        <p className={library.facts}>
          {counted(all.length, 'Reference', 'References')}:{' '}
          {byCount
            .map(({ type, count }) =>
              counted(count, TYPE_NAMES[type].one, TYPE_NAMES[type].many).toLowerCase(),
            )
            .join(', ')}
        </p>
      </TitlePage>

      <section className={reading.section} aria-labelledby="by-author">
        <h2 id="by-author" className="sr-only">
          By author
        </h2>
        <AzIndex
          letters={rail}
          groups={groups}
          total={all.length}
          search="Search by author, title or year"
        >
          {letters
            .filter(({ entries }) => entries.length > 0)
            .map(({ letter, id, entries }) => (
              <section key={id} id={id} className={styles.letter} data-letter>
                <h3 className={styles.letterTitle}>{letter}</h3>
                <ul className={styles.entries}>
                  {entries.map(({ reference, topics: filed }) => (
                    <ReferenceEntry
                      key={reference.id}
                      reference={reference}
                      topics={filed}
                      citing={citing}
                    />
                  ))}
                </ul>
              </section>
            ))}
        </AzIndex>
      </section>

      <p className={library.provenance}>
        Carried over from the current site’s pages, each source once however many pages cite it.{' '}
        {reviewed === all.length
          ? 'Each has been reviewed by the Research editor.'
          : reviewed === 0
            ? 'Not yet reviewed by the Research editor.'
            : `${reviewed} of ${all.length} reviewed by the Research editor.`}
      </p>
    </ReadingPage>
  )
}
