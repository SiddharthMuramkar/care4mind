import type { Metadata } from 'next'
import Link from 'next/link'

import { turnForward } from '@/components/PageTurn'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { hrefFor, works } from '@/content'
import { metadataFor } from '@/lib/metadata'

import listing from '../listing.module.css'
import reading from '../reading.module.css'

const PATH = hrefFor({ page: 'texts' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * The traditional texts the site quotes (D08), each with how many of its verses it quotes.
 */
export default async function TextsPage() {
  const all = await works.list()
  return (
    <ReadingPage path={PATH}>
      <TitlePage>
        <p className={reading.kicker}>Traditional texts</p>
        <PageTitle>Texts</PageTitle>
        <p className={reading.summary}>
          The works the site quotes, each with every verse it quotes from them.
        </p>
      </TitlePage>

      <ul className={listing.entries}>
        {all.map((work) => (
          <li key={work.slug} className={listing.entry}>
            <p className={listing.entryName}>
              <Link href={hrefFor({ kind: 'work', id: work.slug })} transitionTypes={turnForward}>
                <span lang={work.lang}>{work.title}</span>
              </Link>
              {work.term.devanagari ? <span lang="sa-Deva">{work.term.devanagari}</span> : null}
            </p>
            <p className={listing.meta}>
              {[work.english, work.attribution].filter(Boolean).join(' · ')}
              {work.english || work.attribution ? ' · ' : null}
              {work.passageCount} {work.passageCount === 1 ? 'verse' : 'verses'} quoted
            </p>
          </li>
        ))}
      </ul>
    </ReadingPage>
  )
}
