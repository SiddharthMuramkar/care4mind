import type { Metadata } from 'next'

import { counted, holdingsOf } from '@/components/library/catalogue'
import styles from '@/components/library/library.module.css'
import { Holds, Shelf, Spine } from '@/components/library/Shelf'
import { PageTitle, ReadingPage, TitlePage } from '@/components/ReadingPage'
import { hrefFor, library, type LibraryCard, references } from '@/content'
import { metadataFor } from '@/lib/metadata'
import { toDevanagariDigits } from '@/lib/text'

import reading from '../reading.module.css'

const PATH = hrefFor({ page: 'library' })

export function generateMetadata(): Promise<Metadata> {
  return metadataFor(PATH)
}

async function holdings(card: LibraryCard) {
  const view = await library.get(card.slug)
  if (!view) throw new Error(`The Library lists ${card.slug}, which has no page.`)
  return holdingsOf(view)
}

/** How thick a volume stands: the more it holds, the thicker, a little less each time. */
const thickness = (count: number) => Math.min(1, Math.log(count + 1) / Math.log(200))

/**
 * The Library: its five sections standing as volumes on a shelf, each as thick as what it holds,
 * with its count on the spine. On a phone the shelf is a book's contents. It shows no images:
 * they wait for a later phase.
 */
export default async function LibraryPage() {
  const [pages, all] = await Promise.all([library.list(), references.list()])
  const volumes = [
    {
      key: 'references',
      title: 'References',
      href: hrefFor({ page: 'references' }),
      holds: { count: all.length, unit: all.length === 1 ? 'source' : 'sources' },
    },
    ...(await Promise.all(
      pages.map(async (card) => ({
        key: card.slug,
        title: card.title,
        href: hrefFor({ kind: card.kind, id: card.slug }),
        holds: await holdings(card),
      })),
    )),
  ]
  const books = volumes
    .filter(({ holds }) => holds.unit.startsWith('book'))
    .reduce((sum, { holds }) => sum + holds.count, 0)

  return (
    <ReadingPage path={PATH} className={styles.page}>
      <TitlePage>
        <PageTitle>Library</PageTitle>
        <p className={reading.summary}>
          Every source the site cites, its reading lists, and the methods it describes.
        </p>
        <p className={styles.facts}>
          {counted(all.length, 'source', 'sources')} · {counted(books, 'book', 'books')} to read
        </p>
      </TitlePage>

      <Shelf label="The Library’s sections" kind="volumes">
        {volumes.map(({ key, title, href, holds }, index) => (
          <Spine
            key={key}
            href={href}
            name={key}
            index={index}
            head={toDevanagariDigits(String(index + 1))}
            title={title}
            foot={<Holds {...holds} />}
            thickness={thickness(holds.count)}
          />
        ))}
      </Shelf>
    </ReadingPage>
  )
}
