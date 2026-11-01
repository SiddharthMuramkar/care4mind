import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { Folio } from '@/components/folio'
import { PageTurn } from '@/components/page-turn'
import { Provenance, RecordLink, Text } from '@/components/prose'
import { hrefFor, works, type PassageView, type RecordRef } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'
import { toDevanagariDigits } from '@/lib/text'

import listing from '../../listing.module.css'
import reading from '../../reading.module.css'
import styles from './page.module.css'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await works.list()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/texts/[slug]'>): Promise<Metadata> {
  return metadataFor(hrefFor({ kind: 'work', id: (await params).slug }))
}

function Records({ records }: { records: readonly RecordRef[] }) {
  return (
    <ul className={listing.inline}>
      {records.map((record) => (
        <li key={`${record.kind}/${record.id}`}>
          <RecordLink record={record} />
        </li>
      ))}
    </ul>
  )
}

/** One verse the site quotes, anchored at its locator (`#1-30`), as its work's page shows it. */
function Passage({ passage, unit }: { passage: PassageView; unit: string }) {
  const { devanagari, transliteration, translations } = passage
  return (
    <section id={passage.anchor} className={styles.passage}>
      <h2 className={styles.locator}>
        {unit} {passage.locator}
      </h2>
      {devanagari.length > 0 ? (
        <p lang="sa-Deva" className={styles.deva}>
          {devanagari.map((line, index) => (
            <span key={index} className={styles.line}>
              {line}
              {index === devanagari.length - 1 ? (
                <span className={styles.number}> ॥ {toDevanagariDigits(passage.locator)} ॥</span>
              ) : null}
            </span>
          ))}
        </p>
      ) : null}
      {transliteration ? (
        <p lang={passage.work.lang} className={styles.transliteration}>
          {transliteration.lines.map((line, index) => (
            <span key={index} className={styles.line}>
              {line}
            </span>
          ))}
        </p>
      ) : null}
      {transliteration?.scheme === 'informal' ? (
        <p className={listing.meta}>Transliteration as on the current site</p>
      ) : null}
      {translations.map((translation) => (
        <div key={translation.id} className={styles.translation}>
          <p>
            <span className={styles.label}>Translation</span> <Text text={translation.text} />
            {translation.source ? <> ({translation.source})</> : null}
          </p>
          {translations.length > 1 && translation.quotedIn.length > 0 ? (
            <div className={listing.cited}>
              As quoted on <Records records={translation.quotedIn} />
            </div>
          ) : null}
        </div>
      ))}
      {passage.quotedIn.length > 0 ? (
        <div className={listing.cited}>
          Quoted in <Records records={passage.quotedIn} />
        </div>
      ) : null}
    </section>
  )
}

/**
 * A traditional text (D08): every verse the site quotes from it, in the work's own order, each
 * at its own address.
 */
export default async function WorkPage({ params }: PageProps<'/texts/[slug]'>) {
  const work = await works.get((await params).slug)
  if (!work) notFound()

  return (
    <PageTurn>
      <main id="main" className={reading.page}>
        <Breadcrumbs path={hrefFor({ kind: 'work', id: work.slug })} />
        <Folio as="article" className={reading.article} aria-labelledby="work-title">
          <header className={reading.titlePage}>
            <p className={reading.kicker}>Traditional text</p>
            <h1 id="work-title" className={cx(reading.title, reading.titleLong)}>
              <span lang={work.lang}>{work.title}</span>
            </h1>
            {work.term.devanagari ? (
              <p lang="sa-Deva" className={styles.titleDeva}>
                {work.term.devanagari}
              </p>
            ) : null}
            {work.english ? <p className={reading.gloss}>{work.english}</p> : null}
            <p className={listing.facts}>
              {work.attribution ? <>{work.attribution} · </> : null}
              {work.passageCount} {work.passageCount === 1 ? 'verse' : 'verses'} quoted
            </p>
          </header>

          {work.passages.map((passage) => (
            <Passage key={passage.id} passage={passage} unit={work.locatorLabel} />
          ))}

          <Provenance of={work} />
        </Folio>
      </main>
    </PageTurn>
  )
}
