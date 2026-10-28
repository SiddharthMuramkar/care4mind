import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { features, proposalsPageOn } from '@/config/features'
import { hrefFor } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../listing.module.css'
import reading from '../reading.module.css'

const PATH = hrefFor({ page: 'proposals' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * Features proposed beyond the brief (D20), for the Project owner to accept or refuse in the
 * sign-off pack. Each built one shows only while its flag is on. Front-end-site ticket 12 writes
 * what each adds and costs here.
 */
export default function ProposalsPage() {
  if (!proposalsPageOn()) notFound()
  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="proposals-title">
          <header className={reading.titlePage}>
            <h1 id="proposals-title" className={reading.title}>
              Proposals
            </h1>
            <p className={reading.summary}>
              Features proposed beyond the brief, for the Project owner to accept or refuse.
            </p>
          </header>

          <ul className={listing.entries}>
            {features.conceptMap ? (
              <li className={listing.entry}>
                <p className={listing.entryName}>
                  <Link href={hrefFor({ page: 'concept-map' })} transitionTypes={turnForward}>
                    Concept map
                  </Link>
                </p>
                <p>
                  The Concepts on one map, joined by the verses, works and References they share.
                </p>
              </li>
            ) : null}
            {features.devanagariFirst ? (
              <li className={listing.entry}>
                <p className={listing.entryName}>Devanagari first, on every page</p>
                <p>One choice to put Devanagari before IAST on every page, remembered.</p>
              </li>
            ) : null}
            <li className={listing.entry}>
              <p className={listing.entryName}>Audio pronunciation</p>
              <p className={listing.meta}>Described, not built</p>
            </li>
          </ul>
        </Folio>
      </main>
    </PageTurn>
  )
}
