import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { ConceptMap } from '@/components/map/ConceptMap'
import { layoutMap } from '@/components/map/layout'
import { PageTurn } from '@/components/PageTurn'
import { ProposalNote } from '@/components/proposals/ProposalNote'
import { features } from '@/config/features'
import { hrefFor, site, topics } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import listing from '../../listing.module.css'
import reading from '../../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'concept-map' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * The Concept map (Proposal, D20): the Concepts round a circle by topic on a printed plate, and
 * every connection in words. Its layout is worked out here, while the site builds.
 */
export default async function ConceptMapPage() {
  if (!features.conceptMap) notFound()
  const [graph, topicCards] = await Promise.all([site.graph(), topics.list()])
  const layout = layoutMap(
    graph,
    topicCards.map(({ slug, name, order }) => ({ slug, name, order })),
  )

  return (
    <PageTurn>
      <main id="main" className={styles.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="map-title">
          <header className={reading.titlePage}>
            <ProposalNote>Awaiting the Project owner’s decision</ProposalNote>
            <h1 id="map-title" className={cx(reading.title, reading.titleLong)}>
              Concept map
            </h1>
            <p className={reading.summary}>
              The Concepts by topic, and what joins them: a verse, a text or a rarely cited
              Reference they share.
            </p>
            <p className={listing.facts}>
              {layout.points.length} Concepts · {layout.connections.length} connections
            </p>
          </header>
          <ConceptMap layout={layout} />
        </Folio>
      </main>
    </PageTurn>
  )
}
