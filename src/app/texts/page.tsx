import type { Metadata } from 'next'

import { ownArt } from '@/art'
import { SectionSticker } from '@/components/art'
import { Fleuron } from '@/components/Fleuron'
import { ReadingPage } from '@/components/ReadingPage'
import { TextCard } from '@/components/texts'
import { hrefFor, works, type WorkView } from '@/content'
import { metadataFor } from '@/lib/metadata'

import reading from '@/styles/reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'texts' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * The traditional texts the site quotes: a shelf of catalogue cards, one for each work,
 * each leading to the work's page set like a manuscript. No JavaScript of its own.
 */
export default async function TextsPage() {
  const shelf = (await Promise.all((await works.list()).map(({ slug }) => works.get(slug)))).filter(
    (work): work is WorkView => work !== undefined,
  )
  const verses = shelf.reduce((sum, work) => sum + work.passageCount, 0)
  const hasPothi = (work: WorkView) => ownArt({ kind: 'work', slug: work.slug }) !== undefined
  // A card with a Pothi can take a whole row, so those lead and leave no hole in a row of bare cards.
  const ordered = [...shelf.filter(hasPothi), ...shelf.filter((work) => !hasPothi(work))]

  return (
    <ReadingPage
      path={PATH}
      width="shelf"
      beforeTitle={<SectionSticker section="texts" />}
      title="Traditional texts"
      afterTitle={
        <>
          <p className={reading.summary}>
            The works the site quotes, each with every verse it quotes from them.
          </p>
          <p className={styles.facts}>
            {verses} verses from {shelf.length} works
          </p>
          <Fleuron className={styles.fleuron} />
        </>
      }
    >
      <ul className={styles.shelf}>
        {ordered.map((work) => (
          <li key={work.slug} className={styles.item} data-bare={hasPothi(work) ? undefined : ''}>
            <TextCard work={work} />
          </li>
        ))}
      </ul>
    </ReadingPage>
  )
}
