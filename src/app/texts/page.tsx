import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Fleuron } from '@/components/Fleuron'
import { Folio } from '@/components/Folio'
import { PageTurn } from '@/components/PageTurn'
import { TextCard } from '@/components/texts'
import { hrefFor, works, type WorkView } from '@/content'
import { cx } from '@/lib/cx'
import { metadataFor } from '@/lib/metadata'

import reading from '../reading.module.css'
import styles from './page.module.css'

const PATH = hrefFor({ page: 'texts' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

/**
 * The traditional texts the site quotes (D08): a shelf of catalogue cards, one for each work,
 * each leading to the work's page set like a manuscript. No JavaScript of its own.
 */
export default async function TextsPage() {
  const shelf = (await Promise.all((await works.list()).map(({ slug }) => works.get(slug)))).filter(
    (work): work is WorkView => work !== undefined,
  )
  const verses = shelf.reduce((sum, work) => sum + work.passageCount, 0)

  return (
    <PageTurn>
      <main id="main" className={cx(reading.page, styles.page)}>
        <Breadcrumbs path={PATH} />
        <Folio className={reading.article}>
          <header className={reading.titlePage}>
            <p className={reading.kicker}>Traditional texts</p>
            <h1 className={reading.title}>Texts</h1>
            <p className={reading.summary}>
              The works the site quotes, each with every verse it quotes from them.
            </p>
            <p className={styles.facts}>
              {verses} verses from {shelf.length} works
            </p>
            <Fleuron draw className={styles.fleuron} />
          </header>

          <ul className={styles.shelf}>
            {shelf.map((work) => (
              <li key={work.slug} className={styles.item}>
                <TextCard work={work} />
              </li>
            ))}
          </ul>
        </Folio>
      </main>
    </PageTurn>
  )
}
