import type { Metadata } from 'next'

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

  return (
    <ReadingPage
      path={PATH}
      width="shelf"
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
        {shelf.map((work) => (
          <li key={work.slug} className={styles.item}>
            <TextCard work={work} />
          </li>
        ))}
      </ul>
    </ReadingPage>
  )
}
