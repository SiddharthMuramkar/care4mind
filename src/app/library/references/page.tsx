import type { Metadata } from 'next'

import { Citation } from '@/components/Citation'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { RecordLink } from '@/components/prose'
import { hrefFor, references } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../../listing.module.css'
import reading from '../../reading.module.css'

const PATH = hrefFor({ page: 'references' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * Every Reference the site cites, once, in one style (FR-03, D09), each anchored where citations
 * lead (`#ref-<id>`) and with the pages that cite it.
 */
export default async function ReferencesPage() {
  const all = await references.list()
  return (
    <ReadingPage path={PATH}>
      <TitlePage>
        <p className={reading.kicker}>Library</p>
        <PageTitle>References</PageTitle>
        <p className={reading.summary}>Every source the site cites, by author.</p>
        <p className={listing.facts}>{all.length} References</p>
      </TitlePage>

      <ul className={listing.entries}>
        {all.map((reference) => (
          <li key={reference.id} id={reference.anchor} className={listing.entry}>
            <p>
              <Citation reference={reference} />
            </p>
            {reference.citedIn.length > 0 ? (
              <div className={listing.cited}>
                Cited in
                <ul className={listing.inline}>
                  {reference.citedIn.map((record) => (
                    <li key={`${record.kind}/${record.id}`}>
                      <RecordLink record={record} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </ReadingPage>
  )
}
