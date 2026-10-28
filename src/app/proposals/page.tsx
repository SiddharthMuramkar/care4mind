import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Folio } from '@/components/Folio'
import { layoutMap } from '@/components/map/layout'
import { PlatePicture } from '@/components/map/PlatePicture'
import { PageTurn, turnForward } from '@/components/PageTurn'
import { ProposalNote } from '@/components/proposals/ProposalNote'
import { type Proposal, proposalsFor } from '@/components/proposals/proposals'
import { features, proposalsPageOn } from '@/config/features'
import { hrefFor, site, topics } from '@/content'
import { toDevanagariDigits } from '@/lib/text'
import { metadataFor } from '@/lib/metadata'

import listing from '../listing.module.css'
import reading from '../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'proposals' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/** A sentence with its settings (`FEATURE_CONCEPT_MAP=0`) set as code. */
function withSettings(text: string) {
  return text.split(/(FEATURE_[A-Z_]+=\d)/).map((part, index) =>
    index % 2 === 1 ? (
      <code key={part} className={styles.setting}>
        {part}
      </code>
    ) : (
      part
    ),
  )
}

/** What a built proposal offers to try, and where. */
async function TryIt({ proposal }: { proposal: Proposal }) {
  if (proposal.key === 'concept-map') {
    const [graph, topicCards] = await Promise.all([site.graph(), topics.list()])
    const layout = layoutMap(
      graph,
      topicCards.map(({ slug, name, order }) => ({ slug, name, order })),
    )
    return (
      <div className={styles.tryMap}>
        <PlatePicture layout={layout} className={styles.picture} />
        <p className={styles.try}>
          <Link
            href={hrefFor({ page: 'concept-map' })}
            transitionTypes={turnForward}
            className={styles.open}
            data-ink
          >
            Open the Concept map
          </Link>
        </p>
      </div>
    )
  }
  if (proposal.key === 'devanagari-first')
    return (
      <p className={styles.try}>
        <span className={styles.tryLabel}>Try it:</span> press “Devanagari first” in the header (in
        the Menu on a narrower screen), or beside the name on any Concept page, then open the{' '}
        <Link href={hrefFor({ page: 'concepts' })} transitionTypes={turnForward}>
          Concepts A–Z
        </Link>
        : every entry leads with its Devanagari. Press it again to go back.
      </p>
    )
  return null
}

/**
 * Features proposed beyond the brief (D20), for the Project owner to accept or refuse in the
 * sign-off pack: each built one while its flag is on, and audio pronunciation, described only.
 * Each entry says what it adds, what it costs and how it is switched off.
 */
export default function ProposalsPage() {
  if (!proposalsPageOn()) notFound()
  const proposals = proposalsFor(features)
  const built = proposals.filter((proposal) => proposal.built).length

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={PATH} />
        <Folio as="article" className={reading.article} aria-labelledby="proposals-title">
          <header className={reading.titlePage}>
            <ProposalNote here>Each awaits the Project owner’s decision</ProposalNote>
            <h1 id="proposals-title" className={reading.title}>
              Proposals
            </h1>
            <p className={reading.summary}>
              What the design suggests beyond the brief, for the Project owner to accept or refuse.
              A refused one is switched off with one setting, and no code changes.
            </p>
            <p className={listing.facts}>
              {built} built · {proposals.length - built} described
            </p>
          </header>

          <ol className={styles.entries}>
            {proposals.map((proposal, index) => (
              <li key={proposal.key}>
                <article className={styles.entry} aria-labelledby={`${proposal.key}-title`}>
                  <header className={styles.head}>
                    <span className={styles.numeral} lang="sa-Deva" aria-hidden>
                      {toDevanagariDigits(String(index + 1))}
                    </span>
                    <h2 id={`${proposal.key}-title`} className={styles.name}>
                      {proposal.name}
                    </h2>
                    <p className={styles.status} data-built={proposal.built || undefined}>
                      {proposal.built ? 'Built' : 'Described, not built'}
                    </p>
                  </header>
                  <dl className={styles.facts}>
                    <dt>What it adds</dt>
                    <dd>{proposal.adds}</dd>
                    <dt>What it costs</dt>
                    <dd>
                      <p>
                        <span className={styles.cost}>In speed.</span> {proposal.speed}
                      </p>
                      <p>
                        <span className={styles.cost}>In upkeep.</span> {proposal.upkeep}
                      </p>
                    </dd>
                    <dt>How it is switched off</dt>
                    <dd>{withSettings(proposal.off)}</dd>
                  </dl>
                  <TryIt proposal={proposal} />
                </article>
              </li>
            ))}
          </ol>
        </Folio>
      </main>
    </PageTurn>
  )
}
