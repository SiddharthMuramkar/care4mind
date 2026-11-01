import type { Metadata } from 'next'

import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { ConceptMap } from '@/components/map/ConceptMap'
import { layoutMap } from '@/components/map/layout'
import { ProposalNote } from '@/components/proposals/ProposalNote'
import { hrefFor, site, topics } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../../listing.module.css'
import reading from '../../reading.module.css'

const PATH = hrefFor({ page: 'concept-map' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * The Concept map (Proposal, D20): the Concepts round a circle by topic on a printed plate, and
 * every connection in words. Its layout is worked out here, while the site builds.
 */
export default async function ConceptMapPage() {
  const [graph, topicCards] = await Promise.all([site.graph(), topics.list()])
  const layout = layoutMap(
    graph,
    topicCards.map(({ slug, name, order }) => ({ slug, name, order })),
  )

  return (
    <ReadingPage path={PATH} width="plate">
      <TitlePage>
        <ProposalNote>Awaiting the Project owner’s decision</ProposalNote>
        <PageTitle long>Concept map</PageTitle>
        <p className={reading.summary}>
          The Concepts by topic, and what joins them: a verse, a text or a rarely cited Reference
          they share.
        </p>
        <p className={listing.facts}>
          {layout.points.length} Concepts · {layout.connections.length} connections
        </p>
      </TitlePage>
      <ConceptMap layout={layout} />
    </ReadingPage>
  )
}
