import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { features } from '@/config/features'
import { hrefFor, site, topics, type ConceptGraphEdge, type ConceptGraphNode } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../../listing.module.css'
import reading from '../../reading.module.css'

const PATH = hrefFor({ page: 'concept-map' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** What joins two Concepts, strongest first (D06). */
const KINDS: readonly { kind: ConceptGraphEdge['kind']; heading: string }[] = [
  { kind: 'passage', heading: 'A verse both quote' },
  { kind: 'reference', heading: 'A rarely cited Reference both cite' },
  { kind: 'work', heading: 'A text both quote' },
]

function ConceptLink({ node }: { node: ConceptGraphNode | undefined }) {
  if (!node) return null
  return (
    <Link href={hrefFor({ kind: 'concept', id: node.slug })} transitionTypes={turnForward}>
      <span lang={node.lang}>{node.name}</span>
    </Link>
  )
}

/**
 * The Concept map (Proposal, D20), set out in words: the Concepts by topic and every connection
 * between them, with its reason. Front-end-site ticket 12 draws the map itself.
 */
export default async function ConceptMapPage() {
  if (!features.conceptMap) notFound()
  const [graph, topicCards] = await Promise.all([site.graph(), topics.list()])
  const nodes = new Map(graph.nodes.map((node) => [node.slug, node]))

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="map-title">
          <header className={reading.titlePage}>
            {/* The Proposal label leads to every proposal, as ProposalNote will. */}
            <Link href={hrefFor({ page: 'proposals' })} className={reading.badge}>
              Proposal
            </Link>
            <h1 id="map-title" className={reading.title}>
              Concept map
            </h1>
            <p className={reading.summary}>
              The Concepts by topic, and what joins them: a verse, a text or a rarely cited
              Reference they share.
            </p>
            <p className={listing.facts}>
              {graph.nodes.length} Concepts · {graph.edges.length} connections
            </p>
            <p className={listing.note}>
              Proposed beyond the brief, for the Project owner to accept or refuse.
            </p>
          </header>

          <section className={reading.section} aria-labelledby="by-topic-title">
            <h2 id="by-topic-title" className={reading.sectionTitle}>
              Concepts by topic
            </h2>
            <ul className={listing.entries}>
              {topicCards.map((topic) => (
                <li key={topic.slug} className={listing.entry}>
                  <p className={listing.entryName}>
                    <Link
                      href={hrefFor({ kind: 'topic', id: topic.slug })}
                      transitionTypes={turnForward}
                    >
                      {topic.name}
                    </Link>
                  </p>
                  <ul className={listing.inline}>
                    {graph.nodes
                      .filter((node) => node.topic === topic.slug)
                      .map((node) => (
                        <li key={node.slug}>
                          <ConceptLink node={node} />
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          {KINDS.map(({ kind, heading }) => {
            const edges = graph.edges.filter((edge) => edge.kind === kind)
            if (edges.length === 0) return null
            return (
              <section key={kind} className={reading.section} aria-labelledby={`${kind}-title`}>
                <h2 id={`${kind}-title`} className={reading.sectionTitle}>
                  {heading}
                </h2>
                <p className={listing.facts}>{edges.length} connections</p>
                <ul className={listing.entries}>
                  {edges.map((edge) => (
                    <li key={`${edge.source} ${edge.target} ${edge.via}`} className={listing.entry}>
                      <p>
                        <ConceptLink node={nodes.get(edge.source)} /> and{' '}
                        <ConceptLink node={nodes.get(edge.target)} />
                      </p>
                      <p className={listing.meta}>{edge.reason}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </Folio>
      </main>
    </PageTurn>
  )
}
