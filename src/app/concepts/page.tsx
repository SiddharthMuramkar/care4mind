import type { Metadata, Route } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { Text } from '@/components/prose'
import { features } from '@/config/features'
import { hrefFor, site, topics, type AzEntry } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../listing.module.css'
import reading from '../reading.module.css'

const PATH = hrefFor({ page: 'concepts' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** A letter's anchor on the page: `#letter-a`, and `#letter-other` for names starting otherwise. */
const letterId = (letter: string) => `letter-${letter === '#' ? 'other' : letter.toLowerCase()}`

/** What an entry is, in words: a Concept, a term inside one, or a glossary entry. */
function KindOf({ entry }: { entry: AzEntry }) {
  if (entry.kind === 'concept') return <>Concept</>
  if (entry.concept)
    return (
      <>
        Term in{' '}
        <Link
          href={hrefFor({ kind: 'concept', id: entry.concept.slug })}
          transitionTypes={turnForward}
        >
          <span lang={entry.concept.lang}>{entry.concept.name}</span>
        </Link>
      </>
    )
  if (entry.external && entry.href)
    return <>Glossary · on {new URL(entry.href).hostname.replace(/^www\./, '')}, another site</>
  return <>Glossary</>
}

function Entry({ entry }: { entry: AzEntry }) {
  // A glossary entry merged into a Concept's keeps its own anchor (/concepts/#<slug>) here too.
  const [anchor, ...more] = entry.anchors
  const name = <span lang={entry.lang}>{entry.name}</span>
  return (
    <li id={anchor} className={listing.entry}>
      {more.map((id) => (
        <span key={id} id={id} />
      ))}
      <p className={listing.entryName}>
        {entry.href === undefined ? (
          name
        ) : entry.external ? (
          <a href={entry.href}>{name}</a>
        ) : (
          // An A–Z entry's page or anchor, made by hrefFor() in the content module.
          <Link href={entry.href as Route} transitionTypes={turnForward}>
            {name}
          </Link>
        )}
        {entry.devanagari ? <span lang="sa-Deva">{entry.devanagari}</span> : null}
      </p>
      <p className={listing.meta}>
        {entry.gloss ? <>{entry.gloss} · </> : null}
        <KindOf entry={entry} />
      </p>
      {entry.definition ? (
        <p>
          <Text text={entry.definition} />
        </p>
      ) : null}
      {entry.spellings.length > 0 ? (
        <p className={listing.note}>
          Also spelled <span lang="sa-Latn">{entry.spellings.join(', ')}</span>
        </p>
      ) : null}
    </li>
  )
}

/**
 * The Concepts A–Z (D14): every Concept, every term explained inside one and every glossary
 * entry, by letter, with the topics above them. Front-end-site ticket 06 builds the letter rail
 * and the filters here.
 */
export default async function ConceptsPage() {
  const [letters, topicCards] = await Promise.all([site.azIndex(), topics.list()])
  const filled = letters.filter(({ entries }) => entries.length > 0)
  const count = filled.reduce((sum, { entries }) => sum + entries.length, 0)

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
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
            <p className={listing.facts}>{count} entries</p>
          </header>

          <section className={reading.section} aria-labelledby="topics-title">
            <h2 id="topics-title" className={reading.sectionTitle}>
              By topic
            </h2>
            <ul className={listing.contents}>
              {topicCards.map((topic) => (
                <li key={topic.slug}>
                  <Link
                    href={hrefFor({ kind: 'topic', id: topic.slug })}
                    transitionTypes={turnForward}
                  >
                    {topic.name}
                  </Link>
                  <span className={listing.leader} aria-hidden />
                  <span className={listing.count}>
                    {topic.conceptCount} {topic.conceptCount === 1 ? 'Concept' : 'Concepts'}
                  </span>
                </li>
              ))}
              {features.conceptMap ? (
                <li>
                  <Link href={hrefFor({ page: 'concept-map' })} transitionTypes={turnForward}>
                    Concept map
                  </Link>
                  <span className={listing.leader} aria-hidden />
                  <span className={listing.count}>Proposal</span>
                </li>
              ) : null}
            </ul>
            <p className={listing.note}>
              Looking for a term by another spelling?{' '}
              <Link href={hrefFor({ page: 'search' })}>Search the site</Link>.
            </p>
          </section>

          <nav aria-label="Letters">
            <ul className={listing.letters}>
              {filled.map(({ letter }) => (
                <li key={letter}>
                  <a href={`#${letterId(letter)}`}>{letter}</a>
                </li>
              ))}
            </ul>
          </nav>

          {filled.map(({ letter, entries }) => (
            <section key={letter} id={letterId(letter)} className={listing.lettered}>
              <h2 className={listing.letter}>{letter}</h2>
              <ul className={listing.entries}>
                {entries.map((entry) => (
                  <Entry
                    key={`${entry.kind}:${entry.anchors[0] ?? entry.href ?? entry.name}`}
                    entry={entry}
                  />
                ))}
              </ul>
            </section>
          ))}
        </Folio>
      </main>
    </PageTurn>
  )
}
